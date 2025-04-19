import { Request, Response } from 'express';
import { mockDeep, mockReset } from 'jest-mock-extended';
import { prismaMock } from '../../__tests__/setup';
import * as adminController from '../adminController';

describe('Admin Controller', () => {
  // Create mock request and response objects
  const mockRequest = mockDeep<Request>();
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
    mockRequest.app = {
      locals: {
        prisma: prismaMock
      }
    } as any;
  });

  describe('adminDeleteDevice', () => {
    it('should return 400 if device ID is missing', async () => {
      // Arrange
      mockRequest.params = {};

      // Act
      await adminController.adminDeleteDevice(mockRequest as any, mockResponse as any, mockNext);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Device ID is required in URL parameters'
      }));
    });

    it('should return 404 if device is not found', async () => {
      // Arrange
      mockRequest.params = { id: 'nonexistent-device' };
      prismaMock.device.deleteMany.mockResolvedValue({ count: 0 });

      // Act
      await adminController.adminDeleteDevice(mockRequest as any, mockResponse as any, mockNext);

      // Assert
      expect(prismaMock.device.deleteMany).toHaveBeenCalledWith({
        where: {
          id: 'nonexistent-device'
        }
      });
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Device not found'
      }));
    });

    it('should delete device successfully', async () => {
      // Arrange
      mockRequest.params = { id: 'device1' };
      prismaMock.device.deleteMany.mockResolvedValue({ count: 1 });

      // Act
      await adminController.adminDeleteDevice(mockRequest as any, mockResponse as any, mockNext);

      // Assert
      expect(prismaMock.device.deleteMany).toHaveBeenCalledWith({
        where: {
          id: 'device1'
        }
      });
      expect(mockResponse.status).toHaveBeenCalledWith(204);
      expect(mockResponse.send).toHaveBeenCalled();
    });

    it('should handle database errors', async () => {
      // Arrange
      mockRequest.params = { id: 'device1' };
      const dbError = new Error('Database error');
      prismaMock.device.deleteMany.mockRejectedValue(dbError);

      // Act
      await adminController.adminDeleteDevice(mockRequest as any, mockResponse as any, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledWith(dbError);
    });
  });
});