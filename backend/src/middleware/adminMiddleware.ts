import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '../../prisma/src/generated/prisma';

const prisma = new PrismaClient();

// Extend Request interface to include user from authMiddleware
interface AuthenticatedRequest extends Request {
  user?: { userId: string; email: string };
}

export const checkAdmin = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  const userId = req.user?.userId;

  if (!userId) {
    // Should have been caught by authenticateToken, but double-check
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isAdmin: true }, // Only select the isAdmin field
    });

    if (!user || !user.isAdmin) {
      res.status(403).json({ message: 'Forbidden: Requires admin privileges' });
      return;
    }

    // User is admin, proceed to the next handler
    next();

  } catch (error) {
    console.error('Admin check error:', error);
    res.status(500).json({ message: 'Internal server error during admin check' });
  }
};
