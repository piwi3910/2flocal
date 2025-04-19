# Authentication Guide for 2FLocal API

This guide explains how to authenticate with the 2FLocal API and manage user sessions.

## Overview

The 2FLocal API uses JSON Web Tokens (JWT) for authentication. The authentication flow consists of:

1. User registration
2. Email verification
3. User login
4. Access token usage
5. Token refresh
6. Logout

## Authentication Flow

### 1. Registration

To register a new user, send a POST request to `/api/auth/register` with the following JSON body:

```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response:**

```json
{
  "id": "5f8d0c1b2c3d4e5f6a7b8c9d",
  "email": "user@example.com",
  "message": "User registered successfully. Please verify your email."
}
```

Upon successful registration, the user will receive an email with a verification link.

### 2. Email Verification

To verify an email, the user must click the verification link in the email or send a GET request to `/api/auth/verify-email/:token` where `:token` is the verification token sent in the email.

**Response:**

```json
{
  "message": "Email verified successfully. You can now log in."
}
```

### 3. Login

To log in, send a POST request to `/api/auth/login` with the following JSON body:

```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response:**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshTokenExpiry": "2025-05-19T05:01:13.000Z",
  "user": {
    "id": "5f8d0c1b2c3d4e5f6a7b8c9d",
    "email": "user@example.com",
    "name": null,
    "isAdmin": false,
    "isEmailVerified": true
  }
}
```

### 4. Using the Access Token

To access protected endpoints, include the access token in the Authorization header of your requests:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Example:

```bash
curl -X GET http://localhost:3000/api/accounts \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### 5. Refreshing the Access Token

Access tokens expire after 15 minutes. To get a new access token without requiring the user to log in again, send a POST request to `/api/auth/refresh-token` with the refresh token in the request body:

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**

```json
{
  "message": "Token refreshed successfully",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshTokenExpiry": "2025-05-19T05:01:13.000Z"
}
```

Note that the API uses token rotation for security, so each refresh operation returns a new refresh token that replaces the old one.

### 6. Logout

To log out, send a POST request to `/api/auth/revoke-token` with the refresh token in the request body:

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**

```json
{
  "message": "Token revoked successfully"
}
```

This will revoke the refresh token, preventing it from being used to obtain new access tokens.

## Token Security

### Access Token

- Short-lived (15 minutes)
- Used for API authentication
- Sent with every request in the Authorization header
- Cannot be revoked before expiration

### Refresh Token

- Long-lived (30 days)
- Used only to obtain new access tokens
- Should be stored securely
- Can be revoked
- Uses token rotation (a new refresh token is issued with each refresh)

## Password Reset

### Request Password Reset

To request a password reset, send a POST request to `/api/auth/forgot-password` with the following JSON body:

```json
{
  "email": "user@example.com"
}
```

**Response:**

```json
{
  "message": "Password reset email sent"
}
```

The user will receive an email with a password reset link.

### Reset Password

To reset the password, send a POST request to `/api/auth/reset-password` with the following JSON body:

```json
{
  "token": "reset-token-from-email",
  "password": "NewSecurePassword123!"
}
```

**Response:**

```json
{
  "message": "Password reset successful"
}
```

## Profile Management

### Get Current User

To get information about the currently authenticated user, send a GET request to `/api/auth/me`:

```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response:**

```json
{
  "id": "5f8d0c1b2c3d4e5f6a7b8c9d",
  "email": "user@example.com",
  "name": "John Doe",
  "isAdmin": false,
  "isEmailVerified": true
}
```

### Update Profile

To update the user's profile, send a PUT request to `/api/auth/profile`:

```bash
curl -X PUT http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john.doe@example.com"
  }'
```

**Response:**

```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": "5f8d0c1b2c3d4e5f6a7b8c9d",
    "email": "john.doe@example.com",
    "name": "John Doe",
    "isAdmin": false,
    "isEmailVerified": true
  }
}
```

## Admin Authentication

Some endpoints require admin privileges. Admin users are identified by the `isAdmin` flag in the user object.

Admin-only endpoints will return a 403 Forbidden error if accessed by a non-admin user:

```json
{
  "success": false,
  "error": {
    "message": "Forbidden: Requires admin privileges",
    "statusCode": 403,
    "code": "FORBIDDEN"
  }
}
```

## Error Handling

### Common Authentication Errors

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 401 | AUTH_NO_TOKEN | No token provided |
| 401 | AUTH_TOKEN_EXPIRED | Token has expired |
| 403 | AUTH_TOKEN_INVALID | Invalid token |
| 403 | AUTH_TOKEN_VERIFICATION_FAILED | Token verification failed |
| 403 | FORBIDDEN | Insufficient permissions |

### Example Error Response

```json
{
  "success": false,
  "error": {
    "message": "Authentication expired",
    "statusCode": 401,
    "code": "AUTH_TOKEN_EXPIRED"
  }
}
```

## Security Best Practices

1. **Store tokens securely**: 
   - For web applications, store the refresh token in an HTTP-only cookie
   - For mobile applications, use secure storage (e.g., Keychain for iOS, KeyStore for Android)

2. **Implement token refresh logic**:
   - Refresh the access token before it expires
   - Handle token refresh errors gracefully

3. **Implement proper logout**:
   - Always revoke the refresh token on logout
   - Clear stored tokens from the client

4. **Handle token expiration**:
   - Detect 401 responses with AUTH_TOKEN_EXPIRED code
   - Attempt to refresh the token
   - Redirect to login if refresh fails

5. **Protect against CSRF attacks**:
   - Use anti-CSRF tokens for cookie-based authentication
   - Implement proper CORS policies

## Next Steps

- Explore the [Getting Started Guide](./getting-started.md) for a general overview of the API
- Check out the [Common Use Cases](./common-use-cases.md) for examples of typical workflows
- Use the interactive API documentation at `/api-docs` to explore all available endpoints