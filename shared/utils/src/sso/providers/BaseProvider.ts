/**
 * Base SSO Provider
 * Abstract base class for all SSO provider implementations
 */

import { ISSOProvider, SSOConfig, SSOTokens, SSOUser, SSOState } from '../types';
import { generatePKCEChallenge, storePKCEVerifier } from '../PKCEHelper';

export abstract class BaseProvider implements ISSOProvider {
  protected config: SSOConfig;

  constructor(config: SSOConfig) {
    this.config = config;
  }

  /**
   * Generate and store state parameter for CSRF protection
   */
  protected generateState(returnUrl?: string): SSOState {
    const state = this.generateRandomString(32);
    const nonce = this.generateRandomString(32);
    
    const ssoState: SSOState = {
      state,
      nonce,
      returnUrl,
      timestamp: Date.now(),
    };
    
    sessionStorage.setItem('sso_state', JSON.stringify(ssoState));
    
    return ssoState;
  }

  /**
   * Retrieve and validate state parameter
   */
  protected retrieveState(state: string): SSOState | null {
    try {
      const storedStateStr = sessionStorage.getItem('sso_state');
      if (!storedStateStr) return null;
      
      const storedState = JSON.parse(storedStateStr) as SSOState;
      sessionStorage.removeItem('sso_state');
      
      // Validate state matches
      if (storedState.state !== state) {
        console.error('State parameter mismatch');
        return null;
      }
      
      // Check if state is not too old (5 minutes)
      if (Date.now() - storedState.timestamp > 300000) {
        console.error('State parameter expired');
        return null;
      }
      
      return storedState;
    } catch (error) {
      console.error('Failed to retrieve state:', error);
      return null;
    }
  }

  /**
   * Generate random string
   */
  protected generateRandomString(length: number): string {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const randomValues = new Uint8Array(length);
    crypto.getRandomValues(randomValues);
    
    let result = '';
    for (let i = 0; i < length; i++) {
      result += charset[randomValues[i] % charset.length];
    }
    
    return result;
  }

  /**
   * Build authorization URL with PKCE
   */
  protected async buildAuthorizationUrl(additionalParams?: Record<string, string>): Promise<string> {
    const ssoState = this.generateState();
    const params: Record<string, string> = {
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      response_type: this.config.responseType,
      scope: this.config.scope,
      state: ssoState.state,
      ...additionalParams,
    };
    
    if (ssoState.nonce) {
      params.nonce = ssoState.nonce;
    }
    
    if (this.config.usePKCE) {
      const pkce = await generatePKCEChallenge();
      storePKCEVerifier(pkce.codeVerifier);
      params.code_challenge = pkce.codeChallenge;
      params.code_challenge_method = pkce.codeChallengeMethod;
    }
    
    const authUrl = this.getAuthorizationEndpoint();
    const queryString = new URLSearchParams(params).toString();
    
    return `${authUrl}?${queryString}`;
  }

  /**
   * Abstract methods to be implemented by each provider
   */
  protected abstract getAuthorizationEndpoint(): string;
  protected abstract getTokenEndpoint(): string;
  protected abstract getUserInfoEndpoint(): string;
  protected abstract getLogoutEndpoint(): string;
  protected abstract getRevokeEndpoint(): string;

  /**
   * Initiate login flow
   */
  async login(): Promise<void> {
    const authUrl = await this.buildAuthorizationUrl();
    window.location.href = authUrl;
  }

  /**
   * Handle OAuth callback
   */
  abstract handleCallback(code: string, state: string): Promise<SSOTokens>;

  /**
   * Refresh access token
   */
  abstract refreshToken(refreshToken: string): Promise<SSOTokens>;

  /**
   * Get user information
   */
  abstract getUserInfo(accessToken: string): Promise<SSOUser>;

  /**
   * Validate token
   */
  async validateToken(token: string): Promise<boolean> {
    try {
      // Basic JWT structure validation
      const parts = token.split('.');
      if (parts.length !== 3) return false;
      
      // Decode and check expiration
      const payload = JSON.parse(atob(parts[1]));
      if (!payload.exp) return false;
      
      return payload.exp * 1000 > Date.now();
    } catch (error) {
      return false;
    }
  }

  /**
   * Revoke token
   */
  abstract revokeToken(token: string): Promise<void>;

  /**
   * Logout
   */
  async logout(): Promise<void> {
    const logoutUrl = this.getLogoutEndpoint();
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      returnTo: this.config.logoutRedirectUri,
    });
    
    window.location.href = `${logoutUrl}?${params.toString()}`;
  }
}
