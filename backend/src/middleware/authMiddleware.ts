import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'DEFAULT_SECRET_CHANGE_ME';

// Extend the Express Request interface to include the user payload
interface AuthenticatedRequest extends Request {
  user?: { userId: string; email: string }; // Matches the payload structure from login
}

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Extract token from 'Bearer <token>'

  if (!token) {
    res.sendStatus(401); // No token provided
    return;
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      console.error('JWT Verification Error:', err.message);
      res.sendStatus(403); // Invalid token
      return;
    }

    // Token is valid, attach user payload to the request object
    req.user = user as { userId: string; email: string };
    next(); // Proceed to the next middleware or route handler
  });
};
