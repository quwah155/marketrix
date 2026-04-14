import { MongoClient } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Missing MONGODB_URI");
}

type MongoCache = {
  client: MongoClient | null;
  promise: Promise<MongoClient> | null;
};

const globalForMongo = globalThis as unknown as { mongo?: MongoCache };

if (!globalForMongo.mongo) {
  globalForMongo.mongo = { client: null, promise: null };
}

const cache = globalForMongo.mongo;

if (!cache!.promise) {
  const client = new MongoClient(MONGODB_URI);
  cache!.promise = client.connect().then((connected) => {
    cache!.client = connected;
    return connected;
  });
}

export const clientPromise = cache!.promise;

