"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const accountController_1 = require("../accountController");
const qrCodeHandler_1 = require("../../utils/qrCodeHandler");
const encryption_1 = require("../../utils/encryption");
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
        params: {},
        body: {},
        app: {
            locals: {
                prisma: mockPrismaClient
            }
        }
    };
};
const mockResponse = () => {
    const res = {};
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
        it('should return 401 if user is not authenticated', () => __awaiter(void 0, void 0, void 0, function* () {
            const req = mockRequest();
            req.user = undefined;
            const res = mockResponse();
            yield (0, accountController_1.generateQRCodeForAccount)(req, res, mockNext);
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
        }));
        it('should return 400 if account ID is missing', () => __awaiter(void 0, void 0, void 0, function* () {
            const req = mockRequest();
            const res = mockResponse();
            yield (0, accountController_1.generateQRCodeForAccount)(req, res, mockNext);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Account Secret ID is required in URL parameters' });
        }));
        it('should return 404 if account secret is not found', () => __awaiter(void 0, void 0, void 0, function* () {
            const req = mockRequest();
            req.params.id = 'account-123';
            const res = mockResponse();
            mockPrismaClient.accountSecret.findFirst.mockResolvedValue(null);
            yield (0, accountController_1.generateQRCodeForAccount)(req, res, mockNext);
            expect(mockPrismaClient.accountSecret.findFirst).toHaveBeenCalledWith({
                where: {
                    id: 'account-123',
                    userId: 'user-123'
                }
            });
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Account Secret not found or access denied' });
        }));
        it('should generate and return QR code for valid account secret', () => __awaiter(void 0, void 0, void 0, function* () {
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
            encryption_1.decrypt.mockReturnValue('JBSWY3DPEHPK3PXP');
            qrCodeHandler_1.generateTOTPUri.mockReturnValue('otpauth://totp/Example:alice@example.com?secret=JBSWY3DPEHPK3PXP&issuer=Example');
            qrCodeHandler_1.generateQRCode.mockResolvedValue('data:image/png;base64,qrcode-data');
            yield (0, accountController_1.generateQRCodeForAccount)(req, res, mockNext);
            expect(encryption_1.decrypt).toHaveBeenCalledWith('encrypted-secret');
            expect(qrCodeHandler_1.generateTOTPUri).toHaveBeenCalledWith({
                label: 'alice@example.com',
                issuer: 'Example',
                secret: 'JBSWY3DPEHPK3PXP'
            });
            expect(qrCodeHandler_1.generateQRCode).toHaveBeenCalledWith('otpauth://totp/Example:alice@example.com?secret=JBSWY3DPEHPK3PXP&issuer=Example');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                qrCode: 'data:image/png;base64,qrcode-data',
                uri: 'otpauth://totp/Example:alice@example.com?secret=JBSWY3DPEHPK3PXP&issuer=Example'
            });
        }));
    });
    describe('parseQRCodeImage', () => {
        it('should return 401 if user is not authenticated', () => __awaiter(void 0, void 0, void 0, function* () {
            const req = mockRequest();
            req.user = undefined;
            const res = mockResponse();
            yield (0, accountController_1.parseQRCodeImage)(req, res, mockNext);
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
        }));
        it('should return 400 if image data is missing', () => __awaiter(void 0, void 0, void 0, function* () {
            const req = mockRequest();
            const res = mockResponse();
            yield (0, accountController_1.parseQRCodeImage)(req, res, mockNext);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'QR code image data is required' });
        }));
        it('should parse and return TOTP data for valid QR code', () => __awaiter(void 0, void 0, void 0, function* () {
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
            qrCodeHandler_1.parseQRCode.mockResolvedValue(mockTOTPUri);
            qrCodeHandler_1.parseTOTPUri.mockReturnValue(mockParsedUri);
            yield (0, accountController_1.parseQRCodeImage)(req, res, mockNext);
            expect(qrCodeHandler_1.parseQRCode).toHaveBeenCalledWith('base64-image-data');
            expect(qrCodeHandler_1.parseTOTPUri).toHaveBeenCalledWith(mockTOTPUri);
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
        }));
        it('should handle QR code parsing errors', () => __awaiter(void 0, void 0, void 0, function* () {
            const req = mockRequest();
            req.body.image = 'invalid-image-data';
            const res = mockResponse();
            qrCodeHandler_1.parseQRCode.mockRejectedValue(new Error('No QR code found in the image'));
            yield (0, accountController_1.parseQRCodeImage)(req, res, mockNext);
            expect(qrCodeHandler_1.parseQRCode).toHaveBeenCalledWith('invalid-image-data');
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'No valid QR code found in the image.' });
        }));
    });
});
