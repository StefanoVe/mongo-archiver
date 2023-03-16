import { HydratedDocument, Model, model, Schema, Types } from 'mongoose';
import { EnumAvailableCompression } from '../services/backup/class.backupmanager.js';
import { reloadSchedule$ } from '../services/cron.schedule.js';

export const CRON_JOB_VALIDATION_MESSAGES = {
  _id: "L'id del sollecito deve essere un valido id mongoDB",
};

//1. Create a cache interface to represent the document in MongoDB
export interface CronJob {
  _id: Types.ObjectId;
  __v: number;
  alias: string;
  createdAt: Date;
  updatedAt: Date;
  cronJob: string;
  recipient: string;
  databases: Types.ObjectId[];
  enabled: boolean;
  compression: EnumAvailableCompression;
  //If there are references to IDs from other documents, use `Types.ObjectId`
}

//2. Create an interface representing the static methods of the Model
//nb: only needed if there are static methods!
interface CronJobModel extends Model<CronJob> {
  build(doc: Partial<CronJob>): HydratedDocument<CronJob>;
}

//3. Create a Schema corresponding to the document interface defined in step 1
//nb: the document interface will also have _id and __v, which they don't have to be
//additions in the Schema!
const CronJobSchema = new Schema<CronJob, CronJob>(
  {
    cronJob: {
      type: String,
      required: true,
    },
    recipient: {
      type: String,
      required: true,
    },
    databases: [
      {
        type: Schema.Types.ObjectId,
        ref: 'database',
        required: true,
      },
    ],
    alias: {
      type: String,
      required: true,
    },
    enabled: {
      type: Boolean,
      default: true,
    },
    compression: {
      type: String,
      enum: Object.values(EnumAvailableCompression),
      default: EnumAvailableCompression.none,
    },
  },
  {
    timestamps: true,
  }
);
//When there are references to IDs of other documents, use `Schema.Types.ObjectId`

//4. Add here, if any, the hooks to execute before or after a CRUD operation (create, read, update, delete)
CronJobSchema.pre('save', async function (done) {
  reloadSchedule$.next();
  done();
});

//5. Add a static build method to create the new Model
CronJobSchema.statics.build = (doc: Partial<CronJob>) => new CronJobModel(doc);

//6. Export the Model created with mongoose's model function
export const CronJobModel = model<CronJob, CronJobModel>(
  'cronjob',
  CronJobSchema
);
