/**
 * SSO Types and Interfaces
 */

export type SSOProvider = 'auth0' | 'okta' | 'keycloak' | 'azure-ad' | 'google' | 'mock';

export interface SSOConfig {
  provider: SSOProvider;
  clientId: string;
  domain: string;
  redirectUri: string;
  logoutRedirectUri: string;
  audience?: string;
  scope: string;
  responseType: 'code' | 'token';
  usePKCE: boolean;
  tokenRefreshInterval: number; // milliseconds
  sessionTimeout: number; // milliseconds
}

export interface SSOTokens {
  accessToken: string;
  idToken: string;
  refreshToken?: string;
  expiresIn: number; // seconds
  tokenType: string;
  scope: string;
  expiresAt?: number; // timestamp when token expires
}

export interface SSOUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  name: string;
  picture?: string;
  roles: string[];
  permissions: string[];
}

export interface PKCEChallenge {
  codeVerifier: string;
  codeChallenge: string;
  codeChallengeMethod: 'S256' | 'plain';
}

export interface SSOState {
  state: string;
  nonce?: string;
  returnUrl?: string;
  timestamp: number;
}

export interface ISSOProvider {
  login(): Promise<void>;
  logout(): Promise<void>;
  handleCallback(code: string, state: string): Promise<SSOTokens>;
  refreshToken(refreshToken: string): Promise<SSOTokens>;
  getUserInfo(accessToken: string): Promise<SSOUser>;
  validateToken(token: string): Promise<boolean>;
  revokeToken(token: string): Promise<void>;
}

export interface TokenRefreshConfig {
  refreshBeforeExpiry: number; // seconds before expiry to refresh
  maxRetries: number;
  retryDelay: number; // milliseconds
}

export interface SSOError {
  code: string;
  message: string;
  description?: string;
  provider?: SSOProvider;
}
