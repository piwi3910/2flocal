import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'DEFAULT_SECRET_CHANGE_ME';

// Extend the Express Request interface to include the user payload
interface AuthenticatedRequest extends Request {
  user?: { userId: string; email: string }; // Matches the payload structure from login
}

/**
 * Middleware to authenticate JWT tokens
 * Handles token extraction, validation, and attaches user data to the request
 */
export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Extract token from 'Bearer <token>'

  if (!token) {
    res.status(401).json({
      message: 'Authentication required',
      error: 'No token provided',
      code: 'AUTH_NO_TOKEN'
    });
    return;
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      console.error('JWT Verification Error:', err.message);
      
      // Provide more specific error messages based on the error type
      if (err.name === 'TokenExpiredError') {
        res.status(401).json({
          message: 'Authentication expired',
          error: 'Token has expired',
          code: 'AUTH_TOKEN_EXPIRED'
        });
      } else if (err.name === 'JsonWebTokenError') {
        res.status(403).json({
          message: 'Authentication invalid',
          error: 'Invalid token',
          code: 'AUTH_TOKEN_INVALID'
        });
      } else {
        res.status(403).json({
          message: 'Authentication failed',
          error: 'Token verification failed',
          code: 'AUTH_TOKEN_VERIFICATION_FAILED'
        });
      }
      return;
    }

    // Token is valid, attach user payload to the request object
    req.user = user as { userId: string; email: string };
    next(); // Proceed to the next middleware or route handler
  });
};
