import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/userModel.js'; 

dotenv.config(); // loads .env file with MONGO_URL

const MONGO_URL = process.env.MONGO_URL;

const fixOldUsers = async () => {
  try {
    await mongoose.connect(MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('MongoDB connected');

    // Update users without a role
    const result = await User.updateMany(
      { role: { $exists: false } }, // or { role: null }
      { $set: { role: 'user' } }
    );

    console.log(`Updated ${result.modifiedCount} users`);

    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  } catch (error) {
    console.error('Error:', error.message);
  }
};

fixOldUsers();
