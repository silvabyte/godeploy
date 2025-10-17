# GoDeploy Auth Architecture Overview

## 1. Project Structure

### 1.1 Core Directories

- `src/` – Main application source
  - `components/` – Reusable UI components
  - `routes/` – Page-specific components and routing logic
  - `services/` – Business logic and API integrations
  - `stores/` – State management
  - `utils/` – Utility and helper functions
  - `i18n/` – Internationalization resources
  - `constants/` – Application-wide constants
  - `testing/` – Testing utilities and mocks
- `public/` – Publicly accessible static assets
- `dist/` – Build output files

### 1.2 Configuration Files

- `vite.config.ts` – Vite build settings
- `tsconfig.json` – TypeScript settings
- `godeploy.config.json` – Deployment configuration
- `spa-config.json` – SPA-specific settings
- `.env` – Environment variables

## 2. Core Components

### 2.1 Authentication Components

- **Login Page**

  - Email/password and magic link authentication
  - Validation and error handling

- **Session Management**

  - Token storage and refresh
  - Persistent sessions

- **Logout Flow**
  - Session invalidation
  - State clearing and redirection

### 2.2 UI Components

- **Buttons**

  - Action buttons (primary/secondary)
  - Loading states

- **Error Components**

  - Display and handling of errors
  - Fallback UI for error boundaries

- **Support Components**

  - Tooltips, loaders, and help text

- **Brand Components**
  - Logos, typography, and brand colors

## 3. Services Layer

### 3.1 Authentication Service

- Integration with Supabase Auth
- Token and session management
- User profile management

### 3.2 Service Context

- Dependency injection for services
- Lifecycle management and initialization

## 4. State Management

### 4.1 Stores

- Management of user, authentication, UI, and error states

## 5. Routing

### 5.1 Route Structure

- `/login` – User authentication
- `/session` – Session details
- `/logout` – Logout process
- `/dashboard` – User dashboard

### 5.2 Route Features

- Protected and guarded routes
- Redirect logic
- Animated transitions

## 6. Development Tools

### 6.1 Build System

- **Tooling:** Vite
- Hot Module Replacement
- TypeScript and asset optimization

### 6.2 Testing

- **Tooling:** Vitest
- Component, service, and integration tests
- Mock utilities

### 6.3 Code Quality

- TypeScript, ESLint, Prettier, Commit linting

## 7. Internationalization

### 7.1 i18n Support

- Multi-language translations
- Right-to-left language support
- Dynamic language switching

## 8. Security

### 8.1 Authentication Security

- Secure storage and token handling
- CSRF and XSS protection
- Safe redirects

### 8.2 Session Security

- Automatic token refresh
- Session expiry handling
- Secure cookie management
