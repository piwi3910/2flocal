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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const accounts_1 = __importDefault(require("../../routes/accounts"));
const setup_1 = require("../../__tests__/setup");
const encryption = __importStar(require("../../utils/encryption"));
const totpGenerator = __importStar(require("../../utils/totpGenerator"));
const qrCodeHandler = __importStar(require("../../utils/qrCodeHandler"));
// Mock dependencies
jest.mock('jsonwebtoken');
jest.mock('../../utils/encryption');
jest.mock('../../utils/totpGenerator');
jest.mock('../../utils/qrCodeHandler');
jest.mock('../../middleware/rateLimitMiddleware', () => ({
    apiLimiter: (req, res, next) => next(),
    totpGenerationLimiter: (req, res, next) => next()
}));
describe('Accounts API', () => {
    // Create a test app
    const app = (0, express_1.default)();
    app.use(express_1.default.json());
    app.use('/api/accounts', accounts_1.default);
    // Add prisma mock to app.locals
    app.locals.prisma = setup_1.prismaMock;
    // Mock user for authentication
    const mockUser = {
        userId: 'user123',
        email: 'test@example.com'
    };
    beforeEach(() => {
        jest.clearAllMocks();
        // Mock JWT verification for all tests
        jsonwebtoken_1.default.verify.mockReturnValue(mockUser);
    });
    describe('POST /api/accounts', () => {
        // Increase timeout to 15 seconds for all integration tests
        jest.setTimeout(15000);
        it('should add a new account secret', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            const secretData = {
                issuer: 'Test Service',
                label: 'test@example.com',
                secret: 'ABCDEFGHIJKLMNOP'
            };
            // Mock encryption
            encryption.encrypt.mockReturnValue('encrypted-secret');
            // Mock account creation
            setup_1.prismaMock.accountSecret.create.mockResolvedValue({
                id: 'account1',
                issuer: secretData.issuer,
                label: secretData.label,
                encryptedSecret: 'encrypted-secret',
                userId: mockUser.userId,
                createdAt: new Date(),
                updatedAt: new Date()
            });
            // Act
            const response = yield (0, supertest_1.default)(app)
                .post('/api/accounts')
                .set('Authorization', 'Bearer valid-token')
                .send(secretData);
            // Assert
            expect(encryption.encrypt).toHaveBeenCalledWith(secretData.secret);
            expect(setup_1.prismaMock.accountSecret.create).toHaveBeenCalledWith({
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
        }));
        it('should return 400 if required fields are missing', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            const secretData = {
                issuer: 'Test Service',
                // Missing label and secret
            };
            // Act
            const response = yield (0, supertest_1.default)(app)
                .post('/api/accounts')
                .set('Authorization', 'Bearer valid-token')
                .send(secretData);
            // Assert
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('message', 'Issuer, label, and secret are required');
        }));
        it('should return 401 if not authenticated', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            jsonwebtoken_1.default.verify.mockImplementation(() => {
                throw new Error('Invalid token');
            });
            // Act
            const response = yield (0, supertest_1.default)(app)
                .post('/api/accounts')
                .set('Authorization', 'Bearer invalid-token')
                .send({});
            // Assert
            expect(response.status).toBe(401);
        }));
        it('should handle encryption errors', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            const secretData = {
                issuer: 'Test Service',
                label: 'test@example.com',
                secret: 'ABCDEFGHIJKLMNOP'
            };
            // Mock encryption error
            encryption.encrypt.mockImplementation(() => {
                throw new Error('Encryption failed');
            });
            // Act
            const response = yield (0, supertest_1.default)(app)
                .post('/api/accounts')
                .set('Authorization', 'Bearer valid-token')
                .send(secretData);
            // Assert
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('message', 'Failed to secure secret data.');
        }));
    });
    describe('GET /api/accounts', () => {
        it('should list account secrets for the authenticated user', () => __awaiter(void 0, void 0, void 0, function* () {
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
            setup_1.prismaMock.accountSecret.findMany.mockResolvedValue(mockSecrets);
            // Act
            const response = yield (0, supertest_1.default)(app)
                .get('/api/accounts')
                .set('Authorization', 'Bearer valid-token');
            // Assert
            expect(setup_1.prismaMock.accountSecret.findMany).toHaveBeenCalledWith({
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
        }));
    });
    describe('DELETE /api/accounts/:id', () => {
        it('should delete an account secret', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            setup_1.prismaMock.accountSecret.deleteMany.mockResolvedValue({ count: 1 });
            // Act
            const response = yield (0, supertest_1.default)(app)
                .delete('/api/accounts/account1')
                .set('Authorization', 'Bearer valid-token');
            // Assert
            expect(setup_1.prismaMock.accountSecret.deleteMany).toHaveBeenCalledWith({
                where: {
                    id: 'account1',
                    userId: mockUser.userId
                }
            });
            expect(response.status).toBe(204);
        }));
        it('should return 404 if account secret is not found', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            setup_1.prismaMock.accountSecret.deleteMany.mockResolvedValue({ count: 0 });
            // Act
            const response = yield (0, supertest_1.default)(app)
                .delete('/api/accounts/nonexistent')
                .set('Authorization', 'Bearer valid-token');
            // Assert
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('message', 'Account Secret not found or access denied');
        }));
    });
    describe('GET /api/accounts/:id/totp', () => {
        it('should generate TOTP code for an account secret', () => __awaiter(void 0, void 0, void 0, function* () {
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
            const response = yield (0, supertest_1.default)(app)
                .get('/api/accounts/account1/totp')
                .set('Authorization', 'Bearer valid-token');
            // Assert
            expect(setup_1.prismaMock.accountSecret.findFirst).toHaveBeenCalledWith({
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
        }));
        it('should return 404 if account secret is not found', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            setup_1.prismaMock.accountSecret.findFirst.mockResolvedValue(null);
            // Act
            const response = yield (0, supertest_1.default)(app)
                .get('/api/accounts/nonexistent/totp')
                .set('Authorization', 'Bearer valid-token');
            // Assert
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('message', 'Account Secret not found or access denied');
        }));
        it('should handle decryption errors', () => __awaiter(void 0, void 0, void 0, function* () {
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
            setup_1.prismaMock.accountSecret.findFirst.mockResolvedValue(mockAccountSecret);
            encryption.decrypt.mockImplementation(() => {
                throw new Error('Decryption failed');
            });
            // Act
            const response = yield (0, supertest_1.default)(app)
                .get('/api/accounts/account1/totp')
                .set('Authorization', 'Bearer valid-token');
            // Assert
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('message', 'Failed to decrypt secret data.');
        }));
    });
    describe('GET /api/accounts/:id/qrcode', () => {
        it('should generate QR code for an account secret', () => __awaiter(void 0, void 0, void 0, function* () {
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
            setup_1.prismaMock.accountSecret.findFirst.mockResolvedValue(mockAccountSecret);
            const decryptedSecret = 'ABCDEFGHIJKLMNOP';
            encryption.decrypt.mockReturnValue(decryptedSecret);
            const totpUri = 'otpauth://totp/Test%20Service:test@example.com?secret=ABCDEFGHIJKLMNOP&issuer=Test%20Service';
            qrCodeHandler.generateTOTPUri.mockReturnValue(totpUri);
            const qrCodeDataUrl = 'data:image/png;base64,mockQRCodeImage';
            qrCodeHandler.generateQRCode.mockResolvedValue(qrCodeDataUrl);
            // Act
            const response = yield (0, supertest_1.default)(app)
                .get('/api/accounts/account1/qrcode')
                .set('Authorization', 'Bearer valid-token');
            // Assert
            expect(setup_1.prismaMock.accountSecret.findFirst).toHaveBeenCalledWith({
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
        }));
    });
    describe('POST /api/accounts/parse-qrcode', () => {
        it('should parse QR code image and extract TOTP data', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            const requestData = {
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
            const response = yield (0, supertest_1.default)(app)
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
        }));
        it('should return 400 if image data is missing', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            const requestData = {}; // Missing image data
            // Act
            const response = yield (0, supertest_1.default)(app)
                .post('/api/accounts/parse-qrcode')
                .set('Authorization', 'Bearer valid-token')
                .send(requestData);
            // Assert
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('message', 'QR code image data is required');
        }));
        it('should handle QR code parsing errors', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            const requestData = {
                image: 'base64-encoded-image-data'
            };
            qrCodeHandler.parseQRCode.mockRejectedValue(new Error('No QR code found in the image'));
            // Act
            const response = yield (0, supertest_1.default)(app)
                .post('/api/accounts/parse-qrcode')
                .set('Authorization', 'Bearer valid-token')
                .send(requestData);
            // Assert
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('message', 'No valid QR code found in the image.');
        }));
    });
});
