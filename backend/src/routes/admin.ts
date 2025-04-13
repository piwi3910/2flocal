import { Router } from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import { checkAdmin } from '../middleware/adminMiddleware';
import { adminDeleteDevice } from '../controllers/adminController'; // Import controller

const router = Router();

// --- Apply Middleware Stack ---
// 1. Ensure user is authenticated
// 2. Ensure authenticated user is an admin
router.use(authenticateToken);
router.use(checkAdmin);

// --- Define Admin Routes ---

// DELETE /api/admin/devices/:id - Admin deletes a device by its ID
router.delete('/devices/:id', adminDeleteDevice); // Use controller function

// Add other admin routes here (e.g., list all users, promote/demote admin)

export default router;
