import { Request, Response } from 'express';
import { mockDeep, mockReset } from 'jest-mock-extended';
import { prismaMock } from '../../__tests__/setup';
import * as deviceController from '../deviceController';

// Define the AuthenticatedRequest interface to match the one in deviceController
interface AuthenticatedRequest extends Request {
  user?: { userId: string; email: string };
}

describe('Device Controller', () => {
  // Create mock request and response objects
  const mockRequest = mockDeep<AuthenticatedRequest>();
  const mockResponse = mockDeep<Response>();
  const mockNext = jest.fn();

  // Reset mocks before each test
  beforeEach(() => {
    mockReset(mockRequest);
    mockReset(mockResponse);
    mockNext.mockClear();
    mockResponse.status.mockReturnThis();
    mockResponse.json.mockReturnThis();
    mockResponse.send.mockReturnThis();
    
    // Set up common request properties
    mockRequest.user = { userId: 'user123', email: 'test@example.com' };
    mockRequest.app = {
      locals: {
        prisma: prismaMock
      }
    } as any;
  });

  describe('registerDevice', () => {
    it('should return 401 if user is not authenticated', async () => {
      // Arrange
      mockRequest.user = undefined;

      // Act
      await deviceController.registerDevice(mockRequest as any, mockResponse as any, mockNext);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('Unauthorized')
      }));
    });

    it('should return 400 if required fields are missing', async () => {
      // Arrange
      mockRequest.body = { name: 'My Phone', type: 'MOBILE' }; // Missing identifier

      // Act
      await deviceController.registerDevice(mockRequest as any, mockResponse as any, mockNext);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Device name, type, and identifier are required'
      }));
    });

    it('should return 400 if device type is invalid', async () => {
      // Arrange
      mockRequest.body = {
        name: 'My Phone',
        type: 'INVALID_TYPE',
        identifier: 'device-123'
      };

      // Act
      await deviceController.registerDevice(mockRequest as any, mockResponse as any, mockNext);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('Invalid device type')
      }));
    });

    it('should return existing device if already registered', async () => {
      // Arrange
      mockRequest.body = {
        name: 'My Phone',
        type: 'MOBILE',
        identifier: 'device-123'
      };

      const existingDevice = {
        id: 'device1',
        name: 'My Phone',
        type: 'MOBILE',
        identifier: 'device-123',
        userId: 'user123',
        lastSeen: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      prismaMock.device.findUnique.mockResolvedValue(existingDevice);

      // Act
      await deviceController.registerDevice(mockRequest as any, mockResponse as any, mockNext);

      // Assert
      expect(prismaMock.device.findUnique).toHaveBeenCalledWith({
        where: {
          userId_identifier: {
            userId: 'user123',
            identifier: 'device-123'
          }
        }
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Device already registered',
        device: expect.objectContaining({
          id: 'device1',
          name: 'My Phone',
          type: 'MOBILE',
          identifier: 'device-123'
        })
      }));
    });

    it('should register a new device successfully', async () => {
      // Arrange
      mockRequest.body = {
        name: 'My Phone',
        type: 'mobile', // lowercase to test conversion
        identifier: 'device-123'
      };

      prismaMock.device.findUnique.mockResolvedValue(null);

      const newDevice = {
        id: 'device1',
        name: 'My Phone',
        type: 'MOBILE',
        identifier: 'device-123',
        userId: 'user123',
        lastSeen: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      prismaMock.device.create.mockResolvedValue(newDevice);

      // Act
      await deviceController.registerDevice(mockRequest as any, mockResponse as any, mockNext);

      // Assert
      expect(prismaMock.device.create).toHaveBeenCalledWith({
        data: {
          name: 'My Phone',
          type: 'MOBILE',
          identifier: 'device-123',
          userId: 'user123',
          lastSeen: expect.any(Date)
        }
      });
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        id: 'device1',
        name: 'My Phone',
        type: 'MOBILE',
        identifier: 'device-123',
        message: 'Device registered successfully'
      }));
    });

    it('should handle database errors', async () => {
      // Arrange
      mockRequest.body = {
        name: 'My Phone',
        type: 'MOBILE',
        identifier: 'device-123'
      };

      prismaMock.device.findUnique.mockResolvedValue(null);

      const dbError = new Error('Database error');
      prismaMock.device.create.mockRejectedValue(dbError);

      // Act
      await deviceController.registerDevice(mockRequest as any, mockResponse as any, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledWith(dbError);
    });
  });

  describe('listDevices', () => {
    it('should return 401 if user is not authenticated', async () => {
      // Arrange
      mockRequest.user = undefined;

      // Act
      await deviceController.listDevices(mockRequest as any, mockResponse as any, mockNext);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Unauthorized'
      }));
    });

    it('should return a list of devices', async () => {
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
      await deviceController.listDevices(mockRequest as any, mockResponse as any, mockNext);

      // Assert
      expect(prismaMock.device.findMany).toHaveBeenCalledWith({
        where: { userId: 'user123' },
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
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockDevices);
    });

    it('should handle database errors', async () => {
      // Arrange
      const dbError = new Error('Database error');
      prismaMock.device.findMany.mockRejectedValue(dbError);

      // Act
      await deviceController.listDevices(mockRequest as any, mockResponse as any, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledWith(dbError);
    });
  });

  describe('updateDevice', () => {
    it('should return 401 if user is not authenticated', async () => {
      // Arrange
      mockRequest.user = undefined;

      // Act
      await deviceController.updateDevice(mockRequest as any, mockResponse as any, mockNext);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Unauthorized'
      }));
    });

    it('should return 400 if device ID is missing', async () => {
      // Arrange
      mockRequest.params = {};

      // Act
      await deviceController.updateDevice(mockRequest as any, mockResponse as any, mockNext);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Device ID is required'
      }));
    });

    it('should return 400 if no fields are provided for update', async () => {
      // Arrange
      mockRequest.params = { id: 'device1' };
      mockRequest.body = {};

      // Act
      await deviceController.updateDevice(mockRequest as any, mockResponse as any, mockNext);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'At least one field (name or type) must be provided for update'
      }));
    });

    it('should return 400 if device type is invalid', async () => {
      // Arrange
      mockRequest.params = { id: 'device1' };
      mockRequest.body = { type: 'INVALID_TYPE' };

      // Act
      await deviceController.updateDevice(mockRequest as any, mockResponse as any, mockNext);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('Invalid device type')
      }));
    });

    it('should return 404 if device is not found', async () => {
      // Arrange
      mockRequest.params = { id: 'nonexistent-device' };
      mockRequest.body = { name: 'Updated Name' };

      prismaMock.device.findFirst.mockResolvedValue(null);

      // Act
      await deviceController.updateDevice(mockRequest as any, mockResponse as any, mockNext);

      // Assert
      expect(prismaMock.device.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'nonexistent-device',
          userId: 'user123'
        }
      });
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Device not found or does not belong to the user'
      }));
    });

    it('should update device name successfully', async () => {
      // Arrange
      mockRequest.params = { id: 'device1' };
      mockRequest.body = { name: 'Updated Name' };

      const existingDevice = {
        id: 'device1',
        name: 'My Phone',
        type: 'MOBILE',
        identifier: 'device-123',
        userId: 'user123',
        lastSeen: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const updatedDevice = {
        ...existingDevice,
        name: 'Updated Name',
        lastSeen: new Date()
      };

      prismaMock.device.findFirst.mockResolvedValue(existingDevice);
      prismaMock.device.update.mockResolvedValue(updatedDevice);

      // Act
      await deviceController.updateDevice(mockRequest as any, mockResponse as any, mockNext);

      // Assert
      expect(prismaMock.device.update).toHaveBeenCalledWith({
        where: {
          id: 'device1'
        },
        data: {
          name: 'Updated Name',
          lastSeen: expect.any(Date)
        }
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        id: 'device1',
        name: 'Updated Name',
        type: 'MOBILE',
        identifier: 'device-123',
        message: 'Device updated successfully'
      }));
    });

    it('should update device type successfully', async () => {
      // Arrange
      mockRequest.params = { id: 'device1' };
      mockRequest.body = { type: 'desktop' }; // lowercase to test conversion

      const existingDevice = {
        id: 'device1',
        name: 'My Phone',
        type: 'MOBILE',
        identifier: 'device-123',
        userId: 'user123',
        lastSeen: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const updatedDevice = {
        ...existingDevice,
        type: 'DESKTOP',
        lastSeen: new Date()
      };

      prismaMock.device.findFirst.mockResolvedValue(existingDevice);
      prismaMock.device.update.mockResolvedValue(updatedDevice);

      // Act
      await deviceController.updateDevice(mockRequest as any, mockResponse as any, mockNext);

      // Assert
      expect(prismaMock.device.update).toHaveBeenCalledWith({
        where: {
          id: 'device1'
        },
        data: {
          type: 'DESKTOP',
          lastSeen: expect.any(Date)
        }
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        id: 'device1',
        name: 'My Phone',
        type: 'DESKTOP',
        identifier: 'device-123',
        message: 'Device updated successfully'
      }));
    });

    it('should handle database errors', async () => {
      // Arrange
      mockRequest.params = { id: 'device1' };
      mockRequest.body = { name: 'Updated Name' };

      prismaMock.device.findFirst.mockResolvedValue({
        id: 'device1',
        name: 'My Phone',
        type: 'MOBILE',
        identifier: 'device-123',
        userId: 'user123',
        lastSeen: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const dbError = new Error('Database error');
      prismaMock.device.update.mockRejectedValue(dbError);

      // Act
      await deviceController.updateDevice(mockRequest as any, mockResponse as any, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledWith(dbError);
    });
  });

  describe('deleteDevice', () => {
    it('should delete device successfully', async () => {
      // Arrange
      mockRequest.params = { id: 'device1' };

      prismaMock.device.findFirst.mockResolvedValue({
        id: 'device1',
        name: 'My Phone',
        type: 'MOBILE',
        identifier: 'device-123',
        userId: 'user123',
        lastSeen: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      });

      prismaMock.device.delete.mockResolvedValue({} as any);

      // Act
      await deviceController.deleteDevice(mockRequest as any, mockResponse as any, mockNext);

      // Assert
      expect(prismaMock.device.delete).toHaveBeenCalledWith({
        where: {
          id: 'device1'
        }
      });
      expect(mockResponse.status).toHaveBeenCalledWith(204);
      expect(mockResponse.send).toHaveBeenCalled();
    });
  });

  describe('verifyDevice', () => {
    it('should verify device successfully', async () => {
      // Arrange
      mockRequest.params = { id: 'device1' };
      mockRequest.body = { verificationCode: '123456' };

      const existingDevice = {
        id: 'device1',
        name: 'My Phone',
        type: 'MOBILE',
        identifier: 'device-123',
        userId: 'user123',
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
      await deviceController.verifyDevice(mockRequest as any, mockResponse as any, mockNext);

      // Assert
      expect(prismaMock.device.update).toHaveBeenCalledWith({
        where: {
          id: 'device1'
        },
        data: {
          lastSeen: expect.any(Date)
        }
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        id: 'device1',
        name: 'My Phone',
        type: 'MOBILE',
        identifier: 'device-123',
        message: 'Device verified successfully'
      }));
    });

    it('should return 400 if verification code is invalid', async () => {
      // Arrange
      mockRequest.params = { id: 'device1' };
      mockRequest.body = { verificationCode: '12345' }; // Not 6 digits

      // Act
      await deviceController.verifyDevice(mockRequest as any, mockResponse as any, mockNext);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Invalid verification code format. Must be a 6-digit number.'
      }));
    });
  });
});