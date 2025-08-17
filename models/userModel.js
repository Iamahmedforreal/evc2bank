import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({

    name:{
        type: String,
        required: true,
        
    },

    phone:{
        type: string,
        required: true,
        unique: true,

    },

    hashPassword:{
        type: String,
        required: true,

    },

    
    
}, {timestamps: true});

export default mongoose.model('User', userSchema);
