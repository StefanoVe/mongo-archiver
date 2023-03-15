import { format } from 'date-fns';
import * as mongoose from 'mongoose';
import { BackupDocument, BackupModel } from '../../models/backup.js';
import { CronJob } from '../../models/cron-job.js';
import { Database } from '../../models/database.js';
import { connectToMainDB } from '../connect.js';
import { sendEmail } from '../send-email.js';
import { asyncForEach, colorfulLog } from '../service.utils.js';

type IData = { [key: string]: Record<string, unknown>[] };

export class BackupManager {
  private _connection?: typeof mongoose;
  private _data: IData = {};
  private _backupLog?: BackupDocument;

  public get data(): IData {
    return this._data;
  }

  constructor(private _cronJob: CronJob) {}

  static async init(cronJob: CronJob) {
    return new BackupManager(cronJob);
  }

  public async startJob() {
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
    mongoose.disconnect();

    //connect to the target db
    await this._connect(db.uri);

    //get all the collections
    const _collections = await this._connection?.connection.db.collections();

    await asyncForEach(_collections || [], async (collection) => {
      //for each collection, backup it
      await this._backupCollection(collection);
    });

    //disconnect from the db
    await this._disconnect();

    //reconnect to the main db
    await connectToMainDB();

    //update the backup log, setting "success" to true and "dateEnd" to the current date
    await this._updateBackupLog();
  }

  public async sendToRecipient() {
    //send the backup to the recipient

    const buffers = await this.createPackage();

    //send the buffers to the recipient
    await sendEmail(
      [this._cronJob.recipient],
      `Mongo Archiver | ${this._cronJob.alias}`,
      '',
      buffers
    );
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
    });

    await this._backupLog?.save();

    colorfulLog(`Backup log updated`, 'info');
  }

  private async _backupCollection(
    collection: mongoose.mongo.Collection<mongoose.mongo.BSON.Document>
  ) {
    const _collection = collection.find({});

    const _array = await _collection.toArray();

    _array.forEach((doc) => {
      this._data[_collection.namespace.collection || 'unknown'] = _array;
    });
  }

  private async _connect(uri: string) {
    this._connection = await mongoose.connect(uri);

    colorfulLog(`Connected to ${uri}`, 'info');
  }

  private async _disconnect() {
    await this._connection?.disconnect();
  }
}
