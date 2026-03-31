import express, { Request, Response, Application, NextFunction } from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';

// 1. Import Routes
import authRoutes from './routes/authRoutes.ts';
import paymentRoutes from './routes/paymentRoutes.ts';
import transactionRoutes from './routes/transactionRoutes.ts';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI as string;

// 2. Middleware Configuration
app.use(express.json());
app.use(cookieParser());

// UPDATED: Dynamic CORS for Vercel
app.use(cors({
    origin: (origin, callback) => {
        const allowedOrigins = [
            process.env.CLIENT_URL, 
            'http://localhost:5173',
            /\.vercel\.app$/ // Matches any vercel sub-domain
        ];
        if (!origin || allowedOrigins.some(o => typeof o === 'string' ? o === origin : o.test(origin))) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// 3. API Route Registration
app.use('/api/auth', authRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/transactions', transactionRoutes);

app.get('/', (_req: Request, res: Response) => {
    res.status(200).json({
        status: 'success',
        message: 'Bank Backend is operational on Vercel',
        timestamp: new Date().toISOString()
    });
});

// 4. Global Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const statusCode = err.statusCode || 500;
    console.error(`[Error] ${err.message}`);
    res.status(statusCode).json({
        success: false,
        message: err.message || 'Internal Server Error',
    });
});

// 5. Database Connection Logic
// We move connection logic into a function to prevent multiple connections in serverless
const connectDB = async () => {
    if (mongoose.connection.readyState >= 1) return;
    
    try {
        mongoose.set('strictQuery', true);
        await mongoose.connect(MONGO_URI);
        console.log('✅ [Database] Connected to MongoDB Atlas');
    } catch (err: any) {
        console.error('❌ [Database] Connection error:', err.message);
    }
};

// 6. Server Startup Logic
// Check if we are running locally or on Vercel
if (process.env.NODE_ENV !== 'production') {
    connectDB().then(() => {
        app.listen(PORT, () => {
            console.log(`🚀 [Server] Running at: http://localhost:${PORT}`);
        });
    });
} else {
    // On Vercel, we just ensure the DB connects
    connectDB();
}

// 7. Graceful Shutdown
process.on('SIGINT', async () => {
    try {
        await mongoose.connection.close();
        process.exit(0);
    } catch (err) {
        process.exit(1);
    }
});

/**
 * CRITICAL FOR VERCEL: 
 * Export the app so Vercel can wrap it in a Serverless Function.
 */
export default app;