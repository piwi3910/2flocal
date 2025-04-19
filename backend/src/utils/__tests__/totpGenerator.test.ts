import crypto from 'crypto';
import * as totpGenerator from '../totpGenerator';

// Mock crypto module
jest.mock('crypto');

describe('TOTP Generator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock Date.now() to return a fixed timestamp
    jest.spyOn(Date, 'now').mockReturnValue(1619712000000); // 2021-04-29T16:00:00Z
  });
  
  describe('generateTOTP', () => {
    it('should generate a TOTP code with default options', () => {
      // Arrange
      const secret = 'JBSWY3DPEHPK3PXP'; // Test secret in base32
      
      // Mock the HMAC functionality
      const mockHmac = {
        update: jest.fn(),
        digest: jest.fn().mockReturnValue(Buffer.from([
          0x1f, 0x86, 0x98, 0x69, 0x0e, 0x02, 0xca, 0x16, 
          0x61, 0x85, 0x50, 0xef, 0x7f, 0x19, 0xda, 0x8e,
          0x94, 0x5b, 0x55, 0x5a
        ])),
      };
      
      (crypto.createHmac as jest.Mock).mockReturnValue(mockHmac);
      
      // Act
      const result = totpGenerator.generateTOTP(secret);
      
      // Assert
      expect(crypto.createHmac).toHaveBeenCalledWith('sha1', expect.any(Buffer));
      expect(mockHmac.update).toHaveBeenCalled();
      expect(mockHmac.digest).toHaveBeenCalled();
      expect(result).toMatch(/^\d{6}$/); // Should be a 6-digit code
    });
    
    it('should generate a TOTP code with custom options', () => {
      // Arrange
      const secret = 'JBSWY3DPEHPK3PXP'; // Test secret in base32
      const options = {
        timestamp: 1619712000000, // 2021-04-29T16:00:00Z
        period: 60, // 60-second period
        digits: 8, // 8-digit code
        algorithm: 'sha256' as const, // SHA-256 algorithm
      };
      
      // Mock the HMAC functionality
      const mockHmac = {
        update: jest.fn(),
        digest: jest.fn().mockReturnValue(Buffer.from([
          0x1f, 0x86, 0x98, 0x69, 0x0e, 0x02, 0xca, 0x16, 
          0x61, 0x85, 0x50, 0xef, 0x7f, 0x19, 0xda, 0x8e,
          0x94, 0x5b, 0x55, 0x5a, 0x94, 0x5b, 0x55, 0x5a,
          0x94, 0x5b, 0x55, 0x5a, 0x94, 0x5b, 0x55, 0x5a
        ])),
      };
      
      (crypto.createHmac as jest.Mock).mockReturnValue(mockHmac);
      
      // Act
      const result = totpGenerator.generateTOTP(secret, options);
      
      // Assert
      expect(crypto.createHmac).toHaveBeenCalledWith('sha256', expect.any(Buffer));
      expect(mockHmac.update).toHaveBeenCalled();
      expect(mockHmac.digest).toHaveBeenCalled();
      expect(result).toMatch(/^\d{8}$/); // Should be an 8-digit code
    });
    
    it('should throw an error for invalid base32 characters', () => {
      // Arrange
      const invalidSecret = 'INVALID!SECRET'; // Contains invalid base32 character '!'
      
      // Act & Assert
      expect(() => totpGenerator.generateTOTP(invalidSecret)).toThrow('Invalid base32 character: !');
    });
  });
  
  describe('getRemainingSeconds', () => {
    it('should calculate remaining seconds until next TOTP with default period', () => {
      // Arrange - Date.now() is already mocked to return 1619712000000
      // This timestamp in seconds is 1619712000, which is divisible by 30
      // So we should have 30 seconds remaining
      
      // Act
      const result = totpGenerator.getRemainingSeconds();
      
      // Assert
      expect(result).toBe(30);
    });
    
    it('should calculate remaining seconds with custom period', () => {
      // Arrange - Date.now() is already mocked to return 1619712000000
      // This timestamp in seconds is 1619712000, which is divisible by 60
      // So we should have 60 seconds remaining
      
      // Act
      const result = totpGenerator.getRemainingSeconds(60);
      
      // Assert
      expect(result).toBe(60);
    });
  });
  
  describe('getCurrentTOTP', () => {
    it('should return current TOTP code and time information', () => {
      // Arrange
      const secret = 'JBSWY3DPEHPK3PXP'; // Test secret in base32
      
      // Mock the HMAC functionality
      const mockHmac = {
        update: jest.fn(),
        digest: jest.fn().mockReturnValue(Buffer.from([
          0x1f, 0x86, 0x98, 0x69, 0x0e, 0x02, 0xca, 0x16, 
          0x61, 0x85, 0x50, 0xef, 0x7f, 0x19, 0xda, 0x8e,
          0x94, 0x5b, 0x55, 0x5a
        ])),
      };
      
      (crypto.createHmac as jest.Mock).mockReturnValue(mockHmac);
      
      // Act
      const result = totpGenerator.getCurrentTOTP(secret);
      
      // Assert
      expect(result).toHaveProperty('code');
      expect(result).toHaveProperty('remainingSeconds', 30);
      expect(result).toHaveProperty('period', 30);
      expect(result.code).toMatch(/^\d{6}$/); // Should be a 6-digit code
    });
    
    it('should return TOTP with custom options', () => {
      // Arrange
      const secret = 'JBSWY3DPEHPK3PXP'; // Test secret in base32
      const options = {
        period: 60,
        digits: 8,
        algorithm: 'sha256' as const,
      };
      
      // Mock the HMAC functionality
      const mockHmac = {
        update: jest.fn(),
        digest: jest.fn().mockReturnValue(Buffer.from([
          0x1f, 0x86, 0x98, 0x69, 0x0e, 0x02, 0xca, 0x16, 
          0x61, 0x85, 0x50, 0xef, 0x7f, 0x19, 0xda, 0x8e,
          0x94, 0x5b, 0x55, 0x5a, 0x94, 0x5b, 0x55, 0x5a,
          0x94, 0x5b, 0x55, 0x5a, 0x94, 0x5b, 0x55, 0x5a
        ])),
      };
      
      (crypto.createHmac as jest.Mock).mockReturnValue(mockHmac);
      
      // Act
      const result = totpGenerator.getCurrentTOTP(secret, options);
      
      // Assert
      expect(result).toHaveProperty('code');
      expect(result).toHaveProperty('remainingSeconds', 60);
      expect(result).toHaveProperty('period', 60);
      expect(result.code).toMatch(/^\d{8}$/); // Should be an 8-digit code
    });
  });
});