
import express from 'express';

import { logger } from './middleware/logger.js';
import errorHandler from './middleware/errorHandling.js';
import connectMongoDB from './utils/mongodb.js';
import { NODE_ENV, PORT } from './config/env.js';



const app = express();
app.use(express.json());

// Middleware to log requests
app.use(logger);



app.get('/', (req, res) => {
    res.send('Hello World!');
});

// Error handling middleware
app.use(errorHandler);

const stratServer = async () => {
    try{

        await connectMongoDB(); 

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT} in ${NODE_ENV} mode`);
        });
    }


    catch(error) {
        console.error('Failed to start server:', error.message);
    }

}

stratServer();
