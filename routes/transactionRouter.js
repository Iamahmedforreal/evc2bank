import express from 'express';
import transactionController from '../controllers/transactionController.js';
import { authMiddleware } from '../middleware/auth.js';
import { authorizeMiddleware } from '../middleware/authorize.js';

const router = express.Router();

// EVC → Bank Transfer (authenticated users only)
router.post('/evc-to-bank', authMiddleware, transactionController.evcToBankTransfer);

// Bank → EVC Transfer (authenticated users only)
router.post('/bank-to-evc', authMiddleware, transactionController.bankToEvcTransfer);

// Transaction History
// Users can see their own: /api/transactions/history/me
// Admin can see any user's: /api/transactions/history/:userId
// Admin can see all: /api/transactions/history
router.get('/history/:userId?', authMiddleware, transactionController.getTransactionHistory);

// Check Wallet Balance
// Users can check their own: /api/transactions/balance/me
// Admin can check any: /api/transactions/balance/:userId
router.get('/balance/:userId', authMiddleware, transactionController.checkWalletBalance);

export default router;
