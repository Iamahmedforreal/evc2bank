import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phone: {
        type: String,
        required: true,
        unique: true,
        match: /^[0-9]{8,15}$/, // optional validation
    },
    passwordHash: { type: String, required: true },
}, { timestamps: true });

export default mongoose.model('User', userSchema);
