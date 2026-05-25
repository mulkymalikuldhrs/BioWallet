import express from 'express';
import { getStats, getDailyStats, getUserGrowth, getTransactionVolume } from '../controllers/adminController';
import { adminAuthMiddleware } from '../middleware/auth';
import { adminRateLimiter } from '../middleware/rateLimiter';

const router = express.Router();

// All admin routes require admin authentication
router.use(adminAuthMiddleware);
router.use(adminRateLimiter);

// Get overall stats
router.get('/stats', getStats);

// Get daily stats
router.get('/stats/daily', getDailyStats);

// Get user growth
router.get('/stats/users', getUserGrowth);

// Get transaction volume
router.get('/stats/volume', getTransactionVolume);

export default router;
