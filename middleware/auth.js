import jwt from 'jsonwebtoken';

import { config, JWT_SECRET } from '../config/env.js';

export const authMiddleware = (req, res, next) => {

    const token = req.headers['authorization']?.split(' ')[1];

    if(!token){
        // return res.status(401).json({ message: 'No token provided' });
        const error = new Error('No token provided');
        error.statusCode = 401;
        return next(error);
    }
    try{
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    }

     catch (error) {
        // return res.status(401).json({ message: 'Invalid token' });
        error.statusCode = 401;
        return next(error);
        }
    };
