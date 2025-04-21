"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const deviceController_1 = require("../controllers/deviceController"); // Import controllers
const router = (0, express_1.Router)();
// Protect all device routes
router.use(authMiddleware_1.authenticateToken);
// POST /api/devices - Register a new device for the logged-in user
router.post('/', deviceController_1.registerDevice);
// GET /api/devices - List devices for the logged-in user
router.get('/', deviceController_1.listDevices);
// PUT /api/devices/:id - Update a device for the logged-in user
router.put('/:id', deviceController_1.updateDevice);
// DELETE /api/devices/:id - Delete a device for the logged-in user
router.delete('/:id', deviceController_1.deleteDevice);
// POST /api/devices/:id/verify - Verify a device for the logged-in user
router.post('/:id/verify', deviceController_1.verifyDevice);
exports.default = router;
