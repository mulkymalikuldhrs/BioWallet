# Contributing to BioWallet

Thank you for your interest in contributing to BioWallet! This document provides guidelines and instructions for contributing to the project. We appreciate all forms of contribution, from code and documentation to bug reports and feature suggestions.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Monorepo Structure](#monorepo-structure)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)
- [Security Vulnerabilities](#security-vulnerabilities)
- [Community](#community)

---

## Code of Conduct

By participating in this project, you agree to maintain a respectful, inclusive, and professional environment. Harassment, discrimination, and disruptive behavior will not be tolerated. We are committed to providing a welcoming experience for everyone.

---

## How Can I Contribute?

### Reporting Bugs

When filing a bug report, please include the following information:

- A clear and descriptive title summarizing the issue
- The component affected (mobile app, web app, backend API, shared packages)
- Steps to reproduce the problem
- Expected behavior versus actual behavior
- Screenshots or error logs if available
- Your environment details (OS, Node.js version, device model for mobile)

### Suggesting Features

Feature suggestions are welcome. Please provide:

- A clear description of the proposed feature
- The use case or problem it solves
- Any relevant examples from existing wallets or applications
- Mockups or design ideas if applicable
- Which platform(s) the feature should target (mobile, web, backend)

### Contributing Code

We accept pull requests for bug fixes, new features, and improvements. Please follow the development setup and coding standards outlined below.

### Improving Documentation

Documentation contributions are always appreciated, whether fixing typos, adding examples, improving clarity, or translating content into additional languages.

---

## Development Setup

### Prerequisites

- Node.js 14+ (recommended: 18+)
- Yarn (required for monorepo workspace management)
- Docker and Docker Compose
- Git
- For mobile development: Expo CLI, Android Studio or Xcode
- For web development: A modern browser with WebAuthn support

### Local Setup

1. Fork the repository on GitHub.
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/BioWallet.git
   cd BioWallet
   ```
3. Add the upstream remote:
   ```bash
   git remote add upstream https://github.com/mulkymalikuldhrs/BioWallet.git
   ```
4. Install dependencies:
   ```bash
   yarn install
   ```
5. Start the development infrastructure:
   ```bash
   yarn docker:up
   yarn prisma:generate
   yarn prisma:migrate
   ```
6. Start the application you want to work on:
   ```bash
   # Backend API
   yarn dev:backend

   # Web App
   yarn dev:web

   # Mobile App
   yarn dev:mobile
   ```

### Database Management

```bash
# Generate Prisma client
yarn prisma:generate

# Run database migrations
yarn prisma:migrate

# Open Prisma Studio (database GUI)
yarn prisma:studio
```

---

## Monorepo Structure

BioWallet uses Yarn workspaces for monorepo management. Understanding the structure is essential for effective contributions:

```
BioWallet/
├── apps/
│   ├── mobile/          # React Native + Expo app
│   │   ├── App.tsx
│   │   ├── src/
│   │   │   ├── context/  # AuthContext, WalletContext, ThemeContext
│   │   │   ├── screens/  # HomeScreen, RegisterScreen, WelcomeScreen
│   │   │   └── navigation/ # MainNavigator
│   │   └── package.json
│   └── web/             # Next.js + WebAuthn app
│       ├── src/
│       │   ├── pages/    # index, register
│       │   └── context/  # AuthContext, WalletContext
│       └── package.json
├── packages/
│   ├── wallet-core/     # Ethereum wallet functionality
│   ├── biometric-core/  # Biometric processing logic
│   ├── shared-ui/       # Shared UI components
│   └── utils/           # Shared utilities
├── backend/
│   ├── api/             # Express API server
│   │   ├── src/
│   │   │   ├── routes/    # userRoutes, walletRoutes, transactionRoutes, adminRoutes
│   │   │   └── controllers/ # userController, walletController, transactionController, adminController
│   │   └── package.json
│   └── db/              # Prisma schema and migrations
│       └── schema.prisma
├── docker-compose.yml   # PostgreSQL and development services
├── package.json         # Root workspace configuration
└── docs/                # Architecture and design documentation
```

### Workspace Commands

When working in the monorepo, use workspace-aware commands:

```bash
# Run a command in a specific workspace
yarn workspace mobile start
yarn workspace web dev
yarn workspace api dev

# Add a dependency to a specific workspace
yarn workspace mobile add <package>
yarn workspace api add <package>

# Add a shared dependency to the root
yarn add -W <package>
```

---

## Coding Standards

### TypeScript

- Use TypeScript for all new code across all workspaces.
- Avoid `any` types; define proper interfaces and types.
- Use strict TypeScript configuration.
- Export types and interfaces from dedicated files for reuse.

### React / React Native

- Use functional components with hooks.
- Manage state with Context API (AuthContext, WalletContext, ThemeContext).
- Follow consistent component structure: imports, types, component, exports.
- Ensure cross-platform compatibility when working on shared components.

### Backend

- Follow Express.js best practices for route and controller organization.
- Use Prisma for all database interactions; avoid raw SQL queries.
- Validate all inputs with appropriate validation middleware.
- Return consistent API response formats.
- Include proper error handling and status codes.

### Security

Since BioWallet handles financial and biometric data, security is paramount:

- Never log or expose sensitive data (private keys, biometric data, passwords).
- All biometric processing must occur locally on the device.
- Use environment variables for all configuration secrets.
- Follow OWASP best practices for API security.
- Review changes for potential security implications before submitting.

### File Naming

- Use kebab-case for file names: `wallet-routes.ts`
- Use PascalCase for React component files: `HomeScreen.tsx`
- Use camelCase for utility functions: `formatBalance.ts`

---

## Commit Guidelines

We follow conventional commit messages:

```
type(scope): description

[optional body]

[optional footer]
```

### Types

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Build, tooling, or dependency changes

### Scope Examples

- `feat(mobile)`: Feature for the mobile app
- `fix(api)`: Bug fix in the backend API
- `feat(wallet-core)`: Feature in the wallet-core package
- `docs(readme)`: Documentation change

### Examples

```
feat(mobile): add iris scanning support for biometric authentication
fix(api): resolve transaction history pagination issue
feat(wallet-core): implement ERC-20 token balance checking
docs(architecture): update data flow diagrams
```

---

## Pull Request Process

1. Create a new branch from `main`:
   ```bash
   git checkout -b feat/your-feature-name
   ```
2. Make your changes following the coding standards.
3. Test your changes thoroughly:
   - For mobile: test on both iOS and Android simulators
   - For web: test in multiple browsers with WebAuthn support
   - For backend: test all API endpoints
4. Commit your changes following the commit guidelines.
5. Push your branch:
   ```bash
   git push origin feat/your-feature-name
   ```
6. Open a Pull Request against the `main` branch.
7. Include a clear description of the changes and reference any related issues.
8. Be responsive to code review feedback.

### PR Requirements

- All existing tests must pass
- New features must include corresponding tests
- No TypeScript errors
- No linting errors
- Security-sensitive changes must be clearly documented
- Changes to shared packages must not break dependent workspaces

---

## Reporting Bugs

Please open a GitHub Issue with:

1. **Title**: Concise description of the bug
2. **Component**: Which part of the system is affected (mobile/web/backend/package)
3. **Description**: Detailed explanation of the issue
4. **Reproduction Steps**: Numbered steps to reproduce
5. **Expected Behavior**: What should happen
6. **Actual Behavior**: What actually happens
7. **Environment**: OS, Node.js version, device/browser details
8. **Screenshots/Logs**: If applicable

---

## Suggesting Features

Please open a GitHub Issue with the feature request template:

1. **Problem**: What problem does this feature solve?
2. **Proposed Solution**: How should it work?
3. **Platform**: Which platform(s) should this target?
4. **Alternatives**: Any alternative approaches considered
5. **Additional Context**: Examples, mockups, or references

---

## Security Vulnerabilities

If you discover a security vulnerability in BioWallet, please report it responsibly:

- Do NOT open a public GitHub issue for security vulnerabilities
- Email the maintainer directly at mulkymalikuldhaher@email.com
- Include a detailed description of the vulnerability
- Provide steps to reproduce if possible
- Allow reasonable time for a response before public disclosure

Security is a top priority for BioWallet, especially given the nature of biometric data and cryptocurrency handling. We take all security reports seriously and will respond promptly.

---

## Community

- **Author**: Mulky Malikul Dhaher
- **Email**: mulkymalikuldhaher@email.com
- **GitHub**: [mulkymalikuldhrs](https://github.com/mulkymalikuldhrs)
- **Ecosystem**: [HermesQuantOS](https://github.com/mulkymalikuldhrs/HermesQuantOS)

Thank you for contributing to BioWallet! Your efforts help make cryptocurrency management more secure and accessible through biometric innovation.
