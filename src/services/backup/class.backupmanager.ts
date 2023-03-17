import { format } from 'date-fns';
import * as mongoose from 'mongoose';
import pako from 'pako';
import {
  BackupDocument,
  BackupModel,
  EnumBackupStatus,
} from '../../models/backup.js';
import { CronJob } from '../../models/cron-job.js';
import { Database } from '../../models/database.js';
import { asyncForEach, colorfulLog } from '../service.utils.js';

export type IData = {
  [dbName: string]: { [collectionName: string]: Record<string, unknown>[] };
};

export enum EnumAvailableCompression {
  GZIP = 'gzip',
  none = '',
}

export class BackupManager {
  private _connection?: mongoose.Connection;
  private _data: IData = {};

  public get data(): IData {
    return this._data;
  }

  constructor(
    private _cronJob: CronJob | undefined,
    private compression: EnumAvailableCompression,
    private _backupLog: BackupDocument | undefined
  ) {
    if (!this._backupLog?.data) {
      //if there is no data in the backup log or there is no backupLog at all, return
      return;
    }

    if (this._backupLog.compression === EnumAvailableCompression.none) {
      //if the compression is "none", parse the data as a string
      this._data = JSON.parse(this._backupLog.data as string);
      return;
    }

    if (this._backupLog.compression === EnumAvailableCompression.GZIP) {
      //if the compression is "gzip", uncompress the data and parse it as a string
      this._data = JSON.parse(
        pako.ungzip((this._backupLog.data as any).buffer as Uint8Array, {
          to: 'string',
        })
      );
      return;
    }
  }

  static async init(o: { cronJob?: CronJob; backup?: BackupDocument }) {
    if (!o.cronJob && !o.backup) {
      throw new Error('CronJob or Backup is not defined');
    }

    const compression =
      o.backup?.compression ||
      o.cronJob?.compression ||
      EnumAvailableCompression.none;

    return new BackupManager(o.cronJob, compression, o.backup);
  }

  public async startJob() {
    if (!this._cronJob) {
      throw new Error('CronJob is not defined');
    }

    colorfulLog(`Starting backup for "${this._cronJob.alias}"`, 'start');

    //create a backup log
    await this._createBackupLog();

    await asyncForEach(
      this._cronJob.databases as unknown as Database[],
      async (db: Database) => {
        if (!db.enabled) {
          colorfulLog(`Skipping ${db.alias} because it's disabled`, 'warning');
          return;
        }

        //for each db in the cronJob, backup it
        await this._backupDb(db);
      }
    );
    //update the backup log, setting "success" to true and "dateEnd" to the current date
    await this._updateBackupLog();
  }

  public async createPackages() {
    //create a JSON Blob for each collection in "this._data"

    return Object.keys(this._data).map((key) => {
      const jsonString = JSON.stringify(this._data[key]);

      const content = Buffer.from(jsonString).toString('utf-8');

      if (!this._backupLog?.dateEnd) {
        throw new Error('Backup log not found');
      }

      //return an object with a filename and the content of the JSON Blob
      return {
        filename: `${key}_${format(
          this._backupLog?.dateEnd,
          'dd-MM-yyyy-HHmm'
        )}.json`,
        content,
      };
    });
  }

  private async _backupDb(db: Database) {
    //connect to the target db
    await this._connect(db.uri);

    //get all the collections
    const _collections = await this._connection?.db?.collections();

    await asyncForEach(_collections || [], async (collection) => {
      //for each collection, backup it
      await this._backupCollection(collection, db.alias);
      colorfulLog(`Backed up ${collection.collectionName}`, 'none');
    });

    //disconnect from the db
    await this._disconnect();
  }

  private async _createBackupLog() {
    if (!this._cronJob) {
      throw new Error('CronJob is not defined');
    }

    //create a backup log
    this._backupLog = BackupModel.build({
      cronJob: this._cronJob._id,
      databases: this._cronJob.databases,
      compression: this.compression,
    });

    await this._backupLog.save();
  }

  private async _updateBackupLog() {
    //update the backup log
    this._backupLog?.set({
      backupStatus: EnumBackupStatus.SUCCESS,
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
    await this._backupLog
      ?.set({
        data: compressedData,
      })
      .save();

    colorfulLog(`Backup log updated`, 'info');
  }

  private async _backupCollection(
    collection: mongoose.mongo.Collection<mongoose.mongo.BSON.Document>,
    dbAlias: string
  ) {
    const _collection = collection.find({});

    if (!_collection) {
      colorfulLog(`Collection ${collection.collectionName} not found`, 'error');
      return;
    }

    const result = await _collection.toArray();

    const _dbName = `${dbAlias}_${this._connection?.name || 'UNKNOWN'}`;
    const _collectionName = _collection?.namespace?.collection || 'UNKNOWN';

    const _data = { [_collectionName]: result };

    //assigning the exported datat to "db name" > "collection name"
    this._data[_dbName] = { ...this._data[_dbName], ..._data };
  }

  private async _connect(uri: string) {
    this._connection = mongoose.createConnection(uri);

    await this._connection?.getClient().connect().catch(console.log);

    colorfulLog(`Connected to ${this._connection?.name}`, 'start');
  }

  private async _disconnect() {
    await this._connection?.close();

    colorfulLog(`Disconnected from ${this._connection?.name}`, 'end');
  }

  private _gzipCompression() {
    console.log(`compressing data with pako gzip`);
    //compress the data with pako
    return pako.gzip(JSON.stringify(this._data));
  }
}
