import { Request, Response, NextFunction } from 'express';
import { verifyToken, JWTPayload, createLogger } from '@pset4/shared-types';

const logger = createLogger('auth-middleware');

/**
 * JWT authentication middleware for protected routes.
 * Extracts and validates JWT token from Authorization header.
 * Attaches user payload to request object if valid.
 */
export function authenticateJWT(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  // Check if Authorization header exists and has correct format
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    logger.warn('Authentication failed: Missing or invalid Authorization header', {
      path: req.path,
      method: req.method,
    });
    res.status(401).json({ error: 'Missing or invalid Authorization header' });
    return;
  }

  // Remove 'Bearer ' prefix
  const token = authHeader.substring(7);

  const payload = verifyToken(token);

  if (!payload) {
    logger.warn('Authentication failed: Invalid or expired token', {
      path: req.path,
      method: req.method,
    });
    res.status(401).json({ error: 'Invalid or expired token' });
    return;
  }

  req.user = payload;

  logger.info('Authentication successful', {
    userId: payload.userId,
    role: payload.role,
    path: req.path,
    method: req.method,
  });

  next();
}
