import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        walletAddress?: string;
        isAdmin?: boolean;
      };
    }
  }
}

/**
 * JWT payload interface
 */
interface JwtPayload {
  sub: string;           // User ID
  walletAddress: string; // Wallet address
  iss: string;           // Issuer
  aud: string;           // Audience
  iat: number;
  exp: number;
}

/**
 * Get JWT secret - fails if not configured
 */
const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('FATAL: JWT_SECRET environment variable is not set. Authentication is disabled.');
  }
  return secret;
};

/**
 * JWT issuer and audience for verification
 */
const JWT_ISSUER = 'biowallet-api';
const JWT_AUDIENCE = 'biowallet-app';

/**
 * Authentication middleware
 * Validates the Authorization header for a Bearer JWT token.
 * Verifies token signature, expiry, issuer, and audience.
 * Attaches decoded user info to req.user for downstream handlers.
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

  try {
    const secret = getJwtSecret();

    // Verify the JWT token with full validation
    const decoded = jwt.verify(token, secret, {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
      algorithms: ['HS256'],
    }) as JwtPayload;

    // Attach user info to request for downstream handlers
    req.user = {
      id: decoded.sub,
      walletAddress: decoded.walletAddress,
    };

    next();
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    if (error.name === 'TokenExpiredError') {
      res.status(401).json({ message: 'Token has expired. Please authenticate again.' });
      return;
    }

    if (error.name === 'JsonWebTokenError') {
      res.status(401).json({ message: 'Invalid token.' });
      return;
    }

    if (error.name === 'NotBeforeError') {
      res.status(401).json({ message: 'Token not yet active.' });
      return;
    }

    // JWT_SECRET not set or other configuration error
    if (error.message && error.message.includes('JWT_SECRET')) {
      console.error('SECURITY: ' + error.message);
      res.status(503).json({ message: 'Authentication service is not configured' });
      return;
    }

    console.error('JWT verification error:', error.message);
    res.status(401).json({ message: 'Authentication failed' });
  }
};

/**
 * Admin authentication middleware
 * Requires a valid JWT token AND the X-Admin-API-Key header.
 * If ADMIN_API_KEY is not configured, admin routes are entirely blocked (503).
 */
export const adminAuthMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  // First verify JWT auth
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

  // Verify JWT first
  try {
    const secret = getJwtSecret();

    const decoded = jwt.verify(token, secret, {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
      algorithms: ['HS256'],
    }) as JwtPayload;

    // Now check admin API key
    const adminApiKey = req.headers['x-admin-api-key'] as string;
    const expectedAdminKey = process.env.ADMIN_API_KEY;

    if (!expectedAdminKey) {
      // ADMIN_API_KEY not configured — block admin routes entirely
      console.error('SECURITY: ADMIN_API_KEY not set. Admin routes are BLOCKED. Set ADMIN_API_KEY to enable admin access.');
      res.status(503).json({ message: 'Admin access is not configured. Service unavailable.' });
      return;
    }

    if (!adminApiKey || adminApiKey !== expectedAdminKey) {
      res.status(403).json({ message: 'Admin access denied. Invalid API key.' });
      return;
    }

    // Attach user info with admin flag
    req.user = {
      id: decoded.sub,
      walletAddress: decoded.walletAddress,
      isAdmin: true,
    };

    next();
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    if (error.name === 'TokenExpiredError') {
      res.status(401).json({ message: 'Token has expired. Please authenticate again.' });
      return;
    }

    if (error.name === 'JsonWebTokenError') {
      res.status(401).json({ message: 'Invalid token.' });
      return;
    }

    // JWT_SECRET not set
    if (error.message && error.message.includes('JWT_SECRET')) {
      console.error('SECURITY: ' + error.message);
      res.status(503).json({ message: 'Authentication service is not configured' });
      return;
    }

    console.error('Admin JWT verification error:', error.message);
    res.status(401).json({ message: 'Authentication failed' });
  }
};

/**
 * Helper: Generate a JWT token for a user
 * Used in registration/login flows
 */
export const generateToken = (userId: string, walletAddress: string): string => {
  const secret = getJwtSecret();
  return jwt.sign(
    {
      sub: userId,
      walletAddress,
    },
    secret,
    {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
      expiresIn: '24h',
      algorithm: 'HS256',
    }
  );
};
