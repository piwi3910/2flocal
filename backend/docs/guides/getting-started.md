# Getting Started with 2FLocal API

This guide will help you get started with the 2FLocal API, including setup, authentication, and basic usage.

## Overview

The 2FLocal API provides endpoints for:
- User authentication and management
- TOTP account management
- Device management
- Admin operations

## Prerequisites

Before you begin, ensure you have:
- Node.js (v16 or higher)
- npm or yarn
- A local development environment or access to the 2FLocal API server

## Authentication

All API endpoints (except for registration, login, and password reset) require authentication using JWT tokens. See the [Authentication Guide](./authentication.md) for detailed information.

## Base URL

The base URL for all API endpoints is:

```
/api
```

For local development, this would typically be:

```
http://localhost:3000/api
```

## API Documentation

Interactive API documentation is available at:

```
/api-docs
```

For local development, this would be:

```
http://localhost:3000/api-docs
```

## Making Your First Request

### 1. Register a User

To get started, you'll need to register a user:

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123!"
  }'
```

### 2. Login

After registration, you can log in to obtain an access token:

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123!"
  }'
```

The response will include an `accessToken` and a `refreshToken`:

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
    "isEmailVerified": false
  }
}
```

### 3. Use the Access Token

Include the access token in the Authorization header for subsequent requests:

```bash
curl -X GET http://localhost:3000/api/accounts \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## Common Operations

### Add a TOTP Account

```bash
curl -X POST http://localhost:3000/api/accounts \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "issuer": "Google",
    "label": "user@gmail.com",
    "secret": "JBSWY3DPEHPK3PXP"
  }'
```

### Generate a TOTP Code

```bash
curl -X GET http://localhost:3000/api/accounts/5f8d0c1b2c3d4e5f6a7b8c9d/totp \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## Error Handling

The API returns standardized error responses with the following format:

```json
{
  "success": false,
  "error": {
    "message": "Human-readable error message",
    "statusCode": 400,
    "code": "ERROR_CODE"
  }
}
```

Common HTTP status codes:
- 200/201: Success
- 400: Bad Request (invalid input)
- 401: Unauthorized (missing or invalid token)
- 403: Forbidden (insufficient permissions)
- 404: Not Found
- 409: Conflict (e.g., resource already exists)
- 422: Validation Error
- 429: Too Many Requests (rate limit exceeded)
- 500: Internal Server Error

## Next Steps

- Explore the [Authentication Guide](./authentication.md) for detailed information on authentication and token management
- Check out the [Common Use Cases](./common-use-cases.md) for examples of typical workflows
- Use the interactive API documentation at `/api-docs` to explore all available endpoints

## Support

If you encounter any issues or have questions, please contact the 2FLocal support team at support@2flocal.com.