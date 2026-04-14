import express, { type Router } from 'express';
import { 
    transferByPhone, 
    lookupUserByPhone, 
    getTransactionHistory, 
    payUtilityBill, // Ensure this matches your transaction controller function
    addMoney 
} from '../controllers/transactionController.js'; 
import { protect } from '../middleware/authMiddleware.js';

const router: Router = express.Router();

router.get('/lookup/:phone', protect, lookupUserByPhone);
router.post('/transfer-phone', protect, transferByPhone);
router.get('/history', protect, getTransactionHistory);

// FIXED: Changed from '/bill-pay' to '/pay-bill' to match mobile frontend call
router.post('/pay-bill', protect, payUtilityBill);

router.post('/add-money', protect, addMoney);

export default router;