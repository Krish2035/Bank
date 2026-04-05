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

// ESM compatibility: ensure .js extensions are present
import authRoutes from './routes/authRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI as string;

// 1. Database Connection Helper (Serverless Optimized)
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

// 2. Basic Middleware
app.use(express.json());
app.use(cookieParser());

// 3. Advanced CORS Configuration
const allowedOrigins = [
    'https://bank-cfwv.vercel.app', 
    'http://localhost:5173',
    process.env.CLIENT_URL 
].filter(Boolean) as string[];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        const isAllowed = allowedOrigins.includes(origin) || origin.endsWith('.vercel.app');
        if (isAllowed) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS policy'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));

// 4. Preflight (OPTIONS) - Manual fallback for extra stability
app.options('*', (req: Request, res: Response) => {
    const origin = req.headers.origin;
    if (origin && (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app'))) {
        res.header('Access-Control-Allow-Origin', origin);
    }
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.sendStatus(204); 
});

// 5. Middleware to ensure DB connection on every request (Essential for Vercel)
app.use(async (_req, _res, next) => {
    await connectDB();
    next();
});

// 6. API Routes
app.use('/api/auth', authRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/transactions', transactionRoutes);

// Root Health Check
app.get('/', (_req: Request, res: Response) => {
    res.status(200).json({ 
        status: 'success', 
        message: 'Nova Bank API is live',
        timestamp: new Date().toISOString()
    });
});

// 7. Global Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error("Server Error:", err.message);
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
    });
});

// Local development listener
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => console.log(`🚀 Local Server running on port ${PORT}`));
}

// Export for Vercel Serverless
export default app;