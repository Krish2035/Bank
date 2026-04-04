import express, { 
    type Request, 
    type Response, 
    type Application, 
    type NextFunction 
} from 'express';
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
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cookieParser());

// Robust CORS
const allowedOrigins = [
    process.env.CLIENT_URL, // e.g., https://your-frontend.vercel.app
    'http://localhost:5173',
].filter(Boolean) as (string | RegExp)[];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        
        const isAllowed = allowedOrigins.some(o => {
            if (o instanceof RegExp) return o.test(origin);
            return o === origin || origin.endsWith('.vercel.app');
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

// Connect to DB
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/transactions', transactionRoutes);

// Health Check
app.get('/', (_req: Request, res: Response) => {
    res.status(200).json({
        status: 'success',
        message: 'Nova Bank Backend Operational',
        timestamp: new Date().toISOString()
    });
});

// Global Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error("Global Error:", err.stack);
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
    });
});

// Start server locally (Vercel ignores this and uses the export)
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => console.log(`🚀 Local Server: http://localhost:${PORT}`));
}

export default app;