/**
 * SSO Service
 * Main orchestrator for SSO authentication
 */

import { SSOConfig, ISSOProvider, SSOTokens, SSOUser } from './types';
import { Auth0Provider } from './providers/Auth0Provider';
import { OktaProvider } from './providers/OktaProvider';
import { KeycloakProvider } from './providers/KeycloakProvider';
import { AzureADProvider } from './providers/AzureADProvider';
import { GoogleProvider } from './providers/GoogleProvider';
import { MockProvider } from './providers/MockProvider';
import { tokenManager } from './TokenManager';
import { getSSOConfig, isSSOEnabled } from './config';

export class SSOService {
  private provider: ISSOProvider | null = null;
  private config: SSOConfig;
  private onTokenRefreshCallback: (() => void) | null = null;

  constructor(config?: SSOConfig) {
    this.config = config || getSSOConfig();
    this.initializeProvider();
  }

  /**
   * Initialize the appropriate SSO provider
   */
  private initializeProvider(): void {
    switch (this.config.provider) {
      case 'auth0':
        this.provider = new Auth0Provider(this.config);
        break;
      case 'okta':
        this.provider = new OktaProvider(this.config);
        break;
      case 'keycloak':
        this.provider = new KeycloakProvider(this.config);
        break;
      case 'azure-ad':
        this.provider = new AzureADProvider(this.config);
        break;
      case 'google':
        this.provider = new GoogleProvider(this.config);
        break;
      case 'mock':
      default:
        this.provider = new MockProvider(this.config);
        break;
    }
  }

  /**
   * Check if SSO is enabled
   */
  isEnabled(): boolean {
    return isSSOEnabled();
  }

  /**
   * Get current provider name
   */
  getProviderName(): string {
    return this.config.provider;
  }

  /**
   * Initiate SSO login
   */
  async login(): Promise<void> {
    if (!this.provider) {
      throw new Error('SSO provider not initialized');
    }
    
    await this.provider.login();
  }

  /**
   * Handle OAuth callback
   */
  async handleCallback(code: string, state: string): Promise<SSOUser> {
    if (!this.provider) {
      throw new Error('SSO provider not initialized');
    }

    try {
      // Exchange code for tokens
      const tokens = await this.provider.handleCallback(code, state);
      
      // Store tokens
      tokenManager.storeTokens(tokens);
      
      // Get user info
      const user = await this.provider.getUserInfo(tokens.accessToken);
      
      // Start token refresh timer
      this.startTokenRefresh();
      
      return user;
    } catch (error) {
      console.error('SSO callback error:', error);
      throw error;
    }
  }

  /**
   * Get current user information
   */
  async getCurrentUser(): Promise<SSOUser | null> {
    if (!this.provider) return null;

    const tokens = tokenManager.getTokens();
    if (!tokens) return null;

    try {
      return await this.provider.getUserInfo(tokens.accessToken);
    } catch (error) {
      console.error('Failed to get current user:', error);
      return null;
    }
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(): Promise<boolean> {
    if (!this.provider) return false;

    const tokens = tokenManager.getTokens();
    if (!tokens || !tokens.refreshToken) return false;

    try {
      const newTokens = await this.provider.refreshToken(tokens.refreshToken);
      tokenManager.storeTokens(newTokens);
      
      // Notify callback if set
      if (this.onTokenRefreshCallback) {
        this.onTokenRefreshCallback();
      }
      
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  }

  /**
   * Start automatic token refresh
   */
  startTokenRefresh(): void {
    tokenManager.startRefreshTimer(async () => {
      await this.refreshAccessToken();
    });
  }

  /**
   * Stop automatic token refresh
   */
  stopTokenRefresh(): void {
    tokenManager.stopRefreshTimer();
  }

  /**
   * Set callback for token refresh
   */
  onTokenRefresh(callback: () => void): void {
    this.onTokenRefreshCallback = callback;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return tokenManager.isTokenValid();
  }

  /**
   * Get access token
   */
  getAccessToken(): string | null {
    const tokens = tokenManager.getTokens();
    return tokens?.accessToken || null;
  }

  /**
   * Logout
   */
  async logout(): Promise<void> {
    if (!this.provider) return;

    try {
      // Get tokens before clearing
      const tokens = tokenManager.getTokens();
      
      // Stop token refresh
      this.stopTokenRefresh();
      
      // Revoke tokens if available
      if (tokens?.accessToken) {
        try {
          await this.provider.revokeToken(tokens.accessToken);
        } catch (error) {
          console.error('Token revocation failed:', error);
        }
      }
      
      // Clear stored tokens
      tokenManager.clearTokens();
      
      // Perform provider logout
      await this.provider.logout();
    } catch (error) {
      console.error('Logout error:', error);
      // Clear tokens even if logout fails
      tokenManager.clearTokens();
      throw error;
    }
  }

  /**
   * Validate current session
   */
  async validateSession(): Promise<boolean> {
    if (!this.provider) return false;

    const tokens = tokenManager.getTokens();
    if (!tokens) return false;

    // Check token expiration
    if (!tokenManager.isTokenValid()) {
      // Try to refresh token
      if (tokens.refreshToken) {
        return await this.refreshAccessToken();
      }
      return false;
    }

    return true;
  }

  /**
   * Listen for token changes across tabs
   */
  onTokenChange(callback: (tokens: SSOTokens | null) => void): () => void {
    return tokenManager.onTokenChange(callback);
  }
}

// Export singleton instance
export const ssoService = new SSOService();
