import express, { type Request, type Response, type Application, type NextFunction } from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';

// Route Imports
import authRoutes from './routes/authRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI as string;
const BACKEND_URL = 'https://bank-o2xx.vercel.app'; 

/**
 * MongoDB Connection Logic
 * Optimized for Vercel Serverless (checks readyState)
 */
const connectDB = async () => {
    if (mongoose.connection.readyState >= 1) return;
    try {
        mongoose.set('strictQuery', true);
        if (!MONGO_URI) throw new Error('MONGO_URI is missing from environment variables');
        await mongoose.connect(MONGO_URI);
        console.log('✅ MongoDB Connected');
    } catch (err: any) {
        console.error('❌ MongoDB Error:', err.message);
    }
};

// --- Middleware ---
app.use(express.json());
app.use(cookieParser());

/**
 * CORS Configuration
 * Optimized for Mobile: Allows undefined origins (mobile apps) and local IPs
 */
const allowedOrigins = [
    'https://bank-cfwv.vercel.app', 
    'http://localhost:5173',
    'http://localhost:8081', 
    'http://localhost:19000',
    process.env.CLIENT_URL 
].filter(Boolean) as string[];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        const isAllowed = allowedOrigins.includes(origin) || origin.endsWith('.vercel.app');
        const isLocalIP = origin.startsWith('http://192.168.') || origin.startsWith('http://10.0.'); 

        if (isAllowed || isLocalIP) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS policy'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));

/**
 * DB Connection Middleware
 */
app.use(async (_req, _res, next) => {
    await connectDB();
    next();
});

// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/transactions', transactionRoutes);

// --- Root Health Check ---
app.get('/', (_req: Request, res: Response) => {
    res.status(200).json({ 
        status: 'success', 
        message: 'Nova Bank API is live',
        timestamp: new Date().toISOString()
    });
});

/**
 * FIX: Catch-all 404 Handler for JSON
 * This prevents "Received HTML instead of JSON" errors in React Native.
 * If the app calls a wrong URL, it gets a JSON error instead of an HTML page.
 */
app.use((_req: Request, res: Response) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${_req.originalUrl}. Check your endpoint name in the mobile app.`
    });
});

// --- Global Error Handler ---
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error("Server Error:", err.message);
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
    });
});

// --- Start Server ---
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`🚀 Local Server: http://localhost:${PORT}`);
    });
}

export default app;