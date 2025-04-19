import { generateTOTP, getCurrentTOTP, getRemainingSeconds } from '../totpGenerator';
import crypto from 'crypto';

// Add TypeScript declarations for Jest
declare const jest: any;
declare const describe: (name: string, fn: () => void) => void;
declare const beforeEach: (fn: () => void) => void;
declare const it: (name: string, fn: () => void) => void;
declare const expect: any;

// Mock the crypto module
jest.mock('crypto', () => {
  const originalCrypto = jest.requireActual('crypto');
  return {
    ...originalCrypto,
    // Mock the createHmac function to return a predictable value
    createHmac: jest.fn().mockImplementation(() => {
      return {
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValue(Buffer.from([
          0x1f, 0x86, 0x98, 0x69, 0x0e, 0x02, 0xca, 0x16, 
          0x61, 0x85, 0x50, 0xef, 0x7f, 0x19, 0xda, 0x8e,
          0x94, 0x5b, 0x55, 0x5a
        ]))
      };
    })
  };
});

// Mock Date.now() to return a fixed timestamp
const mockTimestamp = 1618000000000; // Fixed timestamp for testing
global.Date.now = jest.fn(() => mockTimestamp);

describe('TOTP Generator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateTOTP', () => {
    it('should generate a 6-digit TOTP code', () => {
      const secret = 'JBSWY3DPEHPK3PXP'; // Test secret
      const code = generateTOTP(secret);
      
      // Verify the code is a 6-digit string
      expect(code).toHaveLength(6);
      expect(/^\d{6}$/.test(code)).toBe(true);
    });

    it('should use the provided timestamp', () => {
      const secret = 'JBSWY3DPEHPK3PXP';
      const timestamp = 1618000030000; // 30 seconds later
      
      const code1 = generateTOTP(secret, { timestamp: mockTimestamp });
      const code2 = generateTOTP(secret, { timestamp });
      
      // Codes should be the same within the same time step
      expect(code1).toBe(code2);
    });

    it('should generate different codes for different time steps', () => {
      const secret = 'JBSWY3DPEHPK3PXP';
      const timestamp = 1618000060000; // 60 seconds later (different time step)
      
      const code1 = generateTOTP(secret, { timestamp: mockTimestamp });
      const code2 = generateTOTP(secret, { timestamp });
      
      // Codes should be different for different time steps
      expect(code1).not.toBe(code2);
    });

    it('should handle different digit lengths', () => {
      const secret = 'JBSWY3DPEHPK3PXP';
      
      const code6 = generateTOTP(secret, { digits: 6 });
      const code8 = generateTOTP(secret, { digits: 8 });
      
      expect(code6).toHaveLength(6);
      expect(code8).toHaveLength(8);
    });

    it('should handle different algorithms', () => {
      const secret = 'JBSWY3DPEHPK3PXP';
      
      const codeSha1 = generateTOTP(secret, { algorithm: 'sha1' });
      const codeSha256 = generateTOTP(secret, { algorithm: 'sha256' });
      
      // Different algorithms should produce different codes
      expect(codeSha1).not.toBe(codeSha256);
    });
  });

  describe('getCurrentTOTP', () => {
    it('should return the current code and time information', () => {
      const secret = 'JBSWY3DPEHPK3PXP';
      const result = getCurrentTOTP(secret);
      
      expect(result).toHaveProperty('code');
      expect(result).toHaveProperty('remainingSeconds');
      expect(result).toHaveProperty('period');
      
      expect(result.code).toHaveLength(6);
      expect(result.period).toBe(30); // Default period
    });

    it('should calculate remaining seconds correctly', () => {
      const secret = 'JBSWY3DPEHPK3PXP';
      
      // Mock timestamp at exactly the start of a period
      global.Date.now = jest.fn(() => 1618000000000);
      let result = getCurrentTOTP(secret);
      expect(result.remainingSeconds).toBe(30);
      
      // Mock timestamp at 10 seconds into a period
      global.Date.now = jest.fn(() => 1618000010000);
      result = getCurrentTOTP(secret);
      expect(result.remainingSeconds).toBe(20);
      
      // Mock timestamp at 29 seconds into a period
      global.Date.now = jest.fn(() => 1618000029000);
      result = getCurrentTOTP(secret);
      expect(result.remainingSeconds).toBe(1);
    });
  });

  describe('getRemainingSeconds', () => {
    it('should calculate remaining seconds until next period', () => {
      // Mock timestamp at exactly the start of a period
      global.Date.now = jest.fn(() => 1618000000000);
      expect(getRemainingSeconds()).toBe(30);
      
      // Mock timestamp at 15 seconds into a period
      global.Date.now = jest.fn(() => 1618000015000);
      expect(getRemainingSeconds()).toBe(15);
      
      // Mock timestamp at 29 seconds into a period
      global.Date.now = jest.fn(() => 1618000029000);
      expect(getRemainingSeconds()).toBe(1);
    });

    it('should handle custom period lengths', () => {
      // Mock timestamp at exactly the start of a period
      global.Date.now = jest.fn(() => 1618000000000);
      expect(getRemainingSeconds(60)).toBe(60);
      
      // Mock timestamp at 30 seconds into a period
      global.Date.now = jest.fn(() => 1618000030000);
      expect(getRemainingSeconds(60)).toBe(30);
    });
  });
});