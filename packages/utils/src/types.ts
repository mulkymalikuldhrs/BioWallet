/**
 * Shared types for BioWallet mobile and web applications.
 * These interfaces ensure consistent APIs between platforms.
 */

export interface WalletContextType {
  walletAddress: string | null;
  balance: string | null;
  isLoading: boolean;
  error: string | null;
  generateWallet: (biometricData: string, salt: string) => Promise<string | null>;
  sendTransaction: (to: string, amount: string, biometricData: string, salt: string) => Promise<string | null>;
  refreshBalance: () => Promise<void>;
}

export interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  register: (email: string, deviceId: string) => Promise<boolean>;
  login: () => Promise<{ success: boolean; credentialId?: string }>;
  logout: () => Promise<void>;
}

export interface TransactionItem {
  id: string;
  type: string;
  amount: string;
  address: string;
  timestamp: string;
  status: string;
  txHash?: string;
}

export interface BackendUserResponse {
  id: string;
  walletAddress: string;
  referralCode?: string;
  token: string;
  message?: string;
}

export interface BackendTransactionResponse {
  id: string;
  txHash: string;
  status: string;
  type: string;
  amount: string;
  fee: string;
  fromAddress: string;
  toAddress: string;
  createdAt: string;
}
