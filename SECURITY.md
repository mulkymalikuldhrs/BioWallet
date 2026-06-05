# Security Policy

## 🔒 Security

We take the security of BioWallet seriously. If you discover a security vulnerability, please follow the responsible disclosure process outlined below.

**⚠️ For Education Purpose Only** — This project is provided strictly for educational and research purposes. The authors and contributors assume **no responsibility or liability** for any damages, losses, or risks arising from the use of this software. **We do not bear any responsibility or risk** for how this software is used.

## 🛡️ Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 3.0.x   | :white_check_mark: |
| 2.0.x   | :white_check_mark: |
| < 2.0   | :x:                |

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
- Deterministic key derivation uses **scrypt** (N=16384, r=8, p=1) for brute-force resistance
- Private keys are derived deterministically from biometric entropy + per-user salt
- WebAuthn PRF extension used for secure key derivation (with PIN fallback)
- All sensitive data is encrypted
- JWT authentication with issuer/audience validation on all API routes
- Admin routes require both JWT and X-Admin-API-Key (timing-safe comparison)
- Rate limiting on all endpoints (general, auth, transaction, admin)
- Helmet security headers with strict CSP (API-only, no scripts/styles)
- Input validation with Zod schemas on all API endpoints
- IDOR protection: users can only access their own resources

## ⚠️ Known Limitations

- In-memory rate limiting does not work across multiple server instances (use Redis for production)
- Web AuthContext does not generate fallback tokens — backend connectivity is required for JWT
- The referral system has no abuse prevention beyond rate limiting
- Email field is optional and not verified

## ⚠️ Disclaimer

This software is for educational and research purposes only. It should not be used in production environments without proper security audits. The authors assume no liability for any security issues or losses arising from the use of this software.

**Contact:** Mulky Malikul Dhaher | mulkymalikuldhaher@email.com
