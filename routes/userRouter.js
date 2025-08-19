import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { permissionMiddleware } from '../middleware/permissionMiddleware.js'; 

export  const router = express.Router();

router.get('/profile', authMiddleware, (req, res) => {

    res.status(200).json({id: req.user.id , role: req.user.role});

});

router.get('/admin', authMiddleware, permissionMiddleware('admin'), (req, res) => {
    res.status(200).json({message: 'Welcome to the admin area', user: req.user});
});

router.get('/merchant', authMiddleware, permissionMiddleware('merchant'), (req, res) => {
    res.status(200).json({message: 'Welcome to the merchant area', user: req.user});
});

