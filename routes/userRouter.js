import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/authorize.js';
 

export  const router = express.Router();

router.get('/profile', authMiddleware, (req, res) => {

    res.status(200).json({
        id: req.user.id ,
        role: req.user.role});

});

router.get('/admin', authMiddleware, authorizeRoles('admin'), (req, res) => {
    res.status(200).json({message: 'Welcome to the admin area', user: req.user});
});



export default router;