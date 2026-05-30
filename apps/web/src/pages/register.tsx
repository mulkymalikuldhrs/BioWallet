import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import { useWallet } from '@/context/WalletContext';
import { FiLoader } from 'react-icons/fi';
import { ethers } from 'ethers';
import { MdFingerprint } from 'react-icons/md';
import { extractEntropy } from 'utils';

// SSR-safe localStorage wrapper
const safeLocalStorage = {
  getItem: (key: string): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(key);
  },
  setItem: (key: string, value: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(key, value);
  },
  removeItem: (key: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(key);
  },
};

export default function Register() {
  const router = useRouter();
  const { register, getRegistrationOptions, isLoading: authLoading, error: authError } = useAuth();
  const { generateWallet, isLoading: walletLoading } = useWallet();
  
  const [step, setStep] = useState(1);
  const [registrationError, setRegistrationError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [pinFallback, setPinFallback] = useState('');
  const [showPinInput, setShowPinInput] = useState(false);
  
  // Ensure we only render WebAuthn-dependent UI on client
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const handleRegister = async () => {
    try {
      // Check for WebAuthn support on client
      if (typeof window === 'undefined' || !navigator.credentials) {
        setRegistrationError('WebAuthn is not supported in this browser. Please use a modern browser with biometric support.');
        return;
      }

      setRegistrationError(null);
      setStep(2);
      
      // 1. Get options from AuthContext
      const tempAddress = '0x0000000000000000000000000000000000000000';
      const options = getRegistrationOptions(tempAddress);
      
      // Add PRF extension request for secure key derivation
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
      const { startRegistration } = await import('@simplewebauthn/browser');
      const credential = await startRegistration(optionsWithPRF as any);

      // 3. Generate Wallet from Biometric Entropy
      // Check if PRF is available
      const prfAvailable = !!(credential as any).clientExtensionResults?.prf?.results?.first;

      let entropySource: string;

      if (prfAvailable) {
        // PRF provides real biometric-derived entropy
        entropySource = extractEntropy(credential);
      } else {
        // PRF not available — require user to set a PIN/password as additional entropy
        // If we already have a PIN, use it; otherwise prompt
        let userPin = safeLocalStorage.getItem('biowallet_user_pin');

        if (!userPin) {
          // Prompt for PIN
          setStep(1);
          setShowPinInput(true);
          // We'll continue after the user enters a PIN
          return;
        }

        // Combine credential ID with user PIN for entropy
        const credentialId = credential.id;
        entropySource = ethers.keccak256(
          ethers.toUtf8Bytes(credentialId + userPin)
        );
      }

      // Generate per-user salt (stored in backend, not hardcoded)
      // For first-time registration, we create a salt based on the credential ID
      const credentialId = credential.id;
      let salt = safeLocalStorage.getItem('biowallet_salt');
      if (!salt) {
        // Create a per-user salt derived from credential ID and a random component
        const randomComponent = ethers.hexlify(ethers.randomBytes(16));
        salt = `biowallet-salt-${credentialId.slice(0, 8)}-${randomComponent.slice(2, 10)}`;
        safeLocalStorage.setItem('biowallet_salt', salt);

        // Store salt on backend (as part of user registration data)
        // The salt is sent alongside the registration request
      }

      const walletAddress = await generateWallet(entropySource, salt);

      if (walletAddress) {
        // 4. Register on Backend
        const publicKey = (credential as any).response?.publicKey || 'biometric-public-key-placeholder';
        const success = await register(walletAddress, publicKey, credential.id);
        if (success) {
          // Store the salt on the backend for this user
          try {
            const token = safeLocalStorage.getItem('userToken');
            if (token) {
              await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/wallet/register`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  walletAddress,
                  publicKey,
                  biometricType: 'FINGERPRINT',
                  salt, // Send salt to backend for persistence
                }),
              });
            }
          } catch {
            // Non-blocking
          }

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

  const handlePinSubmit = async () => {
    if (!pinFallback || pinFallback.length < 6) {
      setRegistrationError('PIN must be at least 6 characters');
      return;
    }

    // Store the PIN locally (hashed)
    const hashedPin = ethers.keccak256(ethers.toUtf8Bytes(pinFallback));
    safeLocalStorage.setItem('biowallet_user_pin', hashedPin);
    setShowPinInput(false);

    // Continue registration
    handleRegister();
  };

  // Don't render WebAuthn-dependent UI on server
  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <FiLoader className="animate-spin text-4xl text-indigo-600" />
      </div>
    );
  }

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
          {showPinInput ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Your device doesn&apos;t support the WebAuthn PRF extension. Please set a backup PIN/password to secure your wallet.
              </p>
              <input
                type="password"
                value={pinFallback}
                onChange={(e) => setPinFallback(e.target.value)}
                placeholder="Enter a PIN (min 6 characters)"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                minLength={6}
              />
              <button
                onClick={handlePinSubmit}
                disabled={pinFallback.length < 6}
                className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50"
              >
                Set PIN & Continue
              </button>
              <button
                onClick={() => {
                  setShowPinInput(false);
                  setPinFallback('');
                }}
                className="w-full py-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600"
              >
                Cancel
              </button>
            </div>
          ) : step === 1 ? (
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
