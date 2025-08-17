
import User from '../models/userModel.js';
import bcrypt from 'bcryptjs';
import { generateToken } from '../utils/token.js';


export const registerUser = async (req, res) => {
 try{
    const {first_name, last_name, phone, password} = req.body;

    const existingUser = await User.findOne({ phone });
    if(existingUser) {
        return res.status(400).json({ message: 'User already exists' });
    }

    const hashPassword = await bcrypt.hash(password, 10);

      const user = await User.create({
      firstName: first_name,
      lastName: last_name,
      phone,
      passwordHash: hashPassword, 
    });
    const token = generateToken(user._id);

    res.status(201).json({
        message: 'User registered successfully',
        user: {
            id: user._id,
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

        const ismatch = await bcrypt.compare(password, user.passwordHash);
        if(!ismatch) {
            return res.status(400).json({ message: 'Invalid phone number or password' });
        }

        const token = generateToken(user._id);
        res.status(200).json({
            message: 'Login successful',
                user: {
                id: user._id,
                token,
                }
        });

    }catch(error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}







