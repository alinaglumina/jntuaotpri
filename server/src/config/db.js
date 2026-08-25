import mongoose from 'mongoose';
import env from './env.js';
import logger from '../utils/logger.js';

export default async function connectDB() {
  mongoose.set('strictQuery', true);
  try {
    const conn = await mongoose.connect(env.mongoUri, { serverSelectionTimeoutMS: 8000 });
    logger.info(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (err) {
    logger.error(`MongoDB connection failed: ${err.message}`);
    process.exit(1);
  }
}
