import { Router } from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import { apiLimiter, totpGenerationLimiter } from '../middleware/rateLimitMiddleware';
import {
    addAccountSecret,
    listAccountSecrets,
    deleteAccountSecret,
    generateTOTPCode,
    generateQRCodeForAccount,
    parseQRCodeImage
} from '../controllers/accountController';

const router = Router();

// --- Mount Authentication Middleware ---
// All routes defined after this will require a valid JWT
router.use(authenticateToken);

// Apply general API rate limiting to all account routes
router.use(apiLimiter);

// --- Define Account Secret Routes ---

// POST /api/accounts - Add a new account secret
router.post('/', addAccountSecret); 

// GET /api/accounts - List account secrets for the logged-in user
router.get('/', listAccountSecrets); 

// DELETE /api/accounts/:id - Delete a specific account secret
router.delete('/:id', deleteAccountSecret);

// GET /api/accounts/:id/totp - Generate TOTP code for a specific account secret
// Apply additional rate limiting to TOTP generation to prevent abuse
router.get('/:id/totp', totpGenerationLimiter, generateTOTPCode);

// GET /api/accounts/:id/qrcode - Generate QR code for a specific account secret
router.get('/:id/qrcode', generateQRCodeForAccount);

// POST /api/accounts/parse-qrcode - Parse a QR code image to extract TOTP secret
router.post('/parse-qrcode', parseQRCodeImage);

export default router;
