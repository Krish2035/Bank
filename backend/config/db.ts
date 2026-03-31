import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load env vars
dotenv.config();

const connectDB = async (): Promise<void> => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI as string);
        
        console.log(`\x1b[36m%s\x1b[0m`, `[MongoDB] Connected: ${conn.connection.host}`);
    } catch (error: any) {
        console.error(`[Error] MongoDB Connection Failed: ${error.message}`);
        process.exit(1); // Exit process with failure
    }
};

export default connectDB;