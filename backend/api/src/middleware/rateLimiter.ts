import { Request, Response, NextFunction } from 'express';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

/**
 * Simple in-memory rate limiter
 *
 * NOTE: In production, use Redis-backed rate limiting (e.g., `rate-limit-redis`)
 * for distributed systems. In-memory rate limiting does NOT work across
 * multiple instances/processes and will be lost on restart.
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
 * Default rate limiter: 60 requests per minute (general API)
 */
export const defaultRateLimiter = rateLimiter(60 * 1000, 60);

/**
 * Auth rate limiter for login/register routes: 5 requests per minute
 * Strict to prevent brute-force and spam account creation
 */
export const authRateLimiter = rateLimiter(60 * 1000, 5);

/**
 * Strict rate limiter for sensitive endpoints: 10 requests per minute
 */
export const strictRateLimiter = rateLimiter(60 * 1000, 10);

/**
 * Transaction rate limiter: 10 requests per minute
 * Prevents transaction spam / flooding
 */
export const transactionRateLimiter = rateLimiter(60 * 1000, 10);

/**
 * Admin rate limiter: 30 requests per minute
 */
export const adminRateLimiter = rateLimiter(60 * 1000, 30);
