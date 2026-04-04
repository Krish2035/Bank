import express, { Request, Response, Application, NextFunction } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectDB from './config/db.js';

// Route Imports
import authRoutes from './routes/authRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';

dotenv.config();

const app: Application = express();

app.use(express.json());
app.use(cookieParser());

// Update CORS to explicitly allow your frontend domain
const allowedOrigins = [
    'https://bank-cfwv.vercel.app', 
    'http://localhost:5173'
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS policy'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

connectDB();

// 1. ADD THIS ROOT ROUTE: This fixes the 404 error on bank-o2xx.vercel.app
app.get('/', (req: Request, res: Response) => {
    res.status(200).json({ message: "Nova Bank Backend is Live" });
});

// 2. API ROUTES: Matches your frontend calls
app.use('/api/auth', authRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/transactions', transactionRoutes);

// 3. EXPORT FOR VERCEL: Critical step
export default app;