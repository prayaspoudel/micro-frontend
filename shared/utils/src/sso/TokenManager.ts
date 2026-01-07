/**
 * Token Manager
 * Handles JWT token storage, validation, and refresh
 */

import { SSOTokens, TokenRefreshConfig } from './types';

const TOKEN_STORAGE_KEY = 'sso_tokens';
const REFRESH_TIMER_KEY = 'token_refresh_timer';

export class TokenManager {
  private refreshTimer: number | null = null;
  private refreshConfig: TokenRefreshConfig = {
    refreshBeforeExpiry: 300, // 5 minutes
    maxRetries: 3,
    retryDelay: 1000,
  };

  /**
   * Store tokens securely
   * WARNING: localStorage is vulnerable to XSS attacks. In production:
   * - Consider using httpOnly cookies (requires backend support)
   * - Implement Content Security Policy (CSP)
   * - Use proper XSS sanitization throughout the application
   */
  storeTokens(tokens: SSOTokens): void {
    const expiresAt = Date.now() + tokens.expiresIn * 1000;
    const tokensWithExpiry = {
      ...tokens,
      expiresAt,
    };
    
    try {
      // Store in localStorage (see security warning above)
      localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokensWithExpiry));
      
      // Broadcast token update to other tabs
      this.broadcastTokenUpdate(tokensWithExpiry);
    } catch (error) {
      console.error('Failed to store tokens:', error);
    }
  }

  /**
   * Retrieve stored tokens
   */
  getTokens(): SSOTokens | null {
    try {
      const tokensStr = localStorage.getItem(TOKEN_STORAGE_KEY);
      if (!tokensStr) return null;
      
      const tokens = JSON.parse(tokensStr) as SSOTokens;
      
      // Check if token is expired
      if (tokens.expiresAt && tokens.expiresAt < Date.now()) {
        this.clearTokens();
        return null;
      }
      
      return tokens;
    } catch (error) {
      console.error('Failed to retrieve tokens:', error);
      return null;
    }
  }

  /**
   * Clear stored tokens
   */
  clearTokens(): void {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    this.stopRefreshTimer();
    this.broadcastTokenClear();
  }

  /**
   * Check if access token is valid and not expired
   */
  isTokenValid(): boolean {
    const tokens = this.getTokens();
    if (!tokens || !tokens.expiresAt) return false;
    
    // Token is valid if it expires in more than 1 minute
    return tokens.expiresAt > Date.now() + 60000;
  }

  /**
   * Check if token needs refresh
   */
  needsRefresh(): boolean {
    const tokens = this.getTokens();
    if (!tokens || !tokens.expiresAt || !tokens.refreshToken) return false;
    
    const refreshTime = tokens.expiresAt - this.refreshConfig.refreshBeforeExpiry * 1000;
    return Date.now() >= refreshTime;
  }

  /**
   * Get time until token refresh (in milliseconds)
   */
  getTimeUntilRefresh(): number {
    const tokens = this.getTokens();
    if (!tokens || !tokens.expiresAt) return 0;
    
    const refreshTime = tokens.expiresAt - this.refreshConfig.refreshBeforeExpiry * 1000;
    return Math.max(0, refreshTime - Date.now());
  }

  /**
   * Start automatic token refresh timer
   */
  startRefreshTimer(onRefresh: () => Promise<void>): void {
    this.stopRefreshTimer();
    
    const scheduleRefresh = () => {
      const timeUntilRefresh = this.getTimeUntilRefresh();
      
      if (timeUntilRefresh > 0) {
        this.refreshTimer = window.setTimeout(async () => {
          try {
            await onRefresh();
            scheduleRefresh(); // Schedule next refresh
          } catch (error) {
            console.error('Token refresh failed:', error);
            // Retry after delay
            this.refreshTimer = window.setTimeout(scheduleRefresh, this.refreshConfig.retryDelay);
          }
        }, timeUntilRefresh);
      }
    };
    
    scheduleRefresh();
  }

  /**
   * Stop automatic token refresh timer
   */
  stopRefreshTimer(): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  /**
   * Decode JWT token (without verification)
   * NOTE: This only validates token structure, not signature
   * Do NOT use for security decisions - tokens must be validated server-side
   */
  decodeToken(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Failed to decode token:', error);
      return null;
    }
  }

  /**
   * Validate token structure
   */
  validateTokenStructure(token: string): boolean {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return false;
      
      const payload = this.decodeToken(token);
      if (!payload) return false;
      
      // Check for required claims
      return !!(payload.exp && payload.iat);
    } catch (error) {
      return false;
    }
  }

  /**
   * Broadcast token update to other tabs
   */
  private broadcastTokenUpdate(tokens: SSOTokens): void {
    try {
      const event = new StorageEvent('storage', {
        key: TOKEN_STORAGE_KEY,
        newValue: JSON.stringify(tokens),
        url: window.location.href,
      });
      window.dispatchEvent(event);
    } catch (error) {
      console.error('Failed to broadcast token update:', error);
    }
  }

  /**
   * Broadcast token clear to other tabs
   */
  private broadcastTokenClear(): void {
    try {
      const event = new StorageEvent('storage', {
        key: TOKEN_STORAGE_KEY,
        newValue: null,
        url: window.location.href,
      });
      window.dispatchEvent(event);
    } catch (error) {
      console.error('Failed to broadcast token clear:', error);
    }
  }

  /**
   * Listen for token changes from other tabs
   */
  onTokenChange(callback: (tokens: SSOTokens | null) => void): () => void {
    const handler = (event: StorageEvent) => {
      if (event.key === TOKEN_STORAGE_KEY) {
        const tokens = event.newValue ? JSON.parse(event.newValue) : null;
        callback(tokens);
      }
    };
    
    window.addEventListener('storage', handler);
    
    // Return cleanup function
    return () => window.removeEventListener('storage', handler);
  }
}

export const tokenManager = new TokenManager();
