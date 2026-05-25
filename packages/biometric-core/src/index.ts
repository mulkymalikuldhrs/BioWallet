import { startRegistration, startAuthentication } from '@simplewebauthn/browser';
import { ethers } from 'ethers';

/**
 * Check if WebAuthn is supported
 * @returns Whether WebAuthn is supported
 */
export async function isWebAuthnSupported(): Promise<boolean> {
  try {
    // Check if PublicKeyCredential is available
    if (
      typeof window !== 'undefined' &&
      window.PublicKeyCredential &&
      typeof window.PublicKeyCredential === 'function'
    ) {
      // Check if platform authenticator is available
      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      return available;
    }
    return false;
  } catch (error) {
    console.error('Error checking WebAuthn support:', error);
    return false;
  }
}

/**
 * Register a new credential with WebAuthn
 * @param username - The username
 * @param displayName - The display name
 * @param rpName - The relying party name
 * @param rpId - The relying party ID
 * @returns The credential
 */
export async function registerWebAuthnCredential(
  username: string,
  displayName: string,
  rpName: string,
  rpId: string
): Promise<any> {
  try {
    // In a real app, you would fetch registration options from the server
    // This is a simplified example
    const challenge = new Uint8Array(32);
    if (typeof window !== 'undefined' && window.crypto) {
      window.crypto.getRandomValues(challenge);
    }
    const registrationOptions = {
      challenge,
      rp: {
        name: rpName,
        id: rpId,
      },
      user: {
        id: new TextEncoder().encode(username),
        name: username,
        displayName,
      },
      pubKeyCredParams: [
        { type: 'public-key', alg: -7 }, // ES256
        { type: 'public-key', alg: -257 }, // RS256
      ],
      timeout: 60000,
      attestation: 'none',
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        userVerification: 'required',
        requireResidentKey: false,
      },
    };

    // Start registration
    const credential = await startRegistration(registrationOptions as any);
    return credential;
  } catch (error) {
    console.error('Error registering WebAuthn credential:', error);
    throw new Error('Failed to register WebAuthn credential');
  }
}

/**
 * Authenticate with WebAuthn
 * @param rpId - The relying party ID
 * @returns The credential
 */
export async function authenticateWithWebAuthn(rpId: string): Promise<any> {
  try {
    // In a real app, you would fetch authentication options from the server
    // This is a simplified example
    const challenge = new Uint8Array(32);
    if (typeof window !== 'undefined' && window.crypto) {
      window.crypto.getRandomValues(challenge);
    }
    const authenticationOptions = {
      challenge,
      timeout: 60000,
      userVerification: 'required',
      rpId,
    };

    // Start authentication
    const credential = await startAuthentication(authenticationOptions as any);
    return credential;
  } catch (error) {
    console.error('Error authenticating with WebAuthn:', error);
    throw new Error('Failed to authenticate with WebAuthn');
  }
}

/**
 * Generate a key from biometric data
 * @param biometricData - The biometric data
 * @param salt - A salt to use for key derivation
 * @returns The key
 */
export async function generateKeyFromBiometric(
  biometricData: string,
  salt: string
): Promise<string> {
  try {
    // Use scrypt for key derivation as it's more compatible with web environments than argon2
    const password = ethers.toUtf8Bytes(biometricData);
    const saltBytes = ethers.toUtf8Bytes(salt);

    // scrypt parameters: N=16384, r=8, p=1
    const derivedKey = await ethers.scrypt(password, saltBytes, 16384, 8, 1, 32);

    return ethers.hexlify(derivedKey);
  } catch (error) {
    console.error('Error generating key from biometric:', error);
    throw new Error('Failed to generate key from biometric');
  }
}