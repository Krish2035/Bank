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

// IMPORTANT: Added .js extensions for ESM compatibility on Vercel
import authRoutes from './routes/authRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI as string;

app.use(express.json());
app.use(cookieParser());

app.use(cors({
    origin: (origin, callback) => {
        const allowedOrigins = [
            process.env.CLIENT_URL, 
            'http://localhost:5173',
            /\.vercel\.app$/ 
        ].filter(Boolean);

        const isAllowed = !origin || allowedOrigins.some(o => {
            if (o instanceof RegExp) return o.test(origin);
            return o === origin;
        });

        if (isAllowed) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Routes
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

// Global Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        message: err.message || 'Internal Server Error',
    });
});

const connectDB = async () => {
    if (mongoose.connection.readyState >= 1) return;
    try {
        mongoose.set('strictQuery', true);
        if (!MONGO_URI) {
            console.error('❌ MONGO_URI is not defined in environment variables');
            return;
        }
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB');
    } catch (err: any) {
        console.error('❌ MongoDB Error:', err.message);
    }
};

// Vercel execution logic
if (process.env.NODE_ENV !== 'production') {
    connectDB().then(() => {
        app.listen(PORT, () => console.log(`🚀 Running on port ${PORT}`));
    });
} else {
    connectDB();
}

export default app;