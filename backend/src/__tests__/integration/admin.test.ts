import request from 'supertest';
import express from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import adminRouter from '../../routes/admin';
import { prismaMock } from '../../__tests__/setup';

// Mock dependencies
jest.mock('jsonwebtoken');
jest.mock('../../middleware/authMiddleware', () => ({
  authenticateToken: (req: any, res: any, next: any) => {
    if (req.headers.authorization) {
      req.user = { userId: 'admin123', email: 'admin@example.com' };
      next();
    } else {
      res.status(401).json({ message: 'No token provided' });
    }
  }
}));

// Mock admin middleware
jest.mock('../../middleware/adminMiddleware', () => ({
  checkAdmin: (req: any, res: any, next: any) => {
    if (req.user && req.user.userId === 'admin123') {
      next();
    } else {
      res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }
  }
}));

describe('Admin API', () => {
  // Create a test app
  const app = express();
  app.use(express.json());
  app.use('/api/admin', adminRouter);
  
  // Add prisma mock to app.locals
  app.locals.prisma = prismaMock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('DELETE /api/admin/devices/:id', () => {
    it('should delete a device as admin', async () => {
      // Arrange
      prismaMock.device.deleteMany.mockResolvedValue({ count: 1 });

      // Act
      const response = await request(app)
        .delete('/api/admin/devices/device1')
        .set('Authorization', 'Bearer valid-admin-token');

      // Assert
      expect(prismaMock.device.deleteMany).toHaveBeenCalledWith({
        where: {
          id: 'device1'
        }
      });
      expect(response.status).toBe(204);
    });

    it('should return 404 if device is not found', async () => {
      // Arrange
      prismaMock.device.deleteMany.mockResolvedValue({ count: 0 });

      // Act
      const response = await request(app)
        .delete('/api/admin/devices/nonexistent')
        .set('Authorization', 'Bearer valid-admin-token');

      // Assert
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Device not found');
    });

    it('should return 401 if not authenticated', async () => {
      // Act
      const response = await request(app)
        .delete('/api/admin/devices/device1');

      // Assert
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'No token provided');
    });

    it('should return 403 if authenticated but not admin', async () => {
      // Arrange - Override the mock for this test
      jest.requireMock('../../middleware/adminMiddleware').checkAdmin = 
        (req: any, res: any, next: any) => {
          res.status(403).json({ message: 'Access denied. Admin privileges required.' });
        };

      // Act
      const response = await request(app)
        .delete('/api/admin/devices/device1')
        .set('Authorization', 'Bearer valid-non-admin-token');

      // Assert
      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('message', 'Access denied. Admin privileges required.');
    });

    it('should handle database errors', async () => {
      // Arrange
      const dbError = new Error('Database error');
      prismaMock.device.deleteMany.mockRejectedValue(dbError);

      // Act
      const response = await request(app)
        .delete('/api/admin/devices/device1')
        .set('Authorization', 'Bearer valid-admin-token');

      // Assert
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('message', 'Internal server error');
    });
  });
});