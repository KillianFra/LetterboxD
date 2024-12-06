import { NextFunction } from "express";
import { verifyToken } from "../services/userService";


export function authMiddleware(req: any, res: any, next: NextFunction) {
    const token = req.headers.authorization;
    
    if (!token) {
      return res.status(401).send('Unauthorized');
    }
    try {
      const jwtToken = token.replace('Bearer ', ''); 
      const decoded = verifyToken(jwtToken);
      req.user = decoded; // Attach decoded user info to the request object
      next()
    } catch (error) {
      next(error);
    }
  }
