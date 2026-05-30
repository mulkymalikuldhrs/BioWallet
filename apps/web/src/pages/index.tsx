import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { FiShield, FiGlobe, FiLock } from 'react-icons/fi';
import { MdFingerprint } from 'react-icons/md';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  
  useEffect(() => {
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
          
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4 mx-auto">
                <MdFingerprint className="text-2xl" />
              </div>
              <h3 className="text-lg font-bold">Biometric Security</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">Use your device's biometric sensors to authorize transactions.</p>
            </div>
            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4 mx-auto">
                <FiShield className="text-2xl" />
              </div>
              <h3 className="text-lg font-bold">Self-Custodial</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">You alone control your private keys, derived deterministically.</p>
            </div>
            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4 mx-auto">
                <FiLock className="text-2xl" />
              </div>
              <h3 className="text-lg font-bold">No Seed Phrases</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">Never worry about losing your backup phrase again.</p>
            </div>
            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4 mx-auto">
                <FiGlobe className="text-2xl" />
              </div>
              <h3 className="text-lg font-bold">Multi-Chain</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">Support for Ethereum, Polygon, and other EVM networks.</p>
            </div>
          </div>

          <div className="mt-10">
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
                  className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                >
                  Login
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}