import { format } from 'date-fns';
import * as mongoose from 'mongoose';
import pako from 'pako';
import { BackupDocument, BackupModel } from '../../models/backup.js';
import { CronJob } from '../../models/cron-job.js';
import { Database } from '../../models/database.js';
import { connectToMainDB } from '../connect.js';
import { asyncForEach, colorfulLog } from '../service.utils.js';

type IData = { [key: string]: Record<string, unknown>[] };

export enum EnumAvailableCompression {
  GZIP = 'gzip',
  none = '',
}

export class BackupManager {
  private _connection?: typeof mongoose;
  private _data: IData = {};
  private _backupLog?: BackupDocument;

  public get data(): IData {
    return this._data;
  }

  constructor(
    private _cronJob: CronJob | undefined,
    private compression: EnumAvailableCompression,
    private _backup: BackupDocument | undefined
  ) {}

  static async init(o: { cronJob?: CronJob; backup: BackupDocument }) {
    if (!o.cronJob && !o.backup) {
      throw new Error('CronJob or Backup is not defined');
    }

    const compression =
      o.backup.compression ||
      o.cronJob?.compression ||
      EnumAvailableCompression.none;

    return new BackupManager(o.cronJob, compression, o.backup);
  }

  public async startJob() {
    if (!this._cronJob) {
      throw new Error('CronJob is not defined');
    }

    colorfulLog(`Starting backup for ${this._cronJob.alias}`, 'start');

    await this._createBackupLog();

    await asyncForEach(
      this._cronJob.databases as unknown as Database[],
      async (db: Database) => {
        if (!db.enabled) {
          colorfulLog(`Skipping ${db.alias} because it's disabled`, 'warning');
          return;
        }

        //for each db in the cronJob, backup it
        await this.backup(db);
      }
    );
  }

  public async backup(db: Database) {
    await mongoose.disconnect();

    //connect to the target db
    await this._connect(db.uri);

    //get all the collections
    const _collections = await this._connection?.connection.db.collections();

    await asyncForEach(_collections || [], async (collection) => {
      colorfulLog(`Backing up ${collection.collectionName}`, 'none');
      //for each collection, backup it
      await this._backupCollection(collection);
      colorfulLog(`Backed up ${collection.collectionName}`, 'none');
    });

    //disconnect from the db
    await this._disconnect();

    //reconnect to the main db
    await connectToMainDB();

    //update the backup log, setting "success" to true and "dateEnd" to the current date
    await this._updateBackupLog();
  }

  public async createPackage() {
    //create a JSON Blob for each collection in "this._data"

    return Object.keys(this._data).map((key) => {
      const jsonString = JSON.stringify(this._data[key]);

      const content = Buffer.from(jsonString).toString('utf-8');

      if (!this._backupLog?.dateEnd) {
        throw new Error('Backup log not found');
      }

      return {
        filename: `${key}_${format(
          this._backupLog?.dateEnd,
          'dd-MM-yyyy-HHmm'
        )}.json`,
        content,
      };
    });
  }

  private async _createBackupLog() {
    //create a backup log
    this._backupLog = BackupModel.build({
      cronJob: this._cronJob._id,
      recipient: this._cronJob.recipient,
      databases: this._cronJob.databases,
    });

    await this._backupLog.save();
  }

  private async _updateBackupLog() {
    //update the backup log
    this._backupLog?.set({
      success: true,
      dateEnd: new Date(),
      compression: this.compression,
    });

    let compressedData;

    //depending on the value of "this.compression", compress the data in different ways
    switch (this.compression) {
      case EnumAvailableCompression.GZIP:
        compressedData = this._gzipCompression();
        break;
      case EnumAvailableCompression.none:
        compressedData = JSON.stringify(this._data);
        break;
      default:
        colorfulLog(`Compression ${this.compression} not found`, 'error');
        break;
    }

    //update the log with the compressed data
    this._backupLog?.set({
      data: compressedData,
    });

    await this._backupLog?.save();
    colorfulLog(`Backup log updated`, 'info');
  }

  private async _backupCollection(
    collection: mongoose.mongo.Collection<mongoose.mongo.BSON.Document>
  ) {
    const _collection = collection.find({});

    this._data[_collection.namespace.collection || 'unknown'] =
      await _collection.toArray();
  }

  private async _connect(uri: string) {
    this._connection = await mongoose.connect(uri);

    colorfulLog(`Connected to ${uri}`, 'info');
  }

  private async _disconnect() {
    await this._connection?.disconnect();

    colorfulLog(
      `Disconnected from ${this._connection?.connection.name}`,
      'end'
    );
  }

  private _gzipCompression() {
    console.log(`compressing data with pako gzip`);
    //compress the data with pako
    return pako.gzip(JSON.stringify(this._data));
  }
}
