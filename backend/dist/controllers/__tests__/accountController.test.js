"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const jest_mock_extended_1 = require("jest-mock-extended");
const setup_1 = require("../../__tests__/setup");
const accountController = __importStar(require("../accountController"));
const encryption = __importStar(require("../../utils/encryption"));
const totpGenerator = __importStar(require("../../utils/totpGenerator"));
const qrCodeHandler = __importStar(require("../../utils/qrCodeHandler"));
// Mock dependencies
jest.mock('../../utils/encryption');
jest.mock('../../utils/totpGenerator');
jest.mock('../../utils/qrCodeHandler');
describe('Account Controller', () => {
    // Create mock request and response objects
    const mockRequest = (0, jest_mock_extended_1.mockDeep)();
    const mockResponse = (0, jest_mock_extended_1.mockDeep)();
    const mockNext = jest.fn();
    // Reset mocks before each test
    beforeEach(() => {
        (0, jest_mock_extended_1.mockReset)(mockRequest);
        (0, jest_mock_extended_1.mockReset)(mockResponse);
        mockNext.mockClear();
        mockResponse.status.mockReturnThis();
        mockResponse.json.mockReturnThis();
        mockResponse.send.mockReturnThis();
        // Set up common request properties
        mockRequest.user = { userId: 'user123', email: 'test@example.com' };
        mockRequest.app = {
            locals: {
                prisma: setup_1.prismaMock
            }
        };
    });
    describe('addAccountSecret', () => {
        it('should return 401 if user is not authenticated', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            mockRequest.user = undefined;
            // Act
            yield accountController.addAccountSecret(mockRequest, mockResponse, mockNext);
            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
                message: 'Unauthorized'
            }));
        }));
        it('should return 400 if required fields are missing', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            mockRequest.body = { issuer: 'Test', label: 'test@example.com' }; // Missing secret
            // Act
            yield accountController.addAccountSecret(mockRequest, mockResponse, mockNext);
            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
                message: 'Issuer, label, and secret are required'
            }));
        }));
        it('should create a new account secret successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            mockRequest.body = {
                issuer: 'Test',
                label: 'test@example.com',
                secret: 'ABCDEFGHIJKLMNOP'
            };
            const encryptedSecret = 'encrypted-secret';
            encryption.encrypt.mockReturnValue(encryptedSecret);
            setup_1.prismaMock.accountSecret.create.mockResolvedValue({
                id: 'account1',
                issuer: 'Test',
                label: 'test@example.com',
                encryptedSecret,
                userId: 'user123',
                createdAt: new Date(),
                updatedAt: new Date()
            });
            // Act
            yield accountController.addAccountSecret(mockRequest, mockResponse, mockNext);
            // Assert
            expect(encryption.encrypt).toHaveBeenCalledWith('ABCDEFGHIJKLMNOP');
            expect(setup_1.prismaMock.accountSecret.create).toHaveBeenCalledWith({
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
        }));
        it('should handle encryption errors', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            mockRequest.body = {
                issuer: 'Test',
                label: 'test@example.com',
                secret: 'ABCDEFGHIJKLMNOP'
            };
            encryption.encrypt.mockImplementation(() => {
                throw new Error('Encryption failed');
            });
            // Act
            yield accountController.addAccountSecret(mockRequest, mockResponse, mockNext);
            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
                message: 'Failed to secure secret data.'
            }));
        }));
        it('should pass other errors to the error handler', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            mockRequest.body = {
                issuer: 'Test',
                label: 'test@example.com',
                secret: 'ABCDEFGHIJKLMNOP'
            };
            const dbError = new Error('Database error');
            encryption.encrypt.mockReturnValue('encrypted-secret');
            setup_1.prismaMock.accountSecret.create.mockRejectedValue(dbError);
            // Act
            yield accountController.addAccountSecret(mockRequest, mockResponse, mockNext);
            // Assert
            expect(mockNext).toHaveBeenCalledWith(dbError);
        }));
    });
    describe('listAccountSecrets', () => {
        it('should return 401 if user is not authenticated', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            mockRequest.user = undefined;
            // Act
            yield accountController.listAccountSecrets(mockRequest, mockResponse, mockNext);
            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
                message: 'Unauthorized'
            }));
        }));
        it('should return a list of account secrets', () => __awaiter(void 0, void 0, void 0, function* () {
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
            setup_1.prismaMock.accountSecret.findMany.mockResolvedValue(mockSecrets);
            // Act
            yield accountController.listAccountSecrets(mockRequest, mockResponse, mockNext);
            // Assert
            expect(setup_1.prismaMock.accountSecret.findMany).toHaveBeenCalledWith({
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
        }));
        it('should handle database errors', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            const dbError = new Error('Database error');
            setup_1.prismaMock.accountSecret.findMany.mockRejectedValue(dbError);
            // Act
            yield accountController.listAccountSecrets(mockRequest, mockResponse, mockNext);
            // Assert
            expect(mockNext).toHaveBeenCalledWith(dbError);
        }));
    });
    describe('deleteAccountSecret', () => {
        it('should return 401 if user is not authenticated', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            mockRequest.user = undefined;
            // Act
            yield accountController.deleteAccountSecret(mockRequest, mockResponse, mockNext);
            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
                message: 'Unauthorized'
            }));
        }));
        it('should return 400 if secret ID is missing', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            mockRequest.params = {};
            // Act
            yield accountController.deleteAccountSecret(mockRequest, mockResponse, mockNext);
            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
                message: 'Account Secret ID is required in URL parameters'
            }));
        }));
        it('should return 404 if secret is not found', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            mockRequest.params = { id: 'nonexistent-secret' };
            setup_1.prismaMock.accountSecret.deleteMany.mockResolvedValue({ count: 0 });
            // Act
            yield accountController.deleteAccountSecret(mockRequest, mockResponse, mockNext);
            // Assert
            expect(setup_1.prismaMock.accountSecret.deleteMany).toHaveBeenCalledWith({
                where: {
                    id: 'nonexistent-secret',
                    userId: 'user123'
                }
            });
            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
                message: 'Account Secret not found or access denied'
            }));
        }));
        it('should delete the account secret successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            mockRequest.params = { id: 'account1' };
            setup_1.prismaMock.accountSecret.deleteMany.mockResolvedValue({ count: 1 });
            // Act
            yield accountController.deleteAccountSecret(mockRequest, mockResponse, mockNext);
            // Assert
            expect(setup_1.prismaMock.accountSecret.deleteMany).toHaveBeenCalledWith({
                where: {
                    id: 'account1',
                    userId: 'user123'
                }
            });
            expect(mockResponse.status).toHaveBeenCalledWith(204);
            expect(mockResponse.send).toHaveBeenCalled();
        }));
        it('should handle database errors', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            mockRequest.params = { id: 'account1' };
            const dbError = new Error('Database error');
            setup_1.prismaMock.accountSecret.deleteMany.mockRejectedValue(dbError);
            // Act
            yield accountController.deleteAccountSecret(mockRequest, mockResponse, mockNext);
            // Assert
            expect(mockNext).toHaveBeenCalledWith(dbError);
        }));
    });
    describe('generateTOTPCode', () => {
        it('should return 401 if user is not authenticated', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            mockRequest.user = undefined;
            // Act
            yield accountController.generateTOTPCode(mockRequest, mockResponse, mockNext);
            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
                message: 'Unauthorized'
            }));
        }));
        it('should return 400 if secret ID is missing', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            mockRequest.params = {};
            // Act
            yield accountController.generateTOTPCode(mockRequest, mockResponse, mockNext);
            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
                message: 'Account Secret ID is required in URL parameters'
            }));
        }));
        it('should return 404 if secret is not found', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            mockRequest.params = { id: 'nonexistent-secret' };
            setup_1.prismaMock.accountSecret.findFirst.mockResolvedValue(null);
            // Act
            yield accountController.generateTOTPCode(mockRequest, mockResponse, mockNext);
            // Assert
            expect(setup_1.prismaMock.accountSecret.findFirst).toHaveBeenCalledWith({
                where: {
                    id: 'nonexistent-secret',
                    userId: 'user123'
                }
            });
            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
                message: 'Account Secret not found or access denied'
            }));
        }));
        it('should generate TOTP code successfully', () => __awaiter(void 0, void 0, void 0, function* () {
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
            setup_1.prismaMock.accountSecret.findFirst.mockResolvedValue(mockAccountSecret);
            const decryptedSecret = 'ABCDEFGHIJKLMNOP';
            encryption.decrypt.mockReturnValue(decryptedSecret);
            const totpData = {
                code: '123456',
                remainingSeconds: 15,
                period: 30
            };
            totpGenerator.getCurrentTOTP.mockReturnValue(totpData);
            // Act
            yield accountController.generateTOTPCode(mockRequest, mockResponse, mockNext);
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
        }));
        it('should handle decryption errors', () => __awaiter(void 0, void 0, void 0, function* () {
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
            setup_1.prismaMock.accountSecret.findFirst.mockResolvedValue(mockAccountSecret);
            encryption.decrypt.mockImplementation(() => {
                throw new Error('Decryption failed');
            });
            // Act
            yield accountController.generateTOTPCode(mockRequest, mockResponse, mockNext);
            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
                message: 'Failed to decrypt secret data.'
            }));
        }));
        it('should handle invalid secret format errors', () => __awaiter(void 0, void 0, void 0, function* () {
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
            setup_1.prismaMock.accountSecret.findFirst.mockResolvedValue(mockAccountSecret);
            const decryptedSecret = 'INVALID-SECRET';
            encryption.decrypt.mockReturnValue(decryptedSecret);
            totpGenerator.getCurrentTOTP.mockImplementation(() => {
                throw new Error('Invalid base32 character');
            });
            // Act
            yield accountController.generateTOTPCode(mockRequest, mockResponse, mockNext);
            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
                message: 'Invalid secret format.'
            }));
        }));
    });
    describe('generateQRCodeForAccount', () => {
        it('should generate QR code successfully', () => __awaiter(void 0, void 0, void 0, function* () {
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
            setup_1.prismaMock.accountSecret.findFirst.mockResolvedValue(mockAccountSecret);
            const decryptedSecret = 'ABCDEFGHIJKLMNOP';
            encryption.decrypt.mockReturnValue(decryptedSecret);
            const totpUri = 'otpauth://totp/Test:test@example.com?secret=ABCDEFGHIJKLMNOP&issuer=Test';
            qrCodeHandler.generateTOTPUri.mockReturnValue(totpUri);
            const qrCodeDataUrl = 'data:image/png;base64,mockQRCodeImage';
            qrCodeHandler.generateQRCode.mockResolvedValue(qrCodeDataUrl);
            // Act
            yield accountController.generateQRCodeForAccount(mockRequest, mockResponse, mockNext);
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
        }));
    });
    describe('parseQRCodeImage', () => {
        it('should parse QR code image successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            mockRequest.body = {
                image: 'base64-encoded-image-data'
            };
            const totpUri = 'otpauth://totp/Test:test@example.com?secret=ABCDEFGHIJKLMNOP&issuer=Test';
            qrCodeHandler.parseQRCode.mockResolvedValue(totpUri);
            const parsedUri = {
                type: 'totp',
                label: 'Test:test@example.com',
                issuer: 'Test',
                secret: 'ABCDEFGHIJKLMNOP',
                algorithm: 'SHA1',
                digits: 6,
                period: 30
            };
            qrCodeHandler.parseTOTPUri.mockReturnValue(parsedUri);
            // Act
            yield accountController.parseQRCodeImage(mockRequest, mockResponse, mockNext);
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
        }));
        it('should handle missing image data', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            mockRequest.body = {}; // Missing image data
            // Act
            yield accountController.parseQRCodeImage(mockRequest, mockResponse, mockNext);
            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
                message: 'QR code image data is required'
            }));
        }));
        it('should handle QR code parsing errors', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            mockRequest.body = {
                image: 'base64-encoded-image-data'
            };
            qrCodeHandler.parseQRCode.mockRejectedValue(new Error('No QR code found in the image'));
            // Act
            yield accountController.parseQRCodeImage(mockRequest, mockResponse, mockNext);
            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
                message: 'No valid QR code found in the image.'
            }));
        }));
    });
});
