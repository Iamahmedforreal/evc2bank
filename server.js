
import express from 'express';

import { loggerMiddleware } from './middleware/logger.js';
import errorHandler from './middleware/errorHandling.js';
import connectMongoDB from './utils/mongodb.js';
import { NODE_ENV, PORT } from './config/env.js';
import authRouter from './routes/authRouter.js';
import userRouter from './routes/userRouter.js';
import walletRouter from './routes/walletRouter.js';
import transactionRouter from './routes/transactionRouter.js';
import logger from './utils/enhancedLogger.js';


const app = express();
app.use(express.json());

// Middleware to log requests
app.use(loggerMiddleware);



// Routes
app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/wallets', walletRouter);
app.use('/api/transactions', transactionRouter);


app.get('/', (req, res) => {
    res.send('Hello World!');
});

// Error handling middleware
app.use(errorHandler);

const startServer = async () => {
    logger.server('Initializing server startup...');
    
    try {
        logger.server('Attempting database connection...');
        const dbTimer = logger.startTimer('Database Connection');
        
        await connectMongoDB(); 
        
        logger.endTimer(dbTimer);
        logger.success('Database connected successfully', null, 'DATABASE');

        logger.server('Starting HTTP server...');
        const serverTimer = logger.startTimer('Server Startup');
        
        app.listen(PORT, () => {
            logger.endTimer(serverTimer);
            logger.success(`Server is running on port ${PORT} in ${NODE_ENV} mode`, {
                port: PORT,
                environment: NODE_ENV,
                timestamp: new Date().toISOString()
            }, 'SERVER');
            
            logger.info('Available routes:', {
                routes: [
                    'GET  / - Health check',
                    'POST /api/auth/register - User registration',
                    'POST /api/auth/login - User login',
                    'GET  /api/users - Get all users',
                    'GET  /api/wallets - Get wallets',
                    'GET  /api/transactions - Get transactions'
                ]
            }, 'ROUTES');
        });
    } catch(error) {
        logger.error('Failed to start server', {
            error: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString()
        }, 'SERVER_ERROR');
        
        process.exit(1);
    }
}

startServer();
