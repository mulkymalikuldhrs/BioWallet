import { Request, Response } from 'express';
import { ethers } from 'ethers';
import { Prisma } from '@prisma/client';
import { prisma } from '../index';

// Provider for Ethereum testnet (Sepolia)
const provider = new ethers.JsonRpcProvider(process.env.ETHEREUM_RPC_URL || 'https://rpc.ankr.com/eth_sepolia');

// Create a new transaction
export const createTransaction = async (req: Request, res: Response) => {
  try {
    const { fromAddress, toAddress, amount, signedTransaction, userId } = req.body;

    // Validate required fields (Zod already validated, but double-check)
    if (!fromAddress || !toAddress || !amount || !signedTransaction || !userId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Validate addresses (already validated by Zod, but ethers provides extra check)
    if (!ethers.isAddress(fromAddress) || !ethers.isAddress(toAddress)) {
      return res.status(400).json({ message: 'Invalid Ethereum address' });
    }

    // IDOR protection: verify fromAddress belongs to the authenticated user
    const authenticatedUser = req.user;
    if (!authenticatedUser) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Look up the authenticated user's wallet address
    const authUser = await prisma.user.findUnique({
      where: { id: authenticatedUser.id },
      select: { walletAddress: true }
    });

    if (!authUser) {
      return res.status(401).json({ message: 'Authenticated user not found' });
    }

    // Verify the fromAddress belongs to the authenticated user
    if (!authenticatedUser.isAdmin && authUser.walletAddress.toLowerCase() !== fromAddress.toLowerCase()) {
      return res.status(403).json({ message: 'Access denied: you can only send transactions from your own wallet' });
    }

    // Verify the userId in the body matches the authenticated user
    if (!authenticatedUser.isAdmin && userId !== authenticatedUser.id) {
      return res.status(403).json({ message: 'Access denied: userId must match authenticated user' });
    }

    // Submit transaction to the network
    const tx = await provider.broadcastTransaction(signedTransaction);

    // Calculate fee (0.1% of transaction amount) using Decimal for precision
    const amountDecimal = new Prisma.Decimal(amount);
    const fee = amountDecimal.mul('0.001');

    // Create transaction record
    const transaction = await prisma.transaction.create({
      data: {
        txHash: tx.hash,
        type: 'SEND',
        amount: amountDecimal,
        fee,
        fromAddress,
        toAddress,
        userId,
        status: 'PENDING',
        network: process.env.ETHEREUM_NETWORK || 'sepolia'
      }
    });

    // Update admin stats (upsert by date for daily aggregation)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await prisma.adminStats.upsert({
      where: {
        date: today
      },
      update: {
        totalTransactions: { increment: 1 },
        totalVolume: { increment: amountDecimal },
        totalFees: { increment: fee }
      },
      create: {
        totalTransactions: 1,
        totalVolume: amountDecimal,
        totalFees: fee,
        date: today
      }
    });

    res.status(201).json({
      id: transaction.id,
      txHash: transaction.txHash,
      status: transaction.status
    });

    // Listen for transaction confirmation (async)
    provider.once(tx.hash, async (receipt) => {
      if (receipt.status === 1) {
        // Transaction successful
        await prisma.transaction.update({
          where: { txHash: tx.hash },
          data: {
            status: 'CONFIRMED',
            blockNumber: receipt.blockNumber,
            blockTimestamp: new Date()
          }
        });
      } else {
        // Transaction failed
        await prisma.transaction.update({
          where: { txHash: tx.hash },
          data: {
            status: 'FAILED'
          }
        });
      }
    });
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ message: 'Failed to create transaction' });
  }
};

// Get transaction by ID
export const getTransactionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (typeof id !== 'string') {
      return res.status(400).json({ message: 'Invalid ID' });
    }

    const transaction = await prisma.transaction.findUnique({
      where: { id }
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // IDOR protection: check the transaction belongs to the requesting user
    if (!req.user?.isAdmin && req.user?.id !== transaction.userId) {
      return res.status(403).json({ message: 'Access denied: you can only view your own transactions' });
    }

    res.status(200).json(transaction);
  } catch (error) {
    console.error('Error fetching transaction:', error);
    res.status(500).json({ message: 'Failed to fetch transaction' });
  }
};

// Get all transactions
export const getAllTransactions = async (req: Request, res: Response) => {
  try {
    const { userId, limit = '10', offset = '0' } = req.query;

    // IDOR protection: non-admin users can only see their own transactions
    let where: any = {};
    if (req.user?.isAdmin && typeof userId === 'string') {
      where = { userId };
    } else if (!req.user?.isAdmin) {
      // Non-admin: force filter to own transactions
      where = { userId: req.user?.id };
    }

    const transactions = await prisma.transaction.findMany({
      where,
      take: parseInt(limit as string) || 10,
      skip: parseInt(offset as string) || 0,
      orderBy: {
        createdAt: 'desc'
      }
    });

    const total = await prisma.transaction.count({ where });

    res.status(200).json({
      transactions,
      total,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string)
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ message: 'Failed to fetch transactions' });
  }
};
