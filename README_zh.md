# BioWallet

[![许可证: MIT](https://img.shields.io/badge/许可证-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6.svg)](https://www.typescriptlang.org/)
[![React Native](https://img.shields.io/badge/React_Native-Expo-61DAFB.svg)](https://reactnative.dev/)
[![Next.js](https://img.shields.io/badge/Next.js-Web-000000.svg?logo=next.js)](https://nextjs.org/)

```
 ____  _      _    _       _ _      _
| __ )(_) ___| |  | | __ _| | | ___| |_
|  _ \| |/ _ \ |  | |/ _` | | |/ _ \ __|
| |_) | | (_) | |__| | (_| | | |  __/ |_
|____/|_|\___/|_____|\__,_|_|_|\___|\__|

你的身体就是你的密码
```

BioWallet 是一个革命性的加密钱包，使用人类生物特征（指纹、面部、虹膜）进行密钥派生，而不是使用密码或助记词。它提供了一种安全、用户友好的方式来管理您的加密货币资产。

[![Read in English](https://img.shields.io/badge/English-US-blue.svg)](README.md)
[![Baca Bahasa Indonesia](https://img.shields.io/badge/Bahasa-Indonesia-red.svg)](README_id.md)

---

## 目录

- [概述](#概述)
- [核心功能](#核心功能)
- [架构](#架构)
- [快速开始](#快速开始)
- [开发](#开发)
- [安全性](#安全性)
- [贡献](#贡献)
- [更新日志](#更新日志)
- [许可证](#许可证)
- [致谢](#致谢)

---

## 概述

BioWallet 通过用生物特征认证取代传统的助记词和密码，改变了我们与加密货币的交互方式。您不再需要备份容易丢失或被盗的24个单词，BioWallet 使用您的指纹、面部扫描或虹膜扫描来确定性派生加密密钥。这意味着您的身体就是您的密码。

该平台采用 monorepo 架构构建，包含三个主要应用程序：移动应用（React Native + Expo）、Web 应用（Next.js + WebAuthn）和后端 API（Express + Prisma + PostgreSQL）。共享包确保钱包逻辑、生物特征处理和 UI 组件在所有平台上保持一致。

本项目是 [HermesQuantOS](https://github.com/mulkymalikuldhrs/HermesQuantOS) 生态系统的一部分。

---

## 核心功能

- **生物特征认证**：使用指纹、面部或虹膜来保护您的钱包
- **无需助记词**：再也不用担心丢失或遗忘助记词
- **跨平台**：支持 Android、iOS 和 Web
- **本地生物特征处理**：所有生物特征数据在您的设备上本地处理
- **以太坊兼容**：发送和接收 ETH 及 ERC-20 代币
- **精美 UI/UX**：直观且用户友好的界面
- **安全密钥派生**：从生物特征数据确定性生成密钥
- **推荐系统**：内置推荐系统以扩大用户群
- **交易历史**：在一个地方查看所有交易
- **管理后台**：全面的管理后台用于监控和分析

---

## 架构

有关系统架构、数据流和安全考虑的详细信息，请参阅 [ARCHITECTURE.md](ARCHITECTURE.md)。

BioWallet 采用 monorepo 架构构建，包含以下组件：

- **移动应用**：React Native + Expo
- **Web 应用**：Next.js + WebAuthn
- **后端 API**：Express + Prisma + PostgreSQL
- **共享包**：
  - `wallet-core`：以太坊钱包功能
  - `biometric-core`：生物特征处理
  - `shared-ui`：共享 UI 组件
  - `utils`：工具函数

---

## 快速开始

### 前提条件

- Node.js 14+
- Yarn 或 npm
- Docker 和 Docker Compose（用于开发）

### 安装

1. 克隆仓库：
   ```bash
   git clone https://github.com/mulkymalikuldhrs/BioWallet.git
   cd BioWallet
   ```

2. 安装依赖：
   ```bash
   yarn install
   ```

3. 启动开发环境：
   ```bash
   yarn docker:up
   yarn prisma:generate
   yarn prisma:migrate
   ```

4. 启动应用：
   ```bash
   # 后端 API
   yarn dev:backend

   # Web 应用
   yarn dev:web

   # 移动应用
   yarn dev:mobile
   ```

---

## 开发

### 移动应用

移动应用使用 React Native 和 Expo 构建。启动开发服务器：

```bash
yarn dev:mobile
```

移动应用的主要功能包括使用 react-native-biometrics 进行生物特征认证、以太坊钱包管理、交易跟踪以及具有亮/暗模式支持的统一 UI 主题。

### Web 应用

Web 应用使用 Next.js 和 WebAuthn 构建。启动开发服务器：

```bash
yarn dev:web
```

Web 应用通过浏览器 WebAuthn API 支持生物特征认证，在 Web 应用形式中提供与移动应用一致的体验。

### 后端 API

后端 API 使用 Express 和 Prisma 构建。启动开发服务器：

```bash
yarn dev:backend
```

API 提供用户管理、钱包操作、交易历史和管理分析的端点。Prisma 用作 PostgreSQL 数据库交互的 ORM。

---

## 安全性

BioWallet 非常重视安全性：

1. **本地处理**：所有生物特征数据在您的设备上本地处理
2. **不存储**：生物特征数据从不存储或传输
3. **确定性密钥派生**：生物特征数据用于派生确定性密钥
4. **加密**：所有敏感数据都经过加密
5. **WebAuthn**：使用 Web Authentication API 进行安全的生物特征认证
6. **无需助记词**：消除助记词丢失或被盗的风险

---

## 贡献

我们欢迎社区贡献！请阅读 [CONTRIBUTING.md](CONTRIBUTING.md) 了解如何为本项目贡献的指南。

---

## 更新日志

详见 [CHANGELOG.md](CHANGELOG.md) 查看重要变更历史。

---

## 许可证

本项目采用 MIT 许可证。详情见 [LICENSE](LICENSE)。

---

## 致谢

由 **Mulky Malikul Dhaher** 开发

- 邮箱: mulkymalikuldhaher@email.com
- GitHub: [mulkymalikuldhrs](https://github.com/mulkymalikuldhrs)
- 生态系统: [HermesQuantOS](https://github.com/mulkymalikuldhrs/HermesQuantOS)

## 致谢

- [Ethereum](https://ethereum.org/)
- [WebAuthn](https://webauthn.io/)
- [React Native](https://reactnative.dev/)
- [Next.js](https://nextjs.org/)
- [Expo](https://expo.dev/)
- [Prisma](https://www.prisma.io/)
