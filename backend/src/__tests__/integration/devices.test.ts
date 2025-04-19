import request from 'supertest';
import express from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import devicesRouter from '../../routes/devices';
import { prismaMock } from '../../__tests__/setup';

// Mock dependencies
jest.mock('jsonwebtoken');

describe('Devices API', () => {
  // Create a test app
  const app = express();
  app.use(express.json());
  app.use('/api/devices', devicesRouter);
  
  // Add prisma mock to app.locals
  app.locals.prisma = prismaMock;

  // Mock user for authentication
  const mockUser = {
    userId: 'user123',
    email: 'test@example.com'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock JWT verification for all tests
    (jwt.verify as jest.Mock).mockReturnValue(mockUser);
  });

  describe('POST /api/devices', () => {
    // Increase timeout to 15 seconds for all integration tests
    jest.setTimeout(15000);
    
    it('should register a new device', async () => {
      // Arrange
      const deviceData = {
        name: 'My Phone',
        type: 'MOBILE',
        identifier: 'device-123'
      };

      // Mock device creation
      prismaMock.device.findUnique.mockResolvedValue(null); // Device doesn't exist yet
      prismaMock.device.create.mockResolvedValue({
        id: 'device1',
        name: deviceData.name,
        type: deviceData.type,
        identifier: deviceData.identifier,
        userId: mockUser.userId,
        lastSeen: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Act
      const response = await request(app)
        .post('/api/devices')
        .set('Authorization', 'Bearer valid-token')
        .send(deviceData);

      // Assert
      expect(prismaMock.device.findUnique).toHaveBeenCalledWith({
        where: {
          userId_identifier: {
            userId: mockUser.userId,
            identifier: deviceData.identifier
          }
        }
      });
      expect(prismaMock.device.create).toHaveBeenCalledWith({
        data: {
          name: deviceData.name,
          type: deviceData.type,
          identifier: deviceData.identifier,
          userId: mockUser.userId,
          lastSeen: expect.any(Date)
        }
      });
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id', 'device1');
      expect(response.body).toHaveProperty('name', deviceData.name);
      expect(response.body).toHaveProperty('type', deviceData.type);
      expect(response.body).toHaveProperty('identifier', deviceData.identifier);
      expect(response.body).toHaveProperty('message', 'Device registered successfully');
    });

    it('should return existing device if already registered', async () => {
      // Arrange
      const deviceData = {
        name: 'My Phone',
        type: 'MOBILE',
        identifier: 'device-123'
      };

      const existingDevice = {
        id: 'device1',
        name: deviceData.name,
        type: deviceData.type,
        identifier: deviceData.identifier,
        userId: mockUser.userId,
        lastSeen: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Mock device already exists
      prismaMock.device.findUnique.mockResolvedValue(existingDevice);

      // Act
      const response = await request(app)
        .post('/api/devices')
        .set('Authorization', 'Bearer valid-token')
        .send(deviceData);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Device already registered');
      expect(response.body).toHaveProperty('device');
      expect(response.body.device).toHaveProperty('id', 'device1');
    });

    it('should return 400 if required fields are missing', async () => {
      // Arrange
      const deviceData = {
        name: 'My Phone',
        // Missing type and identifier
      };

      // Act
      const response = await request(app)
        .post('/api/devices')
        .set('Authorization', 'Bearer valid-token')
        .send(deviceData);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Device name, type, and identifier are required');
    });

    it('should return 400 if device type is invalid', async () => {
      // Arrange
      const deviceData = {
        name: 'My Phone',
        type: 'INVALID_TYPE',
        identifier: 'device-123'
      };

      // Act
      const response = await request(app)
        .post('/api/devices')
        .set('Authorization', 'Bearer valid-token')
        .send(deviceData);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', expect.stringContaining('Invalid device type'));
    });

    it('should return 401 if not authenticated', async () => {
      // Arrange
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      // Act
      const response = await request(app)
        .post('/api/devices')
        .set('Authorization', 'Bearer invalid-token')
        .send({});

      // Assert
      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/devices', () => {
    it('should list devices for the authenticated user', async () => {
      // Arrange
      const mockDevices = [
        {
          id: 'device1',
          name: 'My Phone',
          type: 'MOBILE',
          identifier: 'device-123',
          lastSeen: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'device2',
          name: 'My Laptop',
          type: 'DESKTOP',
          identifier: 'device-456',
          lastSeen: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      prismaMock.device.findMany.mockResolvedValue(mockDevices);

      // Act
      const response = await request(app)
        .get('/api/devices')
        .set('Authorization', 'Bearer valid-token');

      // Assert
      expect(prismaMock.device.findMany).toHaveBeenCalledWith({
        where: { userId: mockUser.userId },
        select: {
          id: true,
          identifier: true,
          name: true,
          type: true,
          lastSeen: true,
          createdAt: true,
          updatedAt: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('id', 'device1');
      expect(response.body[1]).toHaveProperty('id', 'device2');
    });
  });

  describe('PUT /api/devices/:id', () => {
    it('should update a device', async () => {
      // Arrange
      const updateData = {
        name: 'Updated Phone Name'
      };

      const existingDevice = {
        id: 'device1',
        name: 'My Phone',
        type: 'MOBILE',
        identifier: 'device-123',
        userId: mockUser.userId,
        lastSeen: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const updatedDevice = {
        ...existingDevice,
        name: 'Updated Phone Name',
        lastSeen: new Date()
      };

      prismaMock.device.findFirst.mockResolvedValue(existingDevice);
      prismaMock.device.update.mockResolvedValue(updatedDevice);

      // Act
      const response = await request(app)
        .put('/api/devices/device1')
        .set('Authorization', 'Bearer valid-token')
        .send(updateData);

      // Assert
      expect(prismaMock.device.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'device1',
          userId: mockUser.userId
        }
      });
      expect(prismaMock.device.update).toHaveBeenCalledWith({
        where: {
          id: 'device1'
        },
        data: {
          name: 'Updated Phone Name',
          lastSeen: expect.any(Date)
        }
      });
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', 'device1');
      expect(response.body).toHaveProperty('name', 'Updated Phone Name');
      expect(response.body).toHaveProperty('message', 'Device updated successfully');
    });

    it('should return 404 if device is not found', async () => {
      // Arrange
      const updateData = {
        name: 'Updated Phone Name'
      };

      prismaMock.device.findFirst.mockResolvedValue(null);

      // Act
      const response = await request(app)
        .put('/api/devices/nonexistent')
        .set('Authorization', 'Bearer valid-token')
        .send(updateData);

      // Assert
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Device not found or does not belong to the user');
    });

    it('should return 400 if no fields are provided for update', async () => {
      // Arrange
      const updateData = {};

      // Act
      const response = await request(app)
        .put('/api/devices/device1')
        .set('Authorization', 'Bearer valid-token')
        .send(updateData);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'At least one field (name or type) must be provided for update');
    });

    it('should return 400 if device type is invalid', async () => {
      // Arrange
      const updateData = {
        type: 'INVALID_TYPE'
      };

      // Act
      const response = await request(app)
        .put('/api/devices/device1')
        .set('Authorization', 'Bearer valid-token')
        .send(updateData);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', expect.stringContaining('Invalid device type'));
    });
  });

  describe('DELETE /api/devices/:id', () => {
    it('should delete a device', async () => {
      // Arrange
      const existingDevice = {
        id: 'device1',
        name: 'My Phone',
        type: 'MOBILE',
        identifier: 'device-123',
        userId: mockUser.userId,
        lastSeen: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      prismaMock.device.findFirst.mockResolvedValue(existingDevice);
      prismaMock.device.delete.mockResolvedValue({} as any);

      // Act
      const response = await request(app)
        .delete('/api/devices/device1')
        .set('Authorization', 'Bearer valid-token');

      // Assert
      expect(prismaMock.device.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'device1',
          userId: mockUser.userId
        }
      });
      expect(prismaMock.device.delete).toHaveBeenCalledWith({
        where: {
          id: 'device1'
        }
      });
      expect(response.status).toBe(204);
    });

    it('should return 404 if device is not found', async () => {
      // Arrange
      prismaMock.device.findFirst.mockResolvedValue(null);

      // Act
      const response = await request(app)
        .delete('/api/devices/nonexistent')
        .set('Authorization', 'Bearer valid-token');

      // Assert
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Device not found or does not belong to the user');
    });
  });

  describe('POST /api/devices/:id/verify', () => {
    it('should verify a device', async () => {
      // Arrange
      const verificationData = {
        verificationCode: '123456'
      };

      const existingDevice = {
        id: 'device1',
        name: 'My Phone',
        type: 'MOBILE',
        identifier: 'device-123',
        userId: mockUser.userId,
        lastSeen: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const updatedDevice = {
        ...existingDevice,
        lastSeen: new Date()
      };

      prismaMock.device.findFirst.mockResolvedValue(existingDevice);
      prismaMock.device.update.mockResolvedValue(updatedDevice);

      // Act
      const response = await request(app)
        .post('/api/devices/device1/verify')
        .set('Authorization', 'Bearer valid-token')
        .send(verificationData);

      // Assert
      expect(prismaMock.device.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'device1',
          userId: mockUser.userId
        }
      });
      expect(prismaMock.device.update).toHaveBeenCalledWith({
        where: {
          id: 'device1'
        },
        data: {
          lastSeen: expect.any(Date)
        }
      });
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', 'device1');
      expect(response.body).toHaveProperty('message', 'Device verified successfully');
    });

    it('should return 400 if verification code is invalid', async () => {
      // Arrange
      const verificationData = {
        verificationCode: '12345' // Not 6 digits
      };

      // Act
      const response = await request(app)
        .post('/api/devices/device1/verify')
        .set('Authorization', 'Bearer valid-token')
        .send(verificationData);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Invalid verification code format. Must be a 6-digit number.');
    });

    it('should return 404 if device is not found', async () => {
      // Arrange
      const verificationData = {
        verificationCode: '123456'
      };

      prismaMock.device.findFirst.mockResolvedValue(null);

      // Act
      const response = await request(app)
        .post('/api/devices/nonexistent/verify')
        .set('Authorization', 'Bearer valid-token')
        .send(verificationData);

      // Assert
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Device not found or does not belong to the user');
    });
  });
});