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
const nodemailer_1 = __importDefault(require("nodemailer"));
const emailService = __importStar(require("../emailService"));
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
    const originalEnv = Object.assign({}, process.env);
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
        process.env = Object.assign({}, originalEnv);
    });
    describe('sendEmail', () => {
        it('should send an email successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            const to = 'recipient@example.com';
            const subject = 'Test Subject';
            const html = '<p>Test content</p>';
            const mockTransporter = nodemailer_1.default.createTransport();
            // Act
            const result = yield emailService.sendEmail(to, subject, html);
            // Assert
            expect(mockTransporter.sendMail).toHaveBeenCalledWith({
                from: expect.any(String),
                to,
                subject,
                html
            });
            expect(result).toHaveProperty('messageId', 'mock-message-id');
        }));
        it('should throw an error if sending fails', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            const to = 'recipient@example.com';
            const subject = 'Test Subject';
            const html = '<p>Test content</p>';
            const mockError = new Error('Failed to send email');
            const mockTransporter = nodemailer_1.default.createTransport();
            mockTransporter.sendMail.mockRejectedValueOnce(mockError);
            // Act & Assert
            yield expect(emailService.sendEmail(to, subject, html)).rejects.toThrow(mockError);
        }));
    });
    describe('sendVerificationEmail', () => {
        it('should send a verification email with the correct content', () => __awaiter(void 0, void 0, void 0, function* () {
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
            const result = yield emailService.sendVerificationEmail(user, token);
            // Assert
            expect(emailService.sendEmail).toHaveBeenCalledWith(user.email, 'Verify Your Email - 2FLocal', expect.stringContaining('verify-email?token=verification-token-123'));
            expect(result).toHaveProperty('messageId', 'mock-message-id');
        }));
    });
    describe('sendPasswordResetEmail', () => {
        it('should send a password reset email with the correct content', () => __awaiter(void 0, void 0, void 0, function* () {
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
            const result = yield emailService.sendPasswordResetEmail(user, token);
            // Assert
            expect(emailService.sendEmail).toHaveBeenCalledWith(user.email, 'Password Reset - 2FLocal', expect.stringContaining('reset-password?token=reset-token-123'));
            expect(result).toHaveProperty('messageId', 'mock-message-id');
        }));
    });
});
