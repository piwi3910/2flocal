import { Router } from 'express'; 
import { authenticateToken } from '../middleware/authMiddleware';
import { addAccountSecret, listAccountSecrets, deleteAccountSecret } from '../controllers/accountController'; 

const router = Router();

// --- Mount Authentication Middleware ---
// All routes defined after this will require a valid JWT
router.use(authenticateToken);

// --- Define Account Secret Routes ---

// POST /api/accounts - Add a new account secret
router.post('/', addAccountSecret); 

// GET /api/accounts - List account secrets for the logged-in user
router.get('/', listAccountSecrets); 

// DELETE /api/accounts/:id - Delete a specific account secret
router.delete('/:id', deleteAccountSecret); 

export default router;
