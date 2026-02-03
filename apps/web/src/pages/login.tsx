import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';

export default function Login() {
  const router = useRouter();
  const { login, isLoading, error } = useAuth();

  const handleLogin = async () => {
    try {
      const success = await login();
      if (success) {
        router.push('/dashboard');
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

        {error && (
          <div className="p-4 bg-red-50 text-red-800 rounded-lg text-sm">
            {error}
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
            disabled={isLoading}
            className="w-full py-3 bg-indigo-600 text-white rounded-md font-medium hover:bg-indigo-700 disabled:opacity-50"
          >
            {isLoading ? 'Verifying...' : 'Authenticate'}
          </button>
        </div>
      </div>
    </div>
  );
}