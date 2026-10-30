import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import walletRoutes from './routes/walletRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { defaultRateLimiter } from './middleware/rateLimiter.js';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

// Trust first proxy — required for correct IP resolution behind load balancers / reverse proxies
// In production, set to the number of proxies between the internet and your server
app.set('trust proxy', 1);

// ─── CORS Configuration ───────────────────────────────────────────────
// Defaults to http://localhost:12000 for development if CORS_ORIGIN is not set.
// In production, CORS_ORIGIN must be set to a comma-separated list of allowed origins.
const corsOrigin = (() => {
  const configured = process.env.CORS_ORIGIN;
  if (!configured) {
    console.warn('CORS_ORIGIN not set, defaulting to http://localhost:12000 (development only)');
    return 'http://localhost:12000';
  }
  // Support comma-separated list of origins
  const origins = configured.split(',').map((o) => o.trim()).filter(Boolean);
  return origins.length === 1 ? origins[0] : origins;
})();

app.use(cors({
  origin: corsOrigin,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Admin-API-Key'],
  credentials: true,
}));

// ─── Helmet Security Headers ──────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'none'"],              // API only — no default sources
      scriptSrc: ["'none'"],                // No inline scripts in API responses
      styleSrc: ["'none'"],                 // No styles needed for API
      imgSrc: ["'none'"],                   // No images from API
      connectSrc: [
        "'self'",                            // Allow same-origin connections
        process.env.ETHEREUM_RPC_URL || 'https://rpc.ankr.com/eth_sepolia', // Blockchain RPC
      ],
      frameSrc: ["'none'"],                 // Prevent framing (clickjacking protection)
      frameAncestors: ["'none'"],           // X-Frame-Options equivalent
      objectSrc: ["'none'"],                // No plugins
      baseUri: ["'none'"],                  // No <base> tag manipulation
      formAction: ["'none'"],               // No form submissions from API
    },
  },
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: true,
  crossOriginResourcePolicy: true,
  referrerPolicy: { policy: 'no-referrer' },
  xContentTypeOptions: true,    // X-Content-Type-Options: nosniff
  xDnsPrefetchControl: { allow: false },
  xDownloadOptions: true,
  xFrameOptions: { action: 'deny' },  // X-Frame-Options: DENY
  xPermittedCrossDomainPolicies: { permittedPolicies: 'none' },
  xXssProtection: true,
}));

// ─── Request Parsing ──────────────────────────────────────────────────
// Limit JSON body to 10kb to prevent oversized payload attacks
app.use(express.json({ limit: '10kb' }));

// ─── Logging ──────────────────────────────────────────────────────────
app.use(morgan('dev'));

// ─── Rate Limiting ────────────────────────────────────────────────────
// Apply default rate limiting to all routes
app.use(defaultRateLimiter);

// Health check (no auth required)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', version: '3.1.0', network: 'sepolia' });
});

// Routes
// Auth routes (login endpoint)
app.use('/api/auth', authRoutes);

// Public routes (with strict rate limiting for creation endpoints applied in route files)
app.use('/api/users', userRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/transactions', transactionRoutes);

// Admin routes (protected by admin auth middleware in routes)
app.use('/api/admin', adminRoutes);

// ─── 404 Handler ──────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// ─── Error Handler ────────────────────────────────────────────────────
app.use((err: Error, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  // Always log the full error server-side
  console.error(err.stack || err);

  const isDev = process.env.NODE_ENV === 'development';
  const statusCode = (err as { statusCode?: number }).statusCode || 500;

  if (isDev) {
    // In development: return error details, but only stack trace for non-500 errors
    res.status(statusCode).json({
      message: err.message || 'An unexpected error occurred',
      ...(statusCode !== 500 && { stack: err.stack }),
    });
  } else {
    // In production: never return error details to the client
    res.status(statusCode).json({
      message: statusCode === 500 ? 'An unexpected error occurred' : err.message || 'Request failed',
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Network: Sepolia testnet`);
  console.log(`RPC: ${process.env.ETHEREUM_RPC_URL || 'https://rpc.ankr.com/eth_sepolia'}`);
});

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

export { prisma };
