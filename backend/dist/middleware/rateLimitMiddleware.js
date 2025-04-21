"use strict";
/**
 * Rate limiting middleware for preventing abuse
 *
 * This middleware uses express-rate-limit to limit the number of requests
 * a client can make in a given time period, helping to prevent brute force
 * attacks, denial of service attacks, and other types of abuse.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.totpGenerationLimiter = exports.accountCreationLimiter = exports.passwordResetLimiter = exports.authLimiter = exports.apiLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const errors_1 = require("../utils/errors");
// Default rate limit options
const defaultOptions = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: 'Too many requests from this IP, please try again later',
    handler: (req, res, next, options) => {
        next(new errors_1.TooManyRequestsError(options.message));
    },
};
/**
 * General API rate limiter
 * Limits all API requests to prevent abuse
 */
exports.apiLimiter = (0, express_rate_limit_1.default)(Object.assign(Object.assign({}, defaultOptions), { windowMs: 15 * 60 * 1000, max: 100 }));
/**
 * Authentication rate limiter
 * More strict limits for authentication endpoints to prevent brute force attacks
 */
exports.authLimiter = (0, express_rate_limit_1.default)(Object.assign(Object.assign({}, defaultOptions), { windowMs: 15 * 60 * 1000, max: 10, message: 'Too many authentication attempts, please try again later' }));
/**
 * Password reset rate limiter
 * Strict limits for password reset to prevent abuse
 */
exports.passwordResetLimiter = (0, express_rate_limit_1.default)(Object.assign(Object.assign({}, defaultOptions), { windowMs: 60 * 60 * 1000, max: 3, message: 'Too many password reset attempts, please try again later' }));
/**
 * Account creation rate limiter
 * Limits account creation to prevent spam
 */
exports.accountCreationLimiter = (0, express_rate_limit_1.default)(Object.assign(Object.assign({}, defaultOptions), { windowMs: 24 * 60 * 60 * 1000, max: 5, message: 'Too many accounts created from this IP, please try again later' }));
/**
 * TOTP generation rate limiter
 * Limits TOTP code generation to prevent abuse
 */
exports.totpGenerationLimiter = (0, express_rate_limit_1.default)(Object.assign(Object.assign({}, defaultOptions), { windowMs: 5 * 60 * 1000, max: 30, message: 'Too many TOTP code generation attempts, please try again later' }));
