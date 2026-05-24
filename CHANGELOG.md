# Changelog

All notable changes to BioWallet will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2025-07-13

### Added

- **Initial Project Structure**: Set up monorepo architecture with Yarn workspaces containing mobile app, web app, backend API, and shared packages (wallet-core, biometric-core, shared-ui, utils).
- **Backend API**: Implemented Express-based API server with Prisma ORM for database interactions, including user management, wallet operations, transaction tracking, and admin analytics endpoints.
- **Mobile App**: Created React Native application with Expo framework, featuring biometric authentication via react-native-biometrics, wallet management screens, transaction history, and user registration flow.
- **Web App**: Implemented Next.js web application with WebAuthn support for browser-based biometric authentication, wallet dashboard, and transaction management interface.
- **Biometric Authentication**: Core biometric processing system supporting fingerprint, face, and iris recognition with local-only processing to ensure data privacy.
- **Ethereum Wallet Functionality**: Complete wallet generation, transaction signing, balance checking, and ERC-20 token support using ethers.js and bip39.
- **Deterministic Key Derivation**: Argon2-based key derivation from biometric data that generates consistent cryptographic keys across multiple biometric scans.
- **Transaction History**: Full transaction tracking and display with filtering, sorting, and detailed transaction information.
- **User Management**: Registration, authentication, profile management, and settings across all platforms.
- **Admin Dashboard**: Comprehensive monitoring and analytics dashboard for platform oversight, user management, and transaction reporting.
- **Referral System**: Built-in referral mechanism for user growth with tracking and reward distribution.
- **Docker Configuration**: Docker Compose setup for PostgreSQL database and development environment.
- **Prisma Schema**: Complete database schema definition including User, Wallet, Transaction, Referral, and Admin models.

### Technical Details

- **Architecture**: Monorepo with Yarn workspaces
- **Mobile**: React Native + Expo
- **Web**: Next.js + WebAuthn
- **Backend**: Express + Prisma ORM
- **Database**: PostgreSQL
- **Key Derivation**: Argon2
- **Wallet**: ethers.js + bip39
- **Styling**: TailwindCSS + Framer Motion + Shadcn UI

---

## Future Roadmap

### Planned for v0.2.0
- Iris scanning support for enhanced biometric security
- Multi-chain support (Solana, Polygon, Avalanche)
- Social recovery system using Shamir's Secret Sharing
- DeFi protocol integration (Uniswap, Aave, Compound)
- NFT viewing and management
- Zero-knowledge proof support for private transactions

### Planned for v0.3.0
- Post-quantum cryptographic algorithms
- Cross-chain atomic swaps
- AI-powered financial advisory
- Hardware Security Module (HSM) integration
- Multi-party computation (MPC) key management
- Enterprise and institutional features

---

This project is part of the [HermesQuantOS](https://github.com/mulkymalikuldhrs/HermesQuantOS) ecosystem, developed by Mulky Malikul Dhaher.
