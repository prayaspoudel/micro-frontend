/**
 * Azure AD SSO Provider
 */

import { BaseProvider } from './BaseProvider';
import { SSOConfig, SSOTokens, SSOUser } from '../types';
import { retrievePKCEVerifier } from '../PKCEHelper';

export class AzureADProvider extends BaseProvider {
  private tenantId: string;

  constructor(config: SSOConfig) {
    super(config);
    // Extract tenant ID from domain or use common
    this.tenantId = this.extractTenantId(config.domain);
  }

  private extractTenantId(domain: string): string {
    // Domain can be either tenant ID or tenant name
    return domain || 'common';
  }

  protected getAuthorizationEndpoint(): string {
    return `https://login.microsoftonline.com/${this.tenantId}/oauth2/v2.0/authorize`;
  }

  protected getTokenEndpoint(): string {
    return `https://login.microsoftonline.com/${this.tenantId}/oauth2/v2.0/token`;
  }

  protected getUserInfoEndpoint(): string {
    return 'https://graph.microsoft.com/v1.0/me';
  }

  protected getLogoutEndpoint(): string {
    return `https://login.microsoftonline.com/${this.tenantId}/oauth2/v2.0/logout`;
  }

  protected getRevokeEndpoint(): string {
    // Azure AD doesn't have a dedicated revoke endpoint
    return `https://login.microsoftonline.com/${this.tenantId}/oauth2/v2.0/logout`;
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
      scope: this.config.scope,
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
        scope: this.config.scope,
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
      email: data.mail || data.userPrincipalName,
      firstName: data.givenName || '',
      lastName: data.surname || '',
      name: data.displayName || data.userPrincipalName,
      picture: data.photo,
      roles: data.roles || [],
      permissions: data.permissions || [],
    };
  }

  async revokeToken(token: string): Promise<void> {
    // Azure AD handles token revocation through logout
    // No explicit revoke needed
    console.log('Azure AD token revocation handled through logout');
  }

  async logout(): Promise<void> {
    const logoutUrl = this.getLogoutEndpoint();
    const params = new URLSearchParams({
      post_logout_redirect_uri: this.config.logoutRedirectUri,
    });

    window.location.href = `${logoutUrl}?${params.toString()}`;
  }
}
