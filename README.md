<div align="center">

<a href="https://github.com/mulkymalikuldhrs/BioWallet">
<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=28&duration=3000&pause=1000&color=2E9EF7&center=true&vCenter=true&multiline=false&repeat=true&width=500&height=50&lines=BioWallet;Your+Body+is+Your+Password;Biometric+Crypto+Wallet" alt="Typing SVG" />
</a>

<br/>

[![Version](https://img.shields.io/badge/version-2.0.0-2E9EF7?style=for-the-badge&logo=semver)](https://github.com/mulkymalikuldhrs/BioWallet)
[![Status](https://img.shields.io/badge/status-Production_Ready-brightgreen?style=for-the-badge)](https://github.com/mulkymalikuldhrs/BioWallet)
[![React Native](https://img.shields.io/badge/React_Native-Expo-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactnative.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)
[![Stars](https://img.shields.io/github/stars/mulkymalikuldhrs/BioWallet?style=for-the-badge&logo=github&color=yellow)](https://github.com/mulkymalikuldhrs/BioWallet/stargazers)

<br/>

**A revolutionary biometric crypto wallet that uses human biometrics (fingerprint, face, iris) for key derivation instead of passwords or seed phrases.**

[🐛 Report Bug](https://github.com/mulkymalikuldhrs/BioWallet/issues) &bull; [✨ Request Feature](https://github.com/mulkymalikuldhrs/BioWallet/issues) &bull; [🤝 Contribute](CONTRIBUTING.md)

</div>

---

## 🇬🇧 English

### ✨ Overview

BioWallet is a revolutionary crypto wallet that uses human biometrics — fingerprint, face, and iris — for deterministic key derivation, eliminating the need for passwords or seed phrases. Built as a monorepo with React Native (mobile), Next.js (web), and Express (backend), it provides a secure, user-friendly way to manage your cryptocurrency assets with biometric authentication at its core.

### 🔐 v2.0.0 — Production Ready

This release includes critical security fixes and production hardening:

- **Fixed deterministic wallet generation**: Removed `Date.now()` from salt; keys are now derived deterministically from `deviceId + biometricId`
- **Replaced Argon2 with ethers.scrypt()**: More compatible, no invalid mnemonic bug — uses `new ethers.Wallet(privateKey)` instead of `fromPhrase()`
- **Migrated from Goerli to Sepolia**: All RPC endpoints and network references updated to Sepolia testnet
- **Replaced dummy authentication**: No more `dummy-token`; proper session tokens via `crypto.randomUUID()`
- **Added auth middleware**: Bearer token authentication on all API routes; admin routes require `X-Admin-API-Key` header
- **Added rate limiting**: Default (60/min), strict (10/min for sensitive endpoints), admin (30/min)
- **Fixed WebAuthn challenges**: Replaced hardcoded `Uint8Array([1,2,3,4,5,6,7,8])` with `crypto.getRandomValues()`
- **Created missing mobile screens**: SendScreen, HistoryScreen, ProfileScreen, LoginScreen
- **Added expo-linear-gradient**: Missing dependency now included
- **Added utils package**: `extractEntropy()`, `formatAddress()`, `validateEmail()`
- **Added shared-ui package**: Reusable UI components
- **Added .env.example files**: Backend and web environment variable documentation

### 🏗️ Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│   Mobile App    │     │    Web App      │     │  Admin Portal   │
│  (React Native) │     │    (Next.js)    │     │    (Next.js)    │
│                 │     │                 │     │                 │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
         └──────────────►       │       ◄───────────────┘
                         ┌──────┴──────┐
                         │ Backend API │
                         │  (Express)  │
                         └──────┬──────┘
                                │
                         ┌──────┴──────┐
                         │ PostgreSQL  │
                         │  Database   │
                         └─────────────┘
```

### 🎯 Features

| Feature | Description |
|---------|-------------|
| 🔐 **Biometric Authentication** | Use fingerprint, face, or iris to secure your wallet |
| 🔑 **No Seed Phrases** | Deterministic key derivation via scrypt from biometric data |
| 📱 **Cross-Platform** | Available on Android, iOS, and Web |
| 🛡️ **Local Processing** | All biometric data processed locally on device |
| ⛓️ **Ethereum Compatible** | Send and receive ETH on Sepolia testnet |
| 💎 **Beautiful UI/UX** | Intuitive and user-friendly interface |
| 📊 **Transaction History** | View all your transactions in one place |
| 👨‍💼 **Admin Dashboard** | Protected admin dashboard for monitoring |
| 🤝 **Referral System** | Built-in referral system to grow the user base |
| 🔒 **API Security** | Bearer token auth, rate limiting, admin API key protection |
| 🎙️ **Advanced Roadmap** | Future support for Voice recognition and Social Recovery (SSS) |

### 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/mulkymalikuldhrs/BioWallet.git

# Install dependencies
cd BioWallet && yarn install

# Set up environment variables
cp backend/api/.env.example backend/api/.env
cp apps/web/.env.example apps/web/.env.local

# Start Docker services
yarn docker:up
yarn prisma:generate
yarn prisma:migrate

# Start backend
yarn dev:backend

# Start web app
yarn dev:web

# Start mobile app
yarn dev:mobile
```

---

## 🇮🇩 Bahasa Indonesia

### ✨ Gambaran Umum

BioWallet adalah dompet kripto revolusioner yang menggunakan biometrik manusia — sidik jari, wajah, dan iris — untuk derivasi kunci deterministik, menghilangkan kebutuhan akan kata sandi atau frasa seed. Dibangun sebagai monorepo dengan React Native (mobile), Next.js (web), dan Express (backend), menyediakan cara yang aman dan mudah digunakan untuk mengelola aset kripto Anda dengan autentikasi biometrik sebagai intinya.

### 🎯 Fitur Utama

| Fitur | Deskripsi |
|-------|-----------|
| 🔐 **Autentikasi Biometrik** | Gunakan sidik jari, wajah, atau iris untuk mengamankan dompet |
| 🔑 **Tanpa Frasa Seed** | Derivasi kunci deterministik via scrypt dari data biometrik |
| 📱 **Lintas Platform** | Tersedia di Android, iOS, dan Web |
| 🛡️ **Pemrosesan Lokal** | Semua data biometrik diproses secara lokal di perangkat |
| ⛓️ **Kompatibel Ethereum** | Kirim dan terima ETH di jaringan Sepolia |
| 💎 **UI/UX Indah** | Antarmuka yang intuitif dan mudah digunakan |
| 📊 **Riwayat Transaksi** | Lihat semua transaksi Anda di satu tempat |
| 👨‍💼 **Dashboard Admin** | Dashboard admin yang dilindungi untuk pemantauan |
| 🔒 **Keamanan API** | Autentikasi Bearer token, rate limiting, proteksi admin API key |

### 🚀 Mulai Cepat

```bash
git clone https://github.com/mulkymalikuldhrs/BioWallet.git
cd BioWallet && yarn install
cp backend/api/.env.example backend/api/.env
yarn docker:up && yarn prisma:generate && yarn prisma:migrate
yarn dev:backend
```

---

## 🇨🇳 中文

### ✨ 概述

BioWallet 是一款革命性的加密钱包，使用人体生物特征——指纹、面部和虹膜——进行确定性密钥派生，无需密码或助记词。采用 monorepo 架构，包含 React Native（移动端）、Next.js（网页端）和 Express（后端），以生物特征认证为核心，提供安全、友好的加密资产管理方式。

### 🎯 主要功能

| 功能 | 描述 |
|------|------|
| 🔐 **生物特征认证** | 使用指纹、面部或虹膜保护您的钱包 |
| 🔑 **无需助记词** | 通过 scrypt 从生物特征数据进行确定性密钥派生 |
| 📱 **跨平台** | 支持 Android、iOS 和 Web |
| 🛡️ **本地处理** | 所有生物特征数据在设备本地处理 |
| ⛓️ **以太坊兼容** | 在 Sepolia 测试网上发送和接收 ETH |
| 💎 **精美 UI/UX** | 直观且用户友好的界面 |
| 📊 **交易历史** | 在一处查看所有交易 |
| 👨‍💼 **管理仪表板** | 受保护的管理仪表板用于监控 |
| 🔒 **API 安全** | Bearer token 认证、速率限制、管理员 API 密钥保护 |

### 🚀 快速开始

```bash
git clone https://github.com/mulkymalikuldhrs/BioWallet.git
cd BioWallet && yarn install
cp backend/api/.env.example backend/api/.env
yarn docker:up && yarn prisma:generate && yarn prisma:migrate
yarn dev:backend
```

---

## 🛠️ Tech Stack

| Technology | Purpose |
|-----------|---------|
| ![React Native](https://img.shields.io/badge/React_Native-Expo-61DAFB?logo=react&logoColor=black) | Mobile App |
| ![Next.js](https://img.shields.io/badge/Next.js-15-000000?logo=next.js) | Web App |
| ![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white) | Backend API |
| ![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma) | ORM |
| ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?logo=postgresql&logoColor=white) | Database |
| ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white) | Type Safety |
| ![WebAuthn](https://img.shields.io/badge/WebAuthn-FIDO2-FF6F00) | Biometric Auth |
| ![ethers.js](https://img.shields.io/badge/ethers.js-6-7C3AED) | Ethereum SDK |

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

## 👤 Author

**Mulky Malikul Dhaher**

[![GitHub](https://img.shields.io/badge/GitHub-mulkymalikuldhrs-181717?style=flat&logo=github)](https://github.com/mulkymalikuldhrs)
[![Email](https://img.shields.io/badge/Email-mulkymalikuldhaher@email.com-EA4335?style=flat&logo=gmail&logoColor=white)](mailto:mulkymalikuldhaher@email.com)

---

## ⚠️ Disclaimer

### 🇬🇧 English

> **⚠️ For Education Purpose Only**
> This project is provided strictly for educational and research purposes. The authors and contributors assume **no responsibility or liability** for any damages, losses, or risks arising from the use of this software. **We do not bear any responsibility or risk** for how this software is used. Use at your own risk.
> **Contact:** Mulky Malikul Dhaher | mulkymalikuldhaher@email.com

### 🇮🇩 Bahasa Indonesia

> **⚠️ Hanya untuk Tujuan Pendidikan**
> Proyek ini disediakan secara ketat untuk tujuan pendidikan dan penelitian. Penulis dan kontributor **tidak bertanggung jawab atau berkewajiban** atas kerusakan, kerugian, atau risiko yang timbul dari penggunaan perangkat lunak ini. **Kami tidak menanggung tanggung jawab atau risiko** apa pun untuk penggunaan perangkat lunak ini. Gunakan dengan risiko Anda sendiri.
> **Kontak:** Mulky Malikul Dhaher | mulkymalikuldhaher@email.com

### 🇨🇳 中文

> **⚠️ 仅供教育目的**
> 本项目严格仅供教育和研究目的提供。作者和贡献者对因使用本软件而产生的任何损害、损失或风险**不承担任何责任或义务**。**我们不承担任何责任或风险**对于本软件的使用方式。使用风险自负。
> **联系方式:** Mulky Malikul Dhaher | mulkymalikuldhaher@email.com

---

<div align="center">

Made with ❤️ by Mulky Malikul Dhaher

**For Education Purpose Only**

</div>
