import { Request, Response, NextFunction } from "express";
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
    user?: { id: string } | string | any;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ message: "Not authorized, no token" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
        // Standardize req.user to an object with an id property for consistency across controllers
        req.user = { id: decoded.id }; 
        next();
    } catch (error) {
        res.status(401).json({ message: "Not authorized, token failed" });
    }
};
export const authMiddleware = protect;
