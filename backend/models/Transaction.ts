import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * Transaction Enums for consistency across the app
 */
export const TransactionTypes = ['transfer', 'deposit', 'withdrawal', 'bill_pay', 'merchant_pay'] as const;
export const TransactionStatuses = ['pending', 'completed', 'failed'] as const;

/**
 * Transaction Categories
 * Fix: 'Top-up' is included to match the Frontend 'Add Money' action.
 */
export const TransactionCategories = [
    'Utility', 
    'Personal', 
    'Food', 
    'Services', 
    'Education', 
    'Health', 
    'Electricity', 
    'Mobile',    
    'WiFi',      
    'DTH',       
    'Water',     
    'Gas', 
    'Top-up',    
    'Other'
] as const;

export type TTransactionType = typeof TransactionTypes[number];
export type TTransactionStatus = typeof TransactionStatuses[number];
export type TTransactionCategory = typeof TransactionCategories[number];

export interface ITransaction extends Document {
    sender: mongoose.Types.ObjectId;
    receiver?: mongoose.Types.ObjectId;
    amount: number;
    type: TTransactionType;
    status: TTransactionStatus;
    category: TTransactionCategory;
    description?: string;
    metadata?: {
        phoneNumber?: string;
        serviceProvider?: string;
        billId?: string;
    };
    createdAt: Date;
    updatedAt: Date;
}

const TransactionSchema: Schema<ITransaction> = new Schema(
    {
        sender: { 
            type: Schema.Types.ObjectId, 
            ref: 'User', 
            required: [true, 'Sender ID is required'],
        },
        receiver: { 
            type: Schema.Types.ObjectId, 
            ref: 'User', 
            required: false, // Optional for 'Add Money' or 'Withdrawals'
        },
        amount: { 
            type: Number, 
            required: [true, 'Transaction amount is required'],
            min: [1, 'Amount must be at least 1']
        },
        type: { 
            type: String, 
            enum: TransactionTypes, 
            required: [true, 'Transaction type is required'] 
        },
        status: { 
            type: String, 
            enum: TransactionStatuses, 
            default: 'pending' 
        },
        category: {
            type: String,
            enum: TransactionCategories, 
            default: 'Other',
            required: [true, 'Category is required']
        },
        description: { 
            type: String, 
            trim: true,
            maxlength: [255, 'Description cannot exceed 255 characters']
        },
        metadata: {
            phoneNumber: { type: String, trim: true },
            serviceProvider: { type: String, trim: true },
            billId: { type: String, trim: true }
        }
    }, 
    { 
        timestamps: true,
        toJSON: {
            transform: (_doc, ret) => {
                delete ret.__v;
                return ret;
            }
        }
    }
);

/**
 * Indexes for high-performance queries (Optimizes History View)
 */
TransactionSchema.index({ sender: 1, createdAt: -1 });
TransactionSchema.index({ receiver: 1, createdAt: -1 });
TransactionSchema.index({ status: 1 });
TransactionSchema.index({ "metadata.phoneNumber": 1 }, { sparse: true });
TransactionSchema.index({ "metadata.billId": 1 }, { sparse: true });

const Transaction: Model<ITransaction> = mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', TransactionSchema);

export default Transaction;