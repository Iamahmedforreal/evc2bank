import mongoose from 'mongoose';

import { MONGO_URL } from '../config/env.js';



const connectMongoDB = async () => {


if(!MONGO_URL){
    
    throw new Error('MONGO_URL is not defined');
}

mongoose.set('strictQuery', false); 

try{
     const db = await mongoose.connect(MONGO_URL);
    console.log('MongoDB connected successfully');
    return db;
}
catch(error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1); // Exit the process with failure
}

}

export default connectMongoDB;