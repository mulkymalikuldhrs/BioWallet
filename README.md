<img src="docs/banner.png" width="100%">

<img width="100%" src="https://capsule-render.vercel.app/api?type=waving&color=0:0a1628,50:0d2b4a,100:143d5e&fontColor=38bdf8&descColor=22d3ee&height=220&section=header&text=BioWallet&fontSize=70&desc=Biometric%20Crypto%20Wallet%20Concept&animation=fadeIn" />

<div align="center">
  <a href="https://git.io/typing-svg">
    <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&size=22&duration=3000&pause=1000&color=38BDF8&center=true&vCenter=true&width=600&lines=Biometric+Authentication+%2B+Web3;WebAuthn-Powered+Wallet+Access;Your+Fingerprint+%3D+Your+Keys;Early+Development+%E2%80%94+Not+Production+Ready" alt="Typing SVG" />
  </a>
</div>

<br/>

<div align="center">

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![WebAuthn](https://img.shields.io/badge/WebAuthn-FIDO2-00599C?style=for-the-badge&logo=webauthn&logoColor=white)](https://webauthn.io/)
[![Ethereum](https://img.shields.io/badge/Ethereum-Web3-3C3C3D?style=for-the-badge&logo=ethereum&logoColor=white)](https://ethereum.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](./LICENSE)

</div>

---

## Overview

**BioWallet** is a concept wallet that explores the intersection of biometric authentication and cryptocurrency management. Leveraging the WebAuthn (FIDO2) standard, BioWallet aims to replace traditional seed phrases and private key management with device-level biometric authentication — your fingerprint, face, or security key becomes the gateway to your crypto assets.

This is an early-stage research project investigating whether biometric auth can improve the UX and security of crypto wallets without compromising the self-custody principles that make crypto valuable.

## Features

### Biometric Authentication
- WebAuthn/FIDO2-based authentication flow
- Fingerprint and facial recognition support (device-dependent)
- Hardware security key integration (YubiKey, etc.)
- Multi-factor authentication combining biometric + PIN

### Wallet Management
- Create and manage multiple crypto wallets
- Send and receive transactions
- Token and NFT portfolio tracking
- Transaction history and analytics

### Security Architecture
- Private keys never leave the device's secure enclave
- Biometric template stored only on authenticator device
- Optional social recovery mechanism
- Session-based access with automatic timeout

### User Experience
- No seed phrases to memorize or store
- One-tap transaction signing with biometric verification
- Clean, intuitive wallet interface
- Cross-device sync (with re-authentication)

### Developer API
- Extensible authentication provider system
- WebAuthn credential management API
- Transaction builder and signer interface
- Plugin architecture for chain support

## Honest Notes

> **Important limitations to understand:**

- **Early Development** — This project is in early development and is **not production-ready** for storing real funds. The authentication flows, key management, and security model are still being validated.
- **Not for Real Funds** — Do not use BioWallet with significant amounts of cryptocurrency. It has not undergone formal security audits and may contain vulnerabilities.
- **Device Dependency** — Biometric authentication relies entirely on device support. If your device doesn't support WebAuthn or biometric sensors, you cannot use the core authentication feature. Loss of the device means loss of access unless recovery mechanisms are configured.
- **Trade-Offs** — Biometric auth introduces a different threat model than seed phrases. While it eliminates seed phrase theft, it introduces device-dependent risks (device loss, biometric spoofing, secure enclave vulnerabilities).
- **No Security Audit** — This project has not been audited by a professional security firm. Use for experimentation and learning only.

## Visual Architecture

### Biometric Authentication Flow

```mermaid
flowchart TD
    subgraph User["👤 User Interaction"]
        A[Fingerprint / Face Scan] --> B[Hardware Security Key]
        A --> C[Device Biometric Sensor]
    end

    subgraph WebAuthn["🔐 WebAuthn / FIDO2 Layer"]
        D[Registration Request] --> E[Credential Creation]
        F[Authentication Request] --> G[Assertion Verification]
        E --> H[Challenge-Response Protocol]
        G --> H
    end

    subgraph Enclave["🛡️ Secure Enclave"]
        H --> I[Biometric Template Storage]
        I --> J[Private Key Generation]
        J --> K[Key Wrapping and Isolation]
        K --> L[Key Never Leaves Device]
    end

    subgraph Derived["🔑 Derived Access"]
        L --> M[Session Token]
        L --> N[Transaction Signing Key]
        L --> O[Recovery Shard]
    end

    C --> D
    C --> F
    B --> D
    B --> F

    style User fill:#0d2b4a,stroke:#38bdf8,color:#e0f2fe
    style WebAuthn fill:#143d5e,stroke:#22d3ee,color:#e0f2fe
    style Enclave fill:#0a1628,stroke:#38bdf8,color:#e0f2fe
    style Derived fill:#1e3a5f,stroke:#22d3ee,color:#e0f2fe
```

### Wallet Transaction Pipeline

```mermaid
flowchart LR
    subgraph Initiate["1️⃣ Initiate"]
        A[User Requests Transaction] --> B[Biometric Re-Authentication]
        B --> C{Auth Verified?}
        C -->|No| D[❌ Transaction Rejected]
    end

    subgraph Sign["2️⃣ Sign"]
        C -->|Yes| E[Construct Transaction]
        E --> F[Retrieve Key from Enclave]
        F --> G[Sign Transaction Hash]
        G --> H[Generate Signature Proof]
    end

    subgraph Broadcast["3️⃣ Broadcast"]
        H --> I[Submit to Mempool]
        I --> J[Network Validation]
        J --> K{Valid?}
        K -->|No| L[❌ Rejected by Network]
        K -->|Yes| M[✅ Transaction Confirmed]
        M --> N[Update Wallet State]
    end

    style Initiate fill:#0d2b4a,stroke:#38bdf8,color:#e0f2fe
    style Sign fill:#143d5e,stroke:#22d3ee,color:#e0f2fe
    style Broadcast fill:#0a1628,stroke:#38bdf8,color:#e0f2fe
```

### Monorepo Architecture

```mermaid
graph TB
    subgraph Turborepo["📦 BioWallet Monorepo"]
        subgraph Apps["🖥️ Applications"]
            Mobile["📱 Mobile App<br/>React Native<br/>Expo"]
            Web["🌐 Web App<br/>Next.js<br/>Tailwind CSS"]
        end

        subgraph Backend["⚙️ Backend Services"]
            API["🚀 API Server<br/>Express / Fastify<br/>Prisma ORM"]
            DB["🗄️ Database<br/>PostgreSQL<br/>Prisma Schema"]
        end

        subgraph Packages["📚 Shared Packages"]
            BioCore["biometric-core<br/>WebAuthn Registration<br/>and Auth Logic"]
            WalletCore["wallet-core<br/>Key Management<br/>Transaction Signing"]
            SharedUI["shared-ui<br/>React Components<br/>Design System"]
            Utils["utils<br/>Shared Types<br/>Helpers"]
        end
    end

    Mobile --> BioCore
    Mobile --> WalletCore
    Mobile --> SharedUI
    Mobile --> Utils

    Web --> BioCore
    Web --> WalletCore
    Web --> SharedUI
    Web --> Utils

    API --> BioCore
    API --> WalletCore
    API --> Utils
    API --> DB

    WalletCore --> BioCore

    style Turborepo fill:#0a1628,stroke:#38bdf8,color:#e0f2fe
    style Apps fill:#0d2b4a,stroke:#22d3ee,color:#e0f2fe
    style Backend fill:#143d5e,stroke:#38bdf8,color:#e0f2fe
    style Packages fill:#1e3a5f,stroke:#22d3ee,color:#e0f2fe
```

### Project Status Dashboard

```mermaid
graph LR
    subgraph Status["⚠️ Project Status — RESEARCH PHASE"]
        direction TB
        A["🧪 Biometric Auth Flow"] --> A1["Research and Prototyping"]
        B["💰 Wallet Transactions"] --> B1["Concept Only"]
        C["📱 Mobile App"] --> C1["Early UI Shells"]
        D["🌐 Web App"] --> D1["Early UI Shells"]
        E["⚙️ Backend API"] --> E1["Route Scaffolding"]
        F["🔐 Security Audit"] --> F1["NOT PERFORMED"]
        G["📦 npm Packages"] --> G1["Published — Core Logic Only"]
    end

    style Status fill:#0a1628,stroke:#ef4444,color:#fecaca
    style A1 fill:#7c2d12,stroke:#f97316,color:#fed7aa
    style B1 fill:#7c2d12,stroke:#f97316,color:#fed7aa
    style C1 fill:#7c2d12,stroke:#f97316,color:#fed7aa
    style D1 fill:#7c2d12,stroke:#f97316,color:#fed7aa
    style E1 fill:#7c2d12,stroke:#f97316,color:#fed7aa
    style F1 fill:#7f1d1d,stroke:#ef4444,color:#fecaca
    style G1 fill:#14532d,stroke:#22c55e,color:#bbf7d0
```

> **Honest Assessment:** BioWallet is an early-stage research project. The npm packages contain scaffolding and type definitions, not battle-tested crypto implementations. The biometric auth flows are conceptual and have not been validated by security professionals. **Do not use with real funds.**

---

## Quick Start

### Prerequisites
- Node.js 18+
- A browser/device that supports WebAuthn
- Biometric sensor or hardware security key

### Installation

```bash
git clone https://github.com/mulkymalikuldhrs/BioWallet.git
cd BioWallet

# Install dependencies

<!-- AUTO-PACKAGE-BADGES:START -->
<!-- Auto-generated package badges -->

![npm version](https://img.shields.io/npm/v/biometric-core?style=flat-square&logo=npm&color=blue) ![npm downloads](https://img.shields.io/npm/dw/biometric-core?style=flat-square&color=brightgreen) ![npm license](https://img.shields.io/npm/l/biometric-core?style=flat-square) [![Deployed](https://img.shields.io/badge/deployed-2.0.0-blue?style=flat-square)](https://www.npmjs.com/package/biometric-core)
![npm version](https://img.shields.io/npm/v/shared-ui?style=flat-square&logo=npm&color=blue) ![npm downloads](https://img.shields.io/npm/dw/shared-ui?style=flat-square&color=brightgreen) ![npm license](https://img.shields.io/npm/l/shared-ui?style=flat-square) [![Deployed](https://img.shields.io/badge/deployed-2.0.0-blue?style=flat-square)](https://www.npmjs.com/package/shared-ui)
![npm version](https://img.shields.io/npm/v/utils?style=flat-square&logo=npm&color=blue) ![npm downloads](https://img.shields.io/npm/dw/utils?style=flat-square&color=brightgreen) ![npm license](https://img.shields.io/npm/l/utils?style=flat-square) [![Deployed](https://img.shields.io/badge/deployed-2.0.0-blue?style=flat-square)](https://www.npmjs.com/package/utils)
![npm version](https://img.shields.io/npm/v/wallet-core?style=flat-square&logo=npm&color=blue) ![npm downloads](https://img.shields.io/npm/dw/wallet-core?style=flat-square&color=brightgreen) ![npm license](https://img.shields.io/npm/l/wallet-core?style=flat-square) [![Deployed](https://img.shields.io/badge/deployed-2.0.0-blue?style=flat-square)](https://www.npmjs.com/package/wallet-core)

<!-- AUTO-PACKAGE-BADGES:END -->
npm install

# Configure environment
cp .env.example .env
```

### Configuration

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
DATABASE_URL=your_database_url
WEBAUTHN_RP_ID=localhost
WEBAUTHN_RP_NAME=BioWallet
```

### Running

```bash
# Development
npm run dev

# Production
npm run build && npm start
```

## Project Structure

```
BioWallet/
├── src/
│   ├── app/              # Application routes
│   ├── components/
│   │   ├── wallet/       # Wallet UI components
│   │   ├── auth/         # Authentication screens
│   │   └── portfolio/    # Asset tracking views
│   ├── lib/
│   │   ├── webauthn/     # WebAuthn registration & auth
│   │   ├── crypto/       # Key management & signing
│   │   ├── chains/       # Blockchain interaction
│   │   └── recovery/     # Social recovery logic
│   └── types/            # TypeScript definitions
├── tests/                # Test suites
└── docs/                 # Architecture & security docs
```

## Contributing

Contributions are especially welcome in:

1. **Security review** — Identifying vulnerabilities in the auth flow
2. **Chain support** — Adding new blockchain integrations
3. **Recovery mechanisms** — Improving key recovery options
4. **Testing** — Adding comprehensive test coverage

Please open an issue to discuss major changes before submitting PRs.

## Disclaimer

**BioWallet is experimental software and not suitable for storing real cryptocurrency funds.** It has not been security audited. The biometric authentication model is a concept under active research. Do not rely on this wallet for any funds you cannot afford to lose. The authors assume no liability for any loss of funds or data.

## License

This project is licensed under the **MIT License** — see the [LICENSE](./LICENSE) file for details.

## Author

<div align="center">

**Mulky Malikul Dhaher**

[![GitHub](https://img.shields.io/badge/GitHub-mulkymalikuldhrs-181717?style=flat-square&logo=github)](https://github.com/mulkymalikuldhrs)
[![Email](https://img.shields.io/badge/Email-mulkymalikudhr@mail.com-EA4335?style=flat-square&logo=gmail&logoColor=white)](mailto:mulkymalikudhr@mail.com)

</div>

---

<img width="100%" src="https://capsule-render.vercel.app/api?type=waving&color=0:0a1628,50:0d2b4a,100:143d5e&fontColor=38bdf8&descColor=22d3ee&height=120&section=footer&text=&fontSize=0" />
