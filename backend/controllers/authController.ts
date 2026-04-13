import { type Request, type Response } from 'express';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

/**
 * Custom Interface for requests containing user data
 */
interface AuthRequest extends Request {
    user?: any;
}

/**
 * Helper: Generate a unique 10-digit account number
 */
const generateAccountNumber = (): string => {
    return Math.floor(1000000000 + Math.random() * 9000000000).toString();
};

/**
 * Helper: Centralized Cookie Configuration
 */
const cookieOptions: any = {
    httpOnly: true,
    secure: true, 
    sameSite: "none", 
    maxAge: 24 * 60 * 60 * 1000, 
};

// --- REGISTER USER ---
export const registerUser = async (req: Request, res: Response) => {
    try {
        const { firstName, lastName, email, password, phone } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "User already registered with this email" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            phoneNumber: phone,
            accountNumber: generateAccountNumber(),
            balance: 1000 
        });

        await newUser.save();

        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            throw new Error("JWT_SECRET is missing from server environment");
        }

        const token = jwt.sign(
            { id: newUser._id }, 
            jwtSecret, 
            { expiresIn: '1d' }
        );

        res.cookie("token", token, cookieOptions);

        const userResponse = newUser.toObject();
        delete (userResponse as any).password;

        res.status(201).json({
            success: true,
            message: "Account created successfully",
            user: userResponse
        });

    } catch (error: any) {
        console.error("Registration Error:", error);
        res.status(500).json({ success: false, message: "Registration failed", error: error.message });
    }
};

// --- LOGIN USER ---
export const loginUser = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(400).json({ message: "Invalid Email or Password" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid Email or Password" });
        }

        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            throw new Error("JWT_SECRET is not defined");
        }

        const token = jwt.sign(
            { id: user._id }, 
            jwtSecret, 
            { expiresIn: '1d' }
        );

        res.cookie("token", token, cookieOptions);

        const userResponse = user.toObject();
        delete (userResponse as any).password;

        res.status(200).json({
            success: true,
            message: "Login successful",
            user: userResponse
        });

    } catch (error: any) {
        console.error("Login Error:", error);
        res.status(500).json({ success: false, message: "Login Error", error: error.message });
    }
};

// --- DEPOSIT MONEY (Add Money) ---
// This is the function that was missing causing your "Server Busy" error
export const depositMoney = async (req: Request, res: Response) => {
    try {
        const { userId, amount } = req.body;

        if (!userId || !amount) {
            return res.status(400).json({ success: false, message: "Missing User ID or Amount" });
        }

        // Increment the balance field
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $inc: { balance: amount } }, 
            { new: true, runValidators: true }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.status(200).json({
            success: true,
            message: "Money added successfully",
            user: updatedUser 
        });
    } catch (error: any) {
        console.error("Deposit Error:", error.message);
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
};

// --- GET CURRENT USER ---
export const getMe = async (req: AuthRequest, res: Response) => {
    try {
        const userId = typeof req.user === 'object' ? req.user.id : req.user;
        const user = await User.findById(userId).select('-password');
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(user);
    } catch (error: any) {
        res.status(500).json({ message: "Authorization Error", error: error.message });
    }
};

// --- UPDATE USER PROFILE ---
export const updateUserProfile = async (req: AuthRequest, res: Response) => {
    try {
        const userId = typeof req.user === 'object' ? req.user.id : req.user;
        const { firstName, lastName, phoneNumber } = req.body;

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { 
                $set: { 
                    firstName, 
                    lastName, 
                    phoneNumber 
                } 
            },
            { new: true, runValidators: true }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user: updatedUser
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: "Update failed", error: error.message });
    }
};

// --- LOGOUT USER ---
export const logoutUser = async (req: Request, res: Response) => {
    try {
        res.clearCookie("token", {
            ...cookieOptions,
            maxAge: 0
        });
        res.status(200).json({ success: true, message: "Logged out successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Logout failed" });
    }
};