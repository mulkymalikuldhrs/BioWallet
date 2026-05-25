import express from 'express';
import { registerWallet, getWalletBalance, getWalletTransactions } from '../controllers/walletController';
import { authMiddleware } from '../middleware/auth';
import { strictRateLimiter } from '../middleware/rateLimiter';

const router = express.Router();

// Register a new wallet (public, but rate limited)
router.post('/register', strictRateLimiter, registerWallet);

// Get wallet balance (requires auth)
router.get('/balance/:address', authMiddleware, getWalletBalance);

// Get wallet transactions (requires auth)
router.get('/transactions/:address', authMiddleware, getWalletTransactions);

export default router;
