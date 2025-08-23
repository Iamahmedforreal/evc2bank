import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import { promisify } from 'util';

export const authMiddleware = async (req, res, next) => {
    try {
        // 1. Check if token exists
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ 
                success: false,
                message: 'Access denied. No token provided.' 
            });
        }

        const token = authHeader.split(' ')[1];

        // 2. Verify token
        const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

        // 3. Check if user still exists
        const currentUser = await User.findById(decoded.id).select('-passwordHash');
        if (!currentUser) {
            return res.status(401).json({
                success: false,
                message: 'The user belonging to this token no longer exists.'
            });
        }

        // 4. Check if user changed password after token was issued
        if (currentUser.passwordChangedAt && decoded.iat < currentUser.passwordChangedAt.getTime() / 1000) {
            return res.status(401).json({
                success: false,
                message: 'User recently changed password. Please log in again.'
            });
        }

        // 5. Check if account is active/not suspended
        if (currentUser.status && currentUser.status !== 'active') {
            return res.status(401).json({
                success: false,
                message: 'Your account has been suspended. Please contact support.'
            });
        }

        // Grant access to protected route
        req.user = currentUser;
        next();

    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token. Please log in again.'
            });
        } else if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Your token has expired. Please log in again.'
            });
        }
        
        return res.status(500).json({
            success: false,
            message: 'Authentication error occurred.'
        });
    }
};
