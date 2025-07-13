import express from 'express';
import { getStats, getDailyStats, getUserGrowth, getTransactionVolume } from '../controllers/adminController';

const router = express.Router();

// Get overall stats
router.get('/stats', getStats);

// Get daily stats
router.get('/stats/daily', getDailyStats);

// Get user growth
router.get('/stats/users', getUserGrowth);

// Get transaction volume
router.get('/stats/volume', getTransactionVolume);

export default router;