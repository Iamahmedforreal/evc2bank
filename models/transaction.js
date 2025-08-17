import mongoose from 'mongoose';

const transtionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: true,

    },

    status: {  
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending'

    },

    reference:{
        type: String,
        unique: true,
        required: true

    },
    }, {timestamps: true});

    export default mongoose.model('Transaction', transtionSchema);