import { z } from 'zod';

/**
 * Ethereum address regex: 0x followed by 40 hex characters
 */
const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;

/**
 * Ethereum address schema with validation
 */
export const ethAddressSchema = z.string().regex(ethAddressRegex, 'Invalid Ethereum address format');

/**
 * Biometric type enum matching Prisma schema
 */
export const biometricTypeSchema = z.enum(['FINGERPRINT', 'FACE', 'IRIS']);

/**
 * User creation schema
 */
export const createUserSchema = z.object({
  walletAddress: ethAddressSchema,
  publicKey: z.string().min(1, 'Public key is required'),
  email: z.string().email('Invalid email format').optional(),
  deviceId: z.string().min(1, 'Device ID is required').optional(),
  biometricType: biometricTypeSchema,
  referredBy: z.string().optional(),
});

/**
 * User update schema
 */
export const updateUserSchema = z.object({
  email: z.string().email('Invalid email format').optional(),
  deviceId: z.string().min(1, 'Device ID must not be empty').optional(),
  isPremium: z.boolean().optional(),
});

/**
 * Wallet registration schema
 */
export const registerWalletSchema = z.object({
  walletAddress: ethAddressSchema,
  publicKey: z.string().min(1, 'Public key is required'),
  biometricType: biometricTypeSchema,
  deviceId: z.string().min(1, 'Device ID is required').optional(),
  email: z.string().email('Invalid email format').optional(),
  referredBy: z.string().optional(),
});

/**
 * Transaction creation schema
 * Amount accepts string or number for Decimal precision (ETH values need 18 decimal places)
 */
export const createTransactionSchema = z.object({
  fromAddress: ethAddressSchema,
  toAddress: ethAddressSchema,
  amount: z.union([z.string(), z.number()]).transform(String).refine(
    (val) => !isNaN(Number(val)) && Number(val) > 0,
    'Amount must be a positive number'
  ),
  signedTransaction: z.string().min(1, 'Signed transaction is required'),
  userId: z.string().uuid('Invalid user ID format'),
});

/**
 * Login schema (for POST /api/auth/login)
 */
export const loginSchema = z.object({
  walletAddress: ethAddressSchema,
  deviceId: z.string().min(1, 'Device ID must not be empty').optional(),
});

/**
 * Admin daily stats query schema
 */
export const dailyStatsQuerySchema = z.object({
  days: z.string().regex(/^\d+$/, 'Days must be a positive integer').transform(Number).pipe(
    z.number().int().min(1).max(365, 'Cannot query more than 365 days')
  ).optional().default('7'),
});

/**
 * Admin user growth / transaction volume query schema
 */
export const periodQuerySchema = z.object({
  period: z.enum(['day', 'week', 'month']).optional().default('month'),
});

/**
 * Pagination query schema (for transaction list, admin endpoints)
 */
export const paginationQuerySchema = z.object({
  limit: z.string().regex(/^\d+$/, 'Limit must be a positive integer').transform(Number).pipe(
    z.number().int().min(1).max(100, 'Maximum limit is 100')
  ).optional().default('10'),
  offset: z.string().regex(/^\d+$/, 'Offset must be a non-negative integer').transform(Number).pipe(
    z.number().int().min(0)
  ).optional().default('0'),
});

/**
 * Transaction list query schema (pagination + optional userId filter)
 */
export const transactionListQuerySchema = paginationQuerySchema.extend({
  userId: z.string().uuid('Invalid user ID format').optional(),
});
