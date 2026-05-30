import express from 'express';
import { getStats, getDailyStats, getUserGrowth, getTransactionVolume } from '../controllers/adminController';
import { adminAuthMiddleware } from '../middleware/auth';
import { adminRateLimiter } from '../middleware/rateLimiter';
import { validateQuery } from '../validators/middleware';
import { dailyStatsQuerySchema, periodQuerySchema } from '../validators/schemas';

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
