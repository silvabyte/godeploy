# GoDeploy API Architecture Overview

## 1. Project Structure

### 1.1 Core Directories

- `src/` – Application source code
  - `app/` – Core application logic
  - `assets/` – Static assets
  - `logging/` – Logging setup and configurations
- `supabase/` – Database migrations and configurations
- `scripts/` – Utility and helper scripts
- `tests/` – Automated test suite

### 1.2 Application Components (`src/app/`)

- `routes/` – API route definitions and handlers
- `services/` – Business logic and service layers
- `plugins/` – Fastify plugins for extended functionality
- `utils/` – Common utility functions
- `tests/` – Tests for application logic and endpoints

## 2. Core Services

### 2.1 Database Service (`DatabaseService.ts`)

- **Purpose:** Handle database interactions
- **Capabilities:**
  - Project and tenant management
  - User data management
  - Deployment history management
- **Technology:** Supabase PostgreSQL

### 2.2 Storage Service (`storageService.ts`)

- **Purpose:** Manage asset storage and retrieval
- **Capabilities:**
  - Upload and manage SPA builds
  - Integrate with CDN
- **Technology:** DigitalOcean Spaces

## 3. API Routes

### 3.1 Authentication (`auth.ts`)

- **Purpose:** User authentication and authorization
- **Endpoints:**
  - Magic link login
  - Token validation
  - Session handling

### 3.2 Projects (`projects.ts`)

- **Purpose:** Project lifecycle management
- **Endpoints:**
  - Create, read, update, delete projects
  - Manage project settings
  - Fetch project status

### 3.3 Deployment (`deploy.ts`)

- **Purpose:** SPA deployment process
- **Endpoints:**
  - Build file uploads
  - Initiate deployments
  - Track deployment status

### 3.4 Health (`health.ts`)

- **Purpose:** Application health checks
- **Endpoints:**
  - Basic health check
  - System status reporting

## 4. Data Model

### 4.1 Core Entities

- Users
- Projects
- Deployments
- Assets
- Tenants

### 4.2 Relationships

- Users → Projects (One-to-Many)
- Projects → Deployments (One-to-Many)
- Projects → Assets (One-to-Many)
- Users → Tenants (Many-to-One)

## 5. Infrastructure

### 5.1 Database

- **Provider:** Supabase PostgreSQL
- **Capabilities:**
  - Row-Level Security (RLS)
  - Real-time subscriptions
  - Managed database migrations

### 5.2 Storage

- **Provider:** DigitalOcean Spaces
- **Capabilities:**
  - CDN-backed asset delivery
  - Asset version control
  - Secure access management

### 5.3 API Server

- **Framework:** Fastify (Node.js)
- **Capabilities:**
  - TypeScript integration
  - Request validation
  - Response serialization
  - Modular plugins

## 6. Development Tools

### 6.1 Code Quality

- TypeScript
- ESLint
- Prettier
- Husky (Git hooks)

### 6.2 Testing

- Vitest
- Utility libraries for testing
- Mock implementations for external services

### 6.3 Deployment

- Docker containerization
- Environment-specific configurations
- Semantic versioning

## 7. Security

### 7.1 Authentication

- JWT-based secure authentication
- Magic link authentication flow
- Supabase Auth provider integration

### 7.2 Authorization

- Database row-level security
- Tenant-level data isolation
- Project-specific permission controls
