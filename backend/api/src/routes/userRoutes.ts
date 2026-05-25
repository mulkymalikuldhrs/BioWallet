import express from 'express';
import { createUser, getUserById, updateUser, getAllUsers } from '../controllers/userController';
import { authMiddleware, adminAuthMiddleware } from '../middleware/auth';
import { strictRateLimiter } from '../middleware/rateLimiter';

const router = express.Router();

// Create a new user (public, but rate limited)
router.post('/', strictRateLimiter, createUser);

// Get user by ID (requires auth)
router.get('/:id', authMiddleware, getUserById);

// Update user (requires auth)
router.put('/:id', authMiddleware, updateUser);

// Get all users (admin only)
router.get('/', adminAuthMiddleware, getAllUsers);

export default router;
