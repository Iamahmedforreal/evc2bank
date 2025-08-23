import { body, param, validationResult } from 'express-validator';

// Handle validation errors
export const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array()
        });
    }
    next();
};

// User registration validation
export const validateUserRegistration = [
    body('firstName')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('First name must be between 2 and 50 characters')
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage('First name can only contain letters and spaces'),
    
    body('lastName')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Last name must be between 2 and 50 characters')
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage('Last name can only contain letters and spaces'),
    
    body('phone')
        .isMobilePhone()
        .withMessage('Please provide a valid phone number')
        .isLength({ min: 8, max: 15 })
        .withMessage('Phone number must be between 8 and 15 digits'),
    
    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
    
    body('role')
        .optional()
        .isIn(['user', 'admin',])
        .withMessage('Role must be user, admin'),
    
    handleValidationErrors
];

// User login validation
export const validateUserLogin = [
    body('phone')
        .isMobilePhone()
        .withMessage('Please provide a valid phone number'),
    
    body('password')
        .notEmpty()
        .withMessage('Password is required'),
    
    handleValidationErrors
];

// Transaction validation
export const validateTransaction = [
    body('amount')
        .isFloat({ min: 0.01, max: 1000000 })
        .withMessage('Amount must be between 0.01 and 1,000,000')
        .custom((value) => {
            // Ensure only 2 decimal places
            if (!/^\d+(\.\d{1,2})?$/.test(value.toString())) {
                throw new Error('Amount can have at most 2 decimal places');
            }
            return true;
        }),
    
    handleValidationErrors
];

// Wallet update validation
export const validateWalletUpdate = [
    body('evcBalance')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('EVC balance must be a positive number'),
    
    body('bankBalance')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Bank balance must be a positive number'),
    
    body('currancy')
        .optional()
        .isIn(['USD', 'EUR', 'GBP'])
        .withMessage('Currency must be USD, EUR, or GBP'),
    
    handleValidationErrors
];

// MongoDB ObjectId validation
export const validateObjectId = (paramName) => [
    param(paramName)
        .isMongoId()
        .withMessage(`Invalid ${paramName} format`),
    
    handleValidationErrors
];
