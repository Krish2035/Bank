import express, { type Router, type Request, type Response } from 'express';
import { 
    registerUser, 
    loginUser, 
    getMe, 
    logoutUser,
    updateUserProfile 
} from '../controllers/authController.js'; 
import { protect } from '../middleware/authMiddleware.js';

const router: Router = express.Router();

router.post('/signup', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.put('/update-profile', protect, updateUserProfile);
router.post('/logout', protect, logoutUser);

router.get('/status', protect, (req: Request, res: Response) => {
    res.status(200).json({ 
        isAuthenticated: true,
        user: (req as any).user 
    });
});

export default router;