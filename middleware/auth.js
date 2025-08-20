import jwt from 'jsonwebtoken';

export const authMiddleware = (req, res , next) => {
    const token = req.headers['authorization'].split(' ')[1];

    if (!token) {
        const error = new Error('No token provided, authorization denied');
        error.status = 401;
        return next(error);
    }

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; 
        next();
    }

    catch(error) {
        error.status = 401;
        return next(error);
    }


}