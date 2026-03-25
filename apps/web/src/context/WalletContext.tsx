import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';
import { generateWalletFromBiometric as coreGenerateWallet } from 'wallet-core';

interface WalletContextType {
  walletAddress: string | null;
  balance: string | null;
  isLoading: boolean;
  error: string | null;
  generateWallet: (biometricData: string, salt: string) => Promise<string | null>;
  sendTransaction: (to: string, amount: string, biometricData: string, salt: string) => Promise<string | null>;
  refreshBalance: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

// Provider for Ethereum testnet (Sepolia)
const provider = new ethers.JsonRpcProvider(
  process.env.NEXT_PUBLIC_RPC_URL || 'https://rpc.ankr.com/eth_sepolia'
);

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadWallet = async () => {
      try {
        const address = localStorage.getItem('walletAddress');
        if (address) {
          setWalletAddress(address);
          const bal = await provider.getBalance(address);
          setBalance(ethers.formatEther(bal));
        }
      } catch (error) {
        console.error('Error loading wallet:', error);
      }
    };
    loadWallet();
  }, []);

  const generateWallet = async (biometricData: string, salt: string): Promise<string | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const wallet = await coreGenerateWallet(biometricData, salt);
      
      localStorage.setItem('walletAddress', wallet.address);
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

  const sendTransaction = async (to: string, amount: string, biometricData: string, salt: string): Promise<string | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const walletWithProvider = (await coreGenerateWallet(biometricData, salt)).connect(provider);

      const tx = await walletWithProvider.sendTransaction({
        to,
        value: ethers.parseEther(amount),
      });

      await tx.wait();
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

  const refreshBalance = async (): Promise<void> => {
    if (!walletAddress) return;
    try {
      const bal = await provider.getBalance(walletAddress);
      setBalance(ethers.formatEther(bal));
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
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
