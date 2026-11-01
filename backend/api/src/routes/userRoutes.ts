import express from 'express';
import { createUser, getUserById, updateUser, getAllUsers, getMe } from '../controllers/userController.js';
import { authMiddleware, adminAuthMiddleware } from '../middleware/auth.js';
import { strictRateLimiter, authRateLimiter } from '../middleware/rateLimiter.js';
import { validateBody } from '../validators/middleware.js';
import { createUserSchema, updateUserSchema } from '../validators/schemas.js';

const router = express.Router();

// Create a new user (public, but rate limited strictly for auth-like endpoint)
router.post('/', authRateLimiter, validateBody(createUserSchema), createUser);

// Get current authenticated user (requires auth)
router.get('/me', authMiddleware, getMe);

// Get user by ID (requires auth)
router.get('/:id', authMiddleware, getUserById);

// Update user (requires auth + body validation)
router.put('/:id', authMiddleware, validateBody(updateUserSchema), updateUser);

// Get all users (admin only)
router.get('/', adminAuthMiddleware, getAllUsers);

export default router;
