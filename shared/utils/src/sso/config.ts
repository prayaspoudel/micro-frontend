/**
 * SSO Configuration
 * Loads configuration from environment variables
 */

import { SSOConfig } from './types';

/**
 * Get SSO configuration from environment variables
 */
export function getSSOConfig(): SSOConfig {
  const provider = (import.meta.env.VITE_SSO_PROVIDER || 'mock') as SSOConfig['provider'];
  
  return {
    provider,
    clientId: import.meta.env.VITE_SSO_CLIENT_ID || '',
    domain: import.meta.env.VITE_SSO_DOMAIN || '',
    redirectUri: import.meta.env.VITE_SSO_REDIRECT_URI || `${window.location.origin}/callback`,
    logoutRedirectUri: import.meta.env.VITE_SSO_LOGOUT_REDIRECT_URI || `${window.location.origin}/login`,
    audience: import.meta.env.VITE_SSO_AUDIENCE || '',
    scope: import.meta.env.VITE_SSO_SCOPE || 'openid profile email',
    responseType: 'code',
    usePKCE: import.meta.env.VITE_SSO_USE_PKCE === 'true' || true,
    tokenRefreshInterval: parseInt(import.meta.env.VITE_SSO_TOKEN_REFRESH_INTERVAL || '300000', 10),
    sessionTimeout: parseInt(import.meta.env.VITE_SSO_SESSION_TIMEOUT || '3600000', 10),
    customClaimsNamespace: import.meta.env.VITE_SSO_CUSTOM_CLAIMS_NAMESPACE || undefined,
  };
}

/**
 * Check if SSO is enabled
 */
export function isSSOEnabled(): boolean {
  return import.meta.env.VITE_USE_SSO === 'true';
}

/**
 * Validate SSO configuration
 */
export function validateSSOConfig(config: SSOConfig): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (config.provider !== 'mock' && !config.clientId) {
    errors.push('SSO Client ID is required');
  }

  if (config.provider !== 'mock' && !config.domain) {
    errors.push('SSO Domain is required');
  }

  if (!config.redirectUri) {
    errors.push('Redirect URI is required');
  }

  if (!config.logoutRedirectUri) {
    errors.push('Logout Redirect URI is required');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
