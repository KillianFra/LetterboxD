import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../../types/types';

export const adminMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ status: false, message: 'Unauthorized' });
    }
};