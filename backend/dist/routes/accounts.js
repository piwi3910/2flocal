"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const accountController_1 = require("../controllers/accountController");
const router = (0, express_1.Router)();
// --- Mount Authentication Middleware ---
// All routes defined after this will require a valid JWT
router.use(authMiddleware_1.authenticateToken);
// --- Define Account Secret Routes ---
// POST /api/accounts - Add a new account secret
router.post('/', accountController_1.addAccountSecret);
// GET /api/accounts - List account secrets for the logged-in user
router.get('/', accountController_1.listAccountSecrets);
// DELETE /api/accounts/:id - Delete a specific account secret
router.delete('/:id', accountController_1.deleteAccountSecret);
exports.default = router;
