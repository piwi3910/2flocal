import { Router } from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import { registerDevice, listDevices } from '../controllers/deviceController'; // Import controllers

const router = Router();

// Protect all device routes
router.use(authenticateToken);

// POST /api/devices - Register a new device for the logged-in user
router.post('/', registerDevice); // Use controller function

// GET /api/devices - List devices for the logged-in user
router.get('/', listDevices); // Use controller function

// Optional: DELETE /api/devices/:id - Remove a device (consider security implications)
// router.delete('/:id', ...) 

export default router;
