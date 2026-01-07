/**
 * Mock SSO Provider for Testing
 */

import { BaseProvider } from './BaseProvider';
import { SSOConfig, SSOTokens, SSOUser } from '../types';

export class MockProvider extends BaseProvider {
  constructor(config: SSOConfig) {
    super(config);
  }

  protected getAuthorizationEndpoint(): string {
    return '/mock/authorize';
  }

  protected getTokenEndpoint(): string {
    return '/mock/token';
  }

  protected getUserInfoEndpoint(): string {
    return '/mock/userinfo';
  }

  protected getLogoutEndpoint(): string {
    return '/mock/logout';
  }

  protected getRevokeEndpoint(): string {
    return '/mock/revoke';
  }

  async login(): Promise<void> {
    // Simulate SSO login - redirect to callback with mock code
    const state = this.generateState();
    const code = 'mock_authorization_code_' + Date.now();
    
    // Store mock code in session
    sessionStorage.setItem('mock_code', code);
    
    // Redirect to callback
    const callbackUrl = new URL(this.config.redirectUri);
    callbackUrl.searchParams.set('code', code);
    callbackUrl.searchParams.set('state', state.state);
    
    window.location.href = callbackUrl.toString();
  }

  async handleCallback(code: string, state: string): Promise<SSOTokens> {
    const storedState = this.retrieveState(state);
    if (!storedState) {
      throw new Error('Invalid state parameter');
    }

    // Simulate token exchange delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Generate mock tokens
    const mockTokens: SSOTokens = {
      accessToken: 'mock_access_token_' + Date.now(),
      idToken: this.generateMockIdToken(),
      refreshToken: 'mock_refresh_token_' + Date.now(),
      expiresIn: 3600, // 1 hour
      tokenType: 'Bearer',
      scope: this.config.scope,
    };

    return mockTokens;
  }

  async refreshToken(refreshToken: string): Promise<SSOTokens> {
    // Simulate refresh delay
    await new Promise(resolve => setTimeout(resolve, 300));

    // Generate new mock tokens
    return {
      accessToken: 'mock_access_token_refreshed_' + Date.now(),
      idToken: this.generateMockIdToken(),
      refreshToken: refreshToken, // Keep same refresh token
      expiresIn: 3600,
      tokenType: 'Bearer',
      scope: this.config.scope,
    };
  }

  async getUserInfo(accessToken: string): Promise<SSOUser> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));

    // Return mock user
    return {
      id: 'mock_user_1',
      email: 'admin@techcorp.com',
      firstName: 'John',
      lastName: 'Admin',
      name: 'John Admin',
      picture: 'https://placehold.co/100x100?text=JA',
      roles: ['admin'],
      permissions: ['read', 'write', 'delete', 'admin'],
    };
  }

  async validateToken(token: string): Promise<boolean> {
    // Mock tokens are always valid if they start with 'mock_'
    return token.startsWith('mock_');
  }

  async revokeToken(token: string): Promise<void> {
    // Simulate revocation
    await new Promise(resolve => setTimeout(resolve, 100));
    console.log('Mock token revoked:', token);
  }

  async logout(): Promise<void> {
    // Clear session and redirect
    sessionStorage.removeItem('mock_code');
    window.location.href = this.config.logoutRedirectUri;
  }

  /**
   * Generate a mock ID token (JWT format)
   */
  private generateMockIdToken(): string {
    const header = { alg: 'RS256', typ: 'JWT' };
    const payload = {
      sub: 'mock_user_1',
      email: 'admin@techcorp.com',
      name: 'John Admin',
      given_name: 'John',
      family_name: 'Admin',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
    };
    
    const encodedHeader = btoa(JSON.stringify(header));
    const encodedPayload = btoa(JSON.stringify(payload));
    const signature = 'mock_signature';
    
    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }
}
