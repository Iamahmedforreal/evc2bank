import fs from 'fs';
import path from 'path';

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

// Get current date for log file naming
const getCurrentDate = () => {
    return new Date().toISOString().split('T')[0];
};

// Get current timestamp with milliseconds
const getTimestamp = () => {
    return new Date().toISOString();
};

// Log levels
const LOG_LEVELS = {
    ERROR: 'ERROR',
    WARN: 'WARN',
    INFO: 'INFO',
    SUCCESS: 'SUCCESS',
    DEBUG: 'DEBUG'
};

// Color codes for console output
const colors = {
    ERROR: '\x1b[31m',   // Red
    WARN: '\x1b[33m',    // Yellow
    INFO: '\x1b[36m',    // Cyan
    SUCCESS: '\x1b[32m', // Green
    DEBUG: '\x1b[35m',   // Magenta
    RESET: '\x1b[0m'     // Reset
};

// Enhanced Logger Class
class EnhancedLogger {
    constructor() {
        this.logFile = path.join(logsDir, `combined-${getCurrentDate()}.log`);
        this.errorFile = path.join(logsDir, `error-${getCurrentDate()}.log`);
    }

    // Core logging function
    log(level, message, data = null, category = 'GENERAL') {
        const timestamp = getTimestamp();
        const logEntry = {
            timestamp,
            level,
            category,
            message,
            ...(data && { data })
        };

        // Console output with colors
        const colorCode = colors[level] || colors.RESET;
        const formattedMessage = `${colorCode}[${timestamp}] [${level}] [${category}] ${message}${colors.RESET}`;
        
        if (data) {
            console.log(formattedMessage);
            console.log(`${colorCode}Data:${colors.RESET}`, JSON.stringify(data, null, 2));
        } else {
            console.log(formattedMessage);
        }

        // File output
        const fileEntry = JSON.stringify(logEntry) + '\n';
        
        // Write to combined log
        fs.appendFileSync(this.logFile, fileEntry);
        
        // Write errors to separate error log
        if (level === LOG_LEVELS.ERROR) {
            fs.appendFileSync(this.errorFile, fileEntry);
        }
    }

    // Convenience methods
    error(message, data = null, category = 'ERROR') {
        this.log(LOG_LEVELS.ERROR, message, data, category);
    }

    warn(message, data = null, category = 'WARNING') {
        this.log(LOG_LEVELS.WARN, message, data, category);
    }

    info(message, data = null, category = 'INFO') {
        this.log(LOG_LEVELS.INFO, message, data, category);
    }

    success(message, data = null, category = 'SUCCESS') {
        this.log(LOG_LEVELS.SUCCESS, message, data, category);
    }

    debug(message, data = null, category = 'DEBUG') {
        this.log(LOG_LEVELS.DEBUG, message, data, category);
    }

    // Specific operation loggers
    auth(message, data = null) {
        this.log(LOG_LEVELS.INFO, message, data, 'AUTH');
    }

    database(message, data = null) {
        this.log(LOG_LEVELS.INFO, message, data, 'DATABASE');
    }

    transaction(message, data = null) {
        this.log(LOG_LEVELS.INFO, message, data, 'TRANSACTION');
    }

    wallet(message, data = null) {
        this.log(LOG_LEVELS.INFO, message, data, 'WALLET');
    }

    user(message, data = null) {
        this.log(LOG_LEVELS.INFO, message, data, 'USER');
    }

    server(message, data = null) {
        this.log(LOG_LEVELS.INFO, message, data, 'SERVER');
    }

    // Request/Response logging
    request(req, additionalData = {}) {
        const requestData = {
            method: req.method,
            url: req.url,
            headers: req.headers,
            body: req.body,
            query: req.query,
            params: req.params,
            ip: req.ip || req.connection.remoteAddress,
            userAgent: req.get('User-Agent'),
            ...additionalData
        };

        this.log(LOG_LEVELS.INFO, `Incoming ${req.method} request to ${req.url}`, requestData, 'REQUEST');
    }

    response(res, duration, additionalData = {}) {
        const responseData = {
            statusCode: res.statusCode,
            duration: `${duration}ms`,
            ...additionalData
        };

        const level = res.statusCode >= 400 ? LOG_LEVELS.ERROR : LOG_LEVELS.SUCCESS;
        this.log(level, `Response sent with status ${res.statusCode}`, responseData, 'RESPONSE');
    }

    // Performance timing
    startTimer(label) {
        const timestamp = getTimestamp();
        this.debug(`Timer started: ${label}`, { startTime: timestamp }, 'PERFORMANCE');
        return {
            label,
            startTime: Date.now(),
            timestamp
        };
    }

    endTimer(timer) {
        const endTime = Date.now();
        const duration = endTime - timer.startTime;
        const timestamp = getTimestamp();
        
        this.debug(`Timer ended: ${timer.label}`, {
            startTime: timer.timestamp,
            endTime: timestamp,
            duration: `${duration}ms`
        }, 'PERFORMANCE');
        
        return duration;
    }
}

// Create singleton instance
const logger = new EnhancedLogger();

export default logger;
export { LOG_LEVELS };
