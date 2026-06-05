/**
 * SSR-safe localStorage wrapper.
 * Prevents "localStorage is not defined" errors during Next.js server-side rendering.
 *
 * NOTE: localStorage is NOT secure storage. Never store private keys, passwords,
 * or sensitive authentication tokens here. Use it only for non-sensitive UI state
 * like theme preferences, wallet addresses (which are public), and session flags.
 */

export const safeLocalStorage = {
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
