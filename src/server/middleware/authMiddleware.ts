import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../services/userService";


export function authMiddleware(req: Request, res: Response, next: NextFunction) {
    const token = req.cookies?.token;
    console.log(token);
    if (!token) {
      return res.status(401).send('Unauthorized');
    }
    try {
      const decoded = verifyToken(token);
      req.user = decoded; // Attach decoded user info to the request object
      next(); // Move to the next middleware or route handler
    } catch (error) {
      res.status(401).send('Invalid token');
    }
  }
