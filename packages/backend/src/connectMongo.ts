import { MongoClient } from "mongodb";

export function connectMongo() {
  const { MONGO_USER, MONGO_PWD, MONGO_CLUSTER, DB_NAME } = process.env;

  if (!MONGO_USER || !MONGO_PWD || !MONGO_CLUSTER || !DB_NAME) {
    throw new Error("Missing one of MONGO_USER | MONGO_PWD | MONGO_CLUSTER | DB_NAME");
  }

  const uri = `mongodb+srv://${MONGO_USER}:${MONGO_PWD}@${MONGO_CLUSTER}/${DB_NAME}`;
  const uriRedacted = `mongodb+srv://${MONGO_USER}:<password>@${MONGO_CLUSTER}/${DB_NAME}`;
  console.log("↪︎  Connecting to Mongo:", uriRedacted);

  return new MongoClient(uri);
}
