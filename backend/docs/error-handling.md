# Error Handling Documentation

This document outlines the error handling approach used in the 2FLocal backend application.

## Overview

The 2FLocal backend implements a comprehensive error handling system that:

1. Provides standardized error responses across all API endpoints
2. Prevents sensitive information leakage in error messages
3. Implements proper logging of errors for debugging and monitoring
4. Handles errors differently in development and production environments
5. Includes input validation for all API endpoints to prevent security vulnerabilities
6. Implements rate limiting to prevent abuse

## Error Response Format

All error responses follow this standardized format:

```json
{
  "success": false,
  "error": {
    "message": "Human-readable error message",
    "statusCode": 400,
    "code": "ERROR_CODE",
    "details": {} // Optional additional information (only in development or for operational errors)
  }
}
```

## Custom Error Classes

The application uses a set of custom error classes defined in `src/utils/errors.ts`:

| Error Class | HTTP Status | Description |
|-------------|-------------|-------------|
| `ApiError` | - | Base error class that all others extend from |
| `BadRequestError` | 400 | Invalid input or parameters |
| `UnauthorizedError` | 401 | Authentication failure |
| `ForbiddenError` | 403 | Authorization failure |
| `NotFoundError` | 404 | Resource not found |
| `ConflictError` | 409 | Resource conflict (e.g., duplicate entry) |
| `ValidationError` | 422 | Validation error |
| `TooManyRequestsError` | 429 | Rate limit exceeded |
| `InternalServerError` | 500 | Unexpected server error |
| `ServiceUnavailableError` | 503 | Service temporarily unavailable |

### Using Custom Error Classes

```typescript
// Example: Throwing a custom error
import { NotFoundError } from '../utils/errors';

if (!user) {
  throw new NotFoundError('User not found', 'USER_NOT_FOUND');
}
```

## Error Handling Middleware

The error handling middleware in `src/middleware/errorMiddleware.ts` catches all errors thrown in the application and formats them according to the standardized format.

### Environment-Specific Behavior

- **Development**: Includes detailed error information, stack traces, and request details in logs and responses
- **Production**: Sanitizes error responses to prevent information leakage, logs minimal information

### Async Handler

The `asyncHandler` utility simplifies error handling in async route handlers:

```typescript
import { asyncHandler } from '../middleware/errorMiddleware';

// Without asyncHandler
router.get('/users', async (req, res, next) => {
  try {
    const users = await userService.getUsers();
    res.json(users);
  } catch (error) {
    next(error);
  }
});

// With asyncHandler
router.get('/users', asyncHandler(async (req, res) => {
  const users = await userService.getUsers();
  res.json(users);
}));
```

## Input Validation

The application uses express-validator for input validation, with a custom middleware in `src/middleware/validationMiddleware.ts` that standardizes validation error responses.

### Using Validation Middleware

```typescript
import { validate } from '../middleware/validationMiddleware';
import { loginValidation } from '../utils/validationSchemas';

router.post('/login', validate(loginValidation), loginHandler);
```

### Validation Schemas

Validation schemas are defined in `src/utils/validationSchemas.ts` and provide comprehensive validation rules for all API endpoints.

## Rate Limiting

The application implements rate limiting to prevent abuse, with different limits for different types of endpoints:

- General API rate limiter: 100 requests per 15 minutes
- Authentication rate limiter: 10 login/register attempts per 15 minutes
- Password reset rate limiter: 3 password reset attempts per hour
- Account creation rate limiter: 5 account creations per day
- TOTP generation rate limiter: 30 TOTP generations per 5 minutes

### Rate Limiting Response

When a rate limit is exceeded, the API returns a 429 Too Many Requests response:

```json
{
  "success": false,
  "error": {
    "message": "Too many requests from this IP, please try again later",
    "statusCode": 429
  }
}
```

## Security Headers

The application sets the following security headers on all responses:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- `Content-Security-Policy: default-src 'self'`

Additionally, the `X-Powered-By` header is removed to avoid exposing Express.

## Best Practices

1. **Use Custom Error Classes**: Throw appropriate custom error classes instead of generic errors
2. **Use Async Handler**: Wrap async route handlers with the `asyncHandler` utility
3. **Validate Input**: Use validation middleware and schemas for all API endpoints
4. **Apply Rate Limiting**: Apply appropriate rate limiting to sensitive endpoints
5. **Don't Log Sensitive Data**: Avoid logging sensitive information, especially in production
6. **Set Environment Variables**: Ensure all required environment variables are set, especially `NODE_ENV` and `JWT_SECRET`