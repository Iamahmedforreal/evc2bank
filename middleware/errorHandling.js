const errorHandler = (err, req, res, next) => {
    console.error(err.stack); // Log the error stack for debugging

    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    res.status(statusCode).json({
        success: false,
        message: message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack // Don't expose stack in production
    });
};

export default errorHandler;
