import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '../../../prisma/src/generated/prisma';
import { generateTOTPCode } from '../accountController';
import { AuthenticatedRequest } from '../accountController'; // Import the extended interface
import { decrypt } from '../../utils/encryption';
import { getCurrentTOTP } from '../../utils/totpGenerator';

// Declare Jest globals for TypeScript
declare const jest: any;
declare const describe: (name: string, fn: () => void) => void;
declare const beforeEach: (fn: () => void) => void;
declare const it: (name: string, fn: () => void) => void;
declare const expect: any;

// Mock dependencies
jest.mock('../../../prisma/src/generated/prisma', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    accountSecret: {
      findFirst: jest.fn()
    }
  }))
}));

jest.mock('../../utils/encryption', () => ({
  decrypt: jest.fn()
}));

jest.mock('../../utils/totpGenerator', () => ({
  getCurrentTOTP: jest.fn()
}));

describe('Account Controller', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: any;
  let prismaClient: any;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock request object with AuthenticatedRequest properties
    req = {
      user: { userId: 'user123', email: 'test@example.com' },
      params: { id: 'secret123' },
      app: {
        locals: {
          prisma: new PrismaClient()
        }
      }
    };

    // Mock response object
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis()
    };

    // Mock next function
    next = jest.fn();

    // Get prisma client mock
    prismaClient = req.app?.locals.prisma;

    // Setup default mock returns
    prismaClient.accountSecret.findFirst.mockResolvedValue({
      id: 'secret123',
      userId: 'user123',
      issuer: 'Test Issuer',
      label: 'test@example.com',
      encryptedSecret: 'encrypted-secret'
    });
(decrypt as any).mockReturnValue('TESTSECRET');
(getCurrentTOTP as any).mockReturnValue({
    (getCurrentTOTP as jest.Mock).mockReturnValue({
      code: '123456',
      remainingSeconds: 15,
      period: 30
    });
  });

  describe('generateTOTPCode', () => {
    it('should return 401 if user is not authenticated', async () => {
      const reqWithoutUser = { ...req, user: undefined };
      await generateTOTPCode(reqWithoutUser as AuthenticatedRequest, res as Response, next);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
    });

    it('should return 400 if secret ID is not provided', async () => {
      const reqWithoutParams = { ...req, params: {} };
      await generateTOTPCode(reqWithoutParams as AuthenticatedRequest, res as Response, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Account Secret ID is required in URL parameters' });
    });

    it('should return 404 if secret is not found', async () => {
      prismaClient.accountSecret.findFirst.mockResolvedValue(null);
      await generateTOTPCode(req as AuthenticatedRequest, res as Response, next);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Account Secret not found or access denied' });
    });

    it('should return 500 if decryption fails', async () => {
      (decrypt as any).mockImplementation(() => {
        throw new Error('Decryption failed');
      });
      await generateTOTPCode(req as AuthenticatedRequest, res as Response, next);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Failed to decrypt secret data.' });
    });

    it('should return 400 if secret format is invalid', async () => {
      (getCurrentTOTP as any).mockImplementation(() => {
        throw new Error('Invalid base32 character: $');
      });
      await generateTOTPCode(req as AuthenticatedRequest, res as Response, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid secret format.' });
    });

    it('should return TOTP code and time information on success', async () => {
      await generateTOTPCode(req as AuthenticatedRequest, res as Response, next);
      expect(prismaClient.accountSecret.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'secret123',
          userId: 'user123'
        }
      });
      expect(decrypt).toHaveBeenCalledWith('encrypted-secret');
      expect(getCurrentTOTP).toHaveBeenCalledWith('TESTSECRET');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        code: '123456',
        remainingSeconds: 15,
        period: 30,
        issuer: 'Test Issuer',
        label: 'test@example.com'
      });
    });

    it('should call next with error for unexpected exceptions', async () => {
      const error = new Error('Unexpected error');
      prismaClient.accountSecret.findFirst.mockRejectedValue(error);
      await generateTOTPCode(req as AuthenticatedRequest, res as Response, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });
});