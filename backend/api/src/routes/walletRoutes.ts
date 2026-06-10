import express from 'express';
import { registerWallet, getWalletBalance, getWalletTransactions } from '../controllers/walletController.js';
import { authMiddleware } from '../middleware/auth.js';
import { strictRateLimiter, authRateLimiter } from '../middleware/rateLimiter.js';
import { validateBody } from '../validators/middleware.js';
import { registerWalletSchema } from '../validators/schemas.js';

const router = express.Router();

// Register a new wallet (public, but rate limited strictly for auth-like endpoint)
router.post('/register', authRateLimiter, validateBody(registerWalletSchema), registerWallet);

// Get wallet balance (public — blockchain data is public)
router.get('/balance/:address', getWalletBalance);

// Get wallet transactions (requires auth — IDOR protection for DB records)
router.get('/transactions/:address', authMiddleware, getWalletTransactions);

export default router;
