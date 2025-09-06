
import User from '../models/userModel.js';
import bcrypt from 'bcryptjs';
import { generateToken } from '../utils/token.js';
import logger from '../utils/enhancedLogger.js';


export const registerUser = async (req, res) => {
    const timer = logger.startTimer('User Registration');
    
    try {
        const { firstName, lastName, phone, password, role } = req.body;
        
        logger.auth('User registration attempt', {
            firstName,
            lastName,
            phone,
            role: role || 'user'
        });

        // Input validation
        if (!firstName || !lastName || !phone || !password) {
            logger.warn('Registration failed: Missing required fields', {
                provided: { firstName: !!firstName, lastName: !!lastName, phone: !!phone, password: !!password }
            }, 'AUTH_VALIDATION');
            return res.status(400).json({ message: 'All fields are required' });
        }

        logger.database('Checking for existing user with phone', { phone });
        const existingUser = await User.findOne({ phone });
        if (existingUser) {
            logger.warn('Registration failed: User already exists', { phone }, 'AUTH_DUPLICATE');
            return res.status(400).json({ message: 'User already exists' });
        }

        logger.auth('Hashing password...');
        const hashPassword = await bcrypt.hash(password, 10);

        logger.database('Creating new user in database...');
        const user = await User.create({
            firstName: firstName,
            lastName: lastName,
            phone,
            role: role || 'user', 
            passwordHash: hashPassword, 
        });

        logger.auth('Generating authentication token', { userId: user._id, role: user.role });
        const token = generateToken(user._id, user.role);

        const duration = logger.endTimer(timer);
        logger.success('User registered successfully', {
            userId: user._id,
            phone: user.phone,
            role: user.role,
            registrationTime: duration
        }, 'AUTH_SUCCESS');

        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: user._id,
                role: user.role,
                token,
            }
        });
    } catch(error) {
        logger.endTimer(timer);
        logger.error('User registration failed', {
            error: error.message,
            stack: error.stack,
            requestBody: req.body
        }, 'AUTH_ERROR');
        
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}



export const loginUser = async (req, res) => {
    const timer = logger.startTimer('User Login');
    
    try {
        const { phone, password } = req.body;
        
        logger.auth('User login attempt', { phone });

        logger.database('Finding user by phone', { phone });
        const user = await User.findOne({ phone });
        if (!user) {
            logger.warn('Login failed: User not found', { phone }, 'AUTH_FAILED');
            return res.status(400).json({ message: 'Invalid phone number or password' });
        }

        logger.auth('Verifying password for user', { userId: user._id });
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            logger.warn('Login failed: Invalid password', { 
                phone, 
                userId: user._id 
            }, 'AUTH_FAILED');
            return res.status(400).json({ message: 'Invalid phone number or password' });
        }

        logger.auth('Generating authentication token', { userId: user._id, role: user.role });
        const token = generateToken(user._id, user.role);

        const duration = logger.endTimer(timer);
        logger.success('User logged in successfully', {
            userId: user._id,
            phone: user.phone,
            role: user.role,
            loginTime: duration
        }, 'AUTH_SUCCESS');

        res.status(200).json({
            message: 'Login successful',
            user: {
                id: user._id,
                role: user.role,
                firstName: user.firstName,
                lastName: user.lastName,
                phone: user.phone,
                token,
            }
        });

    } catch(error) {
        logger.endTimer(timer);
        logger.error('User login failed', {
            error: error.message,
            stack: error.stack,
            requestBody: { phone: req.body.phone } // Don't log password
        }, 'AUTH_ERROR');
        
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}







