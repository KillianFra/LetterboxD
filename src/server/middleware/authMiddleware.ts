import { Request, Response, NextFunction } from 'express';
import { verifyToken } from "../services/userService";
import { AuthenticatedRequest } from '../../../types/types';

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
    const token = req.headers.authorization;
    if (!token) {
        return next('No token provided');
    }
    try {
        const jwtToken = token.replace('Bearer ', ''); 
        const decoded = verifyToken(jwtToken);
        (req as AuthenticatedRequest).user = decoded; // Attach decoded user info to the request object
        next();
    } catch (err) {
        next('Invalid token');
    }
}
