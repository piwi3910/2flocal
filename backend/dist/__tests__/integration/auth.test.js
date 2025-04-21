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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const express_1 = __importDefault(require("express"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const auth_1 = __importDefault(require("../../routes/auth"));
const setup_1 = require("../../__tests__/setup");
// Mock dependencies
jest.mock('bcrypt');
jest.mock('jsonwebtoken');
jest.mock('../../utils/emailService', () => ({
    sendVerificationEmail: jest.fn().mockResolvedValue(true),
    sendPasswordResetEmail: jest.fn().mockResolvedValue(true),
}));
describe('Auth API', () => {
    // Create a test app
    const app = (0, express_1.default)();
    app.use(express_1.default.json());
    app.use('/api/auth', auth_1.default);
    // Add prisma mock to app.locals
    app.locals.prisma = setup_1.prismaMock;
    beforeEach(() => {
        jest.clearAllMocks();
    });
    describe('POST /api/auth/register', () => {
        // Increase timeout to 15 seconds for all integration tests
        jest.setTimeout(15000);
        it('should register a new user', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            const userData = {
                name: 'Test User',
                email: 'test@example.com',
                password: 'Password123!',
            };
            // Mock bcrypt hash
            bcrypt_1.default.hash.mockResolvedValue('hashedPassword');
            // Mock user creation
            setup_1.prismaMock.user.findUnique.mockResolvedValue(null); // User doesn't exist yet
            setup_1.prismaMock.user.create.mockResolvedValue({
                id: '1',
                email: userData.email,
                passwordHash: 'hashedPassword',
                name: userData.name,
                isEmailVerified: false,
                emailVerificationToken: 'verification-token',
                passwordResetToken: null,
                passwordResetExpires: null,
                isAdmin: false,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            // Act
            const response = yield (0, supertest_1.default)(app)
                .post('/api/auth/register')
                .send(userData);
            // Assert
            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('message', 'User registered successfully. Please check your email to verify your account.');
            expect(response.body).toHaveProperty('id');
            expect(response.body).toHaveProperty('email', userData.email);
            expect(response.body).not.toHaveProperty('passwordHash'); // Password should not be returned
        }));
        it('should return 409 if user already exists', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            const userData = {
                name: 'Test User',
                email: 'existing@example.com',
                password: 'Password123!',
            };
            // Mock user already exists
            setup_1.prismaMock.user.findUnique.mockResolvedValue({
                id: '1',
                email: userData.email,
                passwordHash: 'hashedPassword',
                name: userData.name,
                isEmailVerified: true,
                emailVerificationToken: null,
                passwordResetToken: null,
                passwordResetExpires: null,
                isAdmin: false,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            // Act
            const response = yield (0, supertest_1.default)(app)
                .post('/api/auth/register')
                .send(userData);
            // Assert
            expect(response.status).toBe(409);
            expect(response.body).toHaveProperty('message', 'User with this email already exists');
        }));
        it('should return 400 if email is invalid', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            const userData = {
                name: 'Test User',
                email: 'invalid-email',
                password: 'Password123!',
            };
            // Act
            const response = yield (0, supertest_1.default)(app)
                .post('/api/auth/register')
                .send(userData);
            // Assert
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('message', 'Invalid email format');
        }));
    });
    describe('POST /api/auth/login', () => {
        it('should login a user and return tokens', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            const loginData = {
                email: 'test@example.com',
                password: 'Password123!',
            };
            // Mock user exists
            setup_1.prismaMock.user.findUnique.mockResolvedValue({
                id: '1',
                email: loginData.email,
                passwordHash: 'hashedPassword',
                name: 'Test User',
                isEmailVerified: true,
                emailVerificationToken: null,
                passwordResetToken: null,
                passwordResetExpires: null,
                isAdmin: false,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            // Mock password comparison
            bcrypt_1.default.compare.mockResolvedValue(true);
            // Mock token generation
            jsonwebtoken_1.default.sign.mockReturnValue('mock-access-token');
            // Mock refresh token creation
            setup_1.prismaMock.$executeRaw.mockResolvedValue(1);
            // Act
            const response = yield (0, supertest_1.default)(app)
                .post('/api/auth/login')
                .send(loginData);
            // Assert
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('message', 'Login successful');
            expect(response.body).toHaveProperty('accessToken');
            expect(response.body).toHaveProperty('refreshToken');
            expect(response.body).toHaveProperty('user');
            expect(response.body.user).toHaveProperty('id', '1');
            expect(response.body.user).toHaveProperty('email', loginData.email);
        }));
        it('should return 401 if credentials are invalid', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            const loginData = {
                email: 'test@example.com',
                password: 'WrongPassword',
            };
            // Mock user exists
            setup_1.prismaMock.user.findUnique.mockResolvedValue({
                id: '1',
                email: loginData.email,
                passwordHash: 'hashedPassword',
                name: 'Test User',
                isEmailVerified: true,
                emailVerificationToken: null,
                passwordResetToken: null,
                passwordResetExpires: null,
                isAdmin: false,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            // Mock password comparison (fails)
            bcrypt_1.default.compare.mockResolvedValue(false);
            // Act
            const response = yield (0, supertest_1.default)(app)
                .post('/api/auth/login')
                .send(loginData);
            // Assert
            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('message', 'Invalid credentials');
        }));
    });
    describe('POST /api/auth/refresh-token', () => {
        it('should refresh tokens with a valid refresh token', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            const refreshData = {
                refreshToken: 'valid-refresh-token'
            };
            // Mock token validation
            setup_1.prismaMock.$executeRaw.mockResolvedValue(1); // Token exists
            // Mock token generation
            jsonwebtoken_1.default.sign.mockReturnValue('new-access-token');
            // Act
            const response = yield (0, supertest_1.default)(app)
                .post('/api/auth/refresh-token')
                .send(refreshData);
            // Assert
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('accessToken', 'new-access-token');
            expect(response.body).toHaveProperty('refreshToken');
        }));
        it('should return 401 if refresh token is invalid', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            const refreshData = {
                refreshToken: 'invalid-refresh-token'
            };
            // Mock token validation (token doesn't exist)
            setup_1.prismaMock.$executeRaw.mockResolvedValue(0);
            // Act
            const response = yield (0, supertest_1.default)(app)
                .post('/api/auth/refresh-token')
                .send(refreshData);
            // Assert
            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('message', 'Invalid refresh token');
        }));
    });
    describe('GET /api/auth/me', () => {
        it('should return user data for authenticated user', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            const mockUser = {
                id: '1',
                email: 'test@example.com',
                name: 'Test User',
                isEmailVerified: true,
                isAdmin: false,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            // Mock JWT verification
            jsonwebtoken_1.default.verify.mockReturnValue({ userId: '1', email: 'test@example.com' });
            // Mock user retrieval
            setup_1.prismaMock.user.findUnique.mockResolvedValue(mockUser);
            // Act
            const response = yield (0, supertest_1.default)(app)
                .get('/api/auth/me')
                .set('Authorization', 'Bearer valid-token');
            // Assert
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('id', '1');
            expect(response.body).toHaveProperty('email', 'test@example.com');
            expect(response.body).toHaveProperty('name', 'Test User');
            expect(response.body).not.toHaveProperty('passwordHash');
        }));
        it('should return 401 if no token is provided', () => __awaiter(void 0, void 0, void 0, function* () {
            // Act
            const response = yield (0, supertest_1.default)(app)
                .get('/api/auth/me');
            // Assert
            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('message', 'No token provided');
        }));
        it('should return 401 if token is invalid', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            jsonwebtoken_1.default.verify.mockImplementation(() => {
                throw new Error('Invalid token');
            });
            // Act
            const response = yield (0, supertest_1.default)(app)
                .get('/api/auth/me')
                .set('Authorization', 'Bearer invalid-token');
            // Assert
            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('message', 'Invalid token');
        }));
    });
    describe('PUT /api/auth/profile', () => {
        it('should update user profile successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            const updateData = {
                name: 'Updated Name'
            };
            // Mock JWT verification
            jsonwebtoken_1.default.verify.mockReturnValue({ userId: '1', email: 'test@example.com' });
            // Mock user update
            setup_1.prismaMock.user.update.mockResolvedValue({
                id: '1',
                email: 'test@example.com',
                name: 'Updated Name',
                passwordHash: 'hashedPassword',
                isEmailVerified: true,
                emailVerificationToken: null,
                passwordResetToken: null,
                passwordResetExpires: null,
                isAdmin: false,
                createdAt: new Date(),
                updatedAt: new Date()
            });
            // Act
            const response = yield (0, supertest_1.default)(app)
                .put('/api/auth/profile')
                .set('Authorization', 'Bearer valid-token')
                .send(updateData);
            // Assert
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('name', 'Updated Name');
            expect(response.body).not.toHaveProperty('passwordHash');
        }));
    });
    describe('POST /api/auth/revoke-token', () => {
        it('should revoke a refresh token successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            const revokeData = {
                refreshToken: 'token-to-revoke'
            };
            // Mock JWT verification
            jsonwebtoken_1.default.verify.mockReturnValue({ userId: '1', email: 'test@example.com' });
            // Mock token deletion
            setup_1.prismaMock.$executeRaw.mockResolvedValue(1);
            // Act
            const response = yield (0, supertest_1.default)(app)
                .post('/api/auth/revoke-token')
                .set('Authorization', 'Bearer valid-token')
                .send(revokeData);
            // Assert
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('message', 'Token revoked successfully');
        }));
    });
});
