"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || 'DEFAULT_SECRET_CHANGE_ME';
/**
 * Middleware to authenticate JWT tokens
 * Handles token extraction, validation, and attaches user data to the request
 */
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Extract token from 'Bearer <token>'
    if (!token) {
        res.status(401).json({
            message: 'Authentication required',
            error: 'No token provided',
            code: 'AUTH_NO_TOKEN'
        });
        return;
    }
    jsonwebtoken_1.default.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            console.error('JWT Verification Error:', err.message);
            // Provide more specific error messages based on the error type
            if (err.name === 'TokenExpiredError') {
                res.status(401).json({
                    message: 'Authentication expired',
                    error: 'Token has expired',
                    code: 'AUTH_TOKEN_EXPIRED'
                });
            }
            else if (err.name === 'JsonWebTokenError') {
                res.status(403).json({
                    message: 'Authentication invalid',
                    error: 'Invalid token',
                    code: 'AUTH_TOKEN_INVALID'
                });
            }
            else {
                res.status(403).json({
                    message: 'Authentication failed',
                    error: 'Token verification failed',
                    code: 'AUTH_TOKEN_VERIFICATION_FAILED'
                });
            }
            return;
        }
        // Token is valid, attach user payload to the request object
        req.user = user;
        next(); // Proceed to the next middleware or route handler
    });
};
exports.authenticateToken = authenticateToken;
