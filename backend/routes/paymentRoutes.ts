import { Router, type Response } from 'express';
import { createPaymentIntent } from '../services/stripeService.js';
import Transaction from '../models/Transaction.js';
import { protect, type AuthRequest } from '../middleware/authMiddleware.js';
import { transferFunds, payBill } from '../controllers/paymentController.js';
import User from '../models/User.js';
import mongoose from 'mongoose';

const router = Router();

/**
 * @route   POST /api/payments/create-intent
 * @desc    Step 1: Create a Stripe Payment Intent and log a pending deposit
 * @access  Private
 */
router.post('/create-intent', protect, async (req: AuthRequest, res: Response) => {
    try {
        const { amount, currency = 'usd' } = req.body;
        const userId = req.user?.id;

        if (!amount || Number(amount) <= 0) {
            return res.status(400).json({ error: 'A positive deposit amount is required' });
        }

        // 1. Call Stripe Service
        const intent = await createPaymentIntent(Number(amount), currency, { userId });

        // 2. Create a 'pending' record
        await Transaction.create([
            {
                sender: userId,
                amount: Number(amount),
                type: 'deposit',
                status: 'pending',
                category: 'Top-up', // Fixed: Match categories from Transaction model
                description: `Deposit via Stripe (${currency.toUpperCase()})`,
                metadata: { 
                    billId: intent.id // Stripe Payment Intent ID
                }
            }
        ]);

        res.status(200).json({
            clientSecret: intent.clientSecret,
            paymentIntentId: intent.id
        });
    } catch (error: any) {
        console.error("Stripe Intent Error:", error.message);
        res.status(500).json({ error: error.message });
    }
});

/**
 * @route   POST /api/payments/confirm-deposit
 * @desc    Step 2: Update user balance after Stripe confirms success
 * @access  Private
 */
router.post('/confirm-deposit', protect, async (req: AuthRequest, res: Response) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { paymentIntentId } = req.body;
        const userId = req.user?.id;

        // 1. Find the pending transaction
        const transaction = await Transaction.findOne({ 
            "metadata.billId": paymentIntentId, 
            status: 'pending',
            sender: userId 
        }).session(session);

        if (!transaction) {
            throw new Error("Transaction not found, already processed, or unauthorized");
        }

        // 2. Find the User
        const user = await User.findById(userId).session(session);
        if (!user) throw new Error("User account not found");

        // 3. Update User Balance and Transaction Status
        user.balance += transaction.amount;
        transaction.status = 'completed';

        await user.save({ session });
        await transaction.save({ session });

        // 4. Finalize changes
        await session.commitTransaction();
        
        res.status(200).json({ 
            success: true,
            message: "Funds successfully added to your account", 
            newBalance: user.balance 
        });

    } catch (error: any) {
        await session.abortTransaction();
        res.status(400).json({ success: false, error: error.message });
    } finally {
        session.endSession();
    }
});

/**
 * OTHER PAYMENT ROUTES
 */
router.post('/transfer', protect, transferFunds);
router.post('/pay-bill', protect, payBill);

export default router;