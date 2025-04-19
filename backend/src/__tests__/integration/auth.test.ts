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

  // Add more tests for other auth endpoints...
});