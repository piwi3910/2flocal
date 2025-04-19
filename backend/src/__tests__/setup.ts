import { PrismaClient } from '@prisma/client';
import { mockDeep, mockReset } from 'jest-mock-extended';

// Mock Prisma client
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(),
}));

// Create a mock instance of Prisma client
export const prismaMock = mockDeep<PrismaClient>();

// Reset mocks before each test
beforeEach(() => {
  mockReset(prismaMock);
});

// Mock the Prisma client constructor to return our mock
(PrismaClient as jest.Mock).mockImplementation(() => prismaMock);