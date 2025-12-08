// @desc Verify user role middleware

import { logger } from "../services/logger.js";

// @route Middleware to check if the user has one of the specified roles
export const verifyRole = (...roles) => {

    return (req, res, next) => {

        const userRole = req.user.role; // Access role directly from req.user (which is the freshUser from DB)

        // Logging information about the user
        logger.debug(`User role verification:
          - User ID: ${req.user._id}
          - User Name: ${req.user.name}
          - User Role (from DB): ${userRole}
          - Required Roles: ${roles.join(', ')}`);
        
        // Check if the user role is included in the allowed roles
        if (!roles.includes(userRole)) {
        return res.status(403).json({ message: 'Forbidden: You do not have the required role.' });
        }
    
        next();
    };
}