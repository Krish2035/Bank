import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI as string;

const connectDB = async (): Promise<void> => {
    // If already connected, don't create a new connection
    if (mongoose.connection.readyState >= 1) return;

    try {
        if (!MONGO_URI) {
            throw new Error('MONGO_URI is missing from environment variables');
        }

        mongoose.set('strictQuery', true);
        const conn = await mongoose.connect(MONGO_URI);
        
        console.log(`\x1b[36m%s\x1b[0m`, `[MongoDB] Connected: ${conn.connection.host}`);
    } catch (error: any) {
        console.error(`[Error] MongoDB Connection Failed: ${error.message}`);
        // Do not use process.exit(1) in production serverless, 
        // just let the function fail so Vercel can retry.
        if (process.env.NODE_ENV !== 'production') {
            process.exit(1);
        }
    }
};

export default connectDB;