import { Request, Response, NextFunction } from "express";

export function errorMiddleware(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const status = err.status || 500;
  const message = err.message || "Something went wrong";

  res.status(status).json({
    status,
    message,
  });

  next();
}

export default errorMiddleware;
