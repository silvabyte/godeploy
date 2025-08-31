# Authentication API Documentation

The GoDeploy API supports multiple authentication methods to accommodate different client needs.

## Authentication Methods

### 1. Magic Link Authentication (Passwordless)

Best for: CLI clients, one-time authentication

### 2. Password Authentication

Best for: Web applications, mobile apps, persistent sessions

## Authentication Headers

All authenticated endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <token>
```

## Password Authentication Endpoints

### Sign Up

Create a new account with email and password.

**Endpoint:** `POST /api/auth/signup`

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Success Response (201 Created):**

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "tenant_id": "660e8400-e29b-41d4-a716-446655440000"
  }
}
```

**Error Response (400 Bad Request):**

```json
{
  "success": false,
  "error": "Email already registered"
}
```

**Validation Rules:**

- Email must be valid format
- Password must be at least 8 characters

---

### Sign In

Authenticate with email and password.

**Endpoint:** `POST /api/auth/signin`

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "tenant_id": "660e8400-e29b-41d4-a716-446655440000"
  }
}
```

**Error Response (401 Unauthorized):**

```json
{
  "success": false,
  "error": "Invalid credentials"
}
```

---

### Change Password

Change password for authenticated user.

**Endpoint:** `POST /api/auth/change-password`

**Headers:**

```
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewPassword456!"
}
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

**Error Response (401 Unauthorized):**

```json
{
  "success": false,
  "error": "Current password is incorrect"
}
```

**Validation Rules:**

- New password must be at least 8 characters
- Current password must be verified

---

### Request Password Reset

Send a password reset email to the user.

**Endpoint:** `POST /api/auth/reset-password`

**Request Body:**

```json
{
  "email": "user@example.com",
  "redirect_uri": "https://app.example.com/reset-password" // Optional
}
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Password reset email sent"
}
```

**Error Response (400 Bad Request):**

```json
{
  "success": false,
  "error": "Email not found"
}
```

---

### Confirm Password Reset

Reset password using the token from the reset email.

**Endpoint:** `POST /api/auth/reset-password/confirm`

**Request Body:**

```json
{
  "token": "reset-token-from-email",
  "newPassword": "NewSecurePassword789!"
}
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

**Error Response (400 Bad Request):**

```json
{
  "success": false,
  "error": "Invalid or expired reset token"
}
```

**Validation Rules:**

- Token must be valid and not expired
- New password must be at least 8 characters

---

### Sign Out

End the current session.

**Endpoint:** `POST /api/auth/signout`

**Headers:**

```
Authorization: Bearer <token>
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Signed out successfully"
}
```

---

## Magic Link Authentication (Existing)

### Initialize Magic Link

Send a magic link to the user's email.

**Endpoint:** `POST /api/auth/init`

**Request Body:**

```json
{
  "email": "user@example.com",
  "redirect_uri": "http://localhost:38389/callback"
}
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Check your email for the login link."
}
```

---

### Verify Token

Verify if a token is valid and get user information.

**Endpoint:** `GET /api/auth/verify`

**Headers:**

```
Authorization: Bearer <token>
```

**Success Response (200 OK):**

```json
{
  "valid": true,
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "tenant_id": "660e8400-e29b-41d4-a716-446655440000"
  }
}
```

**Error Response (401 Unauthorized):**

```json
{
  "valid": false,
  "error": "Invalid token"
}
```

---

## Integration Examples

### JavaScript/TypeScript

```typescript
// Sign up
const signUp = async (email: string, password: string) => {
  const response = await fetch('https://api.godeploy.app/api/auth/signup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();
  if (data.success) {
    // Store token securely
    localStorage.setItem('token', data.token);
    return data.user;
  }
  throw new Error(data.error);
};

// Sign in
const signIn = async (email: string, password: string) => {
  const response = await fetch('https://api.godeploy.app/api/auth/signin', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();
  if (data.success) {
    localStorage.setItem('token', data.token);
    return data.user;
  }
  throw new Error(data.error);
};

// Make authenticated request
const getProjects = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch('https://api.godeploy.app/api/projects', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.json();
};
```

### cURL Examples

```bash
# Sign up
curl -X POST https://api.godeploy.app/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"SecurePassword123!"}'

# Sign in
curl -X POST https://api.godeploy.app/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"SecurePassword123!"}'

# Change password
curl -X POST https://api.godeploy.app/api/auth/change-password \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"currentPassword":"OldPass123!","newPassword":"NewPass456!"}'

# Request password reset
curl -X POST https://api.godeploy.app/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com"}'
```

## Security Considerations

1. **Password Requirements**

   - Minimum 8 characters
   - Consider implementing additional complexity requirements

2. **Token Management**

   - Tokens expire after 1 hour by default
   - Store tokens securely (never in plain text)
   - Use HTTPS for all API calls

3. **Rate Limiting**

   - Authentication endpoints are rate-limited
   - Implement exponential backoff on failures

4. **Multi-Factor Authentication**
   - Consider implementing MFA for enhanced security
   - Supabase supports TOTP-based MFA

## Error Codes

| Status Code | Description                                 |
| ----------- | ------------------------------------------- |
| 200         | Success                                     |
| 201         | Created (sign up successful)                |
| 400         | Bad Request (validation error)              |
| 401         | Unauthorized (invalid credentials or token) |
| 429         | Too Many Requests (rate limited)            |
| 500         | Internal Server Error                       |

## Migration Notes

For existing users who have been using magic link authentication:

- They can set a password using the password reset flow
- Both authentication methods can be used interchangeably
- The same token format is used for both methods
