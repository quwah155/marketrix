import mongoose from "mongoose";

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

const globalForMongoose = globalThis as unknown as { mongoose?: MongooseCache };

if (!globalForMongoose.mongoose) {
  globalForMongoose.mongoose = { conn: null, promise: null };
}

export async function connectToDatabase() {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    throw new Error("Missing MONGODB_URI environment variable");
  }

  const cache = globalForMongoose.mongoose!;
  if (cache.conn) return cache.conn;
  if (!cache.promise) {
    cache.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
  }
  cache.conn = await cache.promise;
  return cache.conn;
}
