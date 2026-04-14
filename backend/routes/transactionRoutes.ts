import express, { type Router } from 'express';
import { 
    transferByPhone, 
    lookupUserByPhone, 
    getTransactionHistory, 
    payUtilityBill, 
    addMoney 
} from '../controllers/transactionController.js'; 
import { protect } from '../middleware/authMiddleware.js';

const router: Router = express.Router();

/**
 * @route   GET /api/transactions/lookup/:phone
 * @desc    Look up a user's name by their phone number before transferring
 */
router.get('/lookup/:phone', protect, lookupUserByPhone);

/**
 * @route   POST /api/transactions/transfer-phone
 * @desc    Transfer money to another user using their phone number
 */
router.post('/transfer-phone', protect, transferByPhone);

/**
 * @route   GET /api/transactions/history
 * @desc    Get the transaction history for the logged-in user
 */
router.get('/history', protect, getTransactionHistory);

/**
 * @route   POST /api/transactions/pay-bill
 * @desc    Handle utility bill payments (Electricity, Water, etc.)
 * FIXED: Route name matches the frontend call to prevent 404 HTML errors.
 */
router.post('/pay-bill', protect, payUtilityBill);

/**
 * @route   POST /api/transactions/add-money
 * @desc    Add money/Deposit to the user's own account
 */
router.post('/add-money', protect, addMoney);

export default router;