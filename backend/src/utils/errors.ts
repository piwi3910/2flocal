/**
 * Custom error classes for standardized error handling
 * 
 * This module defines a set of custom error classes that extend the base Error class
 * to provide more specific error types and standardized error handling across the application.
 */

/**
 * Base API Error class that all other custom errors extend from
 */
export class ApiError extends Error {
  statusCode: number;
  isOperational: boolean;
  errorCode?: string;
  details?: any;

  constructor(
    message: string,
    statusCode: number,
    isOperational = true,
    errorCode?: string,
    details?: any
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.errorCode = errorCode;
    this.details = details;
    
    // Maintains proper stack trace for where our error was thrown (only in V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
    
    this.name = this.constructor.name;
  }
}

/**
 * 400 Bad Request - Invalid input or parameters
 */
export class BadRequestError extends ApiError {
  constructor(message = 'Bad Request', errorCode?: string, details?: any) {
    super(message, 400, true, errorCode, details);
  }
}

/**
 * 401 Unauthorized - Authentication failure
 */
export class UnauthorizedError extends ApiError {
  constructor(message = 'Unauthorized', errorCode?: string, details?: any) {
    super(message, 401, true, errorCode, details);
  }
}

/**
 * 403 Forbidden - Authorization failure (authenticated but not allowed)
 */
export class ForbiddenError extends ApiError {
  constructor(message = 'Forbidden', errorCode?: string, details?: any) {
    super(message, 403, true, errorCode, details);
  }
}

/**
 * 404 Not Found - Resource not found
 */
export class NotFoundError extends ApiError {
  constructor(message = 'Resource not found', errorCode?: string, details?: any) {
    super(message, 404, true, errorCode, details);
  }
}

/**
 * 409 Conflict - Resource conflict (e.g., duplicate entry)
 */
export class ConflictError extends ApiError {
  constructor(message = 'Resource conflict', errorCode?: string, details?: any) {
    super(message, 409, true, errorCode, details);
  }
}

/**
 * 422 Unprocessable Entity - Validation error
 */
export class ValidationError extends ApiError {
  constructor(message = 'Validation failed', errorCode?: string, details?: any) {
    super(message, 422, true, errorCode, details);
  }
}

/**
 * 429 Too Many Requests - Rate limit exceeded
 */
export class TooManyRequestsError extends ApiError {
  constructor(message = 'Too many requests', errorCode?: string, details?: any) {
    super(message, 429, true, errorCode, details);
  }
}

/**
 * 500 Internal Server Error - Unexpected server error
 */
export class InternalServerError extends ApiError {
  constructor(message = 'Internal server error', errorCode?: string, details?: any) {
    // isOperational is false because this is typically an unexpected error
    super(message, 500, false, errorCode, details);
  }
}

/**
 * 503 Service Unavailable - Service temporarily unavailable
 */
export class ServiceUnavailableError extends ApiError {
  constructor(message = 'Service unavailable', errorCode?: string, details?: any) {
    super(message, 503, true, errorCode, details);
  }
}

/**
 * Helper function to determine if an error is an instance of ApiError
 */
export const isApiError = (error: any): error is ApiError => {
  return error instanceof ApiError;
};