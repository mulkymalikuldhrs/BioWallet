import express from 'express';
import { createTransaction, getTransactionById, getAllTransactions } from '../controllers/transactionController';

const router = express.Router();

// Create a new transaction
router.post('/', createTransaction);

// Get transaction by ID
router.get('/:id', getTransactionById);

// Get all transactions
router.get('/', getAllTransactions);

export default router;