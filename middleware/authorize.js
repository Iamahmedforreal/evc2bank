


export const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user){
            return res.status(403).json({ message: 'Access denied, not autherize' });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Access denied, insufficient permissions' });

        }
        next();
    }

    
}