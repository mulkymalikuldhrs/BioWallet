# BioWallet - Architecture

This document provides a comprehensive overview of the BioWallet system architecture, including component design, data flow, security architecture, and technical decisions.

---

## Table of Contents

- [System Overview](#system-overview)
- [Architecture Layers](#architecture-layers)
- [Monorepo Structure](#monorepo-structure)
- [Data Flow](#data-flow)
- [Biometric Processing Pipeline](#biometric-processing-pipeline)
- [Key Derivation Architecture](#key-derivation-architecture)
- [Wallet Management Architecture](#wallet-management-architecture)
- [Backend Architecture](#backend-architecture)
- [Security Architecture](#security-architecture)
- [Database Schema](#database-schema)
- [Deployment Architecture](#deployment-architecture)
- [Technology Decisions](#technology-decisions)

---

## System Overview

BioWallet is a biometric-powered cryptocurrency wallet that replaces traditional seed phrases and passwords with human biometrics. The system is designed as a monorepo with three main application surfaces and a shared codebase.

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│   Mobile App    │     │    Web App      │     │  Admin Portal   │
│  (React Native) │     │    (Next.js)    │     │    (Next.js)    │
│                 │     │                 │     │                 │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
         │                       │                       │
         │                       ▼                       │
         │              ┌─────────────────┐              │
         └──────────────►                 ◄──────────────┘
                        │   Backend API   │
                        │    (Express)    │
                        │                 │
                        └────────┬────────┘
                                 │
                                 │
                                 ▼
                        ┌─────────────────┐
                        │                 │
                        │   PostgreSQL    │
                        │   Database      │
                        │                 │
                        └─────────────────┘
```

---

## Architecture Layers

### 1. Biometric Capture Layer

This layer is responsible for capturing and preprocessing biometric data from the user. It is the entry point for all authentication and key derivation operations.

**Mobile (React Native)**:
- Uses `react-native-biometrics` for fingerprint and face recognition
- Accesses native device sensors through Expo modules
- Supports fingerprint (Touch ID / Fingerprint), face (Face ID), and iris scanning

**Web (Next.js)**:
- Uses the Web Authentication API (WebAuthn) for browser-based biometric authentication
- Supports platform authenticators (fingerprint, face) and roaming authenticators (security keys)
- Leverages the `navigator.credentials` API for credential management

**Key Principles**:
- All biometric data is processed locally on the device
- Raw biometric data is never stored, transmitted, or logged
- Biometric templates are used only for key derivation and immediately discarded
- Error correction is applied to handle natural variations in biometric readings

### 2. Key Derivation Layer

This layer transforms biometric data into deterministic cryptographic keys that can consistently regenerate the same wallet.

```
Biometric Input
      │
      ▼
┌──────────────┐
│  Error        │  Handles natural variation in
│  Correction   │  biometric readings
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Argon2 /    │  Key derivation function that
│  BKDF        │  produces deterministic keys
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  SHA-256     │  Additional hashing for
│  Hashing     │  key normalization
└──────┬───────┘
       │
       ▼
  Private Key (256-bit)
```

**Key Properties**:
- Deterministic: The same biometric input always produces the same key
- Secure: Uses Argon2 with appropriate memory and iteration parameters
- Resistant: Designed to withstand brute-force and rainbow table attacks
- Consistent: Error correction ensures reliable key regeneration across scans

### 3. Wallet Management Layer

This layer handles all Ethereum wallet operations using the derived private key.

**Functionality**:
- Wallet generation from derived private key using ethers.js
- Address derivation (Ethereum compatible)
- Transaction signing with local private key
- Balance checking via blockchain RPC providers
- ERC-20 token support (balance checking, transfers)
- Transaction history retrieval and caching

**wallet-core Package**:
The `wallet-core` shared package encapsulates all wallet logic to ensure consistency across mobile and web platforms. It provides a unified API for wallet operations regardless of the client platform.

### 4. Backend Services Layer

This layer provides API services and persistent data storage.

**Express API** (`backend/api`):
- User management endpoints (registration, profile, settings)
- Wallet metadata endpoints (public keys, addresses)
- Transaction history endpoints (recording, retrieval, filtering)
- Admin endpoints (analytics, monitoring, user management)
- Referral system endpoints (tracking, rewards)

**Prisma ORM** (`backend/db`):
- Type-safe database queries
- Schema migrations and versioning
- Database model definitions
- Connection pooling and query optimization

### 5. UI/UX Layer

This layer provides the user interface across all platforms with consistent design language.

**Design System**:
- TailwindCSS for utility-first styling
- Framer Motion for animations and transitions
- Shadcn UI for consistent component design
- Light/dark mode support
- Psychological design elements for trust and prestige

**Context Architecture (Mobile)**:
- `AuthContext`: Manages authentication state and biometric login
- `WalletContext`: Manages wallet state, balance, and transactions
- `ThemeContext`: Manages UI theme and visual preferences

**Context Architecture (Web)**:
- `AuthContext`: WebAuthn-based authentication state
- `WalletContext`: Wallet operations and state management

---

## Monorepo Structure

```
BioWallet/
├── apps/
│   ├── mobile/                  # React Native + Expo
│   │   ├── App.tsx              # Entry point
│   │   ├── src/
│   │   │   ├── context/         # AuthContext, WalletContext, ThemeContext
│   │   │   ├── screens/         # WelcomeScreen, RegisterScreen, HomeScreen
│   │   │   └── navigation/      # MainNavigator
│   │   └── package.json
│   └── web/                     # Next.js + WebAuthn
│       ├── src/
│       │   ├── pages/           # index.tsx, register.tsx, _app.tsx
│       │   └── context/         # AuthContext, WalletContext
│       └── package.json
├── packages/
│   ├── wallet-core/             # Ethereum wallet functionality
│   │   ├── src/index.ts         # Wallet generation, signing, transactions
│   │   └── package.json
│   ├── biometric-core/          # Biometric processing
│   │   ├── src/index.ts         # Key derivation, biometric hashing
│   │   └── package.json
│   ├── shared-ui/               # Shared UI components
│   └── utils/                   # Shared utilities
├── backend/
│   ├── api/                     # Express API server
│   │   ├── src/
│   │   │   ├── index.ts         # Server setup and middleware
│   │   │   ├── routes/          # API route definitions
│   │   │   │   ├── userRoutes.ts
│   │   │   │   ├── walletRoutes.ts
│   │   │   │   ├── transactionRoutes.ts
│   │   │   │   └── adminRoutes.ts
│   │   │   └── controllers/     # Request handlers
│   │   │       ├── userController.ts
│   │   │       ├── walletController.ts
│   │   │       ├── transactionController.ts
│   │   │       └── adminController.ts
│   │   └── package.json
│   └── db/
│       └── schema.prisma        # Database schema
├── docs/
│   └── architecture.md          # Architecture documentation
├── assets/
│   └── images/                  # Logo and image assets
├── docker-compose.yml           # Development services
└── package.json                 # Root workspace config
```

---

## Data Flow

### User Registration

1. User opens the app (mobile or web) for the first time
2. User is presented with the Welcome screen explaining biometric authentication
3. User proceeds to registration and provides biometric data (fingerprint/face scan)
4. Biometric data is processed locally to generate a biometric hash
5. The biometric hash is passed through the key derivation function (Argon2/BKDF)
6. A deterministic private key is generated from the derived key
7. An Ethereum wallet address is derived from the private key using ethers.js
8. Only the public key and wallet address are sent to the backend API
9. The backend stores the public key, wallet address, and user metadata in PostgreSQL
10. No private key or biometric data is ever stored or transmitted

### User Login (Authentication)

1. User opens the app and initiates login
2. Biometric authentication is requested (fingerprint/face scan)
3. The same biometric data is processed through the key derivation pipeline
4. The same private key is regenerated deterministically
5. The private key is used to derive the wallet address
6. The wallet address is compared with the stored address on the backend
7. If they match, the user is authenticated and granted access
8. The private key exists only in memory for the duration of the session

### Transaction Signing

1. User initiates a transaction (send ETH or ERC-20 tokens)
2. User authenticates with biometric data
3. The private key is regenerated from biometric data
4. Transaction details are constructed (to, value, gas, nonce)
5. The transaction is signed locally with the private key using ethers.js
6. The signed transaction is broadcast to the Ethereum network
7. A transaction record is stored in the backend database
8. The private key is cleared from memory

---

## Biometric Processing Pipeline

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Biometric   │    │   Feature    │    │   Template   │    │   Biometric   │
│   Capture     │───▶│  Extraction  │───▶│  Generation  │───▶│    Hash      │
│  (Fingerprint │    │  (Edge       │    │  (Normalized │    │  (SHA-256    │
│   Face, Iris) │    │   Detection) │    │   Template)  │    │   Digest)    │
└──────────────┘    └──────────────┘    └──────────────┘    └──────┬───────┘
                                                                   │
                                                            ┌──────▼───────┐
                                                            │  Key Derivation │
                                                            │  (Argon2/BKDF)  │
                                                            └──────┬───────┘
                                                                   │
                                                            ┌──────▼───────┐
                                                            │  Private Key   │
                                                            │  (256-bit)     │
                                                            └───────────────┘
```

---

## Key Derivation Architecture

The key derivation process is the core security mechanism of BioWallet:

1. **Biometric Capture**: Raw biometric data is captured from device sensors
2. **Feature Extraction**: Distinctive features are extracted from the biometric sample
3. **Error Correction**: Fuzzy extractor or error-tolerant hashing handles natural variations
4. **Argon2 Hashing**: The processed biometric data is hashed using Argon2 with parameters:
   - Memory cost: Sufficient to resist GPU attacks
   - Time cost: Balanced between security and user experience
   - Parallelism: Optimized for device capabilities
5. **Key Normalization**: SHA-256 hashing normalizes the Argon2 output to a 256-bit key
6. **Wallet Generation**: The 256-bit key is used as an Ethereum private key

---

## Wallet Management Architecture

The `wallet-core` package provides a unified wallet interface:

```typescript
// Core wallet operations
interface WalletCore {
  generateWallet(privateKey: string): Wallet;
  getAddress(wallet: Wallet): string;
  getBalance(address: string): Promise<BigNumber>;
  signTransaction(wallet: Wallet, tx: TransactionRequest): Promise<string>;
  sendTransaction(signedTx: string): Promise<TransactionResponse>;
  getTokenBalance(address: string, tokenAddress: string): Promise<BigNumber>;
}
```

---

## Backend Architecture

### API Route Structure

```
/api
├── /users
│   ├── POST /register          # Create new user
│   ├── GET /:id                # Get user profile
│   ├── PUT /:id                # Update user profile
│   └── GET /:id/wallets        # Get user wallets
├── /wallets
│   ├── POST /                  # Register wallet address
│   ├── GET /:address/balance   # Get wallet balance
│   └── GET /:address/tokens    # Get ERC-20 tokens
├── /transactions
│   ├── POST /                  # Record transaction
│   ├── GET /:address           # Get transaction history
│   └── GET /:address/:txHash   # Get transaction details
└── /admin
    ├── GET /stats              # Platform statistics
    ├── GET /users              # All users (admin)
    └── GET /transactions       # All transactions (admin)
```

---

## Security Architecture

### Core Security Principles

1. **Zero Knowledge**: The backend never has access to private keys or biometric data
2. **Local Processing**: All biometric and cryptographic operations occur on the user's device
3. **No Storage**: Biometric data and private keys are never persisted in any form
4. **Deterministic Recovery**: Keys can be regenerated from biometric data at any time
5. **Encrypted Transport**: All API communication uses HTTPS/TLS
6. **Input Validation**: All API inputs are validated and sanitized

### Threat Model

| Threat | Mitigation |
|--------|------------|
| Biometric data theft | Data never leaves the device |
| Private key extraction | Key exists only in memory, never stored |
| Server breach | No private keys or biometric data on server |
| Man-in-the-middle | TLS encryption for all communications |
| Brute force attacks | Argon2 with high memory/time cost |
| Replay attacks | Nonce-based transaction signing |

---

## Database Schema

The PostgreSQL database (managed via Prisma) stores only non-sensitive data:

- **User**: Public profile data, preferences, settings
- **Wallet**: Public keys, wallet addresses (never private keys)
- **Transaction**: Transaction hashes, amounts, timestamps, status
- **Referral**: Referral codes, tracking, rewards
- **Admin**: Platform configuration, analytics data

---

## Deployment Architecture

```
┌─────────────┐     ┌──────────────┐     ┌───────────────┐
│   Expo EAS   │     │    Vercel    │     │   Railway     │
│  (Mobile     │     │  (Web App    │     │  (Backend API │
│   App Store) │     │  Hosting)    │     │   + PostgreSQL)│
└─────────────┘     └──────────────┘     └───────────────┘
```

- **Mobile**: Built with Expo EAS and deployed to Google Play and Apple App Store
- **Web**: Deployed on Vercel with automatic builds from the main branch
- **Backend**: API server deployed on Railway with managed PostgreSQL
- **Alternative**: Supabase can be used as a PostgreSQL provider

---

## Technology Decisions

| Decision | Rationale |
|----------|-----------|
| Monorepo (Yarn Workspaces) | Code sharing, consistent versions, atomic changes |
| React Native + Expo | Cross-platform mobile with native biometric access |
| Next.js + WebAuthn | Web biometric support, SSR, modern React patterns |
| Express + Prisma | Type-safe ORM, migration system, excellent TypeScript support |
| Argon2 | Proven key derivation function, resistant to GPU attacks |
| ethers.js | Comprehensive Ethereum library, well-maintained |
| PostgreSQL | Relational data integrity, Prisma support, scalability |
| Docker Compose | Consistent development environment, easy setup |

---

This project is part of the [HermesQuantOS](https://github.com/mulkymalikuldhrs/HermesQuantOS) ecosystem, developed by Mulky Malikul Dhaher.
