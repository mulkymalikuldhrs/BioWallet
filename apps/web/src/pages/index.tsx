import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { FiFingerprint, FiShield, FiGlobe, FiLock } from 'react-icons/fi';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  
  useEffect(() => {
    // If user is authenticated, redirect to dashboard
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);
  
  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
              <span className="block">Welcome to</span>
              <span className="block text-indigo-600 dark:text-indigo-400">BioWallet</span>
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 dark:text-gray-400 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              The revolutionary crypto wallet that uses your biometrics to secure your digital assets.
              No seed phrases. No passwords. Just you.
            </p>
          </motion.div>
          
          <motion.div
            className="mt-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <div className="flex justify-center">
              <div className="inline-flex rounded-md shadow">
                <button
                  onClick={() => router.push('/register')}
                  className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Get Started
                </button>
              </div>
              <div className="ml-3 inline-flex">
                <button
                  onClick={() => router.push('/login')}
                  className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 dark:text-indigo-100 dark:bg-indigo-900 dark:hover:bg-indigo-800"
                >
                  Login
                </button>
              </div>
            </div>
          </motion.div>
        </div>
        
        <motion.div
          className="mt-20"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="pt-6">
              <div className="flow-root bg-gray-50 dark:bg-gray-800 rounded-lg px-6 pb-8">
                <div className="-mt-6">
                  <div>
                    <span className="inline-flex items-center justify-center p-3 bg-indigo-500 rounded-md shadow-lg">
                      <FiFingerprint className="h-6 w-6 text-white" aria-hidden="true" />
                    </span>
                  </div>
                  <h3 className="mt-8 text-lg font-medium text-gray-900 dark:text-white tracking-tight">Biometric Security</h3>
                  <p className="mt-5 text-base text-gray-500 dark:text-gray-400">
                    Use your fingerprint, face, or iris to secure your wallet. No more seed phrases to remember or lose.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="pt-6">
              <div className="flow-root bg-gray-50 dark:bg-gray-800 rounded-lg px-6 pb-8">
                <div className="-mt-6">
                  <div>
                    <span className="inline-flex items-center justify-center p-3 bg-indigo-500 rounded-md shadow-lg">
                      <FiShield className="h-6 w-6 text-white" aria-hidden="true" />
                    </span>
                  </div>
                  <h3 className="mt-8 text-lg font-medium text-gray-900 dark:text-white tracking-tight">Local Processing</h3>
                  <p className="mt-5 text-base text-gray-500 dark:text-gray-400">
                    All biometric data is processed locally on your device. Your biometric data never leaves your device.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="pt-6">
              <div className="flow-root bg-gray-50 dark:bg-gray-800 rounded-lg px-6 pb-8">
                <div className="-mt-6">
                  <div>
                    <span className="inline-flex items-center justify-center p-3 bg-indigo-500 rounded-md shadow-lg">
                      <FiGlobe className="h-6 w-6 text-white" aria-hidden="true" />
                    </span>
                  </div>
                  <h3 className="mt-8 text-lg font-medium text-gray-900 dark:text-white tracking-tight">Ethereum Compatible</h3>
                  <p className="mt-5 text-base text-gray-500 dark:text-gray-400">
                    Send and receive ETH on the Ethereum network. Compatible with all Ethereum-based tokens and dApps.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="pt-6">
              <div className="flow-root bg-gray-50 dark:bg-gray-800 rounded-lg px-6 pb-8">
                <div className="-mt-6">
                  <div>
                    <span className="inline-flex items-center justify-center p-3 bg-indigo-500 rounded-md shadow-lg">
                      <FiLock className="h-6 w-6 text-white" aria-hidden="true" />
                    </span>
                  </div>
                  <h3 className="mt-8 text-lg font-medium text-gray-900 dark:text-white tracking-tight">Cross-Platform</h3>
                  <p className="mt-5 text-base text-gray-500 dark:text-gray-400">
                    Access your wallet from any device. Available on web, iOS, and Android.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}