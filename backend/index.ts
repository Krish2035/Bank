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
 * Designed to handle Web, Expo Dev, and Physical Mobile Devices
 */
const allowedOrigins = [
    'https://bank-cfwv.vercel.app', 
    'http://localhost:5173',
    'http://localhost:8081', 
    'http://localhost:19000', // Expo Go default
    process.env.CLIENT_URL 
].filter(Boolean) as string[];

app.use(cors({
    origin: (origin, callback) => {
        // Allow mobile/non-browser requests (origin is undefined)
        if (!origin) return callback(null, true);

        const isAllowed = allowedOrigins.includes(origin) || origin.endsWith('.vercel.app');
        const isLocalIP = origin.startsWith('http://192.168.'); // For physical phone testing

        if (isAllowed || isLocalIP) {
            callback(null, true);
        } else {
            console.log('CORS Rejected Origin:', origin);
            callback(new Error('Not allowed by CORS policy'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));

/**
 * Manual Preflight Handling
 * Ensures mobile requests don't hang on OPTIONS checks
 */
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

/**
 * DB Connection Middleware
 * Connects to DB before processing any API routes
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
        timestamp: new Date().toISOString(),
        backend_url: BACKEND_URL
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
        console.log(`🌍 Live Link: ${BACKEND_URL}`);
    });
}

export default app;