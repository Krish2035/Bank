import express, { 
    type Request, 
    type Response, 
    type Application, 
    type NextFunction 
} from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';

// IMPORTANT: Corrected .js extensions for ESM compatibility on Vercel
import authRoutes from './routes/authRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI as string;

// Middleware setup
app.use(express.json());
app.use(cookieParser());

// Robust CORS configuration for Production and Dev
const allowedOrigins = [
    process.env.CLIENT_URL, 
    'http://localhost:5173',
].filter(Boolean) as (string | RegExp)[];

// Add Vercel wildcard support
allowedOrigins.push(/\.vercel\.app$/);

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin) return callback(null, true);
        
        const isAllowed = allowedOrigins.some(o => {
            if (o instanceof RegExp) return o.test(origin);
            return o === origin;
        });

        if (isAllowed) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS policy'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/transactions', transactionRoutes);

// Root health check
app.get('/', (_req: Request, res: Response) => {
    res.status(200).json({
        status: 'success',
        message: 'Nova Bank Backend is operational',
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString()
    });
});

/**
 * Global Error Handler
 * Specifically typed to satisfy strict TypeScript rules
 */
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error("Global Error:", err.stack);
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        message: err.message || 'Internal Server Error',
    });
});

/**
 * MongoDB Connection Logic
 * Optimized for Serverless: Checks for existing connections to prevent overhead
 */
const connectDB = async () => {
    if (mongoose.connection.readyState >= 1) return;
    
    try {
        mongoose.set('strictQuery', true);
        if (!MONGO_URI) {
            throw new Error('MONGO_URI is missing from environment variables');
        }
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB');
    } catch (err: any) {
        console.error('❌ MongoDB Connection Error:', err.message);
        // In serverless, we don't want to crash the whole instance immediately 
        // if one request fails to connect, but we log it for debugging.
    }
};

// Execution logic: Serverless vs. Local
if (process.env.NODE_ENV !== 'production') {
    connectDB().then(() => {
        app.listen(PORT, () => console.log(`🚀 Local Server running on port ${PORT}`));
    });
} else {
    // On Vercel, the DB connection is triggered per-request if not already connected
    connectDB();
}

// Export app for Vercel's serverless handler
export default app;