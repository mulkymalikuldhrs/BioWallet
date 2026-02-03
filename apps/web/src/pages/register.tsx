import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useWallet } from '@/context/WalletContext';

export default function Register() {
  const router = useRouter();
  const { register, isLoading: authLoading, error: authError } = useAuth();
  const { generateWalletFromBiometric, isLoading: walletLoading } = useWallet();
  
  const [step, setStep] = useState(1);
  const [isWebAuthnSupported, setIsWebAuthnSupported] = useState(false);
  const [registrationError, setRegistrationError] = useState<string | null>(null);
  
  useEffect(() => {
    const checkWebAuthnSupport = async () => {
      try {
        if (window.PublicKeyCredential) {
          const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
          setIsWebAuthnSupported(available);
        } else {
          setIsWebAuthnSupported(true); // Default to true for testing if not available
        }
      } catch (error) {
        setIsWebAuthnSupported(true);
      }
    };
    checkWebAuthnSupport();
  }, []);
  
  const handleRegister = async () => {
    try {
      setRegistrationError(null);
      setStep(2);
      
      const walletAddress = await generateWalletFromBiometric();
      
      if (walletAddress) {
        const success = await register(walletAddress, 'dummy-public-key');
        if (success) {
          router.push('/dashboard');
        } else {
          setRegistrationError(authError || 'Registration failed');
          setStep(1);
        }
      } else {
        setRegistrationError('Failed to generate wallet');
        setStep(1);
      }
    } catch (error) {
      setRegistrationError('Registration failed. Please try again.');
      setStep(1);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold">{step === 1 ? 'Register BioWallet' : 'Creating Wallet...'}</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {step === 1 ? 'Your biometrics will secure your wallet.' : 'Securing your assets with your unique biometric signature.'}
          </p>
        </div>
        
        {registrationError && (
          <div className="p-4 bg-red-50 text-red-800 rounded-lg text-sm">
            {registrationError}
          </div>
        )}
        
        <div className="mt-8">
          {step === 1 ? (
            <div className="space-y-6 text-center">
              <div className="flex justify-center">
                <div className="p-6 bg-indigo-100 dark:bg-indigo-900 rounded-full">
                  <span className="text-5xl">🧬</span>
                </div>
              </div>
              <button
                onClick={handleRegister}
                disabled={authLoading || walletLoading}
                className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50"
              >
                Start Registration
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
              <p>Processing biometric data...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}