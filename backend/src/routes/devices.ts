import { Router } from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import {
    registerDevice,
    listDevices,
    updateDevice,
    deleteDevice,
    verifyDevice
} from '../controllers/deviceController'; // Import controllers

const router = Router();

// Protect all device routes
router.use(authenticateToken);

// POST /api/devices - Register a new device for the logged-in user
router.post('/', registerDevice);

// GET /api/devices - List devices for the logged-in user
router.get('/', listDevices);

// PUT /api/devices/:id - Update a device for the logged-in user
router.put('/:id', updateDevice);

// DELETE /api/devices/:id - Delete a device for the logged-in user
router.delete('/:id', deleteDevice);

// POST /api/devices/:id/verify - Verify a device for the logged-in user
router.post('/:id/verify', verifyDevice);

export default router;
