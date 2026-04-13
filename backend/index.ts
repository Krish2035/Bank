import express, { type Request, type Response, type Application, type NextFunction } from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import authRoutes from './routes/authRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI as string;
const BACKEND_URL = 'https://bank-o2xx.vercel.app'; 

const connectDB = async () => {
    if (mongoose.connection.readyState >= 1) return;
    try {
        mongoose.set('strictQuery', true);
        if (!MONGO_URI) throw new Error('MONGO_URI is missing');
        await mongoose.connect(MONGO_URI);
        console.log('✅ MongoDB Connected');
    } catch (err: any) {
        console.error('❌ MongoDB Error:', err.message);
    }
};

app.use(express.json());
app.use(cookieParser());

// List of allowed origins for browser-based clients
const allowedOrigins = [
    'https://bank-cfwv.vercel.app', 
    'http://localhost:5173',
    'http://localhost:8081', // Default Expo Dev port
    process.env.CLIENT_URL 
].filter(Boolean) as string[];

app.use(cors({
    origin: (origin, callback) => {
        // 1. Allow mobile/non-browser requests (Expo Go/Native apps send undefined origin)
        if (!origin) return callback(null, true);

        // 2. Check if origin is in whitelist or is a vercel preview/branch
        const isAllowed = allowedOrigins.includes(origin) || origin.endsWith('.vercel.app');
        
        // 3. Allow local IP addresses for physical device testing with Expo
        const isLocalIP = origin.startsWith('http://192.168.');

        if (isAllowed || isLocalIP) {
            callback(null, true);
        } else {
            // Log rejected origins for easier debugging
            console.log('CORS Rejected Origin:', origin);
            callback(new Error('Not allowed by CORS policy'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));

// Robust Preflight Handling (Crucial for Mobile/Vercel)
app.options('*', (req: Request, res: Response) => {
    const origin = req.headers.origin;
    if (origin) {
        res.header('Access-Control-Allow-Origin', origin);
    }
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
    res.sendStatus(204); 
});

// Database connection middleware (Ensures DB is ready before every request)
app.use(async (_req, _res, next) => {
    await connectDB();
    next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/transactions', transactionRoutes);

// Root Check
app.get('/', (_req: Request, res: Response) => {
    res.status(200).json({ 
        status: 'success', 
        message: 'Nova Bank API is live',
        timestamp: new Date().toISOString(),
        backend_url: BACKEND_URL
    });
});

// Global Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error("Server Error:", err.message);
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
    });
});

// Start Server for Local Development
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`🚀 Local Server: http://localhost:${PORT}`);
        console.log(`🌍 Live Link: ${BACKEND_URL}`);
    });
}

export default app;