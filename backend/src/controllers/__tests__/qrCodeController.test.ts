import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '../../../prisma/src/generated/prisma';
import { generateQRCodeForAccount, parseQRCodeImage } from '../accountController';
import { generateQRCode, parseQRCode, parseTOTPUri, generateTOTPUri } from '../../utils/qrCodeHandler';
import { decrypt } from '../../utils/encryption';

// Mock dependencies
jest.mock('../../utils/qrCodeHandler');
jest.mock('../../utils/encryption');

// Mock PrismaClient
const mockPrismaClient = {
  accountSecret: {
    findFirst: jest.fn()
  }
};

// Mock request, response, and next function
const mockRequest = () => {
  return {
    user: { userId: 'user-123', email: 'test@example.com' },
    params: {} as any,
    body: {} as any,
    app: {
      locals: {
        prisma: mockPrismaClient
      }
    }
  };
};

const mockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockNext = jest.fn();

describe('QR Code Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateQRCodeForAccount', () => {
    it('should return 401 if user is not authenticated', async () => {
      const req = mockRequest();
      req.user = undefined as any;
      const res = mockResponse();
      
      await generateQRCodeForAccount(req as any, res as any, mockNext);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
    });

    it('should return 400 if account ID is missing', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      await generateQRCodeForAccount(req as any, res as any, mockNext);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Account Secret ID is required in URL parameters' });
    });

    it('should return 404 if account secret is not found', async () => {
      const req = mockRequest();
      req.params.id = 'account-123';
      const res = mockResponse();
      
      mockPrismaClient.accountSecret.findFirst.mockResolvedValue(null);
      
      await generateQRCodeForAccount(req as any, res as any, mockNext);
      
      expect(mockPrismaClient.accountSecret.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'account-123',
          userId: 'user-123'
        }
      });
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Account Secret not found or access denied' });
    });

    it('should generate and return QR code for valid account secret', async () => {
      const req = mockRequest();
      req.params.id = 'account-123';
      const res = mockResponse();
      
      const mockAccountSecret = {
        id: 'account-123',
        issuer: 'Example',
        label: 'alice@example.com',
        encryptedSecret: 'encrypted-secret',
        userId: 'user-123'
      };
      
      mockPrismaClient.accountSecret.findFirst.mockResolvedValue(mockAccountSecret);
      (decrypt as jest.Mock).mockReturnValue('JBSWY3DPEHPK3PXP');
      (generateTOTPUri as jest.Mock).mockReturnValue('otpauth://totp/Example:alice@example.com?secret=JBSWY3DPEHPK3PXP&issuer=Example');
      (generateQRCode as jest.Mock).mockResolvedValue('data:image/png;base64,qrcode-data');
      
      await generateQRCodeForAccount(req as any, res as any, mockNext);
      
      expect(decrypt).toHaveBeenCalledWith('encrypted-secret');
      expect(generateTOTPUri).toHaveBeenCalledWith({
        label: 'alice@example.com',
        issuer: 'Example',
        secret: 'JBSWY3DPEHPK3PXP'
      });
      expect(generateQRCode).toHaveBeenCalledWith('otpauth://totp/Example:alice@example.com?secret=JBSWY3DPEHPK3PXP&issuer=Example');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        qrCode: 'data:image/png;base64,qrcode-data',
        uri: 'otpauth://totp/Example:alice@example.com?secret=JBSWY3DPEHPK3PXP&issuer=Example'
      });
    });
  });

  describe('parseQRCodeImage', () => {
    it('should return 401 if user is not authenticated', async () => {
      const req = mockRequest();
      req.user = undefined as any;
      const res = mockResponse();
      
      await parseQRCodeImage(req as any, res as any, mockNext);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
    });

    it('should return 400 if image data is missing', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      await parseQRCodeImage(req as any, res as any, mockNext);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'QR code image data is required' });
    });

    it('should parse and return TOTP data for valid QR code', async () => {
      const req = mockRequest();
      req.body.image = 'base64-image-data';
      const res = mockResponse();
      
      const mockTOTPUri = 'otpauth://totp/Example:alice@example.com?secret=JBSWY3DPEHPK3PXP&issuer=Example&algorithm=SHA1&digits=6&period=30';
      const mockParsedUri = {
        type: 'totp',
        label: 'Example:alice@example.com',
        issuer: 'Example',
        secret: 'JBSWY3DPEHPK3PXP',
        algorithm: 'SHA1',
        digits: 6,
        period: 30
      };
      
      (parseQRCode as jest.Mock).mockResolvedValue(mockTOTPUri);
      (parseTOTPUri as jest.Mock).mockReturnValue(mockParsedUri);
      
      await parseQRCodeImage(req as any, res as any, mockNext);
      
      expect(parseQRCode).toHaveBeenCalledWith('base64-image-data');
      expect(parseTOTPUri).toHaveBeenCalledWith(mockTOTPUri);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        uri: mockTOTPUri,
        secret: 'JBSWY3DPEHPK3PXP',
        issuer: 'Example',
        label: 'Example:alice@example.com',
        algorithm: 'SHA1',
        digits: 6,
        period: 30
      });
    });

    it('should handle QR code parsing errors', async () => {
      const req = mockRequest();
      req.body.image = 'invalid-image-data';
      const res = mockResponse();
      
      (parseQRCode as jest.Mock).mockRejectedValue(new Error('No QR code found in the image'));
      
      await parseQRCodeImage(req as any, res as any, mockNext);
      
      expect(parseQRCode).toHaveBeenCalledWith('invalid-image-data');
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'No valid QR code found in the image.' });
    });
  });
});