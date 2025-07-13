import express from 'express';
import { createUser, getUserById, updateUser, getAllUsers } from '../controllers/userController';

const router = express.Router();

// Create a new user
router.post('/', createUser);

// Get user by ID
router.get('/:id', getUserById);

// Update user
router.put('/:id', updateUser);

// Get all users (admin only)
router.get('/', getAllUsers);

export default router;