import { ethers } from 'ethers';
import * as argon2 from 'argon2-browser';

/**
 * Generate a wallet from biometric data
 * @param biometricData - The biometric data
 * @param salt - A salt to use for key derivation
 * @returns The wallet
 */
export async function generateWalletFromBiometric(
  biometricData: string,
  salt: string
): Promise<ethers.Wallet> {
  try {
    // Hash the biometric data using Argon2
    const hashResult = await argon2.hash({
      pass: biometricData,
      salt,
      time: 3, // Number of iterations
      mem: 4096, // Memory usage in KiB
      hashLen: 32, // Output hash length
      parallelism: 1, // Parallelism factor
    });

    // Use the hash as entropy for wallet generation
    const wallet = ethers.Wallet.fromPhrase(hashResult.encoded);
    
    return wallet;
  } catch (error) {
    console.error('Error generating wallet:', error);
    throw new Error('Failed to generate wallet');
  }
}

/**
 * Get the balance of a wallet
 * @param address - The wallet address
 * @param provider - The Ethereum provider
 * @returns The balance in ETH
 */
export async function getWalletBalance(
  address: string,
  provider: ethers.Provider
): Promise<string> {
  try {
    const balance = await provider.getBalance(address);
    return ethers.formatEther(balance);
  } catch (error) {
    console.error('Error fetching balance:', error);
    throw new Error('Failed to fetch balance');
  }
}

/**
 * Send a transaction
 * @param wallet - The wallet to send from
 * @param to - The recipient address
 * @param amount - The amount to send in ETH
 * @returns The transaction hash
 */
export async function sendTransaction(
  wallet: ethers.Wallet,
  to: string,
  amount: string
): Promise<string> {
  try {
    // Create transaction
    const tx = await wallet.sendTransaction({
      to,
      value: ethers.parseEther(amount),
    });

    // Wait for transaction to be mined
    await tx.wait();

    return tx.hash;
  } catch (error) {
    console.error('Error sending transaction:', error);
    throw new Error('Failed to send transaction');
  }
}

/**
 * Get transaction history for a wallet
 * @param address - The wallet address
 * @param provider - The Ethereum provider
 * @returns The transaction history
 */
export async function getTransactionHistory(
  address: string,
  provider: ethers.Provider
): Promise<any[]> {
  try {
    // This is a simplified example
    // In a real app, you would use a more sophisticated method
    // such as querying an Ethereum explorer API
    
    // Get the latest block number
    const blockNumber = await provider.getBlockNumber();
    
    // Get the last 10 blocks
    const blocks = [];
    for (let i = 0; i < 10; i++) {
      if (blockNumber - i < 0) break;
      const block = await provider.getBlock(blockNumber - i);
      if (block && block.transactions) {
        blocks.push(block);
      }
    }
    
    // Get transactions for the address
    const transactions = [];
    for (const block of blocks) {
      for (const txHash of block.transactions) {
        const tx = await provider.getTransaction(txHash);
        if (tx && (tx.from === address || tx.to === address)) {
          transactions.push(tx);
        }
      }
    }
    
    return transactions;
  } catch (error) {
    console.error('Error fetching transaction history:', error);
    throw new Error('Failed to fetch transaction history');
  }
}