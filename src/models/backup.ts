import {
  Document,
  HydratedDocument,
  Model,
  model,
  Schema,
  Types,
} from 'mongoose';
import { EnumAvailableCompression } from '../services/backup/class.backupmanager.js';

export const BACKUPS_VALIDATION_MESSAGES = {
  _id: "L'id del sollecito deve essere un valido id mongoDB",
};

export type BackupDocument = Document<unknown, {}, Backup> &
  Backup &
  Required<{
    _id: Types.ObjectId;
  }>;
//1. Create a cache interface to represent the document in MongoDB
export interface Backup {
  _id: Types.ObjectId;
  __v: number;
  createdAt: Date;
  updatedAt: Date;

  cronJob: Types.ObjectId;
  databases: Types.ObjectId[];
  success: boolean;
  dateEnd: Date;
  data: Uint8Array | string;
  compression: EnumAvailableCompression;
  //If there are references to IDs from other documents, use `Types.ObjectId`
}

//2. Create an interface representing the static methods of the Model
//nb: only needed if there are static methods!
interface BackupModel extends Model<Backup> {
  build(doc: Partial<Backup>): HydratedDocument<Backup>;
}

//3. Create a Schema corresponding to the document interface defined in step 1
//nb: the document interface will also have _id and __v, which they don't have to be
//additions in the Schema!
const BackupSchema = new Schema<Backup, Backup>(
  {
    cronJob: {
      type: Schema.Types.ObjectId,
      ref: 'cronJob',
      required: true,
    },
    databases: [
      {
        type: Schema.Types.ObjectId,
        ref: 'database',
        required: true,
      },
    ],
    success: {
      type: Boolean,
      default: false,
    },
    dateEnd: {
      type: Date,
      default: null,
    },
    data: {
      type: Schema.Types.Mixed,
      default: null,
    },
    compression: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);
//When there are references to IDs of other documents, use `Schema.Types.ObjectId`

//4. Add here, if any, the hooks to execute before or after a CRUD operation (create, read, update, delete)
BackupSchema.pre('save', async function (done) {
  done();
});

//5. Add a static build method to create the new Model
BackupSchema.statics.build = (doc: Partial<Backup>) => new BackupModel(doc);

//6. Export the Model created with mongoose's model function
export const BackupModel = model<Backup, BackupModel>('backup', BackupSchema);
