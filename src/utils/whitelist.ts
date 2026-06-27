/**
 * Configuration and validation for whitelisted college email domains.
 */

// Default whitelisted domains. Can be configured via environment variables.
const DEFAULT_WHITELIST = [
  'sot.pdpu.ac.in',          // Any .edu domain

];

/**
 * Checks if an email belongs to a whitelisted college domain
 */
export const isWhitelistedEmail = (email: string): boolean => {
  if (!email || !email.includes('@')) return false;
  
  const domain = email.split('@')[1].toLowerCase();
  
  // Get whitelist from env or use defaults
  const whitelistEnv = import.meta.env.VITE_EMAIL_WHITELIST;
  const whitelist = whitelistEnv 
    ? whitelistEnv.split(',').map((d: string) => d.trim().toLowerCase())
    : DEFAULT_WHITELIST;

  return whitelist.some((allowed: string) => {
    // If allowed is a TLD (like 'edu'), check if domain ends with .edu or is exactly edu
    if (!allowed.includes('.')) {
      return domain.endsWith(`.${allowed}`) || domain === allowed;
    }
    // Check for exact domain match or subdomain match (e.g., student.college.edu matches college.edu)
    return domain === allowed || domain.endsWith(`.${allowed}`);
  });
};

/**
 * Returns the list of whitelisted domains as a readable string for UI display
 */
export const getWhitelistedDomainsString = (): string => {
  const whitelistEnv = import.meta.env.VITE_EMAIL_WHITELIST;
  const whitelist = whitelistEnv 
    ? whitelistEnv.split(',').map((d: string) => d.trim())
    : DEFAULT_WHITELIST;
  
  return whitelist.map((d: string) => `*${d.startsWith('.') ? '' : '.'}${d}`).join(', ');
};
