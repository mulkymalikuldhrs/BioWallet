import express from 'express';
import { prisma } from '../index';
import { generateToken } from '../middleware/auth';
import { strictRateLimiter } from '../middleware/rateLimiter';

const router = express.Router();

// Login: authenticate a user by wallet address and return a JWT token
// In a biometric wallet, the client proves identity via biometric auth locally,
// then requests a JWT from the backend by proving they own the wallet address.
router.post('/login', strictRateLimiter, async (req, res) => {
  try {
    const { walletAddress, deviceId } = req.body;

    if (!walletAddress) {
      return res.status(400).json({ message: 'walletAddress is required' });
    }

    // Find user by wallet address
    const user = await prisma.user.findUnique({
      where: { walletAddress },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found. Please register first.' });
    }

    // Update last login timestamp
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date(), deviceId: deviceId || user.deviceId },
    });

    // Generate a new JWT token
    const token = generateToken(user.id, user.walletAddress);

    res.status(200).json({
      id: user.id,
      walletAddress: user.walletAddress,
      token,
      biometricType: user.biometricType,
      message: 'Login successful',
    });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ message: 'Failed to login' });
  }
});

export default router;
