# Common Use Cases and Workflows

This guide provides examples of common use cases and workflows for the 2FLocal API.

## Table of Contents

1. [User Registration and Authentication](#user-registration-and-authentication)
2. [Managing TOTP Accounts](#managing-totp-accounts)
3. [Generating and Using TOTP Codes](#generating-and-using-totp-codes)
4. [Device Management](#device-management)
5. [QR Code Operations](#qr-code-operations)
6. [Admin Operations](#admin-operations)

## User Registration and Authentication

### Complete User Registration Flow

1. **Register a new user**

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123!"
  }'
```

2. **Verify email address** (user clicks link in email or uses token)

```bash
curl -X GET http://localhost:3000/api/auth/verify-email/verification-token-from-email
```

3. **Login to get tokens**

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123!"
  }'
```

4. **Access protected resources**

```bash
curl -X GET http://localhost:3000/api/accounts \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

5. **Refresh token when it expires**

```bash
curl -X POST http://localhost:3000/api/auth/refresh-token \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```

6. **Logout**

```bash
curl -X POST http://localhost:3000/api/auth/revoke-token \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```

## Managing TOTP Accounts

### Adding a New TOTP Account

1. **Add a new account secret**

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

2. **List all account secrets**

```bash
curl -X GET http://localhost:3000/api/accounts \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

3. **Delete an account secret**

```bash
curl -X DELETE http://localhost:3000/api/accounts/5f8d0c1b2c3d4e5f6a7b8c9d \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## Generating and Using TOTP Codes

### Generate TOTP Code for an Account

```bash
curl -X GET http://localhost:3000/api/accounts/5f8d0c1b2c3d4e5f6a7b8c9d/totp \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response:**

```json
{
  "code": "123456",
  "remainingSeconds": 15,
  "period": 30,
  "issuer": "Google",
  "label": "user@gmail.com"
}
```

### Generate QR Code for an Account

```bash
curl -X GET http://localhost:3000/api/accounts/5f8d0c1b2c3d4e5f6a7b8c9d/qrcode \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response:**

```json
{
  "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "uri": "otpauth://totp/Google:user@gmail.com?secret=JBSWY3DPEHPK3PXP&issuer=Google&algorithm=SHA1&digits=6&period=30"
}
```

## Device Management

### Register a New Device

```bash
curl -X POST http://localhost:3000/api/devices \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "device-unique-id-123",
    "name": "My iPhone",
    "type": "MOBILE"
  }'
```

### List All Devices

```bash
curl -X GET http://localhost:3000/api/devices \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Update a Device

```bash
curl -X PUT http://localhost:3000/api/devices/5f8d0c1b2c3d4e5f6a7b8c9d \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My New iPhone",
    "type": "MOBILE"
  }'
```

### Delete a Device

```bash
curl -X DELETE http://localhost:3000/api/devices/5f8d0c1b2c3d4e5f6a7b8c9d \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Verify a Device

```bash
curl -X POST http://localhost:3000/api/devices/5f8d0c1b2c3d4e5f6a7b8c9d/verify \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "verificationCode": "123456"
  }'
```

## QR Code Operations

### Parse a QR Code Image

```bash
curl -X POST http://localhost:3000/api/accounts/parse-qrcode \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
  }'
```

**Response:**

```json
{
  "uri": "otpauth://totp/Google:user@gmail.com?secret=JBSWY3DPEHPK3PXP&issuer=Google&algorithm=SHA1&digits=6&period=30",
  "secret": "JBSWY3DPEHPK3PXP",
  "issuer": "Google",
  "label": "user@gmail.com",
  "algorithm": "SHA1",
  "digits": 6,
  "period": 30
}
```

## Admin Operations

### Admin Delete a Device

This operation requires admin privileges.

```bash
curl -X DELETE http://localhost:3000/api/admin/devices/5f8d0c1b2c3d4e5f6a7b8c9d \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## Complete Workflows

### Onboarding a New User

1. User registers
2. User verifies email
3. User logs in
4. User registers their device
5. User adds their first TOTP account

```bash
# 1. Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123!"
  }'

# 2. Verify email (user clicks link in email)
# ...

# 3. Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123!"
  }'

# Store the access token and refresh token from the response
ACCESS_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
REFRESH_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# 4. Register device
curl -X POST http://localhost:3000/api/devices \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "device-unique-id-123",
    "name": "My iPhone",
    "type": "MOBILE"
  }'

# 5. Add TOTP account
curl -X POST http://localhost:3000/api/accounts \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "issuer": "Google",
    "label": "user@gmail.com",
    "secret": "JBSWY3DPEHPK3PXP"
  }'
```

### Adding a TOTP Account from a QR Code

1. User scans a QR code
2. User parses the QR code
3. User adds the account

```bash
# 1. Parse QR code
curl -X POST http://localhost:3000/api/accounts/parse-qrcode \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
  }'

# Store the parsed data
ISSUER="Google"
LABEL="user@gmail.com"
SECRET="JBSWY3DPEHPK3PXP"

# 2. Add account using parsed data
curl -X POST http://localhost:3000/api/accounts \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "issuer": "'$ISSUER'",
    "label": "'$LABEL'",
    "secret": "'$SECRET'"
  }'
```

### Generating and Using a TOTP Code

1. User selects an account
2. User generates a TOTP code
3. User uses the code for authentication on the target service

```bash
# 1. List accounts
curl -X GET http://localhost:3000/api/accounts \
  -H "Authorization: Bearer $ACCESS_TOKEN"

# Store the account ID
ACCOUNT_ID="5f8d0c1b2c3d4e5f6a7b8c9d"

# 2. Generate TOTP code
curl -X GET http://localhost:3000/api/accounts/$ACCOUNT_ID/totp \
  -H "Authorization: Bearer $ACCESS_TOKEN"

# Response contains the TOTP code and remaining validity time
# {
#   "code": "123456",
#   "remainingSeconds": 15,
#   "period": 30,
#   "issuer": "Google",
#   "label": "user@gmail.com"
# }

# 3. User manually enters the code on the target service
```

## Error Handling

All API endpoints return standardized error responses. Here's how to handle common errors:

### Example: Handling Authentication Errors

```javascript
async function fetchWithAuth(url, options = {}) {
  // Add access token to request
  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${accessToken}`
  };
  
  const response = await fetch(url, { ...options, headers });
  
  if (response.status === 401) {
    const errorData = await response.json();
    
    // Check if token expired
    if (errorData.error?.code === 'AUTH_TOKEN_EXPIRED') {
      // Try to refresh the token
      const refreshed = await refreshToken();
      
      if (refreshed) {
        // Retry the request with new token
        return fetchWithAuth(url, options);
      } else {
        // Redirect to login
        window.location.href = '/login';
      }
    }
  }
  
  return response;
}

async function refreshToken() {
  try {
    const response = await fetch('/api/auth/refresh-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    });
    
    if (response.ok) {
      const data = await response.json();
      // Update tokens
      accessToken = data.accessToken;
      refreshToken = data.refreshToken;
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error refreshing token:', error);
    return false;
  }
}
```

## Next Steps

- Explore the [Getting Started Guide](./getting-started.md) for a general overview of the API
- Check out the [Authentication Guide](./authentication.md) for detailed information on authentication and token management
- Use the interactive API documentation at `/api-docs` to explore all available endpoints