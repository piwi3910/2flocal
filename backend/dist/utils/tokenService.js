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
exports.getRefreshTokenIpAddress = exports.getRefreshTokenDeviceInfo = exports.revokeAllUserRefreshTokens = exports.revokeRefreshToken = exports.refreshAccessToken = exports.verifyRefreshToken = exports.generateRefreshToken = exports.generateAccessToken = exports.hashToken = exports.generateEmailVerificationToken = exports.generatePasswordResetToken = exports.generateToken = void 0;
const crypto_1 = __importDefault(require("crypto"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../../prisma/src/generated/prisma");
// Get JWT secret from environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'DEFAULT_SECRET_CHANGE_ME';
const ACCESS_TOKEN_EXPIRY = '15m'; // 15 minutes
const REFRESH_TOKEN_EXPIRY_DAYS = 7; // 7 days
// Initialize Prisma client
const prisma = new prisma_1.PrismaClient();
/**
 * Generate a random token
 * @param length Length of the token (default: 32)
 * @returns Random token string
 */
const generateToken = (length = 32) => {
    return crypto_1.default.randomBytes(length).toString('hex');
};
exports.generateToken = generateToken;
/**
 * Generate a password reset token and expiry
 * @returns Object containing token and expiry date
 */
const generatePasswordResetToken = () => {
    const token = (0, exports.generateToken)();
    // Token expires in 1 hour
    const expires = new Date(Date.now() + 3600000);
    return { token, expires };
};
exports.generatePasswordResetToken = generatePasswordResetToken;
/**
 * Generate an email verification token
 * @returns Verification token
 */
const generateEmailVerificationToken = () => {
    return (0, exports.generateToken)();
};
exports.generateEmailVerificationToken = generateEmailVerificationToken;
/**
 * Hash a token for secure storage
 * @param token Token to hash
 * @returns Hashed token
 */
const hashToken = (token) => {
    return crypto_1.default.createHash('sha256').update(token).digest('hex');
};
exports.hashToken = hashToken;
/**
 * Generate a JWT access token
 * @param userId User ID to include in the token
 * @param email User email to include in the token
 * @returns JWT access token
 */
const generateAccessToken = (userId, email) => {
    const payload = { userId, email };
    return jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
};
exports.generateAccessToken = generateAccessToken;
/**
 * Generate a refresh token and store it in the database
 * @param userId User ID associated with the token
 * @param deviceInfo Optional device information
 * @param ipAddress Optional IP address
 * @returns Object containing the refresh token and its expiry date
 */
const generateRefreshToken = (userId, deviceInfo, ipAddress) => __awaiter(void 0, void 0, void 0, function* () {
    // Generate a random token
    const token = (0, exports.generateToken)(64); // Longer token for better security
    // Calculate expiry date (7 days from now)
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
    // Hash the token for storage
    const tokenHash = (0, exports.hashToken)(token);
    // Store the token in the database using Prisma ORM
    yield prisma.refreshToken.create({
        data: {
            tokenHash,
            expiresAt,
            isRevoked: false,
            deviceInfo,
            ipAddress,
            userId
        }
    });
    return { token, expiresAt };
});
exports.generateRefreshToken = generateRefreshToken;
/**
 * Verify a refresh token
 * @param token Refresh token to verify
 * @returns Object containing userId if valid, null otherwise
 */
const verifyRefreshToken = (token) => __awaiter(void 0, void 0, void 0, function* () {
    // Hash the token for comparison
    const tokenHash = (0, exports.hashToken)(token);
    // Find the token in the database using Prisma ORM
    const refreshToken = yield prisma.refreshToken.findUnique({
        where: {
            tokenHash
        }
    });
    if (!refreshToken) {
        return null;
    }
    // Check if token is not expired and not revoked
    if (refreshToken.expiresAt < new Date() || refreshToken.isRevoked) {
        return null;
    }
    return { userId: refreshToken.userId };
});
exports.verifyRefreshToken = verifyRefreshToken;
/**
 * Refresh an access token using a valid refresh token
 * @param refreshToken Refresh token
 * @returns Object containing new access token, refresh token, and expiry if valid
 */
const refreshAccessToken = (refreshToken) => __awaiter(void 0, void 0, void 0, function* () {
    // Verify the refresh token
    const verification = yield (0, exports.verifyRefreshToken)(refreshToken);
    if (!verification) {
        return null;
    }
    // Get user information
    const user = yield prisma.user.findUnique({
        where: { id: verification.userId }
    });
    if (!user) {
        return null;
    }
    // Revoke the old refresh token (token rotation for security)
    yield (0, exports.revokeRefreshToken)(refreshToken);
    // Generate a new refresh token
    const { token: newRefreshToken, expiresAt } = yield (0, exports.generateRefreshToken)(user.id, 
    // Maintain the same device info and IP if available
    yield (0, exports.getRefreshTokenDeviceInfo)(refreshToken), yield (0, exports.getRefreshTokenIpAddress)(refreshToken));
    // Generate a new access token
    const accessToken = (0, exports.generateAccessToken)(user.id, user.email);
    return { accessToken, refreshToken: newRefreshToken, expiresAt };
});
exports.refreshAccessToken = refreshAccessToken;
/**
 * Revoke a refresh token
 * @param token Refresh token to revoke
 * @returns True if revoked successfully, false otherwise
 */
const revokeRefreshToken = (token) => __awaiter(void 0, void 0, void 0, function* () {
    // Hash the token for comparison
    const tokenHash = (0, exports.hashToken)(token);
    try {
        // Update the token to mark it as revoked using Prisma ORM
        yield prisma.refreshToken.updateMany({
            where: {
                tokenHash
            },
            data: {
                isRevoked: true,
                revokedAt: new Date()
            }
        });
        return true;
    }
    catch (error) {
        console.error('Error revoking refresh token:', error);
        return false;
    }
});
exports.revokeRefreshToken = revokeRefreshToken;
/**
 * Revoke all refresh tokens for a user
 * @param userId User ID
 * @returns Number of tokens revoked
 */
const revokeAllUserRefreshTokens = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Update all tokens for the user to mark them as revoked using Prisma ORM
        const result = yield prisma.refreshToken.updateMany({
            where: {
                userId,
                isRevoked: false
            },
            data: {
                isRevoked: true,
                revokedAt: new Date()
            }
        });
        return result.count;
    }
    catch (error) {
        console.error('Error revoking all user refresh tokens:', error);
        return 0;
    }
});
exports.revokeAllUserRefreshTokens = revokeAllUserRefreshTokens;
/**
 * Get device info for a refresh token
 * @param token Refresh token
 * @returns Device info string or undefined
 */
const getRefreshTokenDeviceInfo = (token) => __awaiter(void 0, void 0, void 0, function* () {
    const tokenHash = (0, exports.hashToken)(token);
    const refreshToken = yield prisma.refreshToken.findUnique({
        where: {
            tokenHash
        },
        select: {
            deviceInfo: true
        }
    });
    return (refreshToken === null || refreshToken === void 0 ? void 0 : refreshToken.deviceInfo) || undefined;
});
exports.getRefreshTokenDeviceInfo = getRefreshTokenDeviceInfo;
/**
 * Get IP address for a refresh token
 * @param token Refresh token
 * @returns IP address string or undefined
 */
const getRefreshTokenIpAddress = (token) => __awaiter(void 0, void 0, void 0, function* () {
    const tokenHash = (0, exports.hashToken)(token);
    const refreshToken = yield prisma.refreshToken.findUnique({
        where: {
            tokenHash
        },
        select: {
            ipAddress: true
        }
    });
    return (refreshToken === null || refreshToken === void 0 ? void 0 : refreshToken.ipAddress) || undefined;
});
exports.getRefreshTokenIpAddress = getRefreshTokenIpAddress;
