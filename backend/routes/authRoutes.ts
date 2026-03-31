import express, { Router } from 'express';
import { 
    registerUser, 
    loginUser, 
    getMe, 
    logoutUser,
    updateUserProfile // Imported the new update controller
} from '../controllers/authController.ts'; 
import { protect } from '../middleware/authMiddleware.ts';

const router: Router = express.Router();

/**
 * @route   POST /api/auth/signup
 * @desc    Register a new user
 * @access  Public
 */
router.post('/signup', registerUser);

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & get token
 * @access  Public
 */
router.post('/login', loginUser);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', protect, getMe);

/**
 * @route   PUT /api/auth/update-profile
 * @desc    Update user profile details (FirstName, LastName, Phone)
 * @access  Private
 */
router.put('/update-profile', protect, updateUserProfile);

/**
 * @route   POST /api/auth/logout
 * @desc    Clear cookies and logout
 * @access  Private
 */
router.post('/logout', protect, logoutUser);

/**
 * @route   GET /api/auth/status
 * @desc    Quick check for authentication status
 * @access  Private
 */
router.get('/status', protect, (req, res) => {
    res.status(200).json({ 
        isAuthenticated: true,
        user: (req as any).user 
    });
});

export default router;