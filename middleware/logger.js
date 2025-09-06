import logger from '../utils/enhancedLogger.js';

export const loggerMiddleware = (req, res, next) => {
    // Start timing for this request
    const timer = logger.startTimer(`${req.method} ${req.url}`);
    
    // Log incoming request
    logger.request(req);

    // Override res.json to capture response data
    const originalJson = res.json;
    let responseData = null;
    
    res.json = function(data) {
        responseData = data;
        return originalJson.call(this, data);
    };

    // Override res.send to capture response data
    const originalSend = res.send;
    res.send = function(data) {
        if (!responseData && data) {
            try {
                responseData = typeof data === 'string' ? JSON.parse(data) : data;
            } catch (e) {
                responseData = data;
            }
        }
        return originalSend.call(this, data);
    };

    // Log response when request finishes
    res.on('finish', () => {
        const duration = logger.endTimer(timer);
        logger.response(res, duration, { responseData });
    });

    next();
};