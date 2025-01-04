import { Request, Response, NextFunction } from "express";

export function errorMiddleware(
  err: any, 
  req: Request,
  res: Response,
  _next: NextFunction
) {
  // Format error response
  const status = err.status || 500;
  const message = err.message || "Something went wrong";
  res.status(status).json({
    status: false,
    message
  });
}

export default errorMiddleware;