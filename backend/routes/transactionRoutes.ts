import express from 'express';
import { 
    transferByPhone, 
    lookupUserByPhone, 
    getTransactionHistory, 
    payUtilityBill,
    addMoney 
} from '../controllers/transactionController.js'; // Updated to .js for ESM
import { protect } from '../middleware/authMiddleware.js'; // Updated to .js for ESM

const router = express.Router();

/**
 * @route   GET /api/transactions/lookup/:phone
 * @desc    Look up a user's name by their phone number for transfers
 * @access  Private
 */
router.get('/lookup/:phone', protect, lookupUserByPhone);

/**
 * @route   POST /api/transactions/transfer-phone
 * @desc    Execute a phone-to-phone money transfer
 * @access  Private
 */
router.post('/transfer-phone', protect, transferByPhone);

/**
 * @route   GET /api/transactions/history
 * @desc    Fetch all transactions (transfers, deposits, bill payments)
 * @access  Private
 */
router.get('/history', protect, getTransactionHistory);

/**
 * @route   POST /api/transactions/bill-pay
 * @desc    Handle utility bill payments (Electricity, Gas, etc.)
 * @access  Private
 */
router.post('/bill-pay', protect, payUtilityBill);

/**
 * @route   POST /api/transactions/add-money
 * @desc    Top up the user's wallet balance
 * @access  Private
 */
router.post('/add-money', protect, addMoney);

export default router;