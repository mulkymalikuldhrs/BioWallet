# Changelog

All notable changes to BioWallet will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-05-21

### Added

- 🎉 **Tech Stack Upgrade**: Migrated to Next.js 15, React 19, Ethers v6, and Prisma 6 across the entire monorepo.
- **Turbo v2 Migration**: Upgraded the monorepo pipeline to Turbo v2 and updated `turbo.json` to the new `tasks` syntax.
- **Security Enhancement**: Migrated biometric key derivation from Argon2 to `ethers.scrypt` across all platforms (web, mobile, and core packages) for better compatibility and security.
- **Unified Biometric Core**: Centralized wallet generation logic in `packages/wallet-core`.
- **Improved Type Safety**: Added comprehensive `tsconfig.json` files and resolved stricter type checks.

### Fixed

- Fixed build errors in `apps/web` by upgrading to React 19 as required by Next.js 15.
- Resolved TypeScript member export issues in `backend/api/src/controllers/userController.ts`.
- Fixed mobile app wallet derivation to use unified `wallet-core` logic.
- Resolved Prisma Client generation and build issues in `backend/api`.

## [1.0.0] - 2026-03-04

### Added

- 🎉 Official v1.0.0 release of BioWallet.
- Complete trilingual README (English, Bahasa Indonesia, 中文).
- Community files: CODE_OF_CONDUCT.md, SECURITY.md, CONTRIBUTING.md, etc.
- GitHub issue templates, PR template, and FUNDING.yml.
- Full monorepo architecture cleanup and branch consolidation.

## [0.1.2] - 2026-05-21

### Added
- Finalized tech stack upgrade foundation.

## [0.1.1] - 2025-02-22

### Added
- **Branch Consolidation**: Merged feature branches into main.
- Created `packages/shared-ui` and `packages/utils`.
- Implemented dashboard and login pages in web app.
- Added unit tests for wallet generation in `packages/wallet-core`.

### Fixed
- **CRITICAL**: Fixed non-deterministic wallet generation.
- **CRITICAL**: Fixed incorrect wallet generation in `wallet-core`.

## [0.1.0] - 2025-07-13

### Added

- **Initial Project Structure**: Set up monorepo architecture with Yarn workspaces.
- **Backend API**: Express + Prisma ORM.
- **Mobile App**: React Native + Expo.
- **Web App**: Next.js + WebAuthn.
- **Biometric Authentication**: Core biometric processing system.
- **Ethereum Wallet Functionality**: Wallet generation and transaction signing.

---

## Future Roadmap

### Planned for v1.2.0
- Iris scanning support for enhanced biometric security
- Multi-chain support (Solana, Polygon, Avalanche)
- Social recovery system using Shamir's Secret Sharing
- DeFi protocol integration (Uniswap, Aave, Compound)
- NFT viewing and management
- Zero-knowledge proof support for private transactions

---

This project is part of the [HermesQuantOS](https://github.com/mulkymalikuldhrs/HermesQuantOS) ecosystem, developed by Mulky Malikul Dhaher.
