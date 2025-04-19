import { Request, Response } from 'express';
import { mockDeep, mockReset } from 'jest-mock-extended';
import { prismaMock } from '../../__tests__/setup';
import * as accountController from '../accountController';
import { AuthenticatedRequest } from '../accountController';
import * as encryption from '../../utils/encryption';
import * as totpGenerator from '../../utils/totpGenerator';
import * as qrCodeHandler from '../../utils/qrCodeHandler';

// Mock dependencies
jest.mock('../../utils/encryption');
jest.mock('../../utils/totpGenerator');
jest.mock('../../utils/qrCodeHandler');

describe('Account Controller', () => {
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

  describe('addAccountSecret', () => {
    it('should return 401 if user is not authenticated', async () => {
      // Arrange
      mockRequest.user = undefined;

      // Act
      await accountController.addAccountSecret(mockRequest as any, mockResponse as any, mockNext);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Unauthorized'
      }));
    });

    it('should return 400 if required fields are missing', async () => {
      // Arrange
      mockRequest.body = { issuer: 'Test', label: 'test@example.com' }; // Missing secret

      // Act
      await accountController.addAccountSecret(mockRequest as any, mockResponse as any, mockNext);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Issuer, label, and secret are required'
      }));
    });

    it('should create a new account secret successfully', async () => {
      // Arrange
      mockRequest.body = {
        issuer: 'Test',
        label: 'test@example.com',
        secret: 'ABCDEFGHIJKLMNOP'
      };

      const encryptedSecret = 'encrypted-secret';
      (encryption.encrypt as jest.Mock).mockReturnValue(encryptedSecret);

      prismaMock.accountSecret.create.mockResolvedValue({
        id: 'account1',
        issuer: 'Test',
        label: 'test@example.com',
        encryptedSecret,
        userId: 'user123',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Act
      await accountController.addAccountSecret(mockRequest as any, mockResponse as any, mockNext);

      // Assert
      expect(encryption.encrypt).toHaveBeenCalledWith('ABCDEFGHIJKLMNOP');
      expect(prismaMock.accountSecret.create).toHaveBeenCalledWith({
        data: {
          issuer: 'Test',
          label: 'test@example.com',
          encryptedSecret,
          userId: 'user123'
        }
      });
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        id: 'account1',
        issuer: 'Test',
        label: 'test@example.com',
        message: 'Account secret added successfully'
      }));
    });

    it('should handle encryption errors', async () => {
      // Arrange
      mockRequest.body = {
        issuer: 'Test',
        label: 'test@example.com',
        secret: 'ABCDEFGHIJKLMNOP'
      };

      (encryption.encrypt as jest.Mock).mockImplementation(() => {
        throw new Error('Encryption failed');
      });

      // Act
      await accountController.addAccountSecret(mockRequest as any, mockResponse as any, mockNext);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Failed to secure secret data.'
      }));
    });

    it('should pass other errors to the error handler', async () => {
      // Arrange
      mockRequest.body = {
        issuer: 'Test',
        label: 'test@example.com',
        secret: 'ABCDEFGHIJKLMNOP'
      };

      const dbError = new Error('Database error');
      (encryption.encrypt as jest.Mock).mockReturnValue('encrypted-secret');
      prismaMock.accountSecret.create.mockRejectedValue(dbError);

      // Act
      await accountController.addAccountSecret(mockRequest as any, mockResponse as any, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledWith(dbError);
    });
  });

  describe('listAccountSecrets', () => {
    it('should return 401 if user is not authenticated', async () => {
      // Arrange
      mockRequest.user = undefined;

      // Act
      await accountController.listAccountSecrets(mockRequest as any, mockResponse as any, mockNext);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Unauthorized'
      }));
    });

    it('should return a list of account secrets', async () => {
      // Arrange
      const mockSecrets = [
        {
          id: 'account1',
          issuer: 'Test1',
          label: 'test1@example.com',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'account2',
          issuer: 'Test2',
          label: 'test2@example.com',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      prismaMock.accountSecret.findMany.mockResolvedValue(mockSecrets);

      // Act
      await accountController.listAccountSecrets(mockRequest as any, mockResponse as any, mockNext);

      // Assert
      expect(prismaMock.accountSecret.findMany).toHaveBeenCalledWith({
        where: { userId: 'user123' },
        select: {
          id: true,
          issuer: true,
          label: true,
          createdAt: true,
          updatedAt: true
        },
        orderBy: [
          { issuer: 'asc' },
          { label: 'asc' }
        ]
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockSecrets);
    });

    it('should handle database errors', async () => {
      // Arrange
      const dbError = new Error('Database error');
      prismaMock.accountSecret.findMany.mockRejectedValue(dbError);

      // Act
      await accountController.listAccountSecrets(mockRequest as any, mockResponse as any, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledWith(dbError);
    });
  });

  describe('deleteAccountSecret', () => {
    it('should return 401 if user is not authenticated', async () => {
      // Arrange
      mockRequest.user = undefined;

      // Act
      await accountController.deleteAccountSecret(mockRequest as any, mockResponse as any, mockNext);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Unauthorized'
      }));
    });

    it('should return 400 if secret ID is missing', async () => {
      // Arrange
      mockRequest.params = {};

      // Act
      await accountController.deleteAccountSecret(mockRequest as any, mockResponse as any, mockNext);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Account Secret ID is required in URL parameters'
      }));
    });

    it('should return 404 if secret is not found', async () => {
      // Arrange
      mockRequest.params = { id: 'nonexistent-secret' };
      prismaMock.accountSecret.deleteMany.mockResolvedValue({ count: 0 });

      // Act
      await accountController.deleteAccountSecret(mockRequest as any, mockResponse as any, mockNext);

      // Assert
      expect(prismaMock.accountSecret.deleteMany).toHaveBeenCalledWith({
        where: {
          id: 'nonexistent-secret',
          userId: 'user123'
        }
      });
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Account Secret not found or access denied'
      }));
    });

    it('should delete the account secret successfully', async () => {
      // Arrange
      mockRequest.params = { id: 'account1' };
      prismaMock.accountSecret.deleteMany.mockResolvedValue({ count: 1 });

      // Act
      await accountController.deleteAccountSecret(mockRequest as any, mockResponse as any, mockNext);

      // Assert
      expect(prismaMock.accountSecret.deleteMany).toHaveBeenCalledWith({
        where: {
          id: 'account1',
          userId: 'user123'
        }
      });
      expect(mockResponse.status).toHaveBeenCalledWith(204);
      expect(mockResponse.send).toHaveBeenCalled();
    });

    it('should handle database errors', async () => {
      // Arrange
      mockRequest.params = { id: 'account1' };
      const dbError = new Error('Database error');
      prismaMock.accountSecret.deleteMany.mockRejectedValue(dbError);

      // Act
      await accountController.deleteAccountSecret(mockRequest as any, mockResponse as any, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledWith(dbError);
    });
  });

  describe('generateTOTPCode', () => {
    it('should return 401 if user is not authenticated', async () => {
      // Arrange
      mockRequest.user = undefined;

      // Act
      await accountController.generateTOTPCode(mockRequest as any, mockResponse as any, mockNext);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Unauthorized'
      }));
    });

    it('should return 400 if secret ID is missing', async () => {
      // Arrange
      mockRequest.params = {};

      // Act
      await accountController.generateTOTPCode(mockRequest as any, mockResponse as any, mockNext);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Account Secret ID is required in URL parameters'
      }));
    });

    it('should return 404 if secret is not found', async () => {
      // Arrange
      mockRequest.params = { id: 'nonexistent-secret' };
      prismaMock.accountSecret.findFirst.mockResolvedValue(null);

      // Act
      await accountController.generateTOTPCode(mockRequest as any, mockResponse as any, mockNext);

      // Assert
      expect(prismaMock.accountSecret.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'nonexistent-secret',
          userId: 'user123'
        }
      });
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Account Secret not found or access denied'
      }));
    });

    it('should generate TOTP code successfully', async () => {
      // Arrange
      mockRequest.params = { id: 'account1' };
      
      const mockAccountSecret = {
        id: 'account1',
        issuer: 'Test',
        label: 'test@example.com',
        encryptedSecret: 'encrypted-secret',
        userId: 'user123',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      prismaMock.accountSecret.findFirst.mockResolvedValue(mockAccountSecret);
      
      const decryptedSecret = 'ABCDEFGHIJKLMNOP';
      (encryption.decrypt as jest.Mock).mockReturnValue(decryptedSecret);
      
      const totpData = {
        code: '123456',
        remainingSeconds: 15,
        period: 30
      };
      (totpGenerator.getCurrentTOTP as jest.Mock).mockReturnValue(totpData);

      // Act
      await accountController.generateTOTPCode(mockRequest as any, mockResponse as any, mockNext);

      // Assert
      expect(encryption.decrypt).toHaveBeenCalledWith('encrypted-secret');
      expect(totpGenerator.getCurrentTOTP).toHaveBeenCalledWith(decryptedSecret);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        code: '123456',
        remainingSeconds: 15,
        period: 30,
        issuer: 'Test',
        label: 'test@example.com'
      });
    });

    it('should handle decryption errors', async () => {
      // Arrange
      mockRequest.params = { id: 'account1' };
      
      const mockAccountSecret = {
        id: 'account1',
        issuer: 'Test',
        label: 'test@example.com',
        encryptedSecret: 'encrypted-secret',
        userId: 'user123',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      prismaMock.accountSecret.findFirst.mockResolvedValue(mockAccountSecret);
      
      (encryption.decrypt as jest.Mock).mockImplementation(() => {
        throw new Error('Decryption failed');
      });

      // Act
      await accountController.generateTOTPCode(mockRequest as any, mockResponse as any, mockNext);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Failed to decrypt secret data.'
      }));
    });

    it('should handle invalid secret format errors', async () => {
      // Arrange
      mockRequest.params = { id: 'account1' };
      
      const mockAccountSecret = {
        id: 'account1',
        issuer: 'Test',
        label: 'test@example.com',
        encryptedSecret: 'encrypted-secret',
        userId: 'user123',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      prismaMock.accountSecret.findFirst.mockResolvedValue(mockAccountSecret);
      
      const decryptedSecret = 'INVALID-SECRET';
      (encryption.decrypt as jest.Mock).mockReturnValue(decryptedSecret);
      
      (totpGenerator.getCurrentTOTP as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid base32 character');
      });

      // Act
      await accountController.generateTOTPCode(mockRequest as any, mockResponse as any, mockNext);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Invalid secret format.'
      }));
    });
  });

  describe('generateQRCodeForAccount', () => {
    it('should generate QR code successfully', async () => {
      // Arrange
      mockRequest.params = { id: 'account1' };
      
      const mockAccountSecret = {
        id: 'account1',
        issuer: 'Test',
        label: 'test@example.com',
        encryptedSecret: 'encrypted-secret',
        userId: 'user123',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      prismaMock.accountSecret.findFirst.mockResolvedValue(mockAccountSecret);
      
      const decryptedSecret = 'ABCDEFGHIJKLMNOP';
      (encryption.decrypt as jest.Mock).mockReturnValue(decryptedSecret);
      
      const totpUri = 'otpauth://totp/Test:test@example.com?secret=ABCDEFGHIJKLMNOP&issuer=Test';
      (qrCodeHandler.generateTOTPUri as jest.Mock).mockReturnValue(totpUri);
      
      const qrCodeDataUrl = 'data:image/png;base64,mockQRCodeImage';
      (qrCodeHandler.generateQRCode as jest.Mock).mockResolvedValue(qrCodeDataUrl);

      // Act
      await accountController.generateQRCodeForAccount(mockRequest as any, mockResponse as any, mockNext);

      // Assert
      expect(encryption.decrypt).toHaveBeenCalledWith('encrypted-secret');
      expect(qrCodeHandler.generateTOTPUri).toHaveBeenCalledWith({
        label: 'test@example.com',
        issuer: 'Test',
        secret: decryptedSecret
      });
      expect(qrCodeHandler.generateQRCode).toHaveBeenCalledWith(totpUri);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        qrCode: qrCodeDataUrl,
        uri: totpUri
      });
    });
  });

  describe('parseQRCodeImage', () => {
    it('should parse QR code image successfully', async () => {
      // Arrange
      mockRequest.body = {
        image: 'base64-encoded-image-data'
      };
      
      const totpUri = 'otpauth://totp/Test:test@example.com?secret=ABCDEFGHIJKLMNOP&issuer=Test';
      (qrCodeHandler.parseQRCode as jest.Mock).mockResolvedValue(totpUri);
      
      const parsedUri = {
        type: 'totp',
        label: 'Test:test@example.com',
        issuer: 'Test',
        secret: 'ABCDEFGHIJKLMNOP',
        algorithm: 'SHA1',
        digits: 6,
        period: 30
      };
      (qrCodeHandler.parseTOTPUri as jest.Mock).mockReturnValue(parsedUri);

      // Act
      await accountController.parseQRCodeImage(mockRequest as any, mockResponse as any, mockNext);

      // Assert
      expect(qrCodeHandler.parseQRCode).toHaveBeenCalledWith('base64-encoded-image-data');
      expect(qrCodeHandler.parseTOTPUri).toHaveBeenCalledWith(totpUri);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        uri: totpUri,
        secret: 'ABCDEFGHIJKLMNOP',
        issuer: 'Test',
        label: 'Test:test@example.com',
        algorithm: 'SHA1',
        digits: 6,
        period: 30
      });
    });

    it('should handle missing image data', async () => {
      // Arrange
      mockRequest.body = {}; // Missing image data

      // Act
      await accountController.parseQRCodeImage(mockRequest as any, mockResponse as any, mockNext);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'QR code image data is required'
      }));
    });

    it('should handle QR code parsing errors', async () => {
      // Arrange
      mockRequest.body = {
        image: 'base64-encoded-image-data'
      };
      
      (qrCodeHandler.parseQRCode as jest.Mock).mockRejectedValue(new Error('No QR code found in the image'));

      // Act
      await accountController.parseQRCodeImage(mockRequest as any, mockResponse as any, mockNext);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'No valid QR code found in the image.'
      }));
    });
  });
});