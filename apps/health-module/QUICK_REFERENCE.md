# Health Module - Quick Reference

## Quick Start Commands

### Start Evero Healthcare Backend
```bash
cd evero/app/healthcare
go run main.go
```
Backend will run on: `http://localhost:8080`

### Start Health Module (Standalone)
```bash
cd micro-frontend/apps/health-module
npm run dev
```
Access at: `http://localhost:3006`

### Start Complete Micro-Frontend System
```bash
cd micro-frontend
npm run build
npm run serve:only
```
Access at: `http://localhost:3000/health`

## Ports

| Service | Port | URL |
|---------|------|-----|
| Evero Healthcare API | 8080 | http://localhost:8080 |
| Host App | 3000 | http://localhost:3000 |
| CRM Module | 3001 | http://localhost:3001 |
| Inventory Module | 3002 | http://localhost:3002 |
| HR Module | 3003 | http://localhost:3003 |
| Finance Module | 3004 | http://localhost:3004 |
| Task Module | 3005 | http://localhost:3005 |
| **Health Module** | **3006** | **http://localhost:3006** |

## Key API Endpoints

### Authentication
```bash
# Register
POST http://localhost:8080/api/users
Content-Type: application/json
{
  "username": "user",
  "password": "pass",
  "name": "Name"
}

# Login
POST http://localhost:8080/api/users/_login
Content-Type: application/json
{
  "username": "user",
  "password": "pass"
}

# Get Current User
GET http://localhost:8080/api/users/_current
Authorization: Bearer {token}

# Logout
DELETE http://localhost:8080/api/users
Authorization: Bearer {token}
```

### Contacts/Patients
```bash
# List Contacts
GET http://localhost:8080/api/contacts
Authorization: Bearer {token}

# Create Contact
POST http://localhost:8080/api/contacts
Authorization: Bearer {token}
Content-Type: application/json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "+1-555-1234"
}

# Get Contact
GET http://localhost:8080/api/contacts/{id}
Authorization: Bearer {token}

# Update Contact
PUT http://localhost:8080/api/contacts/{id}
Authorization: Bearer {token}
Content-Type: application/json
{
  "firstName": "Jane",
  "lastName": "Doe",
  "email": "jane@example.com",
  "phone": "+1-555-5678"
}

# Delete Contact
DELETE http://localhost:8080/api/contacts/{id}
Authorization: Bearer {token}
```

## Environment Variables

File: `micro-frontend/apps/health-module/.env.development`
```bash
VITE_HEALTHCARE_API_URL=http://localhost:8080
```

File: `micro-frontend/apps/health-module/.env.production`
```bash
VITE_HEALTHCARE_API_URL=https://api.healthcare.yourdomain.com
```

## CORS Setup (Required!)

Add to `evero/modules/healthcare/app/bootstrap.go`:
```go
import "github.com/gofiber/fiber/v2/middleware/cors"

func Bootstrap(config *BootstrapConfig) {
    // ... existing code ...
    
    // Add this BEFORE routeConfig.Setup()
    config.App.Use(cors.New(cors.Config{
        AllowOrigins: "http://localhost:3000,http://localhost:3006",
        AllowHeaders: "Origin, Content-Type, Accept, Authorization",
        AllowMethods: "GET, POST, PUT, PATCH, DELETE, OPTIONS",
        AllowCredentials: true,
    }))
    
    routeConfig := route.RouteConfig{
        // ... rest of code
    }
    routeConfig.Setup()
}
```

## Build Commands

```bash
# Build health module only
cd micro-frontend/apps/health-module
npm run build

# Build all modules
cd micro-frontend
npm run build

# Preview production build
cd micro-frontend/apps/health-module
npm run preview
```

## Testing

```bash
# Check if Evero backend is running
curl http://localhost:8080/api/users

# Check if health module is accessible
curl http://localhost:3006

# Check CORS
curl -X OPTIONS http://localhost:8080/api/contacts \
  -H "Origin: http://localhost:3006" \
  -H "Access-Control-Request-Method: GET" \
  -v
```

## Troubleshooting

### CORS errors in browser
```bash
# Verify CORS middleware is added to Evero backend
# Check evero/modules/healthcare/app/bootstrap.go
```

### Cannot connect to backend
```bash
# Check if backend is running
curl http://localhost:8080/api/users

# Check environment variable
cat micro-frontend/apps/health-module/.env.development
```

### Module not loading
```bash
# Check if health module is running
curl http://localhost:3006

# Rebuild
cd micro-frontend/apps/health-module
npm run build
```

### 401 Unauthorized
```bash
# Login again and save token
# Token might be expired
```

## File Locations

### Health Module Files
- App: `micro-frontend/apps/health-module/src/App.tsx`
- API Service: `micro-frontend/apps/health-module/src/services/api.ts`
- Pages: `micro-frontend/apps/health-module/src/pages/`
- Config: `micro-frontend/apps/health-module/vite.config.ts`

### Host Integration Files
- Routes: `micro-frontend/host/src/App.tsx`
- Module Loader: `micro-frontend/host/src/utils/SharedModuleLoader.ts`
- Registry: `micro-frontend/host/src/utils/ModuleRegistry.ts`
- Vite Config: `micro-frontend/host/vite.config.ts`

### Evero Backend Files
- Main: `evero/app/healthcare/main.go`
- Bootstrap: `evero/modules/healthcare/app/bootstrap.go`
- Routes: `evero/modules/healthcare/delivery/http/route/route.go`
- Controllers: `evero/modules/healthcare/delivery/http/`

## Documentation

- [README.md](README.md) - Module overview
- [SETUP.md](SETUP.md) - Complete setup guide
- [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) - Implementation details
- [../../../evero/docs/healthcare/CORS_SETUP.md](../../../evero/docs/healthcare/CORS_SETUP.md) - CORS configuration

## Support Contacts

- Health Module Issues: Check `micro-frontend/apps/health-module/README.md`
- Evero Backend Issues: Check Evero documentation
- CORS Issues: See `evero/docs/healthcare/CORS_SETUP.md`
