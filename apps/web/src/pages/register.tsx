import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { startRegistration } from '@simplewebauthn/browser';
import { useAuth } from '@/context/AuthContext';
import { useWallet } from '@/context/WalletContext';
import { FiLoader } from 'react-icons/fi';
import { ethers } from 'ethers';
import { MdFingerprint } from 'react-icons/md';

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
      
      // Add PRF extension request for secure key derivation
      // Note: This requires browser and authenticator support
      const optionsWithPRF = {
        ...options,
        extensions: {
          prf: {
            eval: {
              first: new TextEncoder().encode('biowallet-key-derivation-v1')
            }
          }
        }
      };

      // 2. Start WebAuthn Registration
      const credential = await startRegistration(optionsWithPRF as any);

      // 3. Generate Wallet from Biometric Entropy
      // We prioritize using the PRF output as high-entropy secret.
      // If PRF is not supported, we use a combination of credential ID and a client-side secret
      // as a fallback (still better than just credential ID).
      let entropySource = credential.id;
      const prfResults = (credential as any).clientExtensionResults?.prf;

      if (prfResults?.results?.first) {
        // Use the cryptographic secret from the authenticator
        entropySource = ethers.hexlify(new Uint8Array(prfResults.results.first));
        console.log('Using secure PRF entropy for wallet generation');
      } else {
        console.warn('PRF extension not supported. Using fallback entropy (less secure).');
        // Fallback: Combine public ID with a local persistent secret
        let localSecret = localStorage.getItem('biowallet_local_secret');
        if (!localSecret) {
          localSecret = ethers.hexlify(ethers.randomBytes(32));
          localStorage.setItem('biowallet_local_secret', localSecret);
        }
        entropySource = ethers.keccak256(ethers.toUtf8Bytes(credential.id + localSecret));
      }

      const salt = 'biowallet-salt-v1';
      const walletAddress = await generateWallet(entropySource, salt);

      if (walletAddress) {
        // 4. Register on Backend
        // We use the credential's public key if available, otherwise fallback to a placeholder
        const publicKey = (credential as any).response?.publicKey || 'biometric-public-key-placeholder';
        const success = await register(walletAddress, publicKey, credential.id);
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
                <div className="p-6 bg-indigo-100 dark:bg-indigo-900 rounded-full text-indigo-600 dark:text-indigo-400">
                  <MdFingerprint className="text-5xl" />
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
              <FiLoader className="animate-spin text-4xl text-indigo-600 mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Processing biometric data...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
