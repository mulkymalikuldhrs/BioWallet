import express from 'express';
import { getStats, getDailyStats, getUserGrowth, getTransactionVolume } from '../controllers/adminController.js';
import { adminAuthMiddleware } from '../middleware/auth.js';
import { adminRateLimiter } from '../middleware/rateLimiter.js';
import { validateQuery } from '../validators/middleware.js';
import { dailyStatsQuerySchema, periodQuerySchema } from '../validators/schemas.js';

const router = express.Router();

// All admin routes require admin authentication
router.use(adminAuthMiddleware);
router.use(adminRateLimiter);

// Get overall stats
router.get('/stats', getStats);

// Get daily stats (with query validation)
router.get('/stats/daily', validateQuery(dailyStatsQuerySchema), getDailyStats);

// Get user growth (with query validation)
router.get('/stats/users', validateQuery(periodQuerySchema), getUserGrowth);

// Get transaction volume (with query validation)
router.get('/stats/volume', validateQuery(periodQuerySchema), getTransactionVolume);

export default router;
