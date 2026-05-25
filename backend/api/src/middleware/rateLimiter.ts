import { Request, Response, NextFunction } from 'express';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

/**
 * Simple in-memory rate limiter
 * In production, use Redis-backed rate limiting for distributed systems
 */
const rateLimitMap = new Map<string, RateLimitEntry>();

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap.entries()) {
    if (now > entry.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * Rate limiting middleware factory
 * @param windowMs - Time window in milliseconds
 * @param maxRequests - Maximum number of requests per window
 */
export const rateLimiter = (windowMs: number = 60 * 1000, maxRequests: number = 60) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const key = `${ip}:${req.path}`;

    const now = Date.now();
    const entry = rateLimitMap.get(key);

    if (!entry || now > entry.resetTime) {
      // Create new entry
      rateLimitMap.set(key, {
        count: 1,
        resetTime: now + windowMs,
      });
      next();
      return;
    }

    if (entry.count >= maxRequests) {
      res.status(429).json({
        message: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil((entry.resetTime - now) / 1000),
      });
      return;
    }

    entry.count++;
    next();
  };
};

/**
 * Default rate limiter: 60 requests per minute
 */
export const defaultRateLimiter = rateLimiter(60 * 1000, 60);

/**
 * Strict rate limiter for sensitive endpoints: 10 requests per minute
 */
export const strictRateLimiter = rateLimiter(60 * 1000, 10);

/**
 * Admin rate limiter: 30 requests per minute
 */
export const adminRateLimiter = rateLimiter(60 * 1000, 30);
