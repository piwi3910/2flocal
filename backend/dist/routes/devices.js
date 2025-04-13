"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const deviceController_1 = require("../controllers/deviceController"); // Import controllers
const router = (0, express_1.Router)();
// Protect all device routes
router.use(authMiddleware_1.authenticateToken);
// POST /api/devices - Register a new device for the logged-in user
router.post('/', deviceController_1.registerDevice); // Use controller function
// GET /api/devices - List devices for the logged-in user
router.get('/', deviceController_1.listDevices); // Use controller function
// Optional: DELETE /api/devices/:id - Remove a device (consider security implications)
// router.delete('/:id', ...) 
exports.default = router;
