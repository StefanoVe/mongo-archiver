import { HydratedDocument, Model, model, Schema, Types } from 'mongoose';

export const DATABASE_VALIDATION_MESSAGES = {
  _id: "L'id del sollecito deve essere un valido id mongoDB",
};

//1. Create a cache interface to represent the document in MongoDB
export interface Database {
  _id: Types.ObjectId;
  __v: number;
  createdAt: Date;
  updatedAt: Date;
  alias: string;
  uri: string;
  enabled: boolean;
  //If there are references to IDs from other documents, use `Types.ObjectId`
}

//2. Create an interface representing the static methods of the Model
//nb: only needed if there are static methods!
interface DatabaseModel extends Model<Database> {
  build(doc: Partial<Database>): HydratedDocument<Database>;
}

//3. Create a Schema corresponding to the document interface defined in step 1
//nb: the document interface will also have _id and __v, which they don't have to be
//additions in the Schema!
const DatabaseSchema = new Schema<Database, Database>(
  {
    uri: {
      type: String,
      required: true,
    },
    enabled: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);
//When there are references to IDs of other documents, use `Schema.Types.ObjectId`

//4. Add here, if any, the hooks to execute before or after a CRUD operation (create, read, update, delete)
DatabaseSchema.pre('save', async function (done) {
  done();
});

//5. Add a static build method to create the new Model
DatabaseSchema.statics.build = (doc: Partial<Database>) =>
  new DatabaseModel(doc);

//6. Export the Model created with mongoose's model function
export const DatabaseModel = model<Database, DatabaseModel>(
  'database',
  DatabaseSchema
);
