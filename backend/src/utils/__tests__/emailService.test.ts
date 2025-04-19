import nodemailer from 'nodemailer';
import * as emailService from '../emailService';

// Mock nodemailer
jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockImplementation((mailOptions) => {
      return Promise.resolve({
        messageId: 'mock-message-id',
        envelope: {
          from: mailOptions.from,
          to: [mailOptions.to]
        }
      });
    })
  })
}));

describe('Email Service', () => {
  // Save original environment variables
  const originalEnv = { ...process.env };
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Set test environment variables
    process.env.EMAIL_HOST = 'test.smtp.com';
    process.env.EMAIL_PORT = '587';
    process.env.EMAIL_USER = 'test@example.com';
    process.env.EMAIL_PASS = 'test-password';
    process.env.EMAIL_FROM = 'Test 2FLocal <test@2flocal.com>';
    process.env.BASE_URL = 'https://test.2flocal.com';
  });
  
  afterEach(() => {
    // Restore original environment variables
    process.env = { ...originalEnv };
  });
  
  describe('sendEmail', () => {
    it('should send an email successfully', async () => {
      // Arrange
      const to = 'recipient@example.com';
      const subject = 'Test Subject';
      const html = '<p>Test content</p>';
      
      const mockTransporter = nodemailer.createTransport();
      
      // Act
      const result = await emailService.sendEmail(to, subject, html);
      
      // Assert
      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: expect.any(String),
        to,
        subject,
        html
      });
      expect(result).toHaveProperty('messageId', 'mock-message-id');
    });
    
    it('should throw an error if sending fails', async () => {
      // Arrange
      const to = 'recipient@example.com';
      const subject = 'Test Subject';
      const html = '<p>Test content</p>';
      
      const mockError = new Error('Failed to send email');
      const mockTransporter = nodemailer.createTransport();
      (mockTransporter.sendMail as jest.Mock).mockRejectedValueOnce(mockError);
      
      // Act & Assert
      await expect(emailService.sendEmail(to, subject, html)).rejects.toThrow(mockError);
    });
  });
  
  describe('sendVerificationEmail', () => {
    it('should send a verification email with the correct content', async () => {
      // Arrange
      const user = {
        id: 'user1',
        email: 'user@example.com',
        name: 'Test User',
        passwordHash: 'hashed-password',
        isEmailVerified: false,
        emailVerificationToken: null,
        passwordResetToken: null,
        passwordResetExpires: null,
        isAdmin: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const token = 'verification-token-123';
      
      // Spy on sendEmail function
      jest.spyOn(emailService, 'sendEmail').mockResolvedValueOnce({ messageId: 'mock-message-id' });
      
      // Act
      const result = await emailService.sendVerificationEmail(user, token);
      
      // Assert
      expect(emailService.sendEmail).toHaveBeenCalledWith(
        user.email,
        'Verify Your Email - 2FLocal',
        expect.stringContaining('verify-email?token=verification-token-123')
      );
      expect(result).toHaveProperty('messageId', 'mock-message-id');
    });
  });
  
  describe('sendPasswordResetEmail', () => {
    it('should send a password reset email with the correct content', async () => {
      // Arrange
      const user = {
        id: 'user1',
        email: 'user@example.com',
        name: 'Test User',
        passwordHash: 'hashed-password',
        isEmailVerified: true,
        emailVerificationToken: null,
        passwordResetToken: 'reset-token-hash',
        passwordResetExpires: new Date(Date.now() + 3600000),
        isAdmin: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const token = 'reset-token-123';
      
      // Spy on sendEmail function
      jest.spyOn(emailService, 'sendEmail').mockResolvedValueOnce({ messageId: 'mock-message-id' });
      
      // Act
      const result = await emailService.sendPasswordResetEmail(user, token);
      
      // Assert
      expect(emailService.sendEmail).toHaveBeenCalledWith(
        user.email,
        'Password Reset - 2FLocal',
        expect.stringContaining('reset-password?token=reset-token-123')
      );
      expect(result).toHaveProperty('messageId', 'mock-message-id');
    });
  });
});