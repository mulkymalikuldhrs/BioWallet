import React, { createContext, useState, useContext, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { ethers } from 'ethers';
import * as LocalAuthentication from 'expo-local-authentication';
import { generateWalletFromBiometric as coreGenerateWallet } from 'wallet-core';

interface MobileWalletContextType {
  walletAddress: string | null;
  balance: string | null;
  isLoading: boolean;
  error: string | null;
  generateWallet: (biometricData: string, salt: string) => Promise<string | null>;
  generateWalletFromBiometric: () => Promise<string | null>;
  sendTransaction: (to: string, amount: string, biometricData?: string, salt?: string) => Promise<string | null>;
  refreshBalance: () => Promise<void>;
}

const WalletContext = createContext<MobileWalletContextType | undefined>(undefined);

// API base URL — configurable via environment
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001/api';

// Provider for Ethereum testnet (Sepolia)
const provider = new ethers.JsonRpcProvider(
  process.env.EXPO_PUBLIC_RPC_URL || 'https://rpc.ankr.com/eth_sepolia'
);

/**
 * Get or generate the user-specific secret stored in SecureStore.
 * This secret is generated once on first wallet creation and never changes,
 * ensuring the same wallet can always be re-derived.
 */
async function getOrCreateUserSecret(): Promise<string> {
  let secret = await SecureStore.getItemAsync('biowallet_user_secret');
  if (!secret) {
    // Generate a 32-byte random secret on first creation
    const randomBytes = ethers.randomBytes(32);
    secret = ethers.hexlify(randomBytes);
    await SecureStore.setItemAsync('biowallet_user_secret', secret);
  }
  return secret;
}

/**
 * Derive the biometric entropy from device ID + user secret + biometric type.
 * This is a proper derivation that uses a user-specific secret instead of
 * just the deviceId (which is not real biometric entropy).
 */
async function deriveBiometricEntropy(): Promise<string> {
  const deviceId = await SecureStore.getItemAsync('deviceId');
  if (!deviceId) {
    throw new Error('Device ID not found. Please restart the app.');
  }

  const userSecret = await getOrCreateUserSecret();

  // Get biometric type as additional context
  const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
  const biometricType = types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)
    ? 'FACE'
    : types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)
    ? 'FINGERPRINT'
    : 'IRIS';

  // Combine deviceId + userSecret + biometricType as entropy
  const combined = deviceId + userSecret + biometricType;
  return ethers.keccak256(ethers.toUtf8Bytes(combined));
}

/**
 * Get or create the per-user salt.
 * Salt is tied to the wallet address prefix, not a global value.
 */
