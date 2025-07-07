import mongoose, { Mongoose } from "mongoose";
import logger from "./logger";

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
    throw new Error(
        "Please define the MONGODB_URI environment variable inside .env.local"
    );
}

interface MongooseCache {
    conn: Mongoose | null;
    promise: Promise<Mongoose> | null;
}

declare global {
    var mongoose: MongooseCache;
}

let cache = global.mongoose;
if (!cache) {
    cache = global.mongoose = { conn: null, promise: null };
}

const dbConnect = async (): Promise<Mongoose> => {
    if (cache.conn) {
        logger.info("Using existing MongoDB connection");
        return cache.conn;
    }
    if (!cache.promise) {
        cache.promise = mongoose
            .connect(MONGODB_URI, {
                dbName: "devflow",
            })
            .then((res) => {
                logger.info("MongoDB connected successfully");
                return res;
            })
            .catch((err) => {
                logger.error("MongoDB connection error:", err);
                throw err;
            });
    }

    cache.conn = await cache.promise;
    return cache.conn;
};

export default dbConnect;
