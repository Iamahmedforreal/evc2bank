
export const permissionMiddleware = (requiredPermission) => {
    return (req, res, next) => {
        // we  if user is authenticated
        if(!req.user?.permissions?.includes(requiredPermission)){
            
            return res.status(403).json({ message: 'Forbidden: You do not have the required permissions' });

        }
        next();
    };
};