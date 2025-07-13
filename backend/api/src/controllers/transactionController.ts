import { Request, Response } from 'express';
import { ethers } from 'ethers';
import { prisma } from '../index';

// Provider for Ethereum testnet (Goerli)
const provider = new ethers.JsonRpcProvider(process.env.ETHEREUM_RPC_URL || 'https://goerli.infura.io/v3/your-infura-key');

// Create a new transaction
export const createTransaction = async (req: Request, res: Response) => {
  try {
    const { fromAddress, toAddress, amount, signedTransaction, userId } = req.body;

    // Validate required fields
    if (!fromAddress || !toAddress || !amount || !signedTransaction || !userId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Validate addresses
    if (!ethers.isAddress(fromAddress) || !ethers.isAddress(toAddress)) {
      return res.status(400).json({ message: 'Invalid Ethereum address' });
    }

    // Submit transaction to the network
    const tx = await provider.broadcastTransaction(signedTransaction);
    
    // Calculate fee (0.1% of transaction amount)
    const fee = parseFloat(amount) * 0.001;

    // Create transaction record
    const transaction = await prisma.transaction.create({
      data: {
        txHash: tx.hash,
        type: 'SEND',
        amount: parseFloat(amount),
        fee,
        fromAddress,
        toAddress,
        userId,
        status: 'PENDING',
        network: process.env.ETHEREUM_NETWORK || 'goerli'
      }
    });

    // Update admin stats
    await prisma.adminStats.upsert({
      where: {
        id: '1' // Using a fixed ID for simplicity
      },
      update: {
        totalTransactions: { increment: 1 },
        totalVolume: { increment: parseFloat(amount) },
        totalFees: { increment: fee }
      },
      create: {
        id: '1',
        totalTransactions: 1,
        totalVolume: parseFloat(amount),
        totalFees: fee
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

    const transaction = await prisma.transaction.findUnique({
      where: { id }
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
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

    const where = userId ? { userId: userId as string } : {};
    
    const transactions = await prisma.transaction.findMany({
      where,
      take: parseInt(limit as string),
      skip: parseInt(offset as string),
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