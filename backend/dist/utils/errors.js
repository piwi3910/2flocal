"use strict";
/**
 * Custom error classes for standardized error handling
 *
 * This module defines a set of custom error classes that extend the base Error class
 * to provide more specific error types and standardized error handling across the application.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.isApiError = exports.ServiceUnavailableError = exports.InternalServerError = exports.TooManyRequestsError = exports.ValidationError = exports.ConflictError = exports.NotFoundError = exports.ForbiddenError = exports.UnauthorizedError = exports.BadRequestError = exports.ApiError = void 0;
/**
 * Base API Error class that all other custom errors extend from
 */
class ApiError extends Error {
    constructor(message, statusCode, isOperational = true, errorCode, details) {
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
exports.ApiError = ApiError;
/**
 * 400 Bad Request - Invalid input or parameters
 */
class BadRequestError extends ApiError {
    constructor(message = 'Bad Request', errorCode, details) {
        super(message, 400, true, errorCode, details);
    }
}
exports.BadRequestError = BadRequestError;
/**
 * 401 Unauthorized - Authentication failure
 */
class UnauthorizedError extends ApiError {
    constructor(message = 'Unauthorized', errorCode, details) {
        super(message, 401, true, errorCode, details);
    }
}
exports.UnauthorizedError = UnauthorizedError;
/**
 * 403 Forbidden - Authorization failure (authenticated but not allowed)
 */
class ForbiddenError extends ApiError {
    constructor(message = 'Forbidden', errorCode, details) {
        super(message, 403, true, errorCode, details);
    }
}
exports.ForbiddenError = ForbiddenError;
/**
 * 404 Not Found - Resource not found
 */
class NotFoundError extends ApiError {
    constructor(message = 'Resource not found', errorCode, details) {
        super(message, 404, true, errorCode, details);
    }
}
exports.NotFoundError = NotFoundError;
/**
 * 409 Conflict - Resource conflict (e.g., duplicate entry)
 */
class ConflictError extends ApiError {
    constructor(message = 'Resource conflict', errorCode, details) {
        super(message, 409, true, errorCode, details);
    }
}
exports.ConflictError = ConflictError;
/**
 * 422 Unprocessable Entity - Validation error
 */
class ValidationError extends ApiError {
    constructor(message = 'Validation failed', errorCode, details) {
        super(message, 422, true, errorCode, details);
    }
}
exports.ValidationError = ValidationError;
/**
 * 429 Too Many Requests - Rate limit exceeded
 */
class TooManyRequestsError extends ApiError {
    constructor(message = 'Too many requests', errorCode, details) {
        super(message, 429, true, errorCode, details);
    }
}
exports.TooManyRequestsError = TooManyRequestsError;
/**
 * 500 Internal Server Error - Unexpected server error
 */
class InternalServerError extends ApiError {
    constructor(message = 'Internal server error', errorCode, details) {
        // isOperational is false because this is typically an unexpected error
        super(message, 500, false, errorCode, details);
    }
}
exports.InternalServerError = InternalServerError;
/**
 * 503 Service Unavailable - Service temporarily unavailable
 */
class ServiceUnavailableError extends ApiError {
    constructor(message = 'Service unavailable', errorCode, details) {
        super(message, 503, true, errorCode, details);
    }
}
exports.ServiceUnavailableError = ServiceUnavailableError;
/**
 * Helper function to determine if an error is an instance of ApiError
 */
const isApiError = (error) => {
    return error instanceof ApiError;
};
exports.isApiError = isApiError;
