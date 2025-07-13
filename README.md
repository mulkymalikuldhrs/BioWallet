# BioWallet

BioWallet is a revolutionary crypto wallet that uses human biometrics (fingerprint, face, iris) for key derivation instead of passwords or seed phrases. It provides a secure, user-friendly way to manage your cryptocurrency assets.

## Features

- **Biometric Authentication**: Use your fingerprint, face, or iris to secure your wallet
- **No Seed Phrases**: Never worry about losing or forgetting your seed phrase
- **Cross-Platform**: Available on Android, iOS, and Web
- **Local Biometric Processing**: All biometric data is processed locally on your device
- **Ethereum Compatible**: Send and receive ETH and ERC-20 tokens
- **Beautiful UI/UX**: Intuitive and user-friendly interface

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

## Getting Started

### Prerequisites

- Node.js 14+
- Yarn or npm
- Docker and Docker Compose (for development)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/biowallet.git
   cd biowallet
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

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Ethereum](https://ethereum.org/)
- [WebAuthn](https://webauthn.io/)
- [React Native](https://reactnative.dev/)
- [Next.js](https://nextjs.org/)
- [Expo](https://expo.dev/)
- [Prisma](https://www.prisma.io/)