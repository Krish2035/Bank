import express, { Request, Response, Application, NextFunction } from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';

// 1. Import Routes (Added .ts extensions for Bun/ESM compatibility)
import authRoutes from './routes/authRoutes.ts';
import paymentRoutes from './routes/paymentRoutes.ts';
import transactionRoutes from './routes/transactionRoutes.ts';

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI as string;

// 2. Middleware Configuration
app.use(express.json()); // Parse JSON bodies
app.use(cookieParser()); // Handle cookies for JWT
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173', // Matches your Vite frontend
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// 3. API Route Registration
app.use('/api/auth', authRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/transactions', transactionRoutes);

// Basic Health Check Route
app.get('/', (_req: Request, res: Response) => {
    res.status(200).json({
        status: 'success',
        message: 'Bank Backend (TypeScript/Bun) is operational',
        timestamp: new Date().toISOString()
    });
});

// 4. Global Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const statusCode = err.statusCode || 500;
    console.error(`[Error] ${err.message}`); // Helpful for debugging in terminal
    res.status(statusCode).json({
        success: false,
        message: err.message || 'Internal Server Error',
    });
});

// 5. Database Connection & Server Startup
if (!MONGO_URI) {
    console.error("❌ ERROR: MONGO_URI is missing in .env.");
    process.exit(1);
}

// Silences Mongoose 7+ deprecation warnings
mongoose.set('strictQuery', true); 

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('✅ [Database] Connected to MongoDB Atlas');
        app.listen(PORT, () => {
            console.log(`🚀 [Server] Running at: http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.error('❌ [Database] Connection error:', err.message);
        process.exit(1);
    });

// 6. Graceful Shutdown (Important for MongoDB Atlas connections)
process.on('SIGINT', async () => {
    try {
        await mongoose.connection.close();
        console.log('🛑 [Server] MongoDB connection closed. Exiting...');
        process.exit(0);
    } catch (err) {
        console.error('Error during shutdown:', err);
        process.exit(1);
    }
});