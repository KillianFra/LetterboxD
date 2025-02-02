import { userToken } from '../../types/types';
import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: userToken;
    }
  }
} 