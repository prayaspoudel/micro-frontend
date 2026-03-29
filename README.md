# Micro-Frontend Platform

A modular micro-frontend architecture with SSO authentication support.

## Features

- 🔐 **Single Sign-On (SSO)** - Support for multiple SSO providers
- 🏢 **Multi-tenant** - Company-based access control
- 📦 **Module Federation** - Dynamically loaded micro-frontends
- 🎨 **Themed UI** - Shared component library
- 🔒 **RBAC** - Role-based access control

## SSO Authentication

The platform supports SSO authentication with the following providers:

- Auth0
- Okta  
- Keycloak
- Azure AD
- Google Workspace
- Mock (for development)

### Quick Start with SSO

1. Copy the environment example file:
   ```bash
   cp .env.example .env
   ```

2. Configure your SSO provider:
   ```env
   VITE_USE_SSO=true
   VITE_SSO_PROVIDER=mock
   ```

3. For development, use the mock provider or disable SSO:
   ```env
   VITE_USE_SSO=false
   ```

4. Build and run:
   ```bash
   npm install
   npm run build
   npm run start
   ```

### Documentation

See [SSO Implementation Guide](./docs/SSO_IMPLEMENTATION.md) for complete setup instructions.

## Project Structure

```
micro-frontend/
├── host/                    # Main host application
├── apps/                    # Micro-frontend modules
│   ├── crm-module/
│   ├── inventory-module/
│   ├── hr-module/
│   ├── finance-module/
│   ├── task-module/
│   └── health-module/
├── shared/                  # Shared libraries
│   ├── state/              # Zustand state management
│   ├── ui-components/      # Shared UI components
│   └── utils/              # Utilities (including SSO)
├── backends/               # Mock backend data
└── docs/                   # Documentation

```

## Modules

- **CRM** - Customer relationship management
- **Inventory** - Inventory management
- **HR** - Human resources
- **Finance** - Financial management
- **Task** - Task management
- **Health** - Health & wellness

## Development

```bash
# Install dependencies
npm install

# Start development servers
npm run dev

# Build all modules
npm run build

# Run production preview
npm run start
```

## Environment Variables

See `.env.example` for all available configuration options.

## License

All rights reserved.
