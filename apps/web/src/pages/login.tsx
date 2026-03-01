import { useState } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useWallet } from '@/context/WalletContext';

export default function Login() {
  const router = useRouter();
  const { login, isLoading: authLoading, error: authError } = useAuth();
  const { generateWallet, isLoading: walletLoading } = useWallet();

  const handleLogin = async () => {
    try {
      const result = await login();
      if (result.success && result.credentialId) {
        // Re-derive wallet to ensure it matches
        // IMPORTANT SECURITY NOTE: Using credential.id as the sole source of entropy is insecure
        // as it is a public identifier. In a production environment, use the WebAuthn PRF extension
        // or another secure method to obtain a secret from the authenticator.
        const salt = 'biowallet-salt-v1';
        const address = await generateWallet(result.credentialId, salt);

        if (address) {
          router.push('/dashboard');
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            Login with Biometrics
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Securely access your BioWallet using your device's biometric sensor.
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
              className="w-24 h-24 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogin}
            >
              <span className="text-4xl">☝️</span>
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
