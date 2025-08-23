
import User from '../models/userModel.js';
import bcrypt from 'bcryptjs';
import { generateToken } from '../utils/token.js';


export const registerUser = async (req, res) => {
    try {
        const { firstName, lastName, phone, password, role } = req.body;

        // Input validation
        if (!firstName || !lastName || !phone || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const existingUser = await User.findOne({ phone });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

    const hashPassword = await bcrypt.hash(password, 10);

      const user = await User.create({
      firstName: firstName,
      lastName:  lastName,
      phone,
      role: role || 'user', 
      passwordHash: hashPassword, 
    });
    const token = generateToken(user._id , user.role);

    res.status(201).json({
        message: 'User registered successfully',
        user: {
            id: user._id,
            role: user.role,
            token,
        }

    });
} catch(error) {
    res.status(500).json({ message: 'Server error', error: error.message });
}

}



export const loginUser = async (req, res) => {

    try{
        const { phone, password } = req.body;
        const user = await User.findOne({ phone });
        if(!user) {
            return res.status(400).json({ message: 'Invalid phone number or password' });
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if(!isMatch) {
            return res.status(400).json({ message: 'Invalid phone number or password' });
        }

        const token = generateToken(user._id , user.role);
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

    }catch(error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}







