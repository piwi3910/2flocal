"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const adminMiddleware_1 = require("../middleware/adminMiddleware");
const adminController_1 = require("../controllers/adminController"); // Import controller
const router = (0, express_1.Router)();
// --- Apply Middleware Stack ---
// 1. Ensure user is authenticated
// 2. Ensure authenticated user is an admin
router.use(authMiddleware_1.authenticateToken);
router.use(adminMiddleware_1.checkAdmin);
// --- Define Admin Routes ---
// DELETE /api/admin/devices/:id - Admin deletes a device by its ID
router.delete('/devices/:id', adminController_1.adminDeleteDevice); // Use controller function
// Add other admin routes here (e.g., list all users, promote/demote admin)
exports.default = router;
