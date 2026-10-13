import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/framelog';
    const conn = await mongoose.connect(mongoUri);
    console.log(`[MongoDB] Connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error('[MongoDB] Connection error:', error);
    process.exit(1);
  }
};

export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.connection.close();
    console.log('[MongoDB] Connection closed.');
  } catch (error) {
    console.error('[MongoDB] Disconnect error:', error);
  }
};

export default connectDB;
