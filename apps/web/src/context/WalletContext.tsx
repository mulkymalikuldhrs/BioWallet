import { createContext, useState, useContext, useEffect, useCallback, ReactNode } from 'react';
import { ethers } from 'ethers';
import { generateWalletFromBiometric as coreGenerateWallet } from 'wallet-core';
import type { WalletContextType } from 'utils';

// SSR-safe localStorage wrapper
const safeLocalStorage = {
  getItem: (key: string): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(key);
  },
  setItem: (key: string, value: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(key, value);
  },
  removeItem: (key: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(key);
  },
};

const WalletContext = createContext<WalletContextType | undefined>(undefined);

// Provider for Ethereum testnet (Sepolia)
const getProvider = () => new ethers.JsonRpcProvider(
  process.env.NEXT_PUBLIC_RPC_URL || 'https://rpc.ankr.com/eth_sepolia'
);

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadWallet = async () => {
      try {
        const address = safeLocalStorage.getItem('walletAddress');
        if (address) {
          setWalletAddress(address);
          try {
            const provider = getProvider();
            const bal = await provider.getBalance(address);
            setBalance(ethers.formatEther(bal));
          } catch (err) {
            console.error('Error fetching initial balance:', err);
          }
        }
      } catch (err) {
        console.error('Error loading wallet:', err);
      }
    };
    loadWallet();
  }, []);

  const generateWallet = async (biometricData: string, salt: string): Promise<string | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const wallet = await coreGenerateWallet(biometricData, salt);

      safeLocalStorage.setItem('walletAddress', wallet.address);
      setWalletAddress(wallet.address);
      await refreshBalanceWithAddress(wallet.address);

      // Register wallet with backend
      try {
        const token = safeLocalStorage.getItem('userToken');
        const response = await fetch(`${API_URL}/wallet/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            walletAddress: wallet.address,
            publicKey: wallet.address,
            biometricType: 'FINGERPRINT',
          }),
        });

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          // 409 is fine — already registered
          if (response.status !== 409) {
            console.warn('Backend wallet registration warning:', data.message);
          }
        }
      } catch (backendErr) {
        console.warn('Could not register wallet with backend:', backendErr);
      }

      return wallet.address;
    } catch (err) {
      console.error('Error generating wallet:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate wallet');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const sendTransaction = async (to: string, amount: string, biometricData: string, salt: string): Promise<string | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const provider = getProvider();
      const walletWithProvider = (await coreGenerateWallet(biometricData, salt)).connect(provider);

      const tx = await walletWithProvider.sendTransaction({
        to,
        value: ethers.parseEther(amount),
      });

      await tx.wait();

      // Record transaction with backend
      try {
        const token = safeLocalStorage.getItem('userToken');
        const userId = safeLocalStorage.getItem('userId');

        if (token && userId) {
          await fetch(`${API_URL}/transactions`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              fromAddress: walletWithProvider.address,
              toAddress: to,
              amount,
              signedTransaction: tx.serialized || tx.hash,
              userId,
            }),
          });
        }
      } catch (backendErr) {
        console.warn('Could not record transaction with backend:', backendErr);
      }

      await refreshBalanceWithAddress(walletWithProvider.address);
      return tx.hash;
    } catch (err) {
      console.error('Error sending transaction:', err);
      setError(err instanceof Error ? err.message : 'Failed to send transaction');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshBalanceWithAddress = async (address: string): Promise<void> => {
    if (!address) return;
    try {
      const provider = getProvider();
      const bal = await provider.getBalance(address);
      setBalance(ethers.formatEther(bal));
    } catch (err) {
      console.error('Error fetching balance:', err);
    }
  };

  const refreshBalance = async (): Promise<void> => {
    if (!walletAddress) return;
    await refreshBalanceWithAddress(walletAddress);
  };

  return (
    <WalletContext.Provider value={{ walletAddress, balance, isLoading, error, generateWallet, sendTransaction, refreshBalance }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) throw new Error('useWallet must be used within a WalletProvider');
  return context;
};
