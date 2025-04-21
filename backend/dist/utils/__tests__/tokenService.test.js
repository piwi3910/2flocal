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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const setup_1 = require("../../__tests__/setup");
const tokenService = __importStar(require("../tokenService"));
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
            crypto_1.default.randomBytes.mockReturnValue(mockRandomBytes);
            // Act
            const result = tokenService.generateToken();
            // Assert
            expect(crypto_1.default.randomBytes).toHaveBeenCalledWith(32);
            expect(result).toBe(mockRandomBytes.toString('hex'));
        });
        it('should generate a random token with specified length', () => {
            // Arrange
            const mockRandomBytes = Buffer.from('mockRandomBytes');
            crypto_1.default.randomBytes.mockReturnValue(mockRandomBytes);
            // Act
            const result = tokenService.generateToken(64);
            // Assert
            expect(crypto_1.default.randomBytes).toHaveBeenCalledWith(64);
            expect(result).toBe(mockRandomBytes.toString('hex'));
        });
    });
    describe('generatePasswordResetToken', () => {
        it('should generate a password reset token with expiry', () => {
            // Arrange
            const mockToken = 'mockToken';
            jest.spyOn(tokenService, 'generateToken').mockReturnValue(mockToken);
            // Mock Date.now instead of the Date constructor
            const mockTimestamp = 1713600000000; // 2025-04-19T08:00:00Z in milliseconds
            jest.spyOn(Date, 'now').mockReturnValue(mockTimestamp);
            // Act
            const result = tokenService.generatePasswordResetToken();
            // Assert
            expect(tokenService.generateToken).toHaveBeenCalled();
            expect(result.token).toBe(mockToken);
            // Expected expiry is 1 hour (3600000 ms) later
            const expectedExpiry = new Date(mockTimestamp + 3600000);
            expect(result.expires).toEqual(expectedExpiry);
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
            crypto_1.default.createHash.mockReturnValue(mockHash);
            // Act
            const result = tokenService.hashToken(token);
            // Assert
            expect(crypto_1.default.createHash).toHaveBeenCalledWith('sha256');
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
            jsonwebtoken_1.default.sign.mockReturnValue(mockToken);
            // Act
            const result = tokenService.generateAccessToken(userId, email);
            // Assert
            expect(jsonwebtoken_1.default.sign).toHaveBeenCalledWith({ userId, email }, expect.any(String), { expiresIn: '15m' });
            expect(result).toBe(mockToken);
        });
    });
    describe('generateRefreshToken', () => {
        it('should generate a refresh token and store it in the database', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            const userId = 'user123';
            const deviceInfo = 'Chrome on Windows';
            const ipAddress = '127.0.0.1';
            const mockToken = 'mockRefreshToken';
            const mockTokenHash = 'hashedRefreshToken';
            const mockUuid = 'mock-uuid';
            jest.spyOn(tokenService, 'generateToken').mockReturnValue(mockToken);
            jest.spyOn(tokenService, 'hashToken').mockReturnValue(mockTokenHash);
            crypto_1.default.randomUUID.mockReturnValue(mockUuid);
            // Mock Date.now instead of the Date constructor
            const mockTimestamp = 1713600000000; // 2025-04-19T08:00:00Z in milliseconds
            jest.spyOn(Date, 'now').mockReturnValue(mockTimestamp);
            setup_1.prismaMock.$executeRaw.mockResolvedValue(1);
            // Act
            const result = yield tokenService.generateRefreshToken(userId, deviceInfo, ipAddress);
            // Assert
            expect(tokenService.generateToken).toHaveBeenCalledWith(64);
            expect(tokenService.hashToken).toHaveBeenCalledWith(mockToken);
            expect(setup_1.prismaMock.$executeRaw).toHaveBeenCalled();
            expect(result.token).toBe(mockToken);
            // Expected expiry is 7 days (604800000 ms) later
            const expectedExpiry = new Date(mockTimestamp + 604800000);
            expect(result.expiresAt).toEqual(expectedExpiry);
        }));
    });
    // Add more tests for other token service functions...
});
