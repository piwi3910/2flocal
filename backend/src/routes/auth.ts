import { Router, RequestHandler } from 'express';
import { registerUser, loginUser, getCurrentUser } from '../controllers/authController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// --- Public Routes --- 
const registerHandler: RequestHandler = registerUser;
const loginHandler: RequestHandler = loginUser;
router.post('/register', registerHandler);
router.post('/login', loginHandler);

// --- Protected Routes --- 
const getCurrentUserHandler: RequestHandler = getCurrentUser;
// Apply auth middleware ONLY to routes below this line in this router
router.get('/me', authenticateToken, getCurrentUserHandler);

export default router;
