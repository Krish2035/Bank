import { type Request, type Response } from 'express';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';

/**
 * Interface to handle the user object from your protect middleware
 */
interface AuthRequest extends Request {
    user?: { id: string };
}

/**
 * Handles Adding Money to the Wallet (Top-up)
 */
export const addMoney = async (req: AuthRequest, res: Response) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { amount } = req.body;
        const userId = req.user?.id;

        if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
            return res.status(400).json({ success: false, message: "Please enter a valid amount to add" });
        }

        const topUpAmount = Number(amount);

        const user = await User.findById(userId).session(session);
        if (!user) {
            throw new Error("User session not found");
        }

        user.balance += topUpAmount;
        await user.save({ session });

        const createdTransactions = await Transaction.create([{
            sender: userId,
            receiver: userId,
            amount: topUpAmount,
            type: 'deposit',
            category: 'Top-up',
            description: `Added ₹${topUpAmount.toLocaleString('en-IN')} to Nova Wallet`,
            status: 'completed',
            metadata: {
                method: 'Nova Gateway',
            }
        }], { session });

        const transaction = createdTransactions[0];
        if (!transaction) {
            throw new Error("Failed to create transaction record");
        }

        await session.commitTransaction();

        res.status(200).json({
            success: true,
            message: "Money added to your wallet successfully!",
            newBalance: user.balance,
            transactionId: transaction._id
        });

    } catch (error: any) {
        await session.abortTransaction();
        console.error("Add Money Error:", error);
        res.status(400).json({ success: false, message: error.message || "Failed to add money" });
    } finally {
        session.endSession();
    }
};

/**
 * Executes a GPay-style transfer using a Phone Number.
 */
export const transferByPhone = async (req: AuthRequest, res: Response) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { phone, amount, description } = req.body;
        const senderId = req.user?.id; 

        if (!phone || !amount) {
            return res.status(400).json({ success: false, message: "Recipient phone and amount are required" });
        }

        const transferAmount = Number(amount);
        if (isNaN(transferAmount) || transferAmount <= 0) {
            return res.status(400).json({ success: false, message: "Invalid transfer amount" });
        }

        const receiver = await User.findOne({ phoneNumber: phone }).session(session);
        if (!receiver) {
            throw new Error("Recipient not found on Nova Bank");
        }

        if (receiver._id.toString() === senderId) {
            throw new Error("Cannot transfer money to your own account");
        }

        const sender = await User.findById(senderId).session(session);
        if (!sender || sender.balance < transferAmount) {
            throw new Error("Insufficient balance for this transaction");
        }

        // Atomic update of balances
        sender.balance -= transferAmount;
        await sender.save({ session });

        receiver.balance += transferAmount;
        await receiver.save({ session });

        const createdTransactions = await Transaction.create([{
            sender: senderId,
            receiver: receiver._id,
            amount: transferAmount,
            type: 'transfer',
            category: 'Personal',
            description: description || `Transfer to ${receiver.firstName}`,
            status: 'completed',
            metadata: {
                phoneNumber: phone
            }
        }], { session });

        const transaction = createdTransactions[0];
        if (!transaction) {
            throw new Error("Transaction record could not be generated");
        }

        await session.commitTransaction();
        
        res.status(200).json({ 
            success: true,
            message: "Transfer successful!", 
            transactionId: transaction._id,
            newBalance: sender.balance 
        });

    } catch (error: any) {
        await session.abortTransaction();
        res.status(400).json({ success: false, message: error.message || "Transaction failed" });
    } finally {
        session.endSession();
    }
};

/**
 * Handles Utility Bill Payments
 */
export const payUtilityBill = async (req: AuthRequest, res: Response) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { serviceProvider, amount, consumerId } = req.body;
        const senderId = req.user?.id;

        if (!serviceProvider || !amount || !consumerId) {
            return res.status(400).json({ success: false, message: "All bill details are required" });
        }

        const billAmount = Number(amount);
        if (isNaN(billAmount) || billAmount <= 0) {
            return res.status(400).json({ success: false, message: "Invalid bill amount" });
        }

        const sender = await User.findById(senderId).session(session);
        if (!sender || sender.balance < billAmount) {
            throw new Error("Insufficient balance to pay this bill");
        }

        sender.balance -= billAmount;
        await sender.save({ session });

        const createdTransactions = await Transaction.create([{
            sender: senderId,
            amount: billAmount,
            type: 'bill_pay',
            category: 'Utility',
            description: `${serviceProvider} Bill Payment - ID: ${consumerId}`,
            status: 'completed',
            metadata: {
                serviceProvider,
                billId: consumerId
            }
        }], { session });

        const transaction = createdTransactions[0];
        if (!transaction) {
            throw new Error("Bill payment record creation failed");
        }

        await session.commitTransaction();

        res.status(200).json({ 
            success: true,
            message: `${serviceProvider} bill paid successfully!`, 
            transactionId: transaction._id,
            newBalance: sender.balance 
        });

    } catch (error: any) {
        await session.abortTransaction();
        res.status(400).json({ success: false, message: error.message || "Bill payment failed" });
    } finally {
        session.endSession();
    }
};

/**
 * Fetch Transaction History
 */
export const getTransactionHistory = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        
        const transactions = await Transaction.find({
            $or: [{ sender: userId }, { receiver: userId }]
        })
        .populate('sender', 'firstName lastName phoneNumber')
        .populate('receiver', 'firstName lastName phoneNumber')
        .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            transactions
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch history" });
    }
};

/**
 * Quick Lookup for UI (Verification before transfer)
 */
export const lookupUserByPhone = async (req: AuthRequest, res: Response) => {
    try {
        const { phone } = req.params;
        const user = await User.findOne({ phoneNumber: phone }).select('firstName lastName');
        
        if (!user) {
            return res.status(404).json({ success: false, message: "No user found with this number" });
        }

        res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};