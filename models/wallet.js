import mongoose from 'mongoose';

const walletTranstion = new mongoose.Schema({

    userid:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    evcBalance:{
        type: Number,
        default: 0,
    },

    bankbalance:{
         type: Number,
         default: 0,
    },

    currancy:{
        type : String,
        default: 'USD',

    }
    }, {timestamps: true});

    export default mongoose.model('WalletTransaction', walletTranstion);