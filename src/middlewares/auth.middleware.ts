import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserTokenPayload } from '../types/user';

const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
        res.status(401).json({ message: 'Access denied. No token provided.' });
        return;
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as UserTokenPayload;
        req.user = decoded;
        next();
    } catch (err) {
        res.status(400).json({ message: 'Invalid token.' });
        return;
    }
};

export default authMiddleware;
