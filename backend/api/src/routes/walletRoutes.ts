import express from 'express';
import { registerWallet, getWalletBalance, getWalletTransactions } from '../controllers/walletController';

const router = express.Router();

// Register a new wallet
router.post('/register', registerWallet);

// Get wallet balance
router.get('/balance/:address', getWalletBalance);

// Get wallet transactions
router.get('/transactions/:address', getWalletTransactions);

export default router;