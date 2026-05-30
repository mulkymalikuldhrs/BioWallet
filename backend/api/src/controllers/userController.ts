import { Request, Response } from 'express';
import { prisma } from '../index';
import { BiometricType, Prisma } from '@prisma/client';
import { generateToken } from '../middleware/auth';

// Create a new user
export const createUser = async (req: Request, res: Response) => {
  try {
    const { walletAddress, publicKey, email, deviceId, biometricType, referredBy } = req.body;

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

    // Resolve referrer by referral code (referredBy is a code, not an ID)
    let referredById: string | undefined;
    if (referredBy) {
      const referrer = await prisma.user.findFirst({
        where: { referralCode: referredBy }
      });
      if (referrer) {
        referredById = referrer.id;
      }
    }

    // Create new user
    const user = await prisma.user.create({
      data: {
        walletAddress,
        publicKey,
        email,
        deviceId,
        biometricType: biometricType as BiometricType,
        referralCode,
        referredById
      }
    });

    // Generate JWT token for the newly created user
    const token = generateToken(user.id, user.walletAddress);

    res.status(201).json({
      id: user.id,
      walletAddress: user.walletAddress,
      referralCode: user.referralCode,
      token,
      message: 'User registered successfully'
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Failed to create user' });
  }
};

// Get user by ID or Wallet Address
export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id: identifier } = req.params;

    if (typeof identifier !== 'string') {
      return res.status(400).json({ message: 'Invalid identifier' });
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { id: identifier },
          { walletAddress: identifier }
        ]
      },
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

    if (typeof id !== 'string') {
      return res.status(400).json({ message: 'Invalid ID' });
    }

    const updateData: any = { email, deviceId, lastLogin: new Date() };
    if (isPremium !== undefined) {
      updateData.isPremium = isPremium;
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
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
