import { Request, Response } from 'express';
import { mockDeep, mockReset } from 'jest-mock-extended';
import { prismaMock } from '../../__tests__/setup';
import * as authController from '../authController';
import * as tokenService from '../../utils/tokenService';
import * as bcrypt from 'bcrypt';

// Mock dependencies
jest.mock('../../utils/tokenService');
jest.mock('bcrypt');

describe('Auth Controller', () => {
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
  });

  describe('loginUser', () => {
    it('should return 400 if email or password is missing', async () => {
      // Arrange
      mockRequest.body = { email: 'test@example.com' }; // Missing password

      // Act
      await authController.loginUser(mockRequest, mockResponse, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalled();
      expect(mockNext.mock.calls[0][0].statusCode).toBe(400);
    });

    it('should return 401 if user is not found', async () => {
      // Arrange
      mockRequest.body = { email: 'test@example.com', password: 'password123' };
      prismaMock.user.findUnique.mockResolvedValue(null);

      // Act
      await authController.loginUser(mockRequest, mockResponse, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalled();
      expect(mockNext.mock.calls[0][0].statusCode).toBe(401);
      expect(mockNext.mock.calls[0][0].message).toContain('Invalid credentials');
    });

    it('should return 401 if password is incorrect', async () => {
      // Arrange
      mockRequest.body = { email: 'test@example.com', password: 'password123' };
      prismaMock.user.findUnique.mockResolvedValue({
        id: '1',
        email: 'test@example.com',
        passwordHash: 'hashedPassword',
        name: 'Test User',
        role: 'USER',
        createdAt: new Date(),
        updatedAt: new Date(),
        isEmailVerified: false,
        emailVerificationToken: null,
        passwordResetToken: null,
        passwordResetExpires: null,
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      // Act
      await authController.loginUser(mockRequest, mockResponse, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalled();
      expect(mockNext.mock.calls[0][0].statusCode).toBe(401);
      expect(mockNext.mock.calls[0][0].message).toContain('Invalid credentials');
    });

    it('should return 200 and tokens if login is successful', async () => {
      // Arrange
      mockRequest.body = { email: 'test@example.com', password: 'password123' };
      prismaMock.user.findUnique.mockResolvedValue({
        id: '1',
        email: 'test@example.com',
        passwordHash: 'hashedPassword',
        name: 'Test User',
        role: 'USER',
        createdAt: new Date(),
        updatedAt: new Date(),
        isEmailVerified: true,
        emailVerificationToken: null,
        passwordResetToken: null,
        passwordResetExpires: null,
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (tokenService.generateAccessToken as jest.Mock).mockReturnValue('access-token');
      (tokenService.generateRefreshToken as jest.Mock).mockReturnValue('refresh-token');
      prismaMock.refreshToken.create.mockResolvedValue({
        id: '1',
        token: 'refresh-token',
        userId: '1',
        expiresAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Act
      await authController.loginUser(mockRequest, mockResponse, mockNext);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          accessToken: 'access-token',
          refreshToken: 'refresh-token',
        })
      );
    });
  });

  // Add more tests for other auth controller methods...
});