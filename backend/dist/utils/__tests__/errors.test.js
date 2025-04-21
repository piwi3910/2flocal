"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errors_1 = require("../errors");
describe('Error Classes', () => {
    describe('ApiError', () => {
        it('should create an ApiError with default values', () => {
            const error = new errors_1.ApiError('Test error', 400);
            expect(error).toBeInstanceOf(Error);
            expect(error.message).toBe('Test error');
            expect(error.statusCode).toBe(400);
            expect(error.isOperational).toBe(true);
            expect(error.name).toBe('ApiError');
        });
        it('should create an ApiError with custom values', () => {
            const error = new errors_1.ApiError('Custom error', 500, false, 'ERR_CUSTOM', { field: 'value' });
            expect(error.message).toBe('Custom error');
            expect(error.statusCode).toBe(500);
            expect(error.isOperational).toBe(false);
            expect(error.errorCode).toBe('ERR_CUSTOM');
            expect(error.details).toEqual({ field: 'value' });
        });
    });
    describe('BadRequestError', () => {
        it('should create a BadRequestError with default values', () => {
            const error = new errors_1.BadRequestError();
            expect(error).toBeInstanceOf(errors_1.ApiError);
            expect(error.message).toBe('Bad Request');
            expect(error.statusCode).toBe(400);
            expect(error.isOperational).toBe(true);
        });
        it('should create a BadRequestError with custom message', () => {
            const error = new errors_1.BadRequestError('Invalid input');
            expect(error.message).toBe('Invalid input');
            expect(error.statusCode).toBe(400);
        });
        it('should create a BadRequestError with error code and details', () => {
            const error = new errors_1.BadRequestError('Invalid input', 'ERR_INVALID_INPUT', { field: 'email' });
            expect(error.message).toBe('Invalid input');
            expect(error.errorCode).toBe('ERR_INVALID_INPUT');
            expect(error.details).toEqual({ field: 'email' });
        });
    });
    describe('UnauthorizedError', () => {
        it('should create an UnauthorizedError with default values', () => {
            const error = new errors_1.UnauthorizedError();
            expect(error).toBeInstanceOf(errors_1.ApiError);
            expect(error.message).toBe('Unauthorized');
            expect(error.statusCode).toBe(401);
            expect(error.isOperational).toBe(true);
        });
        it('should create an UnauthorizedError with custom message', () => {
            const error = new errors_1.UnauthorizedError('Invalid credentials');
            expect(error.message).toBe('Invalid credentials');
            expect(error.statusCode).toBe(401);
        });
    });
    describe('ForbiddenError', () => {
        it('should create a ForbiddenError with default values', () => {
            const error = new errors_1.ForbiddenError();
            expect(error).toBeInstanceOf(errors_1.ApiError);
            expect(error.message).toBe('Forbidden');
            expect(error.statusCode).toBe(403);
            expect(error.isOperational).toBe(true);
        });
    });
    describe('NotFoundError', () => {
        it('should create a NotFoundError with default values', () => {
            const error = new errors_1.NotFoundError();
            expect(error).toBeInstanceOf(errors_1.ApiError);
            expect(error.message).toBe('Resource not found');
            expect(error.statusCode).toBe(404);
            expect(error.isOperational).toBe(true);
        });
        it('should create a NotFoundError with custom message', () => {
            const error = new errors_1.NotFoundError('User not found');
            expect(error.message).toBe('User not found');
            expect(error.statusCode).toBe(404);
        });
    });
    describe('ConflictError', () => {
        it('should create a ConflictError with default values', () => {
            const error = new errors_1.ConflictError();
            expect(error).toBeInstanceOf(errors_1.ApiError);
            expect(error.message).toBe('Resource conflict');
            expect(error.statusCode).toBe(409);
            expect(error.isOperational).toBe(true);
        });
    });
    describe('ValidationError', () => {
        it('should create a ValidationError with default values', () => {
            const error = new errors_1.ValidationError();
            expect(error).toBeInstanceOf(errors_1.ApiError);
            expect(error.message).toBe('Validation failed');
            expect(error.statusCode).toBe(422);
            expect(error.isOperational).toBe(true);
        });
    });
    describe('TooManyRequestsError', () => {
        it('should create a TooManyRequestsError with default values', () => {
            const error = new errors_1.TooManyRequestsError();
            expect(error).toBeInstanceOf(errors_1.ApiError);
            expect(error.message).toBe('Too many requests');
            expect(error.statusCode).toBe(429);
            expect(error.isOperational).toBe(true);
        });
    });
    describe('InternalServerError', () => {
        it('should create an InternalServerError with default values', () => {
            const error = new errors_1.InternalServerError();
            expect(error).toBeInstanceOf(errors_1.ApiError);
            expect(error.message).toBe('Internal server error');
            expect(error.statusCode).toBe(500);
            expect(error.isOperational).toBe(false); // Note: this is false for InternalServerError
        });
    });
    describe('ServiceUnavailableError', () => {
        it('should create a ServiceUnavailableError with default values', () => {
            const error = new errors_1.ServiceUnavailableError();
            expect(error).toBeInstanceOf(errors_1.ApiError);
            expect(error.message).toBe('Service unavailable');
            expect(error.statusCode).toBe(503);
            expect(error.isOperational).toBe(true);
        });
    });
    describe('isApiError', () => {
        it('should return true for ApiError instances', () => {
            const error = new errors_1.ApiError('Test error', 400);
            expect((0, errors_1.isApiError)(error)).toBe(true);
        });
        it('should return true for derived error classes', () => {
            const error = new errors_1.BadRequestError();
            expect((0, errors_1.isApiError)(error)).toBe(true);
        });
        it('should return false for non-ApiError instances', () => {
            const error = new Error('Regular error');
            expect((0, errors_1.isApiError)(error)).toBe(false);
        });
        it('should return false for null or undefined', () => {
            expect((0, errors_1.isApiError)(null)).toBe(false);
            expect((0, errors_1.isApiError)(undefined)).toBe(false);
        });
    });
});
