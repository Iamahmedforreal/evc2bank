import mongoose from 'mongoose';
import logger from './enhancedLogger.js';
import { MONGO_URL } from '../config/env.js';

const connectMongoDB = async () => {
    logger.database('Initializing MongoDB connection...');

    if (!MONGO_URL) {
        const error = new Error('MONGO_URL is not defined in environment variables');
        logger.error('MongoDB connection failed', {
            error: error.message,
            envCheck: 'MONGO_URL not found'
        }, 'DATABASE_ERROR');
        throw error;
    }

    logger.database('MongoDB URL found, setting connection options...');
    mongoose.set('strictQuery', false);

    try {
        logger.database('Attempting to connect to MongoDB...', {
            url: MONGO_URL.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@') // Hide credentials in logs
        });

        const db = await mongoose.connect(MONGO_URL);
        
        logger.success('MongoDB connected successfully', {
            host: db.connection.host,
            port: db.connection.port,
            database: db.connection.name,
            readyState: db.connection.readyState
        }, 'DATABASE');

        // Listen for MongoDB events
        mongoose.connection.on('connected', () => {
            logger.database('MongoDB connection established');
        });

        mongoose.connection.on('error', (error) => {
            logger.error('MongoDB connection error', {
                error: error.message,
                stack: error.stack
            }, 'DATABASE_ERROR');
        });

        mongoose.connection.on('disconnected', () => {
            logger.warn('MongoDB disconnected', null, 'DATABASE');
        });

        return db;
    } catch (error) {
        logger.error('Error connecting to MongoDB', {
            error: error.message,
            stack: error.stack,
            mongoUrl: MONGO_URL ? 'Provided' : 'Missing'
        }, 'DATABASE_ERROR');
        
        // Don't exit here, let the calling function handle it
        throw error;
    }
}

export default connectMongoDB;