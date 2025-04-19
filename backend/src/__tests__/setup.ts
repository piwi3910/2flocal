import { PrismaClient } from '@prisma/client';
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';
import * as dotenv from 'dotenv';
import path from 'path';

// Load test environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env.test') });

// Mock Prisma client
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(),
}));

// Create a mock instance of Prisma client
export const prismaMock = mockDeep<PrismaClient>() as DeepMockProxy<PrismaClient> & { $executeRaw: jest.Mock };

// Reset mocks before each test
beforeEach(() => {
  mockReset(prismaMock);
  
  // Ensure $executeRaw is available for RefreshToken operations
  if (!prismaMock.$executeRaw) {
    prismaMock.$executeRaw = jest.fn().mockResolvedValue(1);
  }
  
  // Reset Date.now mock if it exists
  if (jest.isMockFunction(Date.now)) {
    jest.spyOn(Date, 'now').mockRestore();
  }
});

// Mock the Prisma client constructor to return our mock
(PrismaClient as jest.Mock).mockImplementation(() => prismaMock);

// Mock QRCode, jsQR, and canvas modules
jest.mock('qrcode', () => ({
  toDataURL: jest.fn().mockResolvedValue('data:image/png;base64,mockQRCodeImage'),
}));

jest.mock('jsqr', () => jest.fn().mockReturnValue({
  data: 'otpauth://totp/Test:test@example.com?secret=ABCDEFGHIJKLMNOP&issuer=Test',
  location: { topLeftCorner: {}, topRightCorner: {}, bottomLeftCorner: {}, bottomRightCorner: {} }
}));

jest.mock('canvas', () => ({
  createCanvas: jest.fn().mockReturnValue({
    width: 200,
    height: 200,
    getContext: jest.fn().mockReturnValue({
      drawImage: jest.fn(),
      getImageData: jest.fn().mockReturnValue({
        data: new Uint8ClampedArray(200 * 200 * 4),
        width: 200,
        height: 200
      })
    })
  }),
  loadImage: jest.fn().mockResolvedValue({
    width: 200,
    height: 200
  })
}));