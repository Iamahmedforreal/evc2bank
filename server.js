import express from 'express';
import { config } from './config/env.js';
import { logger } from './middleware/logger.js';
import errorHandler from './middleware/errorHandling.js';


const app = express();
app.use(express.json());

// Middleware to log requests
app.use(logger);



app.get('/', (req, res) => {
    res.send('Hello World!');
});

// Error handling middleware
app.use(errorHandler);

app.listen(config.port, () => {
    console.log(`Server is running on http://localhost:${config.port}`);
});
