"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// --- Public Routes --- 
const registerHandler = authController_1.registerUser;
const loginHandler = authController_1.loginUser;
router.post('/register', registerHandler);
router.post('/login', loginHandler);
// --- Protected Routes --- 
const getCurrentUserHandler = authController_1.getCurrentUser;
// Apply auth middleware ONLY to routes below this line in this router
router.get('/me', authMiddleware_1.authenticateToken, getCurrentUserHandler);
exports.default = router;
