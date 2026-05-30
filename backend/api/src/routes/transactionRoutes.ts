import express from 'express';
import { createTransaction, getTransactionById, getAllTransactions } from '../controllers/transactionController';
import { authMiddleware } from '../middleware/auth';
import { strictRateLimiter, transactionRateLimiter } from '../middleware/rateLimiter';
import { validateBody, validateQuery } from '../validators/middleware';
import { createTransactionSchema, transactionListQuerySchema } from '../validators/schemas';

const router = express.Router();

// Create a new transaction (requires auth, transaction rate limit, body validation)
router.post('/', authMiddleware, transactionRateLimiter, validateBody(createTransactionSchema), createTransaction);

// Get transaction by ID (requires auth)
router.get('/:id', authMiddleware, getTransactionById);

// Get all transactions (requires auth, query validation)
router.get('/', authMiddleware, validateQuery(transactionListQuerySchema), getAllTransactions);

export default router;
