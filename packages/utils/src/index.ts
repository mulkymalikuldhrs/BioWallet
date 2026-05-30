import { ethers } from 'ethers';

// Re-export shared types
export * from './types';

/**
 * Extract entropy from WebAuthn authentication/registration result
 * @param authResult - The WebAuthn result (authentication or registration)
 * @returns The extracted entropy source string
 */
export function extractEntropy(authResult: any): string {
  if (!authResult) return '';

  // If it's a registration result from @simplewebauthn/browser or a result with .id
  const id = authResult.credentialId || authResult.id;
  if (!id) return '';

  const prfResults = authResult.clientExtensionResults?.prf || (authResult as any).clientExtensionResults?.prf;

  if (prfResults?.results?.first) {
    return ethers.hexlify(new Uint8Array(prfResults.results.first));
  }

  // No longer fall back to localStorage secret — caller should handle fallback
  return id;
}

/**
 * Format an Ethereum address
 * @param address - The address to format
 * @returns The formatted address
 */
export function formatAddress(address: string): string {
  if (!address) return '';
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

/**
 * Validate an email address
 * @param email - The email to validate
 * @returns Whether the email is valid
 */
export function validateEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}
