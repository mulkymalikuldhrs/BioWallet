import express from 'express';
import { createTransaction, getTransactionById, getAllTransactions } from '../controllers/transactionController';
import { authMiddleware } from '../middleware/auth';
import { strictRateLimiter } from '../middleware/rateLimiter';

const router = express.Router();

// Create a new transaction (requires auth, strict rate limit)
router.post('/', authMiddleware, strictRateLimiter, createTransaction);

// Get transaction by ID (requires auth)
router.get('/:id', authMiddleware, getTransactionById);

// Get all transactions (requires auth)
router.get('/', authMiddleware, getAllTransactions);

export default router;
