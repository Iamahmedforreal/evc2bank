import User from '../models/userModel.js';
import Wallet from '../models/wallet.js';
import bcrypt from 'bcryptjs';
import logger from '../utils/enhancedLogger.js';

const userController = {};

userController.createUser = async (req, res) => {
    const timer = logger.startTimer('Create User');
    const { firstName, lastName, phone, password, role } = req.body;

    try {
        logger.user('Creating new user', { firstName, lastName, phone, role });

        logger.database('Checking for existing user', { phone });
        let user = await User.findOne({ phone });
        if (user) {
            logger.warn('User creation failed: User already exists', { phone }, 'USER_DUPLICATE');
            return res.status(400).json({ message: 'User already exists' });
        }

        logger.user('Generating password hash...');
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        logger.database('Saving new user to database...');
        user = new User({
            firstName,
            lastName,
            phone,
            passwordHash,
            role
        });

        await user.save();
        logger.success('User saved successfully', { userId: user._id }, 'USER');

        // Automatically create a wallet for the new user
        logger.wallet('Creating wallet for new user', { userId: user._id });
        const wallet = new Wallet({
            userid: user._id, // Link wallet to the new user's ID
            evcBalance: 0,
            bankBalance: 0,
            currancy: 'USD'
        });
        await wallet.save();
        logger.success('Wallet created successfully', { userId: user._id, walletId: wallet._id }, 'WALLET');

        const duration = logger.endTimer(timer);
        logger.success('User created successfully with wallet', {
            userId: user._id,
            walletId: wallet._id,
            creationTime: duration
        }, 'USER_SUCCESS');

        res.status(201).json({ message: 'User created successfully and wallet initialized', user: user });

    } catch (error) {
        logger.endTimer(timer);
        logger.error('User creation failed', {
            error: error.message,
            stack: error.stack,
            requestBody: req.body
        }, 'USER_ERROR');
        res.status(500).json({ message: error.message });
    }
};

userController.getAllUsers = async (req, res) => {
    const timer = logger.startTimer('Get All Users');
    
    try {
        logger.user('Fetching all users from database...');
        const users = await User.find().select('-passwordHash');
        
        const duration = logger.endTimer(timer);
        logger.success('Users fetched successfully', {
            count: users.length,
            fetchTime: duration
        }, 'USER_SUCCESS');
        
        res.status(200).json(users);
    } catch (error) {
        logger.endTimer(timer);
        logger.error('Failed to fetch users', {
            error: error.message,
            stack: error.stack
        }, 'USER_ERROR');
        res.status(500).json({ message: error.message });
    }
};

userController.getUserById = async (req, res) => {
    const timer = logger.startTimer('Get User By ID');
    const userId = req.params.id;
    
    try {
        logger.user('Fetching user by ID', { userId });
        const user = await User.findById(userId).select('-passwordHash');
        
        if (!user) {
            logger.warn('User not found', { userId }, 'USER_NOT_FOUND');
            return res.status(404).json({ message: 'User not found' });
        }
        
        const duration = logger.endTimer(timer);
        logger.success('User fetched successfully', {
            userId,
            fetchTime: duration
        }, 'USER_SUCCESS');
        
        res.status(200).json(user);
    } catch (error) {
        logger.endTimer(timer);
        logger.error('Failed to fetch user', {
            error: error.message,
            stack: error.stack,
            userId
        }, 'USER_ERROR');
        res.status(500).json({ message: error.message });
    }
};

userController.updateUser = async (req, res) => {
    const timer = logger.startTimer('Update User');
    const userId = req.params.id;
    const { firstName, lastName, phone, password, role } = req.body;

    try {
        logger.user('Updating user', { userId, updates: { firstName, lastName, phone, role } });

        logger.database('Finding user to update', { userId });
        const user = await User.findById(userId);
        if (!user) {
            logger.warn('User update failed: User not found', { userId }, 'USER_NOT_FOUND');
            return res.status(404).json({ message: 'User not found' });
        }

        logger.user('Checking admin permissions', { requesterId: req.user.id, requesterRole: req.user.role });
        if (req.user.role !== 'admin') {
            logger.warn('User update failed: Access denied', {
                requesterId: req.user.id,
                requesterRole: req.user.role,
                targetUserId: userId
            }, 'USER_UNAUTHORIZED');
            return res.status(403).json({ message: 'Access denied: Only admins can update users' });
        }

        logger.user('Applying user updates...');
        user.firstName = firstName || user.firstName;
        user.lastName = lastName || user.lastName;
        user.phone = phone || user.phone;
        user.role = role || user.role;

        if (password) {
            logger.user('Updating password hash...');
            const salt = await bcrypt.genSalt(10);
            user.passwordHash = await bcrypt.hash(password, salt);
        }

        logger.database('Saving updated user to database...');
        await user.save();
        
        const duration = logger.endTimer(timer);
        logger.success('User updated successfully', {
            userId,
            updatedBy: req.user.id,
            updateTime: duration
        }, 'USER_SUCCESS');

        res.status(200).json({ message: 'User updated successfully', user });

    } catch (error) {
        logger.endTimer(timer);
        logger.error('User update failed', {
            error: error.message,
            stack: error.stack,
            userId,
            requestBody: req.body
        }, 'USER_ERROR');
        res.status(500).json({ message: error.message });
    }
};

userController.deleteUser = async (req, res) => {
    const timer = logger.startTimer('Delete User');
    const userId = req.params.id;

    try {
        logger.user('Attempting to delete user', { userId });

        logger.database('Finding user to delete', { userId });
        const user = await User.findById(userId);
        if (!user) {
            logger.warn('User deletion failed: User not found', { userId }, 'USER_NOT_FOUND');
            return res.status(404).json({ message: 'User not found' });
        }

        logger.user('Checking admin permissions for deletion', { requesterId: req.user.id, requesterRole: req.user.role });
        if (req.user.role !== 'admin') {
            logger.warn('User deletion failed: Access denied', {
                requesterId: req.user.id,
                requesterRole: req.user.role,
                targetUserId: userId
            }, 'USER_UNAUTHORIZED');
            return res.status(403).json({ message: 'Access denied: Only admins can delete users' });
        }

        logger.database('Deleting user from database...', { userId });
        await User.deleteOne({ _id: userId });
        
        const duration = logger.endTimer(timer);
        logger.success('User deleted successfully', {
            userId,
            deletedBy: req.user.id,
            deletionTime: duration
        }, 'USER_SUCCESS');

        res.status(200).json({ message: 'User deleted successfully' });

    } catch (error) {
        logger.endTimer(timer);
        logger.error('User deletion failed', {
            error: error.message,
            stack: error.stack,
            userId,
            requesterId: req.user?.id
        }, 'USER_ERROR');
        res.status(500).json({ message: error.message });
    }
};

export default userController;
