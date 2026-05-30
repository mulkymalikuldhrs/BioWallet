import express from 'express';
import { registerWallet, getWalletBalance, getWalletTransactions } from '../controllers/walletController';
import { authMiddleware } from '../middleware/auth';
import { strictRateLimiter, authRateLimiter } from '../middleware/rateLimiter';
import { validateBody } from '../validators/middleware';
import { registerWalletSchema } from '../validators/schemas';

const router = express.Router();

// Register a new wallet (public, but rate limited strictly for auth-like endpoint)
router.post('/register', authRateLimiter, validateBody(registerWalletSchema), registerWallet);

// Get wallet balance (public — blockchain data is public)
router.get('/balance/:address', getWalletBalance);

// Get wallet transactions (requires auth — IDOR protection for DB records)
router.get('/transactions/:address', authMiddleware, getWalletTransactions);

export default router;
