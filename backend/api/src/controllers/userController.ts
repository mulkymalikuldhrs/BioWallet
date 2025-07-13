import { Request, Response } from 'express';
import { prisma } from '../index';
import { BiometricType } from '@prisma/client';

// Create a new user
export const createUser = async (req: Request, res: Response) => {
  try {
    const { walletAddress, publicKey, email, deviceId, biometricType } = req.body;

    // Validate required fields
    if (!walletAddress || !publicKey || !biometricType) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if wallet address already exists
    const existingUser = await prisma.user.findUnique({
      where: { walletAddress }
    });

    if (existingUser) {
      return res.status(409).json({ message: 'Wallet address already registered' });
    }

    // Generate referral code
    const referralCode = `BIO${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Create new user
    const user = await prisma.user.create({
      data: {
        walletAddress,
        publicKey,
        email,
        deviceId,
        biometricType: biometricType as BiometricType,
        referralCode
      }
    });

    res.status(201).json({
      id: user.id,
      walletAddress: user.walletAddress,
      referralCode: user.referralCode
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Failed to create user' });
  }
};

// Get user by ID
export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        walletAddress: true,
        email: true,
        biometricType: true,
        createdAt: true,
        referralCode: true,
        isPremium: true,
        lastLogin: true
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Failed to fetch user' });
  }
};

// Update user
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { email, deviceId, isPremium } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        email,
        deviceId,
        isPremium,
        lastLogin: new Date()
      },
      select: {
        id: true,
        walletAddress: true,
        email: true,
        isPremium: true
      }
    });

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Failed to update user' });
  }
};

// Get all users (admin only)
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        walletAddress: true,
        email: true,
        biometricType: true,
        createdAt: true,
        isPremium: true,
        lastLogin: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
};