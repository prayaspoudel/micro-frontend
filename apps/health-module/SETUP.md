# Health Module - Complete Setup Guide

This guide will walk you through setting up the health-module micro-frontend and connecting it to the Evero Healthcare backend.

## Prerequisites

- Node.js 18+ installed
- Go 1.20+ installed (for Evero backend)
- PostgreSQL running (for Evero backend)
- npm or yarn

## Step 1: Install Dependencies

### Health Module (Micro-Frontend)

```bash
cd micro-frontend/apps/health-module
npm install
```

### Install all workspace dependencies (if not done already)

```bash
cd micro-frontend
npm install
```

## Step 2: Setup Evero Healthcare Backend

### 2.1 Configure Database

Ensure your PostgreSQL database is running and configured in:
`evero/config/healthcare/local.json`

### 2.2 Enable CORS in Evero Backend

**Important**: To allow the frontend to communicate with the backend, you must enable CORS.

See detailed instructions in: [evero/docs/healthcare/CORS_SETUP.md](../../../evero/docs/healthcare/CORS_SETUP.md)

**Quick Setup** - Add to `evero/modules/healthcare/app/bootstrap.go`:

```go
import (
    // ... existing imports
    "github.com/gofiber/fiber/v2/middleware/cors"
)

func Bootstrap(config *BootstrapConfig) {
    // ... existing code ...

    // Enable CORS BEFORE setting up routes
    config.App.Use(cors.New(cors.Config{
        AllowOrigins:     "http://localhost:3000,http://localhost:3006",
        AllowHeaders:     "Origin, Content-Type, Accept, Authorization",
        AllowMethods:     "GET, POST, PUT, PATCH, DELETE, OPTIONS",
        AllowCredentials: true,
    }))

    // ... rest of the code
}
```

### 2.3 Start Evero Healthcare Backend

```bash
cd evero/app/healthcare
go run main.go
```

The backend should start on `http://localhost:8080` (or as configured).

Verify it's running:
```bash
curl http://localhost:8080/api/users
```

## Step 3: Configure Environment Variables

The health-module already has environment files created:
- `.env` - Base configuration
- `.env.development` - Development settings
- `.env.production` - Production settings

Verify the backend URL is correct in `.env.development`:
```
VITE_HEALTHCARE_API_URL=http://localhost:8080
```

## Step 4: Run Health Module Standalone (Optional)

To test the health module independently:

```bash
cd micro-frontend/apps/health-module
npm run dev
```

Visit: `http://localhost:3006`

## Step 5: Run Complete Micro-Frontend System

### 5.1 Build all modules

```bash
cd micro-frontend
npm run build
```

### 5.2 Start all services

```bash
npm run serve:only
```

This will start:
- Host app on port 3000
- CRM module on port 3001
- Inventory module on port 3002
- HR module on port 3003
- Finance module on port 3004
- Task module on port 3005
- **Health module on port 3006** ✨

### 5.3 Access the application

Visit: `http://localhost:3000`

Navigate to Health module: `http://localhost:3000/health`

## Step 6: Testing the Integration

### 6.1 Register a User

Using curl or Postman:
```bash
curl -X POST http://localhost:8080/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "testpass123",
    "name": "Test User"
  }'
```

### 6.2 Login

```bash
curl -X POST http://localhost:8080/api/users/_login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "testpass123"
  }'
```

Save the token from the response.

### 6.3 Create Test Contacts (Patients)

```bash
curl -X POST http://localhost:8080/api/contacts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phone": "+1-555-1234"
  }'
```

### 6.4 Test in Health Module UI

1. Go to `http://localhost:3000/health` (or `http://localhost:3006` standalone)
2. Login with your test user
3. Navigate to Patients page
4. You should see the contacts you created

## Architecture Overview

```
┌─────────────────────────────────────────┐
│  Micro-Frontend (Health Module)         │
│  http://localhost:3006                   │
│  - React + TypeScript                    │
│  - Vite + Module Federation             │
└───────────────┬─────────────────────────┘
                │
                │ HTTP/REST API
                │ (CORS enabled)
                ▼
┌─────────────────────────────────────────┐
│  Evero Healthcare Backend               │
│  http://localhost:8080                   │
│  - Go + Fiber framework                 │
│  - RESTful API                          │
└───────────────┬─────────────────────────┘
                │
                │ SQL
                ▼
┌─────────────────────────────────────────┐
│  PostgreSQL Database                     │
│  - Users, Contacts, Addresses           │
└─────────────────────────────────────────┘
```

## Available API Endpoints

### Authentication
- `POST /api/users` - Register
- `POST /api/users/_login` - Login
- `GET /api/users/_current` - Get current user
- `DELETE /api/users` - Logout

### Contacts (Patients)
- `GET /api/contacts` - List contacts
- `POST /api/contacts` - Create contact
- `GET /api/contacts/:id` - Get contact details
- `PUT /api/contacts/:id` - Update contact
- `DELETE /api/contacts/:id` - Delete contact

### Addresses
- `GET /api/contacts/:contactId/addresses` - List addresses
- `POST /api/contacts/:contactId/addresses` - Create address
- `GET /api/contacts/:contactId/addresses/:addressId` - Get address
- `PUT /api/contacts/:contactId/addresses/:addressId` - Update address
- `DELETE /api/contacts/:contactId/addresses/:addressId` - Delete address

## Module Features

### Dashboard
- Display healthcare metrics
- Recent activity
- Quick stats

### Patients
- List all patients (from contacts API)
- View patient details
- Create/Update/Delete patients

### Contacts
- Grid view of all contacts
- Contact information cards

### Appointments
- Coming soon

## Troubleshooting

### Issue: CORS errors in browser

**Solution**: Make sure CORS is enabled in the Evero backend. See [CORS_SETUP.md](../../../evero/docs/healthcare/CORS_SETUP.md)

### Issue: Cannot connect to backend

**Checklist**:
1. Is Evero backend running? `curl http://localhost:8080/api/users`
2. Is the port correct in `.env.development`?
3. Check browser console for errors

### Issue: 401 Unauthorized errors

**Solution**: 
- Make sure you're logged in
- Check that token is stored in localStorage
- Token might be expired - login again

### Issue: Module not loading in host

**Checklist**:
1. Is health-module running on port 3006?
2. Check host's `vite.config.ts` includes health-app
3. Verify `ModuleRegistry.ts` has health module registered
4. Check browser console for module federation errors

### Issue: Empty data in UI

**Solution**:
- Create test data using the API (see Step 6)
- Check network tab in browser dev tools
- Verify API responses

## Development Tips

1. **Hot Reload**: Vite provides hot module replacement. Changes in code will reflect immediately.

2. **API Changes**: If you modify Evero backend API, update the API service in:
   `health-module/src/services/api.ts`

3. **Styling**: Update theme in `health-module/src/theme.ts`

4. **New Pages**: Add new page components in `src/pages/` and update routes in `App.tsx`

5. **Shared Components**: Use shared UI components from `@shared/ui-components`

## Next Steps

- [ ] Add appointment scheduling functionality
- [ ] Implement real-time notifications using WebSocket
- [ ] Add patient medical records
- [ ] Implement advanced search and filtering
- [ ] Add data visualization/charts
- [ ] Implement role-based access control

## Support

For issues specific to:
- **Health Module**: Check `micro-frontend/apps/health-module/README.md`
- **CORS Setup**: See `evero/docs/healthcare/CORS_SETUP.md`
- **Evero Backend**: Check Evero documentation

## License

Private - Union Products
