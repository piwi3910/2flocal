"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const rateLimitMiddleware_1 = require("../middleware/rateLimitMiddleware");
const accountController_1 = require("../controllers/accountController");
const router = (0, express_1.Router)();
// --- Mount Authentication Middleware ---
// All routes defined after this will require a valid JWT
router.use(authMiddleware_1.authenticateToken);
// Apply general API rate limiting to all account routes
router.use(rateLimitMiddleware_1.apiLimiter);
// --- Define Account Secret Routes ---
// POST /api/accounts - Add a new account secret
router.post('/', accountController_1.addAccountSecret);
// GET /api/accounts - List account secrets for the logged-in user
router.get('/', accountController_1.listAccountSecrets);
// DELETE /api/accounts/:id - Delete a specific account secret
router.delete('/:id', accountController_1.deleteAccountSecret);
// GET /api/accounts/:id/totp - Generate TOTP code for a specific account secret
// Apply additional rate limiting to TOTP generation to prevent abuse
router.get('/:id/totp', rateLimitMiddleware_1.totpGenerationLimiter, accountController_1.generateTOTPCode);
// GET /api/accounts/:id/qrcode - Generate QR code for a specific account secret
router.get('/:id/qrcode', accountController_1.generateQRCodeForAccount);
// POST /api/accounts/parse-qrcode - Parse a QR code image to extract TOTP secret
router.post('/parse-qrcode', accountController_1.parseQRCodeImage);
exports.default = router;
