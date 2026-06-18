# BioWallet

[![Lisensi: MIT](https://img.shields.io/badge/Lisensi-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6.svg)](https://www.typescriptlang.org/)
[![React Native](https://img.shields.io/badge/React_Native-Expo-61DAFB.svg)](https://reactnative.dev/)
[![Next.js](https://img.shields.io/badge/Next.js-Web-000000.svg?logo=next.js)](https://nextjs.org/)

```
 ____  _      _    _       _ _      _
| __ )(_) ___| |  | | __ _| | | ___| |_
|  _ \| |/ _ \ |  | |/ _` | | |/ _ \ __|
| |_) | | (_) | |__| | (_| | | |  __/ |_
|____/|_|\___/|_____|\__,_|_|_|\___|\__|

Tubuhmu adalah kata sandimu
```

BioWallet adalah wallet crypto revolusioner yang menggunakan biometrik manusia (sidik jari, wajah, iris) untuk derivasi kunci sebagai pengganti kata sandi atau seed phrase. Platform ini menyediakan cara aman dan mudah digunakan untuk mengelola aset cryptocurrency Anda.

[![Read in English](https://img.shields.io/badge/English-US-blue.svg)](README.md)
[![阅读中文](https://img.shields.io/badge/Chinese-中文-green.svg)](README_zh.md)

---

## Daftar Isi

- [Gambaran Umum](#gambaran-umum)
- [Fitur Utama](#fitur-utama)
- [Arsitektur](#arsitektur)
- [Memulai](#memulai)
- [Pengembangan](#pengembangan)
- [Keamanan](#keamanan)
- [Berkontribusi](#berkontribusi)
- [Catatan Perubahan](#catatan-perubahan)
- [Lisensi](#lisensi)
- [Kredit](#kredit)

---

## Gambaran Umum

BioWallet mengubah cara kita berinteraksi dengan cryptocurrency dengan menggantikan seed phrase tradisional dan kata sandi dengan autentikasi biometrik. Alih-alih mencadangkan 24 kata yang rentan hilang atau dicuri, BioWallet menggunakan sidik jari, pemindaian wajah, atau pemindaian iris Anda untuk menurunkan kunci kriptografi secara deterministik. Ini berarti tubuh Anda secara harfiah menjadi kata sandi Anda.

Platform ini dibangun sebagai monorepo dengan tiga aplikasi utama: aplikasi mobile (React Native + Expo), aplikasi web (Next.js + WebAuthn), dan backend API (Express + Prisma + PostgreSQL). Paket bersama memastikan konsistensi logika wallet, pemrosesan biometrik, dan komponen UI di seluruh platform.

Proyek ini merupakan bagian dari ekosistem [HermesQuantOS](https://github.com/mulkymalikuldhrs/HermesQuantOS).

---

## Fitur Utama

- **Autentikasi Biometrik**: Gunakan sidik jari, wajah, atau iris untuk mengamankan wallet Anda
- **Tanpa Seed Phrase**: Tidak perlu lagi khawatir kehilangan atau lupa seed phrase
- **Lintas Platform**: Tersedia di Android, iOS, dan Web
- **Pemrosesan Biometrik Lokal**: Semua data biometrik diproses secara lokal di perangkat Anda
- **Kompatibel dengan Ethereum**: Kirim dan terima ETH serta token ERC-20
- **UI/UX Menawan**: Antarmuka yang intuitif dan ramah pengguna
- **Derivasi Kunci Aman**: Pembuatan kunci deterministik dari data biometrik
- **Sistem Referral**: Sistem referral bawaan untuk mengembangkan basis pengguna
- **Riwayat Transaksi**: Lihat semua transaksi Anda di satu tempat
- **Dashboard Admin**: Dashboard admin komprehensif untuk pemantauan dan analitik

---

## Arsitektur

Untuk detail lengkap tentang arsitektur sistem, aliran data, dan pertimbangan keamanan, lihat [ARCHITECTURE.md](ARCHITECTURE.md).

BioWallet dibangun sebagai monorepo dengan komponen berikut:

- **Aplikasi Mobile**: React Native + Expo
- **Aplikasi Web**: Next.js + WebAuthn
- **Backend API**: Express + Prisma + PostgreSQL
- **Paket Bersama**:
  - `wallet-core`: Fungsionalitas Ethereum wallet
  - `biometric-core`: Pemrosesan biometrik
  - `shared-ui`: Komponen UI bersama
  - `utils`: Fungsi utilitas

---

## Memulai

### Prasyarat

- Node.js 14+
- Yarn atau npm
- Docker dan Docker Compose (untuk pengembangan)

### Instalasi

1. Clone repositori:
   ```bash
   git clone https://github.com/mulkymalikuldhrs/BioWallet.git
   cd BioWallet
   ```

2. Install dependensi:
   ```bash
   yarn install
   ```

3. Mulai lingkungan pengembangan:
   ```bash
   yarn docker:up
   yarn prisma:generate
   yarn prisma:migrate
   ```

4. Mulai aplikasi:
   ```bash
   # Backend API
   yarn dev:backend

   # Aplikasi Web
   yarn dev:web

   # Aplikasi Mobile
   yarn dev:mobile
   ```

---

## Pengembangan

### Aplikasi Mobile

Aplikasi mobile dibangun dengan React Native dan Expo. Untuk memulai server pengembangan:

```bash
yarn dev:mobile
```

Fitur utama aplikasi mobile mencakup autentikasi biometrik menggunakan react-native-biometrics, manajemen wallet Ethereum, pelacakan transaksi, dan tema UI yang konsisten dengan dukungan mode terang/gelap.

### Aplikasi Web

Aplikasi web dibangun dengan Next.js dan WebAuthn. Untuk memulai server pengembangan:

```bash
yarn dev:web
```

Aplikasi web mendukung autentikasi biometrik melalui WebAuthn API browser, memberikan pengalaman yang konsisten dengan aplikasi mobile dalam bentuk aplikasi web.

### Backend API

Backend API dibangun dengan Express dan Prisma. Untuk memulai server pengembangan:

```bash
yarn dev:backend
```

API menyediakan endpoint untuk manajemen pengguna, operasi wallet, riwayat transaksi, dan analitik admin. Prisma digunakan sebagai ORM untuk interaksi database PostgreSQL.

---

## Keamanan

BioWallet sangat memperhatikan keamanan:

1. **Pemrosesan Lokal**: Semua data biometrik diproses secara lokal di perangkat Anda
2. **Tanpa Penyimpanan**: Data biometrik tidak pernah disimpan atau ditransmisikan
3. **Derivasi Kunci Deterministik**: Data biometrik digunakan untuk menurunkan kunci deterministik
4. **Enkripsi**: Semua data sensitif dienkripsi
5. **WebAuthn**: Menggunakan Web Authentication API untuk autentikasi biometrik yang aman
6. **Tanpa Seed Phrase**: Menghilangkan risiko seed phrase yang hilang atau dicuri

---

## Berkontribusi

Kami menyambut kontribusi dari komunitas! Silakan baca [CONTRIBUTING.md](CONTRIBUTING.md) untuk panduan cara berkontribusi pada proyek ini.

---

## Catatan Perubahan

Lihat [CHANGELOG.md](CHANGELOG.md) untuk riwayat perubahan penting.

---

## Lisensi

Proyek ini dilisensikan di bawah Lisensi MIT. Lihat [LICENSE](LICENSE) untuk detailnya.

---

## Kredit

Dikembangkan oleh **Mulky Malikul Dhaher**

- Email: mulkymalikuldhaher@email.com
- GitHub: [mulkymalikuldhrs](https://github.com/mulkymalikuldhrs)
- Ekosistem: [HermesQuantOS](https://github.com/mulkymalikuldhrs/HermesQuantOS)

## Ucapan Terima Kasih

- [Ethereum](https://ethereum.org/)
- [WebAuthn](https://webauthn.io/)
- [React Native](https://reactnative.dev/)
- [Next.js](https://nextjs.org/)
- [Expo](https://expo.dev/)
- [Prisma](https://www.prisma.io/)
