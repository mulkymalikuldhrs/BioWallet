import { ethers } from 'ethers';

/**
 * Generate a wallet from biometric data
 * @param biometricData - The biometric data (e.g. WebAuthn credential ID)
 * @param salt - A salt to use for key derivation
 * @returns The wallet
 */
export async function generateWalletFromBiometric(
  biometricData: string,
  salt: string
): Promise<ethers.Wallet> {
  try {
    // Use scrypt for key derivation as it's more compatible with web environments than argon2
    // and still provides strong security against brute-force attacks.
    const password = ethers.toUtf8Bytes(biometricData);
    const saltBytes = ethers.toUtf8Bytes(salt);

    // scrypt parameters: N=16384, r=8, p=1
    const derivedKey = await ethers.scrypt(password, saltBytes, 16384, 8, 1, 32);

    // Use the derived key as a private key for wallet generation
    const privateKey = ethers.hexlify(derivedKey);
    const wallet = new ethers.Wallet(privateKey);
    
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
 *
 * WARNING: This naive implementation scans recent blocks linearly and is NOT
 * suitable for production. Use an indexer (e.g., Etherscan API, Alchemy
 * getAssetTransfers, or The Graph) for reliable transaction history.
 */
export async function getTransactionHistory(
  address: string,
  provider: ethers.Provider
): Promise<any[]> {
  try {
    const addressLower = address.toLowerCase();
    const blockNumber = await provider.getBlockNumber();
    
    // Only scan the last 5 blocks (reduced from 10 to limit RPC calls)
    const blocks = [];
    for (let i = 0; i < 5; i++) {
      if (blockNumber - i < 0) break;
      const block = await provider.getBlock(blockNumber - i);
      if (block && block.prefetchedTransactions) {
        blocks.push(block);
      }
    }
    
    const transactions = [];
    for (const block of blocks) {
      if (!block) continue;
      for (const txHash of block.prefetchedTransactions || []) {
        const tx = await provider.getTransaction(txHash);
        if (tx && (tx.from.toLowerCase() === addressLower || tx.to?.toLowerCase() === addressLower)) {
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
