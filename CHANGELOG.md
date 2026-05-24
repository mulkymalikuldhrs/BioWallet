# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.2] - 2026-04-20

### Added
- **Monorepo Consolidation**: Successfully unified all feature branches into a single cohesive structure.
- **Dependency Upgrades**: Upgraded `ethers` to v6.16.0+, `next` to v15.1.7, and `react` to v19.2.5 across all workspaces.
- **TypeScript Support**: Added `tsconfig.json` to `backend/api`, `packages/wallet-core`, and `packages/biometric-core` for standardized builds.

### Fixed
- Fixed build errors in `apps/web` by upgrading to React 19 as required by Next.js 15.
- Resolved TypeScript member export issues in `backend/api/src/controllers/userController.ts`.
- **Security**: Migrated biometric key derivation from Argon2 to `ethers.scrypt` across all platforms (web, mobile, and core packages) for better compatibility and security.
- Fixed mobile app wallet derivation to use unified `wallet-core` logic.
- Resolved Prisma Client generation and build issues in `backend/api`.

## [0.1.1] - 2025-02-22

### Added
- **Branch Consolidation**: Merged all feature branches including mobile components into main.
- Created `packages/shared-ui` with basic React components.
- Created `packages/utils` with utility functions (`formatAddress`, `validateEmail`).
- Implemented `apps/web/src/pages/dashboard.tsx` for wallet management.
- Implemented `apps/web/src/pages/login.tsx` for biometric authentication.
- Added `apps/web/src/components/Layout.tsx` for consistent UI.
- Added unit tests for wallet generation in `packages/wallet-core`.
- Added `jest` and `ts-jest` for monorepo testing.

### Fixed
- **CRITICAL**: Fixed non-deterministic wallet generation by removing `Date.now()` from the biometric salt.
- **CRITICAL**: Fixed incorrect wallet generation in `wallet-core` to use hash as a private key.
- Fixed `next.config.js` to support WebAssembly and node modules fallback.

### Improved
- Updated `README.md` with current project architecture and unified state.
- Integrated frontend registration with backend API.
- Simplified UI to improve reliability across different environments.

## [0.1.0] - 2025-01-13
- Initial project structure setup.
- Implemented backend API with Express and Prisma.
- Created mobile app with React Native and Expo.
- Implemented web app with Next.js and WebAuthn.

---

> **Contact:** Mulky Malikul Dhaher — [mulkymalikuldhaher@email.com](mailto:mulkymalikuldhaher@email.com)
>
> **Disclaimer:** This project is for Education Purpose only. Risiko apapun tidak kita tanggung. (We are not responsible for any risks or damages.)
