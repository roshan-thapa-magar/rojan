import mongoose, { Mongoose } from "mongoose";

const MONGODB_URI = process.env.MONGODB_URL as string;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable in .env.local"
  );
}

// Define a global type for mongoose cache
type MongooseCache = {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
};

// Extend NodeJS global object
declare global {
  var mongooseCache: MongooseCache | undefined;
}

// Use the global cache or initialize it
const cached: MongooseCache = global.mongooseCache || {
  conn: null,
  promise: null,
};

export const dbConnect = async () => {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        dbName: "barber-shop",
        bufferCommands: false,
      })
      .then((mongoose) => mongoose)
      .catch((err) => {
        console.error("❌ MongoDB Connection Error:", err);
        throw err;
      });
  }

  cached.conn = await cached.promise;
  global.mongooseCache = cached; // Save to global
  return cached.conn;
};
