import { Request, Response, NextFunction } from "express";

const authorizeRole = (roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const userRole = req.user?.role;

        if (!userRole || !roles.includes(userRole)) {
            res.status(403).json({ message: "Access forbidden: Insufficient permissions." });
            return;
        }

        next();
    };
};

export default authorizeRole;
