import * as mongoose from 'mongoose';
import { BackupDocument, BackupModel } from '../../models/backup.js';
import { CronJob } from '../../models/cron-job.js';
import { Database } from '../../models/database.js';
import { connectToMainDB } from '../connect.js';
import { asyncForEach, colorfulLog } from '../service.utils.js';

type IData = { [key: string]: Record<string, unknown>[] };

export class BackupManager {
  private _connection?: typeof mongoose;
  private _data: IData = {};
  private _backupLog?: BackupDocument;

  public get data(): IData {
    return this._data;
  }

  constructor(private cronJob: CronJob) {}

  static async init(cronJob: CronJob) {
    return new BackupManager(cronJob);
  }

  public async start() {
    await this._createBackupLog();

    await asyncForEach(
      this.cronJob.databases as unknown as Database[],
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

  private async _createBackupLog() {
    //create a backup log
    this._backupLog = BackupModel.build({
      cronJob: this.cronJob._id,
      recipient: this.cronJob.recipient,
      databases: this.cronJob.databases,
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
