# BioWallet

```
 ____  _      _    _       _ _      _   
| __ )(_) ___| |  | | __ _| | | ___| |_ 
|  _ \| |/ _ \ |  | |/ _` | | |/ _ \ __|
| |_) | | (_) | |__| | (_| | | |  __/ |_ 
|____/|_|\___/|_____|\__,_|_|_|\___|\__|
                                        
Your body is your password
```

BioWallet is a revolutionary crypto wallet that uses human biometrics (fingerprint, face, iris) for key derivation instead of passwords or seed phrases. It provides a secure, user-friendly way to manage your cryptocurrency assets.

## Features

- **Biometric Authentication**: Use your fingerprint, face, or iris to secure your wallet.
- **Deterministic Key Derivation**: Biometric data is used to derive a deterministic private key via SHA-256/Argon2 hashing.
- **No Seed Phrases**: Never worry about losing or forgetting your seed phrase.
- **Cross-Platform**: Available on Web (Next.js) and Mobile (React Native + Expo).
- **Local Biometric Processing**: All biometric data is processed locally on your device.
- **Ethereum Compatible**: Send and receive ETH and ERC-20 tokens.
- **Beautiful UI/UX**: Intuitive and user-friendly interface with Tailwind CSS and Framer Motion.

## Architecture

BioWallet is built as a monorepo using Yarn Workspaces:

- **apps/web**: Next.js application with WebAuthn integration.
- **apps/mobile**: React Native + Expo mobile application.
- **backend/api**: Express API with Prisma ORM and PostgreSQL.
- **backend/db**: Prisma schema and database migrations.
- **packages/wallet-core**: Core Ethereum wallet logic and key derivation.
- **packages/biometric-core**: WebAuthn and biometric processing logic.
- **packages/shared-ui**: Shared React components.
- **packages/utils**: Common utility functions.

## Getting Started

### Prerequisites

- Node.js 18+
- Yarn
- Docker and Docker Compose

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/mulkymalikuldhrs/BioWallet.git
   cd BioWallet
   ```

2. Install dependencies:
   ```
   yarn install
   ```

3. Setup environment variables:
   Create `.env` in `backend/api` and `apps/web` (see `.env.example` in those directories if they exist, or use the provided defaults).

4. Start the development environment:
   ```
   yarn docker:up
   yarn prisma:generate
   yarn prisma:migrate
   ```

5. Start the applications:
   ```
   # Backend API
   yarn dev:backend
   
   # Web App
   yarn dev:web
   
   # Mobile App
   yarn dev:mobile
   ```

### Running Tests

```
yarn test
```

## Recent Improvements (v0.1.1)

- **Consolidated Branch State**: Merged all feature branches into a single unified codebase.
- **Deterministic Wallet Generation**: Fixed a bug where `Date.now()` was used in the salt, causing non-deterministic wallet addresses.
- **Improved Key Derivation**: Updated `wallet-core` to correctly derive Ethereum private keys from biometric hashes.
- **Infrastructure**: Added `shared-ui` and `utils` packages for better code reuse.
- **Frontend**: Fully implemented Web Dashboard, Login, and Registration flows.

## License

This project is licensed under the MIT License.

## Credits

Developed by **Mulky Malikul Dhaher** (mulkymalikuldhr@technologist.com)
