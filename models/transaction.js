import mongoose from 'mongoose';

const transtionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        enum: ['evc_to_bank', 'bank_to_evc', 'wallet_adjustment'],
        required: true
    },
    status: {  
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending'
    },
    description: {
        type: String,
        required: true
    },
    reference: {
        type: String,
        unique: true,
        required: true
    },
    balanceBefore: {
        type: Number,
        required: true
    },
    balanceAfter: {
        type: Number,
        required: true
    }
}, {timestamps: true});

    export default mongoose.model('Transaction', transtionSchema);