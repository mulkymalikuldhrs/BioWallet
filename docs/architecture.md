# BioWallet Architecture

BioWallet is a secure, futuristic, biometric-powered crypto wallet app that uses the human body (fingerprint, face, iris) as the source of key derivation instead of passwords or seed phrases.

## System Overview

BioWallet is built as a monorepo with the following components:

- **Mobile App**: React Native + Expo application for Android and iOS
- **Web App**: Next.js application with WebAuthn support
- **Backend**: Node.js + Express API with Prisma ORM
- **Shared Packages**: Common code shared between applications

## Architecture Layers

### 1. Biometric Capture Layer

This layer handles the capture and processing of biometric data:

- Uses native device sensors (fingerprint, face, iris)
- Processes biometric data locally on the device
- Never transmits raw biometric data to the server
- Implements platform-specific biometric capture (react-native-biometrics for mobile, WebAuthn for web)

### 2. Key Derivation Layer

This layer converts biometric data into cryptographic keys:

- Uses Argon2 or BKDF for key derivation
- Implements error correction to handle biometric variations
- Generates deterministic keys from biometric data
- Ensures consistent key generation across multiple scans

### 3. Wallet Management Layer

This layer handles wallet operations:

- Generates Ethereum-compatible wallets using ethers.js
- Manages transaction signing and verification
- Connects to blockchain networks (Ethereum testnet initially)
- Handles balance and transaction history retrieval

### 4. Backend Services Layer

This layer provides API services and data storage:

- Stores public keys and transaction records
- Manages user profiles and settings
- Provides API endpoints for wallet operations
- Implements admin dashboard for monitoring

### 5. UI/UX Layer

This layer provides the user interface:

- Implements psychological design elements for trust and prestige
- Provides consistent experience across platforms
- Handles animations and interactive elements
- Implements light/dark mode

## Data Flow

1. **Registration**:
   - User provides biometric data (fingerprint/face scan)
   - Biometric data is processed locally to generate a hash
   - Hash is used to derive a private key using BKDF
   - Public key and wallet address are sent to the backend
   - Backend stores public key and wallet address

2. **Login**:
   - User provides biometric data
   - Same process regenerates the private key
   - Private key is used to access the wallet
   - No private key or biometric data is ever stored

3. **Transactions**:
   - User initiates transaction
   - Transaction is signed locally with private key
   - Signed transaction is sent to the blockchain
   - Transaction record is stored in the backend

## Security Considerations

- **Biometric Data**: Never stored or transmitted; processed locally only
- **Private Keys**: Generated on-demand from biometric data; never stored
- **Public Keys**: Stored in the backend database
- **Transactions**: Signed locally; only signed transactions are transmitted

## Monetization Strategy

- **Transaction Fees**: 0.1% fee on transactions
- **Premium Features**: Secure backup solutions, multi-chain support
- **Referral System**: Reward users for bringing new users

## Deployment Architecture

- **Mobile**: Deployed via app stores (Google Play, Apple App Store)
- **Web**: Deployed on Vercel
- **Backend**: Deployed on Railway
- **Database**: PostgreSQL on Railway or Supabase

## Technology Stack

| Layer | Technologies |
|-------|--------------|
| Frontend Mobile | React Native + Expo |
| Frontend Web | Next.js + WebAuthn |
| Biometric Processing | react-native-biometrics, WebAuthn, MediaPipe |
| Wallet Generation | ethers.js, bip39 |
| Key Derivation | argon2-browser, scrypt, SHA256 |
| Backend | Node.js + Express + Prisma ORM |
| Database | PostgreSQL / Supabase |
| UI/UX | TailwindCSS + Framer Motion + Shadcn UI |
| Deployment | Vercel (Web), Expo EAS (Mobile), Railway (API) |