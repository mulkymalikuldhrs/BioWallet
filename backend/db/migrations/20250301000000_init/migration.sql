-- AlterTable: Change Float columns to Decimal(65,18) for crypto precision
-- This migration sets up the complete BioWallet database schema

-- CreateEnum
CREATE TYPE "BiometricType" AS VALUE ('FINGERPRINT', 'FACE', 'IRIS');
CREATE TYPE "TransactionType" AS VALUE ('SEND', 'RECEIVE');
CREATE TYPE "TransactionStatus" AS VALUE ('PENDING', 'CONFIRMED', 'FAILED');
CREATE TYPE "RewardStatus" AS VALUE ('PENDING', 'PAID', 'FAILED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "walletAddress" TEXT NOT NULL,
    "publicKey" TEXT NOT NULL,
    "email" TEXT,
    "deviceId" TEXT,
    "biometricType" "BiometricType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "referralCode" TEXT,
    "referredById" TEXT,
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
    "lastLogin" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "txHash" TEXT NOT NULL,
    "type" "TransactionType" NOT NULL,
    "token" TEXT NOT NULL DEFAULT 'ETH',
    "amount" DECIMAL(65,18) NOT NULL,
    "fee" DECIMAL(65,18) NOT NULL,
    "status" "TransactionStatus" NOT NULL DEFAULT 'PENDING',
    "fromAddress" TEXT NOT NULL,
    "toAddress" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "blockNumber" INTEGER,
    "blockTimestamp" TIMESTAMP(3),
    "network" TEXT NOT NULL DEFAULT 'sepolia',

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReferralReward" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DECIMAL(65,18) NOT NULL,
    "status" "RewardStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReferralReward_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminStats" (
    "id" SERIAL NOT NULL,
    "totalUsers" INTEGER NOT NULL DEFAULT 0,
    "totalTransactions" INTEGER NOT NULL DEFAULT 0,
    "totalVolume" DECIMAL(65,18) NOT NULL DEFAULT 0,
    "totalFees" DECIMAL(65,18) NOT NULL DEFAULT 0,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminStats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_walletAddress_key" ON "User"("walletAddress");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_deviceId_key" ON "User"("deviceId");
CREATE UNIQUE INDEX "User_referralCode_key" ON "User"("referralCode");
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_txHash_key" ON "Transaction"("txHash");
CREATE INDEX "Transaction_userId_idx" ON "Transaction"("userId");
CREATE INDEX "Transaction_fromAddress_idx" ON "Transaction"("fromAddress");
CREATE INDEX "Transaction_toAddress_idx" ON "Transaction"("toAddress");
CREATE INDEX "Transaction_status_idx" ON "Transaction"("status");
CREATE INDEX "Transaction_createdAt_idx" ON "Transaction"("createdAt");

-- CreateIndex
CREATE INDEX "ReferralReward_userId_idx" ON "ReferralReward"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "AdminStats_date_key" ON "AdminStats"("date");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_referredById_fkey" FOREIGN KEY ("referredById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReferralReward" ADD CONSTRAINT "ReferralReward_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
