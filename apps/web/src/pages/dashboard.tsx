import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import { useWallet } from '@/context/WalletContext';
import { formatAddress } from 'utils';

export default function Dashboard() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { walletAddress, balance, isLoading: walletLoading, refreshBalance, sendTransaction } = useWallet();

  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [txHash, setTxHash] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  const handleRefresh = async () => {
    await refreshBalance();
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    try {
      const hash = await sendTransaction(recipient, amount);
      if (hash) {
        setTxHash(hash);
        setRecipient('');
        setAmount('');
      }
    } catch (error) {
      console.error('Send error:', error);
    } finally {
      setIsSending(false);
    }
  };

  const copyAddress = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      alert('Address copied to clipboard');
    }
  };

  if (authLoading || !isAuthenticated) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Balance</h2>
                <div className="flex items-baseline mt-1">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">{balance || '0.00'}</span>
                  <span className="ml-2 text-xl font-medium text-indigo-600">ETH</span>
                </div>
              </div>
              <button
                onClick={handleRefresh}
                className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${walletLoading ? 'animate-spin' : ''}`}
              >
                🔄
              </button>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 flex items-center justify-between">
              <div className="overflow-hidden">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Wallet Address</p>
                <p className="text-sm font-mono font-medium truncate">
                  {walletAddress || 'No wallet generated'}
                </p>
              </div>
              <button
                onClick={copyAddress}
                className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
              >
                📋
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-bold mb-6">Send Transaction</h3>
          <form onSubmit={handleSend} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Recipient Address</label>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="0x..."
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount (ETH)</label>
              <input
                type="number"
                step="0.0001"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.0"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isSending || walletLoading}
              className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {isSending ? 'Sending...' : 'Send ETH'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}