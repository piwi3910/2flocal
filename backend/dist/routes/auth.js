"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const rateLimitMiddleware_1 = require("../middleware/rateLimitMiddleware");
const router = (0, express_1.Router)();
// --- Public Routes ---
const registerHandler = authController_1.registerUser;
const loginHandler = authController_1.loginUser;
const verifyEmailHandler = authController_1.verifyEmail;
const forgotPasswordHandler = authController_1.forgotPassword;
const resetPasswordHandler = authController_1.resetPassword;
const refreshTokensHandler = authController_1.refreshTokens;
// Apply rate limiting to sensitive endpoints
router.post('/register', rateLimitMiddleware_1.accountCreationLimiter, rateLimitMiddleware_1.authLimiter, registerHandler);
router.post('/login', rateLimitMiddleware_1.authLimiter, loginHandler);
router.get('/verify-email/:token', verifyEmailHandler);
router.post('/forgot-password', rateLimitMiddleware_1.passwordResetLimiter, forgotPasswordHandler);
router.post('/reset-password', rateLimitMiddleware_1.passwordResetLimiter, resetPasswordHandler);
router.post('/refresh-token', rateLimitMiddleware_1.authLimiter, refreshTokensHandler);
// --- Protected Routes ---
const getCurrentUserHandler = authController_1.getCurrentUser;
const updateProfileHandler = authController_1.updateProfile;
const resendVerificationEmailHandler = authController_1.resendVerificationEmail;
const revokeTokenHandler = authController_1.revokeToken;
const revokeAllTokensHandler = authController_1.revokeAllTokens;
// Apply auth middleware ONLY to routes below this line in this router
router.get('/me', authMiddleware_1.authenticateToken, getCurrentUserHandler);
router.put('/profile', authMiddleware_1.authenticateToken, updateProfileHandler);
router.post('/resend-verification', authMiddleware_1.authenticateToken, resendVerificationEmailHandler);
router.post('/revoke-token', authMiddleware_1.authenticateToken, revokeTokenHandler);
router.post('/revoke-all-tokens', authMiddleware_1.authenticateToken, revokeAllTokensHandler);
exports.default = router;
