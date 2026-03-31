import { type Request, type Response } from 'express';
import mongoose from 'mongoose';
import User from '../models/User.js'; // Updated to .js for ESM compatibility
import Transaction from '../models/Transaction.js'; // Updated to .js for ESM compatibility

/**
 * Custom interface to allow 'user' property on Request
 * This matches the data injected by your protect middleware
 */
interface AuthRequest extends Request {
    user?: { id: string };
}

/**
 * INTERNAL TRANSFER BETWEEN USERS
 */
export const transferFunds = async (req: AuthRequest, res: Response) => {
    const { recipientAccountNumber, amount, description } = req.body;
    const senderId = req.user?.id;

    if (!senderId) {
        return res.status(401).json({ success: false, error: "Authentication required" });
    }

    // Initialize the session for ACID compliance
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const transferAmount = Number(amount);
        if (isNaN(transferAmount) || transferAmount <= 0) {
            throw new Error('Please enter a valid positive amount');
        }

        // 1. Fetch Sender
        const sender = await User.findById(senderId).session(session);
        if (!sender) throw new Error('Sender account not found');
        if (sender.balance < transferAmount) throw new Error('Insufficient funds');

        // 2. Fetch Recipient
        const recipient = await User.findOne({ accountNumber: recipientAccountNumber }).session(session);
        if (!recipient) throw new Error('Recipient account number not found');

        // Safety: Prevent self-transfer
        if (sender._id.toString() === recipient._id.toString()) {
            throw new Error('You cannot transfer money to your own account');
        }

        // 3. Update Balances
        sender.balance -= transferAmount;
        recipient.balance += transferAmount;

        // 4. Save Changes
        await sender.save({ session });
        await recipient.save({ session });

        // 5. Create Transaction Record
        const createdTransactions = await Transaction.create([
            {
                sender: sender._id,
                receiver: recipient._id,
                amount: transferAmount,
                type: 'transfer',
                status: 'completed',
                category: 'Personal',
                description: description || `Transfer to ${recipient.firstName} ${recipient.lastName}`,
                metadata: { phoneNumber: recipient.phoneNumber }
            }
        ], { session });

        // Check if transaction was successfully created before committing
        if (!createdTransactions || createdTransactions.length === 0) {
            throw new Error("Failed to record transaction history");
        }

        // Commit all DB changes at once
        await session.commitTransaction();
        
        res.status(200).json({ 
            success: true,
            message: 'Transfer successful', 
            newBalance: sender.balance 
        });

    } catch (error: any) {
        // Undo everything if any step fails
        await session.abortTransaction();
        res.status(400).json({ success: false, error: error.message });
    } finally {
        session.endSession();
    }
};

/**
 * UTILITY BILL PAYMENT (Electricity, Water, etc.)
 */
export const payBill = async (req: AuthRequest, res: Response) => {
    const { amount, serviceProvider, consumerNumber, category } = req.body;
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const user = await User.findById(userId).session(session);
        if (!user) throw new Error("User account not found");

        const billAmount = Number(amount);
        if (isNaN(billAmount) || billAmount <= 0) throw new Error("Invalid bill amount");
        
        if (user.balance < billAmount) {
            return res.status(400).json({ success: false, message: "Insufficient balance to pay this bill" });
        }

        // 1. Deduct balance
        user.balance -= billAmount;
        await user.save({ session });

        // 2. Record Bill Payment
        const createdTransactions = await Transaction.create([
            {
                sender: userId,
                amount: billAmount,
                type: 'bill_pay',
                status: 'completed',
                category: category || 'Utility',
                description: `Bill payment to ${serviceProvider}`,
                metadata: { serviceProvider, billId: consumerNumber }
            }
        ], { session });

        if (!createdTransactions || createdTransactions.length === 0) {
            throw new Error("Bill payment record failed to generate");
        }

        await session.commitTransaction();
        
        res.status(200).json({ 
            success: true,
            message: "Payment successful", 
            newBalance: user.balance 
        });

    } catch (error: any) {
        await session.abortTransaction();
        res.status(500).json({ success: false, message: error.message });
    } finally {
        session.endSession();
    }
};