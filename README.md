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

- **Biometric Authentication**: Use your fingerprint, face, or iris to secure your wallet
- **No Seed Phrases**: Never worry about losing or forgetting your seed phrase
- **Cross-Platform**: Available on Android, iOS, and Web
- **Local Biometric Processing**: All biometric data is processed locally on your device
- **Ethereum Compatible**: Send and receive ETH and ERC-20 tokens
- **Beautiful UI/UX**: Intuitive and user-friendly interface
- **Secure Key Derivation**: Deterministic key generation from biometric data
- **Referral System**: Built-in referral system to grow the user base
- **Transaction History**: View all your transactions in one place
- **Admin Dashboard**: Comprehensive admin dashboard for monitoring and analytics

## Architecture

BioWallet is built as a monorepo with the following components:

- **Mobile App**: React Native + Expo
- **Web App**: Next.js + WebAuthn
- **Backend API**: Express + Prisma + PostgreSQL
- **Shared Packages**:
  - `wallet-core`: Ethereum wallet functionality
  - `biometric-core`: Biometric processing
  - `shared-ui`: Shared UI components
  - `utils`: Utility functions

## Blueprint

The BioWallet system architecture follows these key principles:

1. **Biometric Processing**: All biometric data is processed locally on the device using WebAuthn (web) or native biometric APIs (mobile).

2. **Key Derivation**: The biometric data is used to derive a deterministic key using Argon2 hashing.

3. **Wallet Generation**: The derived key is used to generate an Ethereum wallet.

4. **Transaction Signing**: Transactions are signed locally using the derived key after biometric authentication.

5. **Backend Services**: The backend provides API endpoints for user management, transaction history, and analytics.

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│   Mobile App    │     │    Web App      │     │  Admin Portal   │
│  (React Native) │     │    (Next.js)    │     │    (Next.js)    │
│                 │     │                 │     │                 │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
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

## Getting Started

### Prerequisites

- Node.js 14+
- Yarn or npm
- Docker and Docker Compose (for development)

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

3. Start the development environment:
   ```
   yarn docker:up
   yarn prisma:generate
   yarn prisma:migrate
   ```

4. Start the applications:
   ```
   # Backend API
   yarn dev:backend
   
   # Web App
   yarn dev:web
   
   # Mobile App
   yarn dev:mobile
   ```

## Development

### Mobile App

The mobile app is built with React Native and Expo. To start the development server:

```
yarn dev:mobile
```

### Web App

The web app is built with Next.js. To start the development server:

```
yarn dev:web
```

### Backend API

The backend API is built with Express and Prisma. To start the development server:

```
yarn dev:backend
```

## Security

BioWallet takes security seriously:

1. **Local Processing**: All biometric data is processed locally on your device
2. **No Storage**: Biometric data is never stored or transmitted
3. **Deterministic Key Derivation**: Biometric data is used to derive a deterministic key
4. **Encryption**: All sensitive data is encrypted
5. **WebAuthn**: Uses the Web Authentication API for secure biometric authentication
6. **No Seed Phrases**: Eliminates the risk of lost or stolen seed phrases

## Changelog

### v0.1.0 (2025-07-13)
- Initial project structure setup
- Implemented backend API with Express and Prisma
- Created mobile app with React Native and Expo
- Implemented web app with Next.js and WebAuthn
- Added biometric authentication for key derivation
- Implemented Ethereum wallet functionality
- Added transaction history and user management
- Created admin dashboard for monitoring and analytics

## TODO: Next Implementation

1. **Multi-Chain Support**:
   - Add support for other blockchains (Solana, Polygon, etc.)
   - Implement multi-chain wallet management

2. **Enhanced Security**:
   - Add multi-factor authentication options
   - Implement transaction limits and approvals
   - Add device management for multi-device support

3. **DeFi Integration**:
   - Connect to popular DeFi protocols
   - Add staking and yield farming features
   - Implement token swaps

4. **Social Recovery**:
   - Add social recovery options for account recovery
   - Implement guardian system for recovery

5. **NFT Support**:
   - Add NFT viewing and management
   - Implement NFT marketplace integration

6. **Performance Optimization**:
   - Optimize biometric processing for faster authentication
   - Improve transaction signing speed
   - Enhance UI/UX performance

7. **Expanded Testing**:
   - Add comprehensive unit and integration tests
   - Implement end-to-end testing
   - Conduct security audits

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Credits

Developed by **Mulky Malikul Dhaher** (mulkymalikuldhr@technologist.com)

## Acknowledgments

- [Ethereum](https://ethereum.org/)
- [WebAuthn](https://webauthn.io/)
- [React Native](https://reactnative.dev/)
- [Next.js](https://nextjs.org/)
- [Expo](https://expo.dev/)
- [Prisma](https://www.prisma.io/)