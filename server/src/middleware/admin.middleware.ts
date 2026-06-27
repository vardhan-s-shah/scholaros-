import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware.js';

export const adminMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({ message: 'Access denied. Admins only.' });
    return;
  }
  next();
};
