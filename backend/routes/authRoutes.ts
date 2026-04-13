import express, { type Router, type Request, type Response } from 'express';
import { 
    registerUser, 
    loginUser, 
    getMe, 
    logoutUser,
    updateUserProfile,
    depositMoney // 1. Import the deposit controller function
} from '../controllers/authController.js'; 
import { protect } from '../middleware/authMiddleware.js';

const router: Router = express.Router();

// Public Routes
router.post('/signup', registerUser);
router.post('/login', loginUser);

// Transaction Routes (Adding Money)
// We add this so the "Add Money" button in your app actually has a destination
router.post('/deposit', depositMoney); 

// Protected Routes (Require Auth Token)
router.get('/me', protect, getMe);
router.put('/update-profile', protect, updateUserProfile);
router.post('/logout', protect, logoutUser);

// Health/Status Check
router.get('/status', protect, (req: Request, res: Response) => {
    res.status(200).json({ 
        isAuthenticated: true,
        user: (req as any).user 
    });
});

export default router;