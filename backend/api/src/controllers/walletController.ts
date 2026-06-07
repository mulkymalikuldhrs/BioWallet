import { Request, Response } from 'express';
import crypto from 'crypto';
import { ethers } from 'ethers';
import { prisma } from '../index';
import { BiometricType, Prisma } from '@prisma/client';
import { generateToken } from '../middleware/auth';

// Provider for Ethereum testnet (Sepolia)
const provider = new ethers.JsonRpcProvider(process.env.ETHEREUM_RPC_URL || 'https://rpc.ankr.com/eth_sepolia');

// Register a new wallet
export const registerWallet = async (req: Request, res: Response) => {
  try {
    const { walletAddress, publicKey, biometricType, deviceId, email, referredBy } = req.body;

    // Validate required fields
    if (!walletAddress || !publicKey || !biometricType) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if wallet address already exists
    const existingWallet = await prisma.user.findUnique({
      where: { walletAddress }
    });

    if (existingWallet) {
      return res.status(409).json({ message: 'Wallet address already registered' });
    }

    // Generate referral code using crypto-safe random
    const referralCode = `BIO${crypto.randomUUID().replace(/-/g, '').substring(0, 8).toUpperCase()}`;

    // Resolve referrer by referral code
    let referrerId: string | undefined;
    if (referredBy) {
      const referrer = await prisma.user.findFirst({
        where: { referralCode: referredBy }
      });
      if (referrer) {
        referrerId = referrer.id;
      }
    }

    // Create new user with wallet
    const user = await prisma.user.create({
      data: {
        walletAddress,
        publicKey,
        biometricType: biometricType as BiometricType,
        deviceId,
        email,
        referralCode,
        referredById: referrerId
      }
    });

    // Generate JWT token for the newly registered user
    const token = generateToken(user.id, user.walletAddress);

    // Increment AdminStats.totalUsers
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    await prisma.adminStats.upsert({
      where: { date: today },
      update: { totalUsers: { increment: 1 } },
      create: { date: today, totalUsers: 1 },
    });

    // If user was referred, create referral reward for the referrer
    if (referrerId) {
      await prisma.referralReward.create({
        data: {
          userId: referrerId,
          amount: new Prisma.Decimal('0.001'), // Small ETH reward
          status: 'PENDING'
        }
      });
    }

    res.status(201).json({
      id: user.id,
      walletAddress: user.walletAddress,
      referralCode: user.referralCode,
      token,
    });
  } catch (error) {
    console.error('Error registering wallet:', error);
    res.status(500).json({ message: 'Failed to register wallet' });
  }
};

// Get wallet balance
export const getWalletBalance = async (req: Request, res: Response) => {
  try {
    const { address } = req.params;

    // Validate address format
    if (!ethers.isAddress(address)) {
      return res.status(400).json({ message: 'Invalid Ethereum address' });
    }

    // Get balance from Ethereum network
    const balance = await provider.getBalance(address);
    const balanceInEth = ethers.formatEther(balance);

    res.status(200).json({
      address,
      balance: balanceInEth,
      token: 'ETH',
      network: process.env.ETHEREUM_NETWORK || 'sepolia'
    });
  } catch (error) {
    console.error('Error fetching wallet balance:', error);
    res.status(500).json({ message: 'Failed to fetch wallet balance' });
  }
};

// Get wallet transactions
export const getWalletTransactions = async (req: Request, res: Response) => {
  try {
    const { address } = req.params;
    const authenticatedUser = req.user;

    // Validate address format
    if (!ethers.isAddress(address)) {
      return res.status(400).json({ message: 'Invalid Ethereum address' });
    }

    // IDOR protection: non-admin users can only view their own wallet transactions
    if (!authenticatedUser?.isAdmin && authenticatedUser?.walletAddress?.toLowerCase() !== address.toLowerCase()) {
      return res.status(403).json({ message: 'Access denied: you can only view your own wallet transactions' });
    }

    // Find user by wallet address
    const user = await prisma.user.findUnique({
      where: { walletAddress: address }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get transactions from database
    const transactions = await prisma.transaction.findMany({
      where: {
        OR: [
          { fromAddress: address },
          { toAddress: address }
        ]
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.status(200).json(transactions);
  } catch (error) {
    console.error('Error fetching wallet transactions:', error);
    res.status(500).json({ message: 'Failed to fetch wallet transactions' });
  }
};
