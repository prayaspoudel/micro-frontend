# Health Module

A healthcare management micro-frontend application that communicates with the Evero Healthcare backend.

## Overview

The Health Module is part of the micro-frontend architecture and provides healthcare management features including:
- Patient management
- Contact management
- Appointment scheduling
- Healthcare dashboard with key metrics

## Architecture

This module connects to the Evero Healthcare backend API, which is a Go-based application running separately. The communication happens through RESTful APIs.

### Technology Stack
- **Frontend**: React 18 with TypeScript
- **UI**: Styled Components
- **State Management**: Zustand (via shared state)
- **Build Tool**: Vite
- **Module Federation**: @originjs/vite-plugin-federation
- **Backend**: Evero Healthcare (Go/Fiber)

## API Integration

The health module communicates with the Evero Healthcare app through the following endpoints:

### User Management
- `POST /api/users` - Register new user
- `POST /api/users/_login` - User login
- `GET /api/users/_current` - Get current user
- `DELETE /api/users` - Logout

### Contact Management (Patients)
- `GET /api/contacts` - List all contacts/patients
- `GET /api/contacts/:contactId` - Get contact details
- `POST /api/contacts` - Create new contact
- `PUT /api/contacts/:contactId` - Update contact
- `DELETE /api/contacts/:contactId` - Delete contact

### Address Management
- `GET /api/contacts/:contactId/addresses` - List addresses
- `POST /api/contacts/:contactId/addresses` - Create address
- `PUT /api/contacts/:contactId/addresses/:addressId` - Update address
- `DELETE /api/contacts/:contactId/addresses/:addressId` - Delete address

## Configuration

### Environment Variables

The module uses the following environment variables:

- `VITE_HEALTHCARE_API_URL` - URL of the Evero Healthcare API
  - Default (development): `http://localhost:8080`
  - Production: `https://api.healthcare.yourdomain.com`

Configuration files:
- `.env` - Base configuration
- `.env.development` - Development environment
- `.env.production` - Production environment

## Development

### Prerequisites
- Node.js 18+
- npm or yarn
- Evero Healthcare backend running (default: http://localhost:8080)

### Installation

```bash
cd micro-frontend/apps/health-module
npm install
```

### Running Standalone

```bash
npm run dev
```

The module will be available at `http://localhost:3006`

### Building

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Integration with Host App

The health module is automatically loaded by the host application when:
1. User navigates to `/health/*` routes
2. User has appropriate permissions (`health.read`, `health.write`)

### Module Federation Configuration

**Port**: 3006  
**Remote Entry**: `http://localhost:3006/assets/remoteEntry.js`  
**Exposed Component**: `./App`

## Connecting to Evero Healthcare Backend

### Step 1: Start Evero Healthcare App

```bash
cd evero/app/healthcare
go run main.go
```

The healthcare backend should start on port 8080 (or as configured).

### Step 2: Configure Environment

Update `.env.development` or `.env` with the correct backend URL:

```
VITE_HEALTHCARE_API_URL=http://localhost:8080
```

### Step 3: Authentication

The health module uses token-based authentication. Tokens are:
- Obtained via `/api/users/_login` endpoint
- Stored in `localStorage` with key `token`
- Sent in `Authorization` header as `Bearer {token}`

## Project Structure

```
health-module/
├── src/
│   ├── pages/
│   │   ├── Dashboard.tsx        # Healthcare dashboard
│   │   ├── Patients.tsx         # Patient list
│   │   ├── PatientDetails.tsx   # Patient details
│   │   ├── Contacts.tsx         # Contact management
│   │   └── Appointments.tsx     # Appointment management
│   ├── services/
│   │   └── api.ts              # API service for Evero backend
│   ├── App.tsx                 # Main app component
│   ├── main.tsx                # Entry point
│   └── theme.ts                # Theme configuration
├── index.html
├── package.json
├── vite.config.ts
├── .env
├── .env.development
└── .env.production
```

## Features

### Dashboard
- Total patients count
- Active contacts count
- Today's appointments
- Pending tasks

### Patient Management
- View all patients (contacts from Evero)
- View patient details
- Create new patients
- Update patient information
- Delete patients

### Contact Management
- View contacts in card grid
- Contact information display

### Appointments
- Coming soon

## Data Flow

```
Health Module (React) 
    ↓ (HTTP/REST)
Evero Healthcare Backend (Go/Fiber)
    ↓
PostgreSQL Database
```

The health module makes HTTP requests to the Evero Healthcare backend, which processes the requests and interacts with the database.

## Troubleshooting

### Cannot connect to backend
- Verify Evero Healthcare app is running: `http://localhost:8080`
- Check CORS configuration in Evero backend
- Verify `VITE_HEALTHCARE_API_URL` in environment files

### Authentication errors
- Ensure you're logged in via `/api/users/_login`
- Check that token is stored in localStorage
- Verify token is not expired

### Module not loading in host
- Ensure health module is running on port 3006
- Check host's vite.config.ts includes health-app remote
- Verify Module Registry includes health module

## License

Private - Union Products
