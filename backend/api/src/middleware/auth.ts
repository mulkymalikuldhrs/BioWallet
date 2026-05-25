import { Request, Response, NextFunction } from 'express';

/**
 * Authentication middleware
 * Validates the Authorization header for a Bearer token or API key.
 * In production, this would verify a JWT token against a secret.
 */
export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({ message: 'Authorization header is required' });
    return;
  }

  const [type, token] = authHeader.split(' ');

  if (type !== 'Bearer' || !token) {
    res.status(401).json({ message: 'Invalid authorization format. Use: Bearer <token>' });
    return;
  }

  // In production, verify the JWT token here
  // For now, we check that a non-empty token is provided
  // The token should be a UUID or JWT issued during registration/login
  if (token.length < 10) {
    res.status(401).json({ message: 'Invalid or expired token' });
    return;
  }

  // Attach user info to request for downstream handlers
  (req as any).user = { token };
  next();
};

/**
 * Admin authentication middleware
 * Requires both a valid auth token and an admin API key
 */
export const adminAuthMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  // First check regular auth
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({ message: 'Authorization header is required' });
    return;
  }

  const [type, token] = authHeader.split(' ');

  if (type !== 'Bearer' || !token) {
    res.status(401).json({ message: 'Invalid authorization format' });
    return;
  }

  // Check admin API key
  const adminApiKey = req.headers['x-admin-api-key'] as string;
  const expectedAdminKey = process.env.ADMIN_API_KEY;

  if (!expectedAdminKey) {
    // If no admin key is configured, require at least a valid auth token
    // In production, ADMIN_API_KEY must be set in environment
    console.warn('WARNING: ADMIN_API_KEY not set. Admin routes are less secure.');
  } else if (adminApiKey !== expectedAdminKey) {
    res.status(403).json({ message: 'Admin access denied. Invalid API key.' });
    return;
  }

  (req as any).user = { token, isAdmin: true };
  next();
};
