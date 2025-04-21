"use strict";
/**
 * Error handling middleware for standardized error responses
 *
 * This middleware provides centralized error handling for the application,
 * ensuring consistent error responses and proper error logging based on
 * the environment (development vs production).
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = exports.notFoundHandler = exports.errorHandler = void 0;
const errors_1 = require("../utils/errors");
/**
 * Logger function that can be replaced with a more sophisticated logging solution
 * This implementation ensures sensitive information is not logged in production
 */
const logError = (err, req) => {
    const isProduction = process.env.NODE_ENV === 'production';
    // Basic request information that's safe to log in any environment
    const logData = {
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
        method: req.method,
        path: req.path,
        ip: req.ip,
        errorName: err.name,
        errorMessage: err.message,
    };
    // In development, include the full stack trace
    if (!isProduction) {
        console.error('ERROR DETAILS:', Object.assign(Object.assign({}, logData), { stack: err.stack, body: req.body, query: req.query, params: req.params }));
    }
    else {
        // In production, log minimal information to avoid leaking sensitive data
        // For ApiErrors, we can include the status code and error code
        if ((0, errors_1.isApiError)(err)) {
            console.error('ERROR:', Object.assign(Object.assign({}, logData), { statusCode: err.statusCode, errorCode: err.errorCode, isOperational: err.isOperational }));
        }
        else {
            console.error('ERROR:', logData);
        }
    }
};
/**
 * Main error handling middleware
 */
const errorHandler = (err, req, res, next) => {
    // Log the error with appropriate level of detail based on environment
    logError(err, req);
    // Determine if we're in production
    const isProduction = process.env.NODE_ENV === 'production';
    // Default error values
    let statusCode = 500;
    let errorMessage = 'Internal Server Error';
    let errorCode = undefined;
    let errorDetails = undefined;
    // If this is one of our custom API errors, use its information
    if ((0, errors_1.isApiError)(err)) {
        statusCode = err.statusCode;
        errorMessage = err.message;
        errorCode = err.errorCode;
        // Only include details if it's an operational error or we're in development
        if (err.isOperational || !isProduction) {
            errorDetails = err.details;
        }
    }
    else {
        // For unexpected errors, provide generic message in production
        if (!isProduction) {
            errorMessage = err.message;
            errorDetails = { stack: err.stack };
        }
    }
    // Construct the standardized error response
    const errorResponse = {
        success: false,
        error: Object.assign(Object.assign({ message: errorMessage, statusCode }, (errorCode && { code: errorCode })), (errorDetails && { details: errorDetails })),
    };
    // Send the response with appropriate status code
    res.status(statusCode).json(errorResponse);
};
exports.errorHandler = errorHandler;
/**
 * Middleware to handle 404 errors for routes that don't exist
 */
const notFoundHandler = (req, res, next) => {
    const errorResponse = {
        success: false,
        error: {
            message: `Not Found - ${req.originalUrl}`,
            statusCode: 404,
        },
    };
    res.status(404).json(errorResponse);
};
exports.notFoundHandler = notFoundHandler;
/**
 * Async handler to catch errors in async route handlers
 * This eliminates the need for try/catch blocks in every controller
 */
const asyncHandler = (fn) => (req, res, next) => {
    return Promise.resolve(fn(req, res, next)).catch(next);
};
exports.asyncHandler = asyncHandler;
