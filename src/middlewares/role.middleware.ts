import { Request, Response, NextFunction } from "express";

const authorizeRole = (roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const userRole = req.user?.role; // Access the user's role from req.user

        if (!userRole || !roles.includes(userRole)) {
            res.status(403).json({ message: "Access forbidden: Insufficient permissions." });
            return; // Ensure function stops execution after sending a response
        }

        next(); // Pass control to the next middleware if role is valid
    };
};

export default authorizeRole;