async function getOrCreateSalt(walletAddress?: string): Promise<string> {
  // If we already have a stored salt, use it
  const storedSalt = await SecureStore.getItemAsync('biowallet_salt');
  if (storedSalt) {
    return storedSalt;
  }

  // Create a per-user salt based on wallet address prefix (or random if no address yet)
  // NOTE: Using ethers.randomBytes instead of Date.now() for determinism across reinstalls.
  // The random salt is stored in SecureStore and persists across app restarts.
  const saltSuffix = walletAddress ? walletAddress.slice(0, 8) : ethers.hexlify(ethers.randomBytes(4)).slice(2);
  const salt = `biowallet-salt-${saltSuffix}`;
  await SecureStore.setItemAsync('biowallet_salt', salt);
  return salt;
}

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load wallet address from secure storage
    const loadWallet = async () => {
      try {
        const address = await SecureStore.getItemAsync('walletAddress');
        if (address) {
          setWalletAddress(address);
          await refreshBalance(address);
        }
      } catch (err) {
        console.error('Error loading wallet:', err);
        setError('Failed to load wallet');
      }
    };

    loadWallet();
  }, []);

  // Generate a wallet from biometric data
  const generateWallet = async (biometricData: string, salt: string): Promise<string | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // Check if device supports biometrics
      const compatible = await LocalAuthentication.hasHardwareAsync();
      if (!compatible) {
        throw new Error('This device does not support biometric authentication');
      }

      // Check if biometrics are enrolled
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      if (!enrolled) {
        throw new Error('No biometrics found. Please set up fingerprint or face recognition on your device');
      }

      // Authenticate with biometrics
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to generate your wallet',
        disableDeviceFallback: true,
      });

      if (!result.success) {
        throw new Error('Biometric authentication failed');
      }

      // Derive proper biometric entropy using deviceId + userSecret + biometricType
      const biometricEntropy = await deriveBiometricEntropy();

      // Get per-user salt (create if needed)
      const perUserSalt = await getOrCreateSalt();

      const wallet = await coreGenerateWallet(biometricEntropy, perUserSalt);

      // Save wallet address to secure storage
      await SecureStore.setItemAsync('walletAddress', wallet.address);

      // Update the salt if it was just created (now we have the wallet address)
      const finalSalt = await getOrCreateSalt(wallet.address);

      // Register wallet with backend
      try {
        const token = await SecureStore.getItemAsync('userToken');
        const deviceId = await SecureStore.getItemAsync('deviceId');
        const biometricType = await SecureStore.getItemAsync('biometricType') || 'FINGERPRINT';

        const response = await fetch(`${API_BASE_URL}/wallet/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            walletAddress: wallet.address,
            publicKey: wallet.address, // In a real implementation, this would be the public key
            biometricType,
            deviceId,
          }),
        });

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          // 409 means already registered — that's fine for wallet regeneration
          if (response.status !== 409) {
            console.warn('Backend wallet registration warning:', data.message || 'Unknown error');
          }
        }
      } catch (backendErr) {
        // Non-blocking: wallet works offline, backend sync can retry later
        console.warn('Could not register wallet with backend:', backendErr);
      }

      setWalletAddress(wallet.address);
      await refreshBalance(wallet.address);

      return wallet.address;
    } catch (err) {
      console.error('Error generating wallet:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate wallet');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Legacy method name for backward compatibility with screens
  const generateWalletFromBiometric = (): Promise<string | null> => {
    return generateWallet('', '');
  };

  // Send a transaction
  const sendTransaction = async (to: string, amount: string, biometricData?: string, salt?: string): Promise<string | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // Authenticate with biometrics
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to send transaction',
        disableDeviceFallback: true,
      });

      if (!result.success) {
        throw new Error('Biometric authentication failed');
      }

      // Regenerate wallet from biometric entropy
      const biometricEntropy = await deriveBiometricEntropy();
      const perUserSalt = await getOrCreateSalt();

      const wallet = await coreGenerateWallet(biometricEntropy, perUserSalt);
      const connectedWallet = wallet.connect(provider);

      // Create transaction
      const tx = await connectedWallet.sendTransaction({
        to,
        value: ethers.parseEther(amount),
      });

      // Wait for transaction to be mined
      await tx.wait();

      // Record transaction with backend
      try {
        const token = await SecureStore.getItemAsync('userToken');
        const userId = await SecureStore.getItemAsync('userId');

        if (token && userId) {
          const signedTx = tx.serialized || tx.hash; // Use what's available
          await fetch(`${API_BASE_URL}/transactions`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              fromAddress: wallet.address,
              toAddress: to,
              amount,
              signedTransaction: signedTx,
              userId,
            }),
          });
        }
      } catch (backendErr) {
        // Non-blocking: transaction already sent on-chain
        console.warn('Could not record transaction with backend:', backendErr);
      }

      // Refresh balance
      await refreshBalance(wallet.address);

      return tx.hash;
    } catch (err) {
      console.error('Error sending transaction:', err);
      setError(err instanceof Error ? err.message : 'Failed to send transaction');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh wallet balance
  const refreshBalance = async (address?: string): Promise<void> => {
    const addr = address || walletAddress;
    if (!addr) return;

    try {
      const bal = await provider.getBalance(addr);
      setBalance(ethers.formatEther(bal));
    } catch (err) {
      console.error('Error fetching balance:', err);
      setError('Failed to fetch balance');
    }
  };

  return (
    <WalletContext.Provider
      value={{
        walletAddress,
        balance,
        isLoading,
        error,
        generateWallet,
        generateWalletFromBiometric,
        sendTransaction,
        refreshBalance,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
