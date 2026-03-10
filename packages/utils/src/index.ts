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
