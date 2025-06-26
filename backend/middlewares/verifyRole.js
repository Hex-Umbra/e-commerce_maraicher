// @desc Verify user role middleware
// @route Middleware to check if the user has one of the specified roles
export const verifyRole = (...roles) => {

    return (req, res, next) => {

        const userRole = req.user.role;
    
        if (!roles.includes(userRole)) {
        return res.status(403).json({ message: 'Forbidden: You do not have the required role.' });
        }
    
        next();
    };
}