import { Request, Response } from 'express';
import { ethers } from 'ethers';
import { prisma } from '../index';
import { BiometricType } from '@prisma/client';

// Provider for Ethereum testnet (Goerli)
const provider = new ethers.JsonRpcProvider(process.env.ETHEREUM_RPC_URL || 'https://goerli.infura.io/v3/your-infura-key');

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

    // Generate referral code
    const referralCode = `BIO${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Create new user with wallet
    const user = await prisma.user.create({
      data: {
        walletAddress,
        publicKey,
        biometricType: biometricType as BiometricType,
        deviceId,
        email,
        referralCode,
        referredBy
      }
    });

    // If user was referred, create referral reward
    if (referredBy) {
      const referrer = await prisma.user.findFirst({
        where: { referralCode: referredBy }
      });

      if (referrer) {
        await prisma.referralReward.create({
          data: {
            userId: referrer.id,
            amount: 0.001, // Small ETH reward
            status: 'PENDING'
          }
        });
      }
    }

    res.status(201).json({
      id: user.id,
      walletAddress: user.walletAddress,
      referralCode: user.referralCode
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
      network: process.env.ETHEREUM_NETWORK || 'goerli'
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

    // Validate address format
    if (!ethers.isAddress(address)) {
      return res.status(400).json({ message: 'Invalid Ethereum address' });
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