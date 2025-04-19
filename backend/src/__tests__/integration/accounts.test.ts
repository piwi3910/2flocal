import request from 'supertest';
import express from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import accountsRouter from '../../routes/accounts';
import { prismaMock } from '../../__tests__/setup';
import * as encryption from '../../utils/encryption';
import * as totpGenerator from '../../utils/totpGenerator';
import * as qrCodeHandler from '../../utils/qrCodeHandler';

// Mock dependencies
jest.mock('jsonwebtoken');
jest.mock('../../utils/encryption');
jest.mock('../../utils/totpGenerator');
jest.mock('../../utils/qrCodeHandler');
jest.mock('../../middleware/rateLimitMiddleware', () => ({
  apiLimiter: (req: any, res: any, next: any) => next(),
  totpGenerationLimiter: (req: any, res: any, next: any) => next()
}));

describe('Accounts API', () => {
  // Create a test app
  const app = express();
  app.use(express.json());
  app.use('/api/accounts', accountsRouter);
  
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

  describe('POST /api/accounts', () => {
    // Increase timeout to 15 seconds for all integration tests
    jest.setTimeout(15000);
    
    it('should add a new account secret', async () => {
      // Arrange
      const secretData = {
        issuer: 'Test Service',
        label: 'test@example.com',
        secret: 'ABCDEFGHIJKLMNOP'
      };

      // Mock encryption
      (encryption.encrypt as jest.Mock).mockReturnValue('encrypted-secret');

      // Mock account creation
      prismaMock.accountSecret.create.mockResolvedValue({
        id: 'account1',
        issuer: secretData.issuer,
        label: secretData.label,
        encryptedSecret: 'encrypted-secret',
        userId: mockUser.userId,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Act
      const response = await request(app)
        .post('/api/accounts')
        .set('Authorization', 'Bearer valid-token')
        .send(secretData);

      // Assert
      expect(encryption.encrypt).toHaveBeenCalledWith(secretData.secret);
      expect(prismaMock.accountSecret.create).toHaveBeenCalledWith({
        data: {
          issuer: secretData.issuer,
          label: secretData.label,
          encryptedSecret: 'encrypted-secret',
          userId: mockUser.userId
        }
      });
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id', 'account1');
      expect(response.body).toHaveProperty('issuer', secretData.issuer);
      expect(response.body).toHaveProperty('label', secretData.label);
      expect(response.body).toHaveProperty('message', 'Account secret added successfully');
      expect(response.body).not.toHaveProperty('encryptedSecret');
    });

    it('should return 400 if required fields are missing', async () => {
      // Arrange
      const secretData = {
        issuer: 'Test Service',
        // Missing label and secret
      };

      // Act
      const response = await request(app)
        .post('/api/accounts')
        .set('Authorization', 'Bearer valid-token')
        .send(secretData);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Issuer, label, and secret are required');
    });

    it('should return 401 if not authenticated', async () => {
      // Arrange
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      // Act
      const response = await request(app)
        .post('/api/accounts')
        .set('Authorization', 'Bearer invalid-token')
        .send({});

      // Assert
      expect(response.status).toBe(401);
    });

    it('should handle encryption errors', async () => {
      // Arrange
      const secretData = {
        issuer: 'Test Service',
        label: 'test@example.com',
        secret: 'ABCDEFGHIJKLMNOP'
      };

      // Mock encryption error
      (encryption.encrypt as jest.Mock).mockImplementation(() => {
        throw new Error('Encryption failed');
      });

      // Act
      const response = await request(app)
        .post('/api/accounts')
        .set('Authorization', 'Bearer valid-token')
        .send(secretData);

      // Assert
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('message', 'Failed to secure secret data.');
    });
  });

  describe('GET /api/accounts', () => {
    it('should list account secrets for the authenticated user', async () => {
      // Arrange
      const mockSecrets = [
        {
          id: 'account1',
          issuer: 'Service 1',
          label: 'test1@example.com',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'account2',
          issuer: 'Service 2',
          label: 'test2@example.com',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      prismaMock.accountSecret.findMany.mockResolvedValue(mockSecrets);

      // Act
      const response = await request(app)
        .get('/api/accounts')
        .set('Authorization', 'Bearer valid-token');

      // Assert
      expect(prismaMock.accountSecret.findMany).toHaveBeenCalledWith({
        where: { userId: mockUser.userId },
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
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('id', 'account1');
      expect(response.body[1]).toHaveProperty('id', 'account2');
    });
  });

  describe('DELETE /api/accounts/:id', () => {
    it('should delete an account secret', async () => {
      // Arrange
      prismaMock.accountSecret.deleteMany.mockResolvedValue({ count: 1 });

      // Act
      const response = await request(app)
        .delete('/api/accounts/account1')
        .set('Authorization', 'Bearer valid-token');

      // Assert
      expect(prismaMock.accountSecret.deleteMany).toHaveBeenCalledWith({
        where: {
          id: 'account1',
          userId: mockUser.userId
        }
      });
      expect(response.status).toBe(204);
    });

    it('should return 404 if account secret is not found', async () => {
      // Arrange
      prismaMock.accountSecret.deleteMany.mockResolvedValue({ count: 0 });

      // Act
      const response = await request(app)
        .delete('/api/accounts/nonexistent')
        .set('Authorization', 'Bearer valid-token');

      // Assert
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Account Secret not found or access denied');
    });
  });

  describe('GET /api/accounts/:id/totp', () => {
    it('should generate TOTP code for an account secret', async () => {
      // Arrange
      const mockAccountSecret = {
        id: 'account1',
        issuer: 'Test Service',
        label: 'test@example.com',
        encryptedSecret: 'encrypted-secret',
        userId: mockUser.userId,
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
      const response = await request(app)
        .get('/api/accounts/account1/totp')
        .set('Authorization', 'Bearer valid-token');

      // Assert
      expect(prismaMock.accountSecret.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'account1',
          userId: mockUser.userId
        }
      });
      expect(encryption.decrypt).toHaveBeenCalledWith('encrypted-secret');
      expect(totpGenerator.getCurrentTOTP).toHaveBeenCalledWith(decryptedSecret);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('code', '123456');
      expect(response.body).toHaveProperty('remainingSeconds', 15);
      expect(response.body).toHaveProperty('period', 30);
      expect(response.body).toHaveProperty('issuer', 'Test Service');
      expect(response.body).toHaveProperty('label', 'test@example.com');
    });

    it('should return 404 if account secret is not found', async () => {
      // Arrange
      prismaMock.accountSecret.findFirst.mockResolvedValue(null);

      // Act
      const response = await request(app)
        .get('/api/accounts/nonexistent/totp')
        .set('Authorization', 'Bearer valid-token');

      // Assert
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Account Secret not found or access denied');
    });

    it('should handle decryption errors', async () => {
      // Arrange
      const mockAccountSecret = {
        id: 'account1',
        issuer: 'Test Service',
        label: 'test@example.com',
        encryptedSecret: 'encrypted-secret',
        userId: mockUser.userId,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      prismaMock.accountSecret.findFirst.mockResolvedValue(mockAccountSecret);
      
      (encryption.decrypt as jest.Mock).mockImplementation(() => {
        throw new Error('Decryption failed');
      });

      // Act
      const response = await request(app)
        .get('/api/accounts/account1/totp')
        .set('Authorization', 'Bearer valid-token');

      // Assert
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('message', 'Failed to decrypt secret data.');
    });
  });

  describe('GET /api/accounts/:id/qrcode', () => {
    it('should generate QR code for an account secret', async () => {
      // Arrange
      const mockAccountSecret = {
        id: 'account1',
        issuer: 'Test Service',
        label: 'test@example.com',
        encryptedSecret: 'encrypted-secret',
        userId: mockUser.userId,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      prismaMock.accountSecret.findFirst.mockResolvedValue(mockAccountSecret);
      
      const decryptedSecret = 'ABCDEFGHIJKLMNOP';
      (encryption.decrypt as jest.Mock).mockReturnValue(decryptedSecret);
      
      const totpUri = 'otpauth://totp/Test%20Service:test@example.com?secret=ABCDEFGHIJKLMNOP&issuer=Test%20Service';
      (qrCodeHandler.generateTOTPUri as jest.Mock).mockReturnValue(totpUri);
      
      const qrCodeDataUrl = 'data:image/png;base64,mockQRCodeImage';
      (qrCodeHandler.generateQRCode as jest.Mock).mockResolvedValue(qrCodeDataUrl);

      // Act
      const response = await request(app)
        .get('/api/accounts/account1/qrcode')
        .set('Authorization', 'Bearer valid-token');

      // Assert
      expect(prismaMock.accountSecret.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'account1',
          userId: mockUser.userId
        }
      });
      expect(encryption.decrypt).toHaveBeenCalledWith('encrypted-secret');
      expect(qrCodeHandler.generateTOTPUri).toHaveBeenCalledWith({
        label: 'test@example.com',
        issuer: 'Test Service',
        secret: decryptedSecret
      });
      expect(qrCodeHandler.generateQRCode).toHaveBeenCalledWith(totpUri);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('qrCode', qrCodeDataUrl);
      expect(response.body).toHaveProperty('uri', totpUri);
    });
  });

  describe('POST /api/accounts/parse-qrcode', () => {
    it('should parse QR code image and extract TOTP data', async () => {
      // Arrange
      const requestData = {
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
      const response = await request(app)
        .post('/api/accounts/parse-qrcode')
        .set('Authorization', 'Bearer valid-token')
        .send(requestData);

      // Assert
      expect(qrCodeHandler.parseQRCode).toHaveBeenCalledWith('base64-encoded-image-data');
      expect(qrCodeHandler.parseTOTPUri).toHaveBeenCalledWith(totpUri);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('uri', totpUri);
      expect(response.body).toHaveProperty('secret', 'ABCDEFGHIJKLMNOP');
      expect(response.body).toHaveProperty('issuer', 'Test');
    });

    it('should return 400 if image data is missing', async () => {
      // Arrange
      const requestData = {}; // Missing image data

      // Act
      const response = await request(app)
        .post('/api/accounts/parse-qrcode')
        .set('Authorization', 'Bearer valid-token')
        .send(requestData);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'QR code image data is required');
    });

    it('should handle QR code parsing errors', async () => {
      // Arrange
      const requestData = {
        image: 'base64-encoded-image-data'
      };
      
      (qrCodeHandler.parseQRCode as jest.Mock).mockRejectedValue(new Error('No QR code found in the image'));

      // Act
      const response = await request(app)
        .post('/api/accounts/parse-qrcode')
        .set('Authorization', 'Bearer valid-token')
        .send(requestData);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'No valid QR code found in the image.');
    });
  });
});