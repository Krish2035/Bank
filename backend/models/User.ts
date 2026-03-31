import mongoose, { Schema, Document, Model } from 'mongoose';

// 1. Interface representing the User document
export interface IUser extends Document {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    accountNumber: string;
    balance: number;
    phoneNumber?: string;
    createdAt: Date;
    updatedAt: Date;
}

// 2. Define the Schema
const UserSchema: Schema<IUser> = new Schema(
    {
        firstName: { 
            type: String, 
            required: [true, 'First name is required'], 
            trim: true 
        },
        lastName: { 
            type: String, 
            required: [true, 'Last name is required'], 
            trim: true 
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address'],
        },
        password: { 
            type: String, 
            required: [true, 'Password is required'], 
            minlength: [6, 'Password must be at least 6 characters'],
            select: false // Automatically excludes password from queries by default
        },
        accountNumber: {
            type: String,
            unique: true,
            required: true,
            index: true // Optimized for searching
        },
        balance: { 
            type: Number, 
            default: 0,
            min: [0, 'Balance cannot be negative'] 
        },
        phoneNumber: { 
            type: String,
            trim: true 
        },
    },
    { 
        timestamps: true,
        // Ensures that when we convert to JSON (API responses), we don't leak internal __v
        toJSON: {
            transform: (doc, ret) => {
                delete ret.__v;
                return ret;
            }
        }
    }
);

// 3. Create and Export the Model
const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export default User;