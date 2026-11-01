import { Request, Response } from 'express';
import crypto from 'crypto';
import { prisma } from '../index.js';
import { BiometricType, Prisma } from '@prisma/client';
import { generateToken } from '../middleware/auth.js';

/**
 * Increment AdminStats.totalUsers for today's date.
 * Uses upsert so the row is created if it doesn't exist yet.
 */
async function incrementTotalUsers(): Promise<void> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await prisma.adminStats.upsert({
    where: { date: today },
    update: { totalUsers: { increment: 1 } },
    create: { date: today, totalUsers: 1 },
  });
}

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

    // Generate referral code using crypto-safe random
    const referralCode = `BIO${crypto.randomUUID().replace(/-/g, '').substring(0, 8).toUpperCase()}`;

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

    // Increment AdminStats.totalUsers
    await incrementTotalUsers();

    res.status(201).json({
      id: user.id,
      walletAddress: user.walletAddress,
      referralCode: user.referralCode,
      token,
      message: 'User registered successfully'
    });
  } catch (error) {
    console.error('Error creating user:', error);
    // Handle Prisma unique constraint violations with proper HTTP status
    if (error && typeof error === 'object' && 'code' in error) {
      const prismaError = error as { code: string; meta?: { target?: string[] } };
      if (prismaError.code === 'P2002') {
        const target = prismaError.meta?.target?.[0] || 'field';
        const fieldMap: Record<string, string> = {
          walletAddress: 'Wallet address already registered',
          email: 'Email address already in use',
          deviceId: 'Device already registered',
          referralCode: 'Referral code conflict, please try again',
        };
        return res.status(409).json({ message: fieldMap[target] || `Duplicate value for ${target}` });
      }
    }
    res.status(500).json({ message: 'Failed to create user' });
  }
};

// Get current authenticated user ("me")
export const getMe = async (req: Request, res: Response) => {
  try {
    const authenticatedUser = req.user;
    if (!authenticatedUser) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const user = await prisma.user.findUnique({
      where: { id: authenticatedUser.id },
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
    console.error('Error fetching current user:', error);
    res.status(500).json({ message: 'Failed to fetch user' });
  }
};

// Get user by ID or Wallet Address
export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id: identifier } = req.params;
    const authenticatedUser = req.user;

    if (typeof identifier !== 'string') {
      return res.status(400).json({ message: 'Invalid identifier' });
    }

    // IDOR protection: non-admin users can only view their own profile
    if (!authenticatedUser?.isAdmin && authenticatedUser?.id !== identifier && authenticatedUser?.walletAddress !== identifier) {
      return res.status(403).json({ message: 'Access denied: you can only view your own profile' });
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
    const authenticatedUser = req.user;

    if (typeof id !== 'string') {
      return res.status(400).json({ message: 'Invalid ID' });
    }

    // IDOR protection: non-admin users can only update their own profile
    if (!authenticatedUser?.isAdmin && authenticatedUser?.id !== id) {
      return res.status(403).json({ message: 'Access denied: you can only update your own profile' });
    }

    const updateData: Record<string, unknown> = { email, deviceId, lastLogin: new Date() };
    if (isPremium !== undefined) {
      // Only admins can change isPremium status
      if (!authenticatedUser?.isAdmin) {
        return res.status(403).json({ message: 'Access denied: only admins can change premium status' });
      }
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
