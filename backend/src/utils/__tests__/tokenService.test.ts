import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { prismaMock } from '../../__tests__/setup';
import * as tokenService from '../tokenService';

// Mock dependencies
jest.mock('jsonwebtoken');
jest.mock('crypto');

describe('Token Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateToken', () => {
    it('should generate a random token with default length', () => {
      // Arrange
      const mockRandomBytes = Buffer.from('mockRandomBytes');
      (crypto.randomBytes as jest.Mock).mockReturnValue(mockRandomBytes);

      // Act
      const result = tokenService.generateToken();

      // Assert
      expect(crypto.randomBytes).toHaveBeenCalledWith(32);
      expect(result).toBe(mockRandomBytes.toString('hex'));
    });

    it('should generate a random token with specified length', () => {
      // Arrange
      const mockRandomBytes = Buffer.from('mockRandomBytes');
      (crypto.randomBytes as jest.Mock).mockReturnValue(mockRandomBytes);

      // Act
      const result = tokenService.generateToken(64);

      // Assert
      expect(crypto.randomBytes).toHaveBeenCalledWith(64);
      expect(result).toBe(mockRandomBytes.toString('hex'));
    });
  });

  describe('generatePasswordResetToken', () => {
    it('should generate a password reset token with expiry', () => {
      // Arrange
      const mockToken = 'mockToken';
      jest.spyOn(tokenService, 'generateToken').mockReturnValue(mockToken);
      const mockDate = new Date('2025-04-19T08:00:00Z');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

      // Act
      const result = tokenService.generatePasswordResetToken();

      // Assert
      expect(tokenService.generateToken).toHaveBeenCalled();
      expect(result.token).toBe(mockToken);
      expect(result.expires).toEqual(new Date('2025-04-19T09:00:00Z')); // 1 hour later
    });
  });

  describe('generateEmailVerificationToken', () => {
    it('should generate an email verification token', () => {
      // Arrange
      const mockToken = 'mockToken';
      jest.spyOn(tokenService, 'generateToken').mockReturnValue(mockToken);

      // Act
      const result = tokenService.generateEmailVerificationToken();

      // Assert
      expect(tokenService.generateToken).toHaveBeenCalled();
      expect(result).toBe(mockToken);
    });
  });

  describe('hashToken', () => {
    it('should hash a token using SHA-256', () => {
      // Arrange
      const token = 'testToken';
      const mockHash = {
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValue('hashedToken'),
      };
      (crypto.createHash as jest.Mock).mockReturnValue(mockHash);

      // Act
      const result = tokenService.hashToken(token);

      // Assert
      expect(crypto.createHash).toHaveBeenCalledWith('sha256');
      expect(mockHash.update).toHaveBeenCalledWith(token);
      expect(mockHash.digest).toHaveBeenCalledWith('hex');
      expect(result).toBe('hashedToken');
    });
  });

  describe('generateAccessToken', () => {
    it('should generate a JWT access token', () => {
      // Arrange
      const userId = 'user123';
      const email = 'test@example.com';
      const mockToken = 'mockAccessToken';
      (jwt.sign as jest.Mock).mockReturnValue(mockToken);

      // Act
      const result = tokenService.generateAccessToken(userId, email);

      // Assert
      expect(jwt.sign).toHaveBeenCalledWith(
        { userId, email },
        expect.any(String),
        { expiresIn: '15m' }
      );
      expect(result).toBe(mockToken);
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate a refresh token and store it in the database', async () => {
      // Arrange
      const userId = 'user123';
      const deviceInfo = 'Chrome on Windows';
      const ipAddress = '127.0.0.1';
      const mockToken = 'mockRefreshToken';
      const mockTokenHash = 'hashedRefreshToken';
      const mockUuid = 'mock-uuid';
      
      jest.spyOn(tokenService, 'generateToken').mockReturnValue(mockToken);
      jest.spyOn(tokenService, 'hashToken').mockReturnValue(mockTokenHash);
      (crypto.randomUUID as jest.Mock).mockReturnValue(mockUuid);
      
      const mockDate = new Date('2025-04-19T08:00:00Z');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate);
      
      prismaMock.$executeRaw.mockResolvedValue(1);

      // Act
      const result = await tokenService.generateRefreshToken(userId, deviceInfo, ipAddress);

      // Assert
      expect(tokenService.generateToken).toHaveBeenCalledWith(64);
      expect(tokenService.hashToken).toHaveBeenCalledWith(mockToken);
      expect(prismaMock.$executeRaw).toHaveBeenCalled();
      expect(result.token).toBe(mockToken);
      expect(result.expiresAt).toEqual(new Date('2025-04-26T08:00:00Z')); // 7 days later
    });
  });

  // Add more tests for other token service functions...
});