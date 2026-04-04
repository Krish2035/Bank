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

// Middleware
app.use(express.json());
app.use(cookieParser());

// Robust CORS - Explicitly allowing your frontend domain to stop CORS errors
const allowedOrigins = [
    'https://bank-cfwv.vercel.app', 
    'https://amazing-tulumba-29d6c9.netlify.app',
    'http://localhost:5173'
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile) or from allowed list
        if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS policy'));
        }
    },
    credentials: true, // Required for JWT cookies across different domains
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Connect to DB
connectDB();

/** * Root Route: Essential to fix the 404 error seen on https://bank-o2xx.vercel.app/
 */
app.get('/', (req: Request, res: Response) => {
    res.status(200).json({ 
        success: true,
        message: "Nova Bank Backend is Live and Operational",
        timestamp: new Date().toISOString()
    });
});

/**
 * API Routes: Matches your frontend calls to /api/auth/login
 */
app.use('/api/auth', authRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/transactions', transactionRoutes);

// Global Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err.stack);
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
    });
});

// For local testing: Vercel production ignores app.listen and uses the export
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`🚀 Local Server: http://localhost:${PORT}`));
}

// CRITICAL: Export for Vercel Serverless Functions
export default app;