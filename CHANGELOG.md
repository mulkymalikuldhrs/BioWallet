# Changelog

All notable changes to BioWallet will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2026-03-05

### 🚀 Production Ready Release

This release includes critical bug fixes, security hardening, and production-ready improvements.

### Fixed

- **CRITICAL: Deterministic wallet key generation** — Removed `Date.now()` from biometric salt. Keys are now derived deterministically from `deviceId + biometricId`, enabling wallet recovery via biometric re-authentication
- **CRITICAL: Invalid mnemonic bug** — Replaced `ethers.Wallet.fromPhrase(hashResult.encoded)` with `ethers.scrypt()` key derivation + `new ethers.Wallet(privateKey)`. Argon2 encoded strings are not valid BIP39 mnemonics
- **CRITICAL: Goerli testnet migration** — Migrated all RPC endpoints from deprecated Goerli (`goerli.infura.io`) to Sepolia testnet (`rpc.ankr.com/eth_sepolia`)
- **CRITICAL: Fake authentication** — Replaced hardcoded `'dummy-token'` in Web AuthContext with `crypto.randomUUID()` session tokens
- **CRITICAL: Missing mobile screens** — Created SendScreen, HistoryScreen, ProfileScreen, and LoginScreen with full UI
- **Missing dependency** — Added `expo-linear-gradient` to mobile package.json (required by WelcomeScreen)

### Security

- **WebAuthn challenge randomization** — Replaced static `new Uint8Array([1,2,3,4,5,6,7,8])` challenges with `crypto.getRandomValues()` in biometric-core
- **Auth middleware** — Added Bearer token authentication middleware to all protected API routes
- **Admin route protection** — Admin routes now require `X-Admin-API-Key` header in addition to Bearer token
- **Rate limiting** — Added in-memory rate limiting: default (60/min), strict (10/min for auth/transaction endpoints), admin (30/min)
- **Environment variable references** — Replaced hardcoded `your-infura-key` with `process.env.ETHEREUM_RPC_URL` throughout backend

### Added

- **utils package** — New shared package with `extractEntropy()`, `formatAddress()`, `validateEmail()`
- **shared-ui package** — New shared UI component library
- **Web dashboard page** — `dashboard.tsx` with balance display, wallet address, and transaction sending
- **Web login page** — `login.tsx` with WebAuthn biometric authentication
- **Auth middleware** — `backend/api/src/middleware/auth.ts` with `authMiddleware` and `adminAuthMiddleware`
- **Rate limiter** — `backend/api/src/middleware/rateLimiter.ts` with configurable rate limiting
- **.env.example files** — Added for both backend API and web app
- **jsonwebtoken & uuid** — Added to backend dependencies for future JWT-based authentication

### Changed

- **Key derivation** — Migrated from Argon2 to `ethers.scrypt()` for wallet key generation (more compatible with web/mobile environments)
- **Network** — All Ethereum network references changed from Goerli to Sepolia
- **Web WalletContext** — Now uses `generateWallet(biometricData, salt)` from wallet-core package
- **Mobile WalletContext** — Uses stable biometric entropy (`biometric-entropy-${deviceId}`) instead of `Date.now()` salt
- **Backend CORS** — Configurable via `CORS_ORIGIN` environment variable

---

## [1.0.0] - 2026-03-04

### Added

- 🎉 Official v1.0.0 release of BioWallet
- Complete trilingual README (English, Bahasa Indonesia, 中文)
- Community files: CODE_OF_CONDUCT.md, SECURITY.md, CONTRIBUTING.md
- GitHub issue templates, PR template, and FUNDING.yml
- Full monorepo architecture cleanup and branch consolidation

## [0.1.0] - 2025-07-13

### Added

- **Initial Project Structure**: Set up monorepo architecture with Yarn workspaces containing mobile app, web app, backend API, and shared packages (wallet-core, biometric-core, shared-ui, utils).
- **Backend API**: Implemented Express-based API server with Prisma ORM for database interactions, including user management, wallet operations, transaction tracking, and admin analytics endpoints.
- **Mobile App**: Created React Native application with Expo framework, featuring biometric authentication via react-native-biometrics, wallet management screens, transaction history, and user registration flow.
- **Web App**: Implemented Next.js web application with WebAuthn support for browser-based biometric authentication, wallet dashboard, and transaction management interface.
- **Biometric Authentication**: Core biometric processing system supporting fingerprint, face, and iris recognition with local-only processing to ensure data privacy.
- **Ethereum Wallet Functionality**: Complete wallet generation, transaction signing, balance checking, and ERC-20 token support using ethers.js.
- **Deterministic Key Derivation**: Key derivation from biometric data that generates consistent cryptographic keys across multiple biometric scans.
- **Transaction History**: Full transaction tracking and display with filtering, sorting, and detailed transaction information.
- **User Management**: Registration, authentication, profile management, and settings across all platforms.
- **Admin Dashboard**: Comprehensive monitoring and analytics dashboard for platform oversight, user management, and transaction reporting.
- **Referral System**: Built-in referral mechanism for user growth with tracking and reward distribution.
- **Docker Configuration**: Docker Compose setup for PostgreSQL database and development environment.
- **Prisma Schema**: Complete database schema definition including User, Wallet, Transaction, Referral, and Admin models.

---

This project is part of the [HermesQuantOS](https://github.com/mulkymalikuldhrs/HermesQuantOS) ecosystem, developed by Mulky Malikul Dhaher.
