"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || 'DEFAULT_SECRET_CHANGE_ME';
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Extract token from 'Bearer <token>'
    if (!token) {
        res.sendStatus(401); // No token provided
        return;
    }
    jsonwebtoken_1.default.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            console.error('JWT Verification Error:', err.message);
            res.sendStatus(403); // Invalid token
            return;
        }
        // Token is valid, attach user payload to the request object
        req.user = user;
        next(); // Proceed to the next middleware or route handler
    });
};
exports.authenticateToken = authenticateToken;
