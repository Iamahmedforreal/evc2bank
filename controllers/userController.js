import User from '../models/userModel.js';
import Wallet from '../models/wallet.js';
import bcrypt from 'bcryptjs';

const userController = {};

userController.createUser = async (req, res) => {
    const { firstName, lastName, phone, password, role } = req.body;

    try {
        let user = await User.findOne({ phone });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        user = new User({
            firstName,
            lastName,
            phone,
            passwordHash,
            role
        });

        await user.save();

        // Automatically create a wallet for the new user
        const wallet = new Wallet({
            userid: user._id, // Link wallet to the new user's ID
            evcBalance: 0,
            bankBalance: 0,
            currancy: 'USD'
        });
        await wallet.save();

        res.status(201).json({ message: 'User created successfully and wallet initialized', user: user });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

userController.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-passwordHash');
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

userController.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-passwordHash');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

userController.updateUser = async (req, res) => {
    const { firstName, lastName, phone, password, role } = req.body;

    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied: Only admins can update users' });
        }

        user.firstName = firstName || user.firstName;
        user.lastName = lastName || user.lastName;
        user.phone = phone || user.phone;
        user.role = role || user.role;

        if (password) {
            const salt = await bcrypt.genSalt(10);
            user.passwordHash = await bcrypt.hash(password, salt);
        }

        await user.save();
        res.status(200).json({ message: 'User updated successfully', user });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

userController.deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied: Only admins can delete users' });
        }

        await User.deleteOne({ _id: req.params.id });
        res.status(200).json({ message: 'User deleted successfully' });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export default userController;
