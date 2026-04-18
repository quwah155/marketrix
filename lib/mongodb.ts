import { MongoClient } from "mongodb";

type MongoCache = {
  client: MongoClient | null;
  promise: Promise<MongoClient> | null;
};

const globalForMongo = globalThis as unknown as { mongo?: MongoCache };

if (!globalForMongo.mongo) {
  globalForMongo.mongo = { client: null, promise: null };
}

const cache = globalForMongo.mongo;

function getClientPromise(): Promise<MongoClient> {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    throw new Error("Missing MONGODB_URI environment variable");
  }

  if (!cache!.promise) {
    const client = new MongoClient(MONGODB_URI);
    cache!.promise = client.connect().then((connected) => {
      cache!.client = connected;
      return connected;
    });
  }

  return cache!.promise;
}

// Lazy proxy — the promise is only created when first accessed
export const clientPromise: Promise<MongoClient> = new Proxy(
  {} as Promise<MongoClient>,
  {
    get(_target, prop) {
      const promise = getClientPromise();
      const value = (promise as unknown as Record<string | symbol, unknown>)[prop];
      if (typeof value === "function") {
        return value.bind(promise);
      }
      return value;
    },
  }
);
