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
exports.revokeAllTokens = exports.revokeToken = exports.refreshTokens = exports.resendVerificationEmail = exports.updateProfile = exports.resetPassword = exports.forgotPassword = exports.verifyEmail = exports.getCurrentUser = exports.loginUser = exports.registerUser = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const tokenService_1 = require("../utils/tokenService");
const emailService_1 = require("../utils/emailService");
const SALT_ROUNDS = 10;
// Get JWT secret from environment variable
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    console.error('ERROR: JWT_SECRET environment variable is not set!');
    process.exit(1); // Exit the application if JWT_SECRET is not set
}
// Helper function to get device info from request
const getDeviceInfo = (req) => {
    const userAgent = req.headers['user-agent'] || 'unknown';
    return userAgent;
};
// Helper function to get IP address from request
const getIpAddress = (req) => {
    return req.ip || req.socket.remoteAddress || 'unknown';
};
// --- Register User --- 
const registerUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Entering registerUser function...'); // Added log
    const { email, password, name } = req.body;
    const prisma = req.app.locals.prisma; // Get prisma from app.locals
    // 1. Validate input
    if (!email || !password) {
        res.status(400).json({ message: 'Email and password are required' });
        return;
    }
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        res.status(400).json({ message: 'Invalid email format' });
        return;
    }
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
        // 4. Generate email verification token
        const verificationToken = (0, tokenService_1.generateEmailVerificationToken)();
        // 5. Create user in DB
        const newUser = yield prisma.user.create({
            data: {
                email,
                passwordHash,
                name: name || null,
                emailVerificationToken: verificationToken,
                isEmailVerified: false
            },
        });
        // 6. Send verification email
        try {
            yield (0, emailService_1.sendVerificationEmail)(newUser, verificationToken);
        }
        catch (emailError) {
            console.error('Error sending verification email:', emailError);
            // Continue with registration even if email fails
        }
        // 7. Return success (excluding sensitive info)
        res.status(201).json({
            id: newUser.id,
            email: newUser.email,
            name: newUser.name,
            isEmailVerified: newUser.isEmailVerified,
            message: 'User registered successfully. Please check your email to verify your account.'
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
        // 4. Generate access and refresh tokens
        const accessToken = (0, tokenService_1.generateAccessToken)(user.id, user.email);
        // Get device info and IP address for security tracking
        const deviceInfo = getDeviceInfo(req);
        const ipAddress = getIpAddress(req);
        // Generate refresh token
        const { token: refreshToken, expiresAt } = yield (0, tokenService_1.generateRefreshToken)(user.id, deviceInfo, ipAddress);
        // 5. Return tokens and user info
        res.status(200).json({
            message: 'Login successful',
            accessToken,
            refreshToken,
            refreshTokenExpiry: expiresAt,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                isEmailVerified: user.isEmailVerified
            }
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
                name: true,
                isAdmin: true, // Include admin status
                isEmailVerified: true,
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
// --- Verify Email ---
const verifyEmail = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { token } = req.params;
    const prisma = req.app.locals.prisma;
    if (!token) {
        res.status(400).json({ message: 'Verification token is required' });
        return;
    }
    try {
        // Find user with this verification token
        const user = yield prisma.user.findFirst({
            where: { emailVerificationToken: token }
        });
        if (!user) {
            res.status(400).json({ message: 'Invalid or expired verification token' });
            return;
        }
        // Update user to mark email as verified
        yield prisma.user.update({
            where: { id: user.id },
            data: {
                isEmailVerified: true,
                emailVerificationToken: null
            }
        });
        res.status(200).json({ message: 'Email verified successfully' });
    }
    catch (error) {
        console.error('Email verification error:', error);
        if (error instanceof Error) {
            console.log('Error details:', error.message, error.stack);
        }
        else {
            console.log('Caught a non-Error object:', error);
        }
        next(error);
    }
});
exports.verifyEmail = verifyEmail;
// --- Forgot Password ---
const forgotPassword = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    const prisma = req.app.locals.prisma;
    if (!email) {
        res.status(400).json({ message: 'Email is required' });
        return;
    }
    try {
        // Find user by email
        const user = yield prisma.user.findUnique({
            where: { email }
        });
        // For security reasons, don't reveal if the email exists or not
        if (!user) {
            res.status(200).json({ message: 'If your email is registered, you will receive a password reset link' });
            return;
        }
        // Generate password reset token and expiry
        const { token, expires } = (0, tokenService_1.generatePasswordResetToken)();
        // Update user with reset token and expiry
        yield prisma.user.update({
            where: { id: user.id },
            data: {
                passwordResetToken: token,
                passwordResetExpires: expires
            }
        });
        // Send password reset email
        try {
            yield (0, emailService_1.sendPasswordResetEmail)(user, token);
        }
        catch (emailError) {
            console.error('Error sending password reset email:', emailError);
            // Continue with the process even if email fails
        }
        res.status(200).json({ message: 'If your email is registered, you will receive a password reset link' });
    }
    catch (error) {
        console.error('Forgot password error:', error);
        if (error instanceof Error) {
            console.log('Error details:', error.message, error.stack);
        }
        else {
            console.log('Caught a non-Error object:', error);
        }
        next(error);
    }
});
exports.forgotPassword = forgotPassword;
// --- Reset Password ---
const resetPassword = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { token, password } = req.body;
    const prisma = req.app.locals.prisma;
    if (!token || !password) {
        res.status(400).json({ message: 'Token and new password are required' });
        return;
    }
    try {
        // Find user with this reset token and valid expiry
        const user = yield prisma.user.findFirst({
            where: {
                passwordResetToken: token,
                passwordResetExpires: {
                    gt: new Date() // Token must not be expired
                }
            }
        });
        if (!user) {
            res.status(400).json({ message: 'Invalid or expired reset token' });
            return;
        }
        // Hash new password
        const passwordHash = yield bcrypt_1.default.hash(password, SALT_ROUNDS);
        // Update user with new password and clear reset token
        yield prisma.user.update({
            where: { id: user.id },
            data: {
                passwordHash,
                passwordResetToken: null,
                passwordResetExpires: null
            }
        });
        res.status(200).json({ message: 'Password reset successful' });
    }
    catch (error) {
        console.error('Reset password error:', error);
        if (error instanceof Error) {
            console.log('Error details:', error.message, error.stack);
        }
        else {
            console.log('Caught a non-Error object:', error);
        }
        next(error);
    }
});
exports.resetPassword = resetPassword;
// --- Update User Profile ---
const updateProfile = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    const { name, email } = req.body;
    const prisma = req.app.locals.prisma;
    if (!userId) {
        res.status(401).json({ message: 'Unauthorized - User ID not found in token' });
        return;
    }
    // Validate input
    if (email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            res.status(400).json({ message: 'Invalid email format' });
            return;
        }
    }
    try {
        // Check if user exists
        const existingUser = yield prisma.user.findUnique({
            where: { id: userId }
        });
        if (!existingUser) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        // Prepare update data
        const updateData = {};
        if (name !== undefined) {
            updateData.name = name;
        }
        // If email is being changed, require verification
        if (email && email !== existingUser.email) {
            // Check if email is already in use by another user
            const emailExists = yield prisma.user.findUnique({
                where: { email }
            });
            if (emailExists) {
                res.status(409).json({ message: 'Email already in use' });
                return;
            }
            // Generate new verification token
            const verificationToken = (0, tokenService_1.generateEmailVerificationToken)();
            updateData.email = email;
            updateData.isEmailVerified = false;
            updateData.emailVerificationToken = verificationToken;
            // Send verification email for new address
            try {
                yield (0, emailService_1.sendVerificationEmail)(Object.assign(Object.assign({}, existingUser), { email }), verificationToken);
            }
            catch (emailError) {
                console.error('Error sending verification email:', emailError);
                // Continue with update even if email fails
            }
        }
        // Only update if there's something to update
        if (Object.keys(updateData).length === 0) {
            res.status(400).json({ message: 'No valid update data provided' });
            return;
        }
        // Update user
        const updatedUser = yield prisma.user.update({
            where: { id: userId },
            data: updateData,
            select: {
                id: true,
                email: true,
                name: true,
                isEmailVerified: true,
                createdAt: true,
                updatedAt: true
            }
        });
        res.status(200).json({
            message: 'Profile updated successfully',
            user: updatedUser
        });
    }
    catch (error) {
        console.error('Update profile error:', error);
        if (error instanceof Error) {
            console.log('Error details:', error.message, error.stack);
        }
        else {
            console.log('Caught a non-Error object:', error);
        }
        next(error);
    }
});
exports.updateProfile = updateProfile;
// --- Resend Verification Email ---
const resendVerificationEmail = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    const prisma = req.app.locals.prisma;
    if (!userId) {
        res.status(401).json({ message: 'Unauthorized - User ID not found in token' });
        return;
    }
    try {
        // Get user
        const user = yield prisma.user.findUnique({
            where: { id: userId }
        });
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        // Check if already verified
        if (user.isEmailVerified) {
            res.status(400).json({ message: 'Email is already verified' });
            return;
        }
        // Generate new verification token
        const verificationToken = (0, tokenService_1.generateEmailVerificationToken)();
        // Update user with new token
        yield prisma.user.update({
            where: { id: userId },
            data: {
                emailVerificationToken: verificationToken
            }
        });
        // Send verification email
        try {
            yield (0, emailService_1.sendVerificationEmail)(user, verificationToken);
        }
        catch (emailError) {
            console.error('Error sending verification email:', emailError);
            res.status(500).json({ message: 'Failed to send verification email' });
            return;
        }
        res.status(200).json({ message: 'Verification email sent successfully' });
    }
    catch (error) {
        console.error('Resend verification email error:', error);
        if (error instanceof Error) {
            console.log('Error details:', error.message, error.stack);
        }
        else {
            console.log('Caught a non-Error object:', error);
        }
        next(error);
    }
});
exports.resendVerificationEmail = resendVerificationEmail;
// --- Refresh Access Token ---
const refreshTokens = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        res.status(400).json({ message: 'Refresh token is required' });
        return;
    }
    try {
        // Attempt to refresh the access token
        const result = yield (0, tokenService_1.refreshAccessToken)(refreshToken);
        if (!result) {
            res.status(401).json({ message: 'Invalid or expired refresh token' });
            return;
        }
        // Return the new tokens
        res.status(200).json({
            message: 'Token refreshed successfully',
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
            refreshTokenExpiry: result.expiresAt
        });
    }
    catch (error) {
        console.error('Token refresh error:', error);
        if (error instanceof Error) {
            console.log('Error details:', error.message, error.stack);
        }
        else {
            console.log('Caught a non-Error object:', error);
        }
        next(error);
    }
});
exports.refreshTokens = refreshTokens;
// --- Revoke Refresh Token ---
const revokeToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    const { refreshToken } = req.body;
    if (!userId) {
        res.status(401).json({ message: 'Unauthorized - User ID not found in token' });
        return;
    }
    if (!refreshToken) {
        res.status(400).json({ message: 'Refresh token is required' });
        return;
    }
    try {
        // Verify the refresh token belongs to the current user
        const verification = yield (0, tokenService_1.verifyRefreshToken)(refreshToken);
        if (!verification || verification.userId !== userId) {
            res.status(403).json({ message: 'Unauthorized - Token does not belong to the current user' });
            return;
        }
        // Revoke the token
        const success = yield (0, tokenService_1.revokeRefreshToken)(refreshToken);
        if (!success) {
            res.status(500).json({ message: 'Failed to revoke token' });
            return;
        }
        res.status(200).json({ message: 'Token revoked successfully' });
    }
    catch (error) {
        console.error('Token revocation error:', error);
        if (error instanceof Error) {
            console.log('Error details:', error.message, error.stack);
        }
        else {
            console.log('Caught a non-Error object:', error);
        }
        next(error);
    }
});
exports.revokeToken = revokeToken;
// --- Revoke All User Refresh Tokens ---
const revokeAllTokens = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    if (!userId) {
        res.status(401).json({ message: 'Unauthorized - User ID not found in token' });
        return;
    }
    try {
        // Revoke all tokens for the user
        const count = yield (0, tokenService_1.revokeAllUserRefreshTokens)(userId);
        res.status(200).json({
            message: 'All tokens revoked successfully',
            count
        });
    }
    catch (error) {
        console.error('Token revocation error:', error);
        if (error instanceof Error) {
            console.log('Error details:', error.message, error.stack);
        }
        else {
            console.log('Caught a non-Error object:', error);
        }
        next(error);
    }
});
exports.revokeAllTokens = revokeAllTokens;
