import express from 'express';
import walletController from '../controllers/walletController.js';
import { authMiddleware } from '../middleware/auth.js';
import { authorizeMiddleware } from '../middleware/authorize.js';

const router = express.Router();

// User can view their own wallet, admin can view any wallet
router.get('/:userId', authMiddleware, walletController.getWallet);

// Admin only: update wallet balance
router.put('/:id', authMiddleware, authorizeMiddleware(['admin']), walletController.updateWallet);

// Admin only: create wallet manually
router.post('/', authMiddleware, authorizeMiddleware(['admin']), walletController.createWallet);

// Admin only: delete wallet
router.delete('/:id', authMiddleware, authorizeMiddleware(['admin']), walletController.deleteWallet);

export default router;
