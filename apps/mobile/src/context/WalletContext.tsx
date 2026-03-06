import React, { createContext, useState, useContext, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { ethers } from 'ethers';
import * as LocalAuthentication from 'expo-local-authentication';
import { generateWalletFromBiometric as coreGenerateWallet } from 'wallet-core';

interface WalletContextType {
  walletAddress: string | null;
  balance: string | null;
  isLoading: boolean;
  error: string | null;
  generateWalletFromBiometric: () => Promise<string | null>;
  sendTransaction: (to: string, amount: string) => Promise<string | null>;
  refreshBalance: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

// Provider for Ethereum testnet (Sepolia)
const provider = new ethers.JsonRpcProvider(
  process.env.EXPO_PUBLIC_RPC_URL || 'https://rpc.ankr.com/eth_sepolia'
);

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
          await refreshBalance();
        }
      } catch (error) {
        console.error('Error loading wallet:', error);
        setError('Failed to load wallet');
      }
    };

    loadWallet();
  }, []);

  // Generate a wallet from biometric data
  const generateWalletFromBiometric = async (): Promise<string | null> => {
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

      // Get device ID as salt
      const deviceId = await SecureStore.getItemAsync('deviceId');
      if (!deviceId) {
        throw new Error('Device ID not found');
      }

      // Generate a deterministic key from biometric authentication
      // We use a stable biometric salt and scrypt via wallet-core
      const biometricEntropy = `biometric-entropy-${deviceId}`;
      const salt = 'biowallet-salt-v1';
      
      const wallet = await coreGenerateWallet(biometricEntropy, salt);
      
      // Save wallet address to secure storage
      await SecureStore.setItemAsync('walletAddress', wallet.address);
      
      // Register wallet with backend
      // This would be implemented in a real app
      
      setWalletAddress(wallet.address);
      await refreshBalance();
      
      return wallet.address;
    } catch (error) {
      console.error('Error generating wallet:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate wallet');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Send a transaction
  const sendTransaction = async (to: string, amount: string): Promise<string | null> => {
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

      // Regenerate wallet from biometric
      const deviceId = await SecureStore.getItemAsync('deviceId');
      if (!deviceId) {
        throw new Error('Device ID not found');
      }

      const biometricEntropy = `biometric-entropy-${deviceId}`;
      const salt = 'biowallet-salt-v1';
      
      const wallet = await coreGenerateWallet(biometricEntropy, salt);
      const connectedWallet = wallet.connect(provider);

      // Create transaction
      const tx = await connectedWallet.sendTransaction({
        to,
        value: ethers.parseEther(amount),
      });

      // Wait for transaction to be mined
      await tx.wait();

      // Refresh balance
      await refreshBalance();

      return tx.hash;
    } catch (error) {
      console.error('Error sending transaction:', error);
      setError(error instanceof Error ? error.message : 'Failed to send transaction');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh wallet balance
  const refreshBalance = async (): Promise<void> => {
    if (!walletAddress) return;

    try {
      const balance = await provider.getBalance(walletAddress);
      setBalance(ethers.formatEther(balance));
    } catch (error) {
      console.error('Error fetching balance:', error);
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