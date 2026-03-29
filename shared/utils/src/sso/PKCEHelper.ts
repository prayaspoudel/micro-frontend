/**
 * PKCE (Proof Key for Code Exchange) Helper
 * Implements RFC 7636 for enhanced OAuth2 security
 */

import { PKCEChallenge } from './types';

/**
 * Generate a cryptographically random string
 */
function generateRandomString(length: number): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  const randomValues = new Uint8Array(length);
  crypto.getRandomValues(randomValues);
  
  let result = '';
  for (let i = 0; i < length; i++) {
    result += charset[randomValues[i] % charset.length];
  }
  
  return result;
}

/**
 * Generate SHA-256 hash
 */
async function sha256(plain: string): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return crypto.subtle.digest('SHA-256', data);
}

/**
 * Base64 URL encode
 */
function base64URLEncode(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Generate PKCE challenge pair
 */
export async function generatePKCEChallenge(): Promise<PKCEChallenge> {
  const codeVerifier = generateRandomString(128);
  const hashed = await sha256(codeVerifier);
  const codeChallenge = base64URLEncode(hashed);
  
  return {
    codeVerifier,
    codeChallenge,
    codeChallengeMethod: 'S256',
  };
}

/**
 * Store PKCE verifier in session storage
 */
export function storePKCEVerifier(verifier: string): void {
  sessionStorage.setItem('pkce_verifier', verifier);
}

/**
 * Retrieve and remove PKCE verifier from session storage
 */
export function retrievePKCEVerifier(): string | null {
  const verifier = sessionStorage.getItem('pkce_verifier');
  sessionStorage.removeItem('pkce_verifier');
  return verifier;
}

/**
 * Verify PKCE challenge
 */
export async function verifyPKCEChallenge(verifier: string, challenge: string): Promise<boolean> {
  try {
    const hashed = await sha256(verifier);
    const computed = base64URLEncode(hashed);
    return computed === challenge;
  } catch (error) {
    console.error('PKCE verification failed:', error);
    return false;
  }
}
