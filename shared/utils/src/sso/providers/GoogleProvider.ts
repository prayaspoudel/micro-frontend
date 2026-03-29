/**
 * Google Workspace SSO Provider
 */

import { BaseProvider } from './BaseProvider';
import { SSOConfig, SSOTokens, SSOUser } from '../types';
import { retrievePKCEVerifier } from '../PKCEHelper';

export class GoogleProvider extends BaseProvider {
  constructor(config: SSOConfig) {
    super(config);
  }

  protected getAuthorizationEndpoint(): string {
    return 'https://accounts.google.com/o/oauth2/v2/auth';
  }

  protected getTokenEndpoint(): string {
    return 'https://oauth2.googleapis.com/token';
  }

  protected getUserInfoEndpoint(): string {
    return 'https://www.googleapis.com/oauth2/v2/userinfo';
  }

  protected getLogoutEndpoint(): string {
    // Google doesn't have a centralized logout endpoint
    return 'https://accounts.google.com/Logout';
  }

  protected getRevokeEndpoint(): string {
    return 'https://oauth2.googleapis.com/revoke';
  }

  async handleCallback(code: string, state: string): Promise<SSOTokens> {
    const storedState = this.retrieveState(state);
    if (!storedState) {
      throw new Error('Invalid state parameter');
    }

    const tokenParams: Record<string, string> = {
      grant_type: 'authorization_code',
      client_id: this.config.clientId,
      code,
      redirect_uri: this.config.redirectUri,
    };

    if (this.config.usePKCE) {
      const verifier = retrievePKCEVerifier();
      if (!verifier) {
        throw new Error('PKCE verifier not found');
      }
      tokenParams.code_verifier = verifier;
    }

    const response = await fetch(this.getTokenEndpoint(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(tokenParams),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error_description || 'Token exchange failed');
    }

    const data = await response.json();

    return {
      accessToken: data.access_token,
      idToken: data.id_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
      tokenType: data.token_type,
      scope: data.scope,
    };
  }

  async refreshToken(refreshToken: string): Promise<SSOTokens> {
    const response = await fetch(this.getTokenEndpoint(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: this.config.clientId,
        refresh_token: refreshToken,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error_description || 'Token refresh failed');
    }

    const data = await response.json();

    return {
      accessToken: data.access_token,
      idToken: data.id_token,
      refreshToken: data.refresh_token || refreshToken,
      expiresIn: data.expires_in,
      tokenType: data.token_type,
      scope: data.scope,
    };
  }

  async getUserInfo(accessToken: string): Promise<SSOUser> {
    const response = await fetch(this.getUserInfoEndpoint(), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user info');
    }

    const data = await response.json();

    return {
      id: data.id,
      email: data.email,
      firstName: data.given_name || '',
      lastName: data.family_name || '',
      name: data.name || data.email,
      picture: data.picture,
      roles: [],
      permissions: [],
    };
  }

  async revokeToken(token: string): Promise<void> {
    await fetch(this.getRevokeEndpoint(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        token,
      }),
    });
  }

  async logout(): Promise<void> {
    // Google doesn't support programmatic logout with redirect
    // Clear local session and redirect to login
    window.location.href = this.config.logoutRedirectUri;
  }
}
