import { startRegistration, startAuthentication } from '@simplewebauthn/browser';
import * as argon2 from 'argon2-browser';

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
    const registrationOptions = {
      challenge: new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]),
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
    const authenticationOptions = {
      challenge: new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]),
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
    // Hash the biometric data using Argon2
    const hashResult = await argon2.hash({
      pass: biometricData,
      salt,
      time: 3, // Number of iterations
      mem: 4096, // Memory usage in KiB
      hashLen: 32, // Output hash length
      parallelism: 1, // Parallelism factor
    });

    return hashResult.encoded;
  } catch (error) {
    console.error('Error generating key from biometric:', error);
    throw new Error('Failed to generate key from biometric');
  }
}