"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentUser = exports.loginUser = exports.registerUser = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'DEFAULT_SECRET_CHANGE_ME';
// --- Register User --- 
const registerUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Entering registerUser function...'); // Added log
    const { email, password } = req.body;
    const prisma = req.app.locals.prisma; // Get prisma from app.locals
    // 1. Validate input
    if (!email || !password) {
        res.status(400).json({ message: 'Email and password are required' });
        return;
    }
    // Add more robust email validation if needed
    try {
        // 2. Check if user already exists
        const existingUser = yield prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            res.status(409).json({ message: 'User with this email already exists' });
            return;
        }
        // 3. Hash password
        const passwordHash = yield bcrypt_1.default.hash(password, SALT_ROUNDS);
        // 4. Create user in DB
        const newUser = yield prisma.user.create({
            data: {
                email,
                passwordHash,
            },
        });
        // 5. Return success (excluding sensitive info)
        res.status(201).json({
            id: newUser.id,
            email: newUser.email,
            message: 'User registered successfully'
        });
    }
    catch (error) {
        console.error('Registration error:', error);
        if (error instanceof Error) {
            console.log('Error details:', error.message, error.stack); // Enhanced logging
        }
        else {
            console.log('Caught a non-Error object:', error);
        }
        next(error); // Pass error to the centralized error handler
    }
});
exports.registerUser = registerUser;
// --- Login User --- 
const loginUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const prisma = req.app.locals.prisma; // Get prisma from app.locals
    // 1. Validate input
    if (!email || !password) {
        res.status(400).json({ message: 'Email and password are required' });
        return;
    }
    try {
        // 2. Find user by email
        const user = yield prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            res.status(401).json({ message: 'Invalid credentials' }); // Use generic message for security
            return;
        }
        // 3. Compare hashed password
        const passwordMatch = yield bcrypt_1.default.compare(password, user.passwordHash);
        if (!passwordMatch) {
            res.status(401).json({ message: 'Invalid credentials' }); // Use generic message
            return;
        }
        // 4. Generate JWT token
        const tokenPayload = { userId: user.id, email: user.email };
        const token = jsonwebtoken_1.default.sign(tokenPayload, JWT_SECRET, { expiresIn: '1h' }); // Token expires in 1 hour
        // 5. Return token
        res.status(200).json({
            message: 'Login successful',
            token: token
        });
    }
    catch (error) {
        console.error('Login error:', error);
        if (error instanceof Error) {
            console.log('Error details:', error.message, error.stack); // Enhanced logging
        }
        else {
            console.log('Caught a non-Error object:', error);
        }
        next(error); // Pass error to the centralized error handler
    }
});
exports.loginUser = loginUser;
// --- Get Current User Info --- 
const getCurrentUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    if (!userId) {
        // This should technically not happen if authenticateToken middleware is used correctly
        res.status(401).json({ message: 'Unauthorized - User ID not found in token' });
        return;
    }
    try {
        const prisma = req.app.locals.prisma; // Get prisma from app.locals
        const user = yield prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                isAdmin: true, // Include admin status
                createdAt: true,
                updatedAt: true,
            },
        });
        if (!user) {
            // This would imply a mismatch between token and DB, which is problematic
            res.status(404).json({ message: 'User not found in database' });
            return;
        }
        res.status(200).json(user);
    }
    catch (error) {
        console.error('Get current user error:', error);
        if (error instanceof Error) {
            console.log('Error details:', error.message, error.stack); // Enhanced logging
        }
        else {
            console.log('Caught a non-Error object:', error);
        }
        next(error); // Pass error to the centralized error handler
    }
});
exports.getCurrentUser = getCurrentUser;
