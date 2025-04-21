import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '../../prisma/src/generated/prisma';

// Get JWT secret from environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'DEFAULT_SECRET_CHANGE_ME';
const ACCESS_TOKEN_EXPIRY = '15m'; // 15 minutes
const REFRESH_TOKEN_EXPIRY_DAYS = 7; // 7 days

// Initialize Prisma client
const prisma = new PrismaClient();

// Define types for RefreshToken
interface RefreshToken {
  id: string;
  tokenHash: string;
  expiresAt: Date;
  isRevoked: boolean;
  revokedAt: Date | null;
  deviceInfo: string | null;
  ipAddress: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Generate a random token
 * @param length Length of the token (default: 32)
 * @returns Random token string
 */
export const generateToken = (length: number = 32): string => {
  return crypto.randomBytes(length).toString('hex');
};

/**
 * Generate a password reset token and expiry
 * @returns Object containing token and expiry date
 */
export const generatePasswordResetToken = (): { token: string; expires: Date } => {
  const token = generateToken();
  // Token expires in 1 hour
  const expires = new Date(Date.now() + 3600000);
  
  return { token, expires };
};

/**
 * Generate an email verification token
 * @returns Verification token
 */
export const generateEmailVerificationToken = (): string => {
  return generateToken();
};

/**
 * Hash a token for secure storage
 * @param token Token to hash
 * @returns Hashed token
 */
export const hashToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

/**
 * Generate a JWT access token
 * @param userId User ID to include in the token
 * @param email User email to include in the token
 * @returns JWT access token
 */
export const generateAccessToken = (userId: string, email: string): string => {
  const payload = { userId, email };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
};

/**
 * Generate a refresh token and store it in the database
 * @param userId User ID associated with the token
 * @param deviceInfo Optional device information
 * @param ipAddress Optional IP address
 * @returns Object containing the refresh token and its expiry date
 */
export const generateRefreshToken = async (
  userId: string,
  deviceInfo?: string,
  ipAddress?: string
): Promise<{ token: string; expiresAt: Date }> => {
  // Generate a random token
  const token = generateToken(64); // Longer token for better security
  
  // Calculate expiry date (7 days from now)
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
  
  // Hash the token for storage
  const tokenHash = hashToken(token);
  
  // Store the token in the database using Prisma ORM
  await prisma.refreshToken.create({
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
};

/**
 * Verify a refresh token
 * @param token Refresh token to verify
 * @returns Object containing userId if valid, null otherwise
 */
export const verifyRefreshToken = async (token: string): Promise<{ userId: string } | null> => {
  // Hash the token for comparison
  const tokenHash = hashToken(token);
  
  // Find the token in the database using Prisma ORM
  const refreshToken = await prisma.refreshToken.findUnique({
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
};

/**
 * Refresh an access token using a valid refresh token
 * @param refreshToken Refresh token
 * @returns Object containing new access token, refresh token, and expiry if valid
 */
export const refreshAccessToken = async (
  refreshToken: string
): Promise<{ accessToken: string; refreshToken: string; expiresAt: Date } | null> => {
  // Verify the refresh token
  const verification = await verifyRefreshToken(refreshToken);
  
  if (!verification) {
    return null;
  }
  
  // Get user information
  const user = await prisma.user.findUnique({
    where: { id: verification.userId }
  });
  
  if (!user) {
    return null;
  }
  
  // Revoke the old refresh token (token rotation for security)
  await revokeRefreshToken(refreshToken);
  
  // Generate a new refresh token
  const { token: newRefreshToken, expiresAt } = await generateRefreshToken(
    user.id,
    // Maintain the same device info and IP if available
    await getRefreshTokenDeviceInfo(refreshToken),
    await getRefreshTokenIpAddress(refreshToken)
  );
  
  // Generate a new access token
  const accessToken = generateAccessToken(user.id, user.email);
  
  return { accessToken, refreshToken: newRefreshToken, expiresAt };
};

/**
 * Revoke a refresh token
 * @param token Refresh token to revoke
 * @returns True if revoked successfully, false otherwise
 */
export const revokeRefreshToken = async (token: string): Promise<boolean> => {
  // Hash the token for comparison
  const tokenHash = hashToken(token);
  
  try {
    // Update the token to mark it as revoked using Prisma ORM
    await prisma.refreshToken.updateMany({
      where: {
        tokenHash
      },
      data: {
        isRevoked: true,
        revokedAt: new Date()
      }
    });
    
    return true;
  } catch (error) {
    console.error('Error revoking refresh token:', error);
    return false;
  }
};

/**
 * Revoke all refresh tokens for a user
 * @param userId User ID
 * @returns Number of tokens revoked
 */
export const revokeAllUserRefreshTokens = async (userId: string): Promise<number> => {
  try {
    // Update all tokens for the user to mark them as revoked using Prisma ORM
    const result = await prisma.refreshToken.updateMany({
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
  } catch (error) {
    console.error('Error revoking all user refresh tokens:', error);
    return 0;
  }
};

/**
 * Get device info for a refresh token
 * @param token Refresh token
 * @returns Device info string or undefined
 */
export const getRefreshTokenDeviceInfo = async (token: string): Promise<string | undefined> => {
  const tokenHash = hashToken(token);
  
  const refreshToken = await prisma.refreshToken.findUnique({
    where: {
      tokenHash
    },
    select: {
      deviceInfo: true
    }
  });
  
  return refreshToken?.deviceInfo || undefined;
};

/**
 * Get IP address for a refresh token
 * @param token Refresh token
 * @returns IP address string or undefined
 */
export const getRefreshTokenIpAddress = async (token: string): Promise<string | undefined> => {
  const tokenHash = hashToken(token);
  
  const refreshToken = await prisma.refreshToken.findUnique({
    where: {
      tokenHash
    },
    select: {
      ipAddress: true
    }
  });
  
  return refreshToken?.ipAddress || undefined;
};