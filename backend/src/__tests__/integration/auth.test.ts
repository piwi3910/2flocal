import request from 'supertest';
import express from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import authRouter from '../../routes/auth';
import { prismaMock } from '../../__tests__/setup';

// Mock dependencies
jest.mock('bcrypt');
jest.mock('jsonwebtoken');
jest.mock('../../utils/emailService', () => ({
  sendVerificationEmail: jest.fn().mockResolvedValue(true),
  sendPasswordResetEmail: jest.fn().mockResolvedValue(true),
}));

describe('Auth API', () => {
  // Create a test app
  const app = express();
  app.use(express.json());
  app.use('/api/auth', authRouter);
  
  // Add prisma mock to app.locals
  app.locals.prisma = prismaMock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    // Increase timeout to 15 seconds for all integration tests
    jest.setTimeout(15000);
    
    it('should register a new user', async () => {
      // Arrange
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123!',
      };

      // Mock bcrypt hash
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');

      // Mock user creation
      prismaMock.user.findUnique.mockResolvedValue(null); // User doesn't exist yet
      prismaMock.user.create.mockResolvedValue({
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
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      // Assert
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message', 'User registered successfully. Please check your email to verify your account.');
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('email', userData.email);
      expect(response.body).not.toHaveProperty('passwordHash'); // Password should not be returned
    });

    it('should return 409 if user already exists', async () => {
      // Arrange
      const userData = {
        name: 'Test User',
        email: 'existing@example.com',
        password: 'Password123!',
      };

      // Mock user already exists
      prismaMock.user.findUnique.mockResolvedValue({
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
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      // Assert
      expect(response.status).toBe(409);
      expect(response.body).toHaveProperty('message', 'User with this email already exists');
    });

    it('should return 400 if email is invalid', async () => {
      // Arrange
      const userData = {
        name: 'Test User',
        email: 'invalid-email',
        password: 'Password123!',
      };

      // Act
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Invalid email format');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login a user and return tokens', async () => {
      // Arrange
      const loginData = {
        email: 'test@example.com',
        password: 'Password123!',
      };

      // Mock user exists
      prismaMock.user.findUnique.mockResolvedValue({
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
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      // Mock token generation
      (jwt.sign as jest.Mock).mockReturnValue('mock-access-token');
      
      // Mock refresh token creation
      prismaMock.$executeRaw.mockResolvedValue(1);

      // Act
      const response = await request(app)
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
    });

    it('should return 401 if credentials are invalid', async () => {
      // Arrange
      const loginData = {
        email: 'test@example.com',
        password: 'WrongPassword',
      };

      // Mock user exists
      prismaMock.user.findUnique.mockResolvedValue({
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
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      // Act
      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      // Assert
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'Invalid credentials');
    });
  });

  describe('POST /api/auth/refresh-token', () => {
    it('should refresh tokens with a valid refresh token', async () => {
      // Arrange
      const refreshData = {
        refreshToken: 'valid-refresh-token'
      };

      // Mock token validation
      prismaMock.$executeRaw.mockResolvedValue(1); // Token exists
      
      // Mock token generation
      (jwt.sign as jest.Mock).mockReturnValue('new-access-token');

      // Act
      const response = await request(app)
        .post('/api/auth/refresh-token')
        .send(refreshData);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('accessToken', 'new-access-token');
      expect(response.body).toHaveProperty('refreshToken');
    });

    it('should return 401 if refresh token is invalid', async () => {
      // Arrange
      const refreshData = {
        refreshToken: 'invalid-refresh-token'
      };

      // Mock token validation (token doesn't exist)
      prismaMock.$executeRaw.mockResolvedValue(0);

      // Act
      const response = await request(app)
        .post('/api/auth/refresh-token')
        .send(refreshData);

      // Assert
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'Invalid refresh token');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return user data for authenticated user', async () => {
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
      (jwt.verify as jest.Mock).mockReturnValue({ userId: '1', email: 'test@example.com' });
      
      // Mock user retrieval
      prismaMock.user.findUnique.mockResolvedValue(mockUser);

      // Act
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer valid-token');

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', '1');
      expect(response.body).toHaveProperty('email', 'test@example.com');
      expect(response.body).toHaveProperty('name', 'Test User');
      expect(response.body).not.toHaveProperty('passwordHash');
    });

    it('should return 401 if no token is provided', async () => {
      // Act
      const response = await request(app)
        .get('/api/auth/me');

      // Assert
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'No token provided');
    });

    it('should return 401 if token is invalid', async () => {
      // Arrange
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      // Act
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token');

      // Assert
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'Invalid token');
    });
  });

  describe('PUT /api/auth/profile', () => {
    it('should update user profile successfully', async () => {
      // Arrange
      const updateData = {
        name: 'Updated Name'
      };

      // Mock JWT verification
      (jwt.verify as jest.Mock).mockReturnValue({ userId: '1', email: 'test@example.com' });
      
      // Mock user update
      prismaMock.user.update.mockResolvedValue({
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
      const response = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', 'Bearer valid-token')
        .send(updateData);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('name', 'Updated Name');
      expect(response.body).not.toHaveProperty('passwordHash');
    });
  });

  describe('POST /api/auth/revoke-token', () => {
    it('should revoke a refresh token successfully', async () => {
      // Arrange
      const revokeData = {
        refreshToken: 'token-to-revoke'
      };

      // Mock JWT verification
      (jwt.verify as jest.Mock).mockReturnValue({ userId: '1', email: 'test@example.com' });
      
      // Mock token deletion
      prismaMock.$executeRaw.mockResolvedValue(1);

      // Act
      const response = await request(app)
        .post('/api/auth/revoke-token')
        .set('Authorization', 'Bearer valid-token')
        .send(revokeData);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Token revoked successfully');
    });
  });
});