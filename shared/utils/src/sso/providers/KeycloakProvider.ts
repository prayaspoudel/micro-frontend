/**
 * Keycloak SSO Provider
 */

import { BaseProvider } from './BaseProvider';
import { SSOConfig, SSOTokens, SSOUser } from '../types';
import { retrievePKCEVerifier } from '../PKCEHelper';

export class KeycloakProvider extends BaseProvider {
  private realm: string;

  constructor(config: SSOConfig) {
    super(config);
    // Extract realm from domain (format: domain/realms/realm-name)
    this.realm = this.extractRealm(config.domain);
  }

  private extractRealm(domain: string): string {
    const match = domain.match(/\/realms\/([^/]+)/);
    return match ? match[1] : 'master';
  }

  private getBaseUrl(): string {
    return this.config.domain.split('/realms/')[0];
  }

  protected getAuthorizationEndpoint(): string {
    return `${this.getBaseUrl()}/realms/${this.realm}/protocol/openid-connect/auth`;
  }

  protected getTokenEndpoint(): string {
    return `${this.getBaseUrl()}/realms/${this.realm}/protocol/openid-connect/token`;
  }

  protected getUserInfoEndpoint(): string {
    return `${this.getBaseUrl()}/realms/${this.realm}/protocol/openid-connect/userinfo`;
  }

  protected getLogoutEndpoint(): string {
    return `${this.getBaseUrl()}/realms/${this.realm}/protocol/openid-connect/logout`;
  }

  protected getRevokeEndpoint(): string {
    return `${this.getBaseUrl()}/realms/${this.realm}/protocol/openid-connect/revoke`;
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
      id: data.sub,
      email: data.email,
      firstName: data.given_name || data.name?.split(' ')[0] || '',
      lastName: data.family_name || data.name?.split(' ')[1] || '',
      name: data.name || data.preferred_username || data.email,
      picture: data.picture,
      roles: data.realm_access?.roles || [],
      permissions: data.permissions || [],
    };
  }

  async revokeToken(token: string): Promise<void> {
    await fetch(this.getRevokeEndpoint(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: this.config.clientId,
        token,
      }),
    });
  }

  async logout(): Promise<void> {
    const logoutUrl = this.getLogoutEndpoint();
    const params = new URLSearchParams({
      redirect_uri: this.config.logoutRedirectUri,
    });

    window.location.href = `${logoutUrl}?${params.toString()}`;
  }
}
