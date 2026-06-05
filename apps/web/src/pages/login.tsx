import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useWallet } from '@/context/WalletContext';
import { MdFingerprint } from 'react-icons/md';
import { ethers } from 'ethers';
import { extractEntropy } from 'utils';
import { safeLocalStorage } from '@/lib/safeLocalStorage';

export default function Login() {
  const router = useRouter();
  const { login, isLoading: authLoading, error: authError } = useAuth();
  const { generateWallet, isLoading: walletLoading } = useWallet();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleLogin = async () => {
    try {
      // Check WebAuthn availability
      if (typeof window === 'undefined' || !navigator.credentials) {
        alert('WebAuthn is not supported in this browser.');
        return;
      }

      const result = await login();
      if (result.success && result.credentialId) {
        // Re-derive wallet from entropy
        let entropySource = extractEntropy(result);

        // If PRF not available, combine with stored PIN
        const prfAvailable = !!(result as any).clientExtensionResults?.prf?.results?.first;
        if (!prfAvailable) {
          const storedPin = safeLocalStorage.getItem('biowallet_user_pin');
          if (storedPin) {
            entropySource = ethers.keccak256(
              ethers.toUtf8Bytes(result.credentialId + storedPin)
            );
          }
        }

        // Use per-user salt (stored in localStorage, should be synced from backend)
        let salt = safeLocalStorage.getItem('biowallet_salt');
        if (!salt) {
          // Fallback: derive from credential ID
          salt = `biowallet-salt-${result.credentialId.slice(0, 8)}`;
          safeLocalStorage.setItem('biowallet_salt', salt);
        }

        const address = await generateWallet(entropySource, salt);

        if (address) {
          router.push('/dashboard');
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Don't render WebAuthn-dependent UI on server
  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            Login with Biometrics
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Securely access your BioWallet using your device&apos;s biometric sensor.
          </p>
        </div>

        {authError && (
          <div className="p-4 bg-red-50 text-red-800 rounded-lg text-sm">
            {authError}
          </div>
        )}

        <div className="mt-8 space-y-6">
          <div className="flex justify-center">
            <motion.div
              className="w-24 h-24 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center cursor-pointer text-indigo-600 dark:text-indigo-400"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogin}
            >
              <MdFingerprint className="text-5xl" />
            </motion.div>
          </div>

          <button
            onClick={handleLogin}
            disabled={authLoading || walletLoading}
            className="w-full py-3 bg-indigo-600 text-white rounded-md font-medium hover:bg-indigo-700 disabled:opacity-50"
          >
            {authLoading || walletLoading ? 'Verifying...' : 'Authenticate'}
          </button>
        </div>
      </div>
    </div>
  );
}
