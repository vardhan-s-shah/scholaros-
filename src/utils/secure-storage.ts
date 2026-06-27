/**
 * Secure Storage Abstraction Layer
 * Handles storage of keys in localStorage or sessionStorage with basic Base64 obfuscation
 * to prevent plain-text visibility in browser dev tools.
 */

const IS_SERVER = typeof window === 'undefined';

const obfuscate = (value: string): string => {
  try {
    return btoa(encodeURIComponent(value));
  } catch (e) {
    return value;
  }
};

const deobfuscate = (value: string): string => {
  try {
    return decodeURIComponent(atob(value));
  } catch (e) {
    return value;
  }
};

export const secureStorage = {
  /**
   * Set value in localStorage or sessionStorage
   */
  setItem: (key: string, value: any, useSession: boolean = false): void => {
    if (IS_SERVER) return;
    const storage = useSession ? window.sessionStorage : window.localStorage;
    const serializedValue = typeof value === 'string' ? value : JSON.stringify(value);
    const obfuscatedKey = obfuscate(key);
    const obfuscatedValue = obfuscate(serializedValue);
    storage.setItem(obfuscatedKey, obfuscatedValue);
  },

  /**
   * Get value from localStorage or sessionStorage
   */
  getItem: <T = any>(key: string, useSession: boolean = false): T | null => {
    if (IS_SERVER) return null;
    const storage = useSession ? window.sessionStorage : window.localStorage;
    const obfuscatedKey = obfuscate(key);
    const obfuscatedValue = storage.getItem(obfuscatedKey);
    
    if (!obfuscatedValue) return null;

    const deobfuscatedValue = deobfuscate(obfuscatedValue);
    
    try {
      return JSON.parse(deobfuscatedValue) as T;
    } catch (e) {
      return deobfuscatedValue as unknown as T;
    }
  },

  /**
   * Remove item from localStorage or sessionStorage
   */
  removeItem: (key: string, useSession: boolean = false): void => {
    if (IS_SERVER) return;
    const storage = useSession ? window.sessionStorage : window.localStorage;
    const obfuscatedKey = obfuscate(key);
    storage.removeItem(obfuscatedKey);
  },

  /**
   * Clear all items from both local and session storage
   */
  clear: (): void => {
    if (IS_SERVER) return;
    window.localStorage.clear();
    window.sessionStorage.clear();
  }
};
