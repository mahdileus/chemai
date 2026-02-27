import mongoose from "mongoose";

const MONGO_URL = process.env.MONGO_URL;

if (!MONGO_URL) {
  throw new Error("❌ Please define MONGO_URL in your environment variables");
}

// cache روی globalThis برای جلوگیری از اتصال تکراری در dev/hot-reload
let cached = globalThis.mongoose;

if (!cached) {
  cached = globalThis.mongoose = { conn: null, promise: null };
}

export default async function connectToDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGO_URL, {
        // این‌ها در mongoose جدید معمولاً لازم نیست، ولی بودنش مشکلی نداره
        // useNewUrlParser: true,
        // useUnifiedTopology: true,
      })
      .then((mongooseInstance) => mongooseInstance);
  }

  cached.conn = await cached.promise;
  console.log("✅ Connected to MongoDB");
  return cached.conn;
}