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
const authController = __importStar(require("../authController"));
const tokenService = __importStar(require("../../utils/tokenService"));
const bcrypt = __importStar(require("bcrypt"));
// Mock dependencies
jest.mock('../../utils/tokenService');
jest.mock('bcrypt');
describe('Auth Controller', () => {
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
    });
    describe('loginUser', () => {
        it('should return 400 if email or password is missing', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            mockRequest.body = { email: 'test@example.com' }; // Missing password
            // Act
            yield authController.loginUser(mockRequest, mockResponse, mockNext);
            // Assert
            expect(mockNext).toHaveBeenCalled();
            expect(mockNext.mock.calls[0][0].statusCode).toBe(400);
        }));
        it('should return 401 if user is not found', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            mockRequest.body = { email: 'test@example.com', password: 'password123' };
            setup_1.prismaMock.user.findUnique.mockResolvedValue(null);
            // Act
            yield authController.loginUser(mockRequest, mockResponse, mockNext);
            // Assert
            expect(mockNext).toHaveBeenCalled();
            expect(mockNext.mock.calls[0][0].statusCode).toBe(401);
            expect(mockNext.mock.calls[0][0].message).toContain('Invalid credentials');
        }));
        it('should return 401 if password is incorrect', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            mockRequest.body = { email: 'test@example.com', password: 'password123' };
            setup_1.prismaMock.user.findUnique.mockResolvedValue({
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
            bcrypt.compare.mockResolvedValue(false);
            // Act
            yield authController.loginUser(mockRequest, mockResponse, mockNext);
            // Assert
            expect(mockNext).toHaveBeenCalled();
            expect(mockNext.mock.calls[0][0].statusCode).toBe(401);
            expect(mockNext.mock.calls[0][0].message).toContain('Invalid credentials');
        }));
        it('should return 200 and tokens if login is successful', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            mockRequest.body = { email: 'test@example.com', password: 'password123' };
            setup_1.prismaMock.user.findUnique.mockResolvedValue({
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
            bcrypt.compare.mockResolvedValue(true);
            tokenService.generateAccessToken.mockReturnValue('access-token');
            tokenService.generateRefreshToken.mockReturnValue('refresh-token');
            setup_1.prismaMock.refreshToken.create.mockResolvedValue({
                id: '1',
                token: 'refresh-token',
                userId: '1',
                expiresAt: new Date(),
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            // Act
            yield authController.loginUser(mockRequest, mockResponse, mockNext);
            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
                accessToken: 'access-token',
                refreshToken: 'refresh-token',
            }));
        }));
    });
    // Add more tests for other auth controller methods...
});
