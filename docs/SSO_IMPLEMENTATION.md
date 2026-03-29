# SSO Implementation Guide

## Overview

This document provides comprehensive guidance on implementing and configuring Single Sign-On (SSO) for the micro-frontend platform.

## Supported Providers

- Auth0
- Okta
- Keycloak
- Azure AD
- Google Workspace
- Mock (for development)

## Quick Start

### 1. Enable SSO

Create `.env` file:

```env
VITE_USE_SSO=true
VITE_SSO_PROVIDER=mock
```

### 2. Configure Provider

For production, configure your SSO provider:

```env
VITE_SSO_PROVIDER=auth0
VITE_SSO_CLIENT_ID=your_client_id
VITE_SSO_DOMAIN=your-tenant.auth0.com
VITE_SSO_REDIRECT_URI=http://localhost:3000/callback
VITE_SSO_LOGOUT_REDIRECT_URI=http://localhost:3000/login
```

### 3. Build and Run

```bash
npm run build
npm run start
```

## Configuration

See `.env.example` for all available configuration options.

## Provider Setup

### Auth0

1. Create SPA application in Auth0 Dashboard
2. Configure callback URLs: `http://localhost:3000/callback`
3. Set environment variables with Auth0 credentials

### Okta

1. Create SPA application in Okta Admin Console
2. Enable Authorization Code with PKCE
3. Configure redirect URIs
4. Set environment variables with Okta credentials

### Other Providers

See full documentation for Keycloak, Azure AD, and Google Workspace setup instructions.

## Development Mode

Use mock provider for development:

```env
VITE_USE_SSO=true
VITE_SSO_PROVIDER=mock
```

Or disable SSO:

```env
VITE_USE_SSO=false
```

## Security

- Always use HTTPS in production
- Enable PKCE (enabled by default)
- Implement proper CORS configuration
- Use secure token storage
- Set appropriate session timeouts

## Troubleshooting

### Common Issues

1. **Invalid state parameter**: Clear browser cache/session storage
2. **PKCE verifier not found**: Ensure session storage is enabled
3. **CORS errors**: Check provider configuration for allowed origins
4. **Token refresh failures**: User must log in again

## Architecture

The SSO implementation includes:

- **SSO Service**: Main orchestrator (`shared/utils/src/sso/`)
- **Token Manager**: JWT token handling
- **Provider Implementations**: Auth0, Okta, Keycloak, Azure AD, Google
- **Auth Store Integration**: Zustand store with SSO methods
- **UI Components**: SSO login buttons and error displays

## API Reference

### SSO Service

```typescript
import { ssoService } from '@shared/utils';

// Login
await ssoService.login();

// Handle callback
const user = await ssoService.handleCallback(code, state);

// Logout
await ssoService.logout();

// Check authentication
const isAuth = ssoService.isAuthenticated();
```

### Auth Store

```typescript
import { useAuthStore } from '@shared/state';

const { loginWithSSO, handleSSOCallback, logout } = useAuthStore();

// SSO login
await loginWithSSO();

// Handle callback
await handleSSOCallback(code, state);
```

## Support

For issues or questions, refer to the full documentation or open a GitHub issue.
