import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useWallet } from '@/context/WalletContext';
import { FiFingerprint, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';

export default function Register() {
  const router = useRouter();
  const { register, isLoading, error } = useAuth();
  const { generateWalletFromBiometric } = useWallet();
  
  const [step, setStep] = useState(1);
  const [isWebAuthnSupported, setIsWebAuthnSupported] = useState(false);
  const [registrationError, setRegistrationError] = useState<string | null>(null);
  
  useEffect(() => {
    // Check if WebAuthn is supported
    const checkWebAuthnSupport = async () => {
      try {
        // Check if PublicKeyCredential is available
        if (
          window.PublicKeyCredential &&
          typeof window.PublicKeyCredential === 'function'
        ) {
          // Check if platform authenticator is available
          const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
          setIsWebAuthnSupported(available);
        } else {
          setIsWebAuthnSupported(false);
        }
      } catch (error) {
        console.error('Error checking WebAuthn support:', error);
        setIsWebAuthnSupported(false);
      }
    };
    
    checkWebAuthnSupport();
  }, []);
  
  const handleRegister = async () => {
    try {
      setRegistrationError(null);
      
      // Register with WebAuthn
      const success = await register();
      
      if (success) {
        setStep(2);
        
        // Generate wallet from biometric
        const walletAddress = await generateWalletFromBiometric();
        
        if (walletAddress) {
          // Navigate to dashboard
          router.push('/dashboard');
        } else {
          setRegistrationError('Failed to generate wallet');
        }
      } else {
        setRegistrationError(error || 'Registration failed');
      }
    } catch (error) {
      console.error('Error during registration:', error);
      setRegistrationError('Registration failed. Please try again.');
    }
  };
  
  if (!isWebAuthnSupported) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
              Browser Not Supported
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
              Your browser does not support WebAuthn, which is required for biometric authentication.
              Please use a modern browser like Chrome, Firefox, or Edge.
            </p>
          </div>
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => router.push('/')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            {step === 1 ? 'Register with Biometrics' : 'Creating Your Wallet'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            {step === 1
              ? 'Your biometrics will be used to generate your unique wallet. No biometric data is ever stored or transmitted.'
              : 'Please wait while we generate your secure wallet from your biometric data.'}
          </p>
        </motion.div>
        
        {registrationError && (
          <div className="rounded-md bg-red-50 dark:bg-red-900 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <FiAlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                  Registration Error
                </h3>
                <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                  <p>{registrationError}</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="mt-8 space-y-6">
          {step === 1 ? (
            <>
              <div className="flex justify-center">
                <motion.div
                  className="w-24 h-24 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center"
                  animate={{
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                >
                  <FiFingerprint className="h-12 w-12 text-indigo-600 dark:text-indigo-400" />
                </motion.div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <FiCheckCircle className="h-5 w-5 text-green-500" />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Processed locally on your device
                  </span>
                </div>
                <div className="flex items-center">
                  <FiCheckCircle className="h-5 w-5 text-green-500" />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Never stored or transmitted
                  </span>
                </div>
                <div className="flex items-center">
                  <FiCheckCircle className="h-5 w-5 text-green-500" />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Creates your unique wallet key
                  </span>
                </div>
              </div>
              
              <div>
                <button
                  onClick={handleRegister}
                  disabled={isLoading}
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Processing...' : 'Register with Biometrics'}
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center space-y-4">
              <motion.div
                animate={{
                  rotate: 360,
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              >
                <svg
                  className="w-16 h-16 text-indigo-600 dark:text-indigo-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              </motion.div>
              <p className="text-indigo-600 dark:text-indigo-400 font-medium">
                Processing biometric data...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}