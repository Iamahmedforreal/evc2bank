import express from 'express';
import userController from '../controllers/userController.js';
import { authMiddleware } from '../middleware/auth.js';
import { authorizeMiddleware } from '../middleware/authorize.js';

const router = express.Router();

// Admin only: get all users
router.get('/', authMiddleware, authorizeMiddleware(['admin']), userController.getAllUsers);

// Users can see their own profile, admins can see anyone
router.get('/:id', authMiddleware, userController.getUserById);

// Admin only: update user
router.put('/:id', authMiddleware, authorizeMiddleware(['admin']), userController.updateUser);

// Admin only: delete user
router.delete('/:id', authMiddleware, authorizeMiddleware(['admin']), userController.deleteUser);

export default router;
