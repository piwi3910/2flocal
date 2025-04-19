import { Router, RequestHandler } from 'express';
import {
    registerUser,
    loginUser,
    getCurrentUser,
    verifyEmail,
    forgotPassword,
    resetPassword,
    updateProfile,
    resendVerificationEmail,
    refreshTokens,
    revokeToken,
    revokeAllTokens
} from '../controllers/authController';
import { authenticateToken } from '../middleware/authMiddleware';
import {
    authLimiter,
    passwordResetLimiter,
    accountCreationLimiter
} from '../middleware/rateLimitMiddleware';

const router = Router();

// --- Public Routes ---
const registerHandler: RequestHandler = registerUser;
const loginHandler: RequestHandler = loginUser;
const verifyEmailHandler: RequestHandler = verifyEmail;
const forgotPasswordHandler: RequestHandler = forgotPassword;
const resetPasswordHandler: RequestHandler = resetPassword;
const refreshTokensHandler: RequestHandler = refreshTokens;

// Apply rate limiting to sensitive endpoints
router.post('/register', accountCreationLimiter, authLimiter, registerHandler);
router.post('/login', authLimiter, loginHandler);
router.get('/verify-email/:token', verifyEmailHandler);
router.post('/forgot-password', passwordResetLimiter, forgotPasswordHandler);
router.post('/reset-password', passwordResetLimiter, resetPasswordHandler);
router.post('/refresh-token', authLimiter, refreshTokensHandler);

// --- Protected Routes ---
const getCurrentUserHandler: RequestHandler = getCurrentUser;
const updateProfileHandler: RequestHandler = updateProfile;
const resendVerificationEmailHandler: RequestHandler = resendVerificationEmail;
const revokeTokenHandler: RequestHandler = revokeToken;
const revokeAllTokensHandler: RequestHandler = revokeAllTokens;

// Apply auth middleware ONLY to routes below this line in this router
router.get('/me', authenticateToken, getCurrentUserHandler);
router.put('/profile', authenticateToken, updateProfileHandler);
router.post('/resend-verification', authenticateToken, resendVerificationEmailHandler);
router.post('/revoke-token', authenticateToken, revokeTokenHandler);
router.post('/revoke-all-tokens', authenticateToken, revokeAllTokensHandler);

export default router;
