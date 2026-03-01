import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { startRegistration } from '@simplewebauthn/browser';
import { useAuth } from '@/context/AuthContext';
import { useWallet } from '@/context/WalletContext';

export default function Register() {
  const router = useRouter();
  const { register, getRegistrationOptions, isLoading: authLoading, error: authError } = useAuth();
  const { generateWallet, isLoading: walletLoading } = useWallet();
  
  const [step, setStep] = useState(1);
  const [registrationError, setRegistrationError] = useState<string | null>(null);
  
  const handleRegister = async () => {
    try {
      setRegistrationError(null);
      setStep(2);
      
      // 1. Get options from AuthContext (simulated from server)
      // We use a temporary wallet address for the options
      const tempAddress = '0x0000000000000000000000000000000000000000';
      const options = getRegistrationOptions(tempAddress);
      
      // 2. Start WebAuthn Registration
      const credential = await startRegistration(options);

      // 3. Generate Wallet from Credential ID (Biometric entropy)
      // IMPORTANT SECURITY NOTE: Using credential.id as the sole source of entropy is insecure
      // as it is a public identifier. In a production environment, use the WebAuthn PRF extension
      // or another secure method to obtain a secret from the authenticator.
      const salt = 'biowallet-salt-v1';
      const walletAddress = await generateWallet(credential.id, salt);

      if (walletAddress) {
        // 4. Register on Backend
        const success = await register(walletAddress, 'biometric-public-key', credential.id);
        if (success) {
          router.push('/dashboard');
        } else {
          setRegistrationError('Registration failed on backend');
          setStep(1);
        }
      } else {
        setRegistrationError('Failed to generate wallet');
        setStep(1);
      }
    } catch (error) {
      console.error(error);
      setRegistrationError(error instanceof Error ? error.message : 'Registration failed');
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
        
        {(registrationError || authError) && (
          <div className="p-4 bg-red-50 text-red-800 rounded-lg text-sm">
            {registrationError || authError}
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
                Start Biometric Registration
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
