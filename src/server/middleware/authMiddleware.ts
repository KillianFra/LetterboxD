import { NextFunction, Response } from "express";
import { verifyToken } from "../services/userService";


export function authMiddleware(req: any, res: Response, next: NextFunction) {
    const token = req.headers.authorization;
    if (!token) {
      return res.status(401).send('Unauthorized');
    }
    try {
      const jwtToken = token.replace('Bearer ', ''); 
      const decoded = verifyToken(jwtToken);
      req.user = decoded; // Attach decoded user info to the request object
      next(); // Move to the next middleware or route handler
    } catch (error) {
      res.status(401).send('Invalid token');
    }
  }
