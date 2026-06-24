# Security Policy

## 🔒 Security

We take the security of BioWallet seriously. If you discover a security vulnerability, please follow the responsible disclosure process outlined below.

**⚠️ For Education Purpose Only** — This project is provided strictly for educational and research purposes. The authors and contributors assume **no responsibility or liability** for any damages, losses, or risks arising from the use of this software. **We do not bear any responsibility or risk** for how this software is used.

## 🛡️ Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## 📣 Reporting a Vulnerability

If you discover a security vulnerability within BioWallet, please report it by:

1. **Email:** Send a detailed report to **mulkymalikuldhaher@email.com**
2. **Do NOT** create a public GitHub issue for security vulnerabilities
3. Include the following in your report:
   - Type of vulnerability
   - Full path of the affected file(s)
   - Steps to reproduce
   - Potential impact
   - Any possible mitigation

We will acknowledge your report within 48 hours and provide a detailed response within 7 days.

## 🔐 Security Best Practices

- All biometric data is processed locally on your device
- Biometric data is never stored or transmitted
- Deterministic key derivation uses `ethers.scrypt()` (v6)
- All sensitive data is encrypted
- WebAuthn is used for secure biometric authentication

## ⚠️ Disclaimer

This software is for educational and research purposes only. It should not be used in production environments without proper security audits. The authors assume no liability for any security issues or losses arising from the use of this software.

**Contact:** Mulky Malikul Dhaher | mulkymalikuldhaher@email.com
