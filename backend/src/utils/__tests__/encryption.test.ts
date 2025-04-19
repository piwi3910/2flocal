import crypto from 'crypto';
import * as encryption from '../encryption';

// Mock crypto module
jest.mock('crypto');

describe('Encryption Utility', () => {
  // Save original environment variable
  const originalEnv = process.env.ENCRYPTION_KEY;
  
  // Mock encryption key
  const mockEncryptionKey = Buffer.from('0123456789abcdef0123456789abcdef', 'utf8'); // 32 bytes
  
  beforeEach(() => {
    jest.clearAllMocks();
    // Set mock encryption key
    process.env.ENCRYPTION_KEY = mockEncryptionKey.toString('hex');
    
    // Mock Buffer.from for the encryption key
    jest.spyOn(Buffer, 'from')
      .mockImplementation((input: any, encoding?: string) => {
        if (input === process.env.ENCRYPTION_KEY && encoding === 'hex') {
          return mockEncryptionKey;
        }
        return jest.requireActual('buffer').Buffer.from(input, encoding);
      });
  });
  
  afterEach(() => {
    // Restore original environment variable
    process.env.ENCRYPTION_KEY = originalEnv;
  });
  
  describe('encrypt', () => {
    it('should encrypt a string', () => {
      // Arrange
      const text = 'test-secret-data';
      const mockIv = Buffer.from('mockiv0123456789', 'utf8'); // 16 bytes
      const mockAuthTag = Buffer.from('mockauthtag012345', 'utf8'); // 16 bytes
      const mockEncrypted = Buffer.from('mockencrypteddata', 'utf8');
      
      // Mock crypto.randomBytes
      (crypto.randomBytes as jest.Mock).mockReturnValue(mockIv);
      
      // Mock cipher
      const mockCipher = {
        update: jest.fn().mockReturnValue(Buffer.from('mockupdate', 'utf8')),
        final: jest.fn().mockReturnValue(Buffer.from('mockfinal', 'utf8')),
        getAuthTag: jest.fn().mockReturnValue(mockAuthTag),
      };
      
      // Mock crypto.createCipheriv
      (crypto.createCipheriv as jest.Mock).mockReturnValue(mockCipher);
      
      // Act
      const result = encryption.encrypt(text);
      
      // Assert
      expect(crypto.randomBytes).toHaveBeenCalledWith(16); // IV length
      expect(crypto.createCipheriv).toHaveBeenCalledWith('aes-256-gcm', mockEncryptionKey, mockIv);
      expect(mockCipher.update).toHaveBeenCalledWith(text, 'utf8');
      expect(mockCipher.final).toHaveBeenCalled();
      expect(mockCipher.getAuthTag).toHaveBeenCalled();
      
      // The result should be a hex string of IV + AuthTag + Encrypted data
      const expectedBuffer = Buffer.concat([mockIv, mockAuthTag, Buffer.concat([Buffer.from('mockupdate', 'utf8'), Buffer.from('mockfinal', 'utf8')])]);
      expect(result).toBe(expectedBuffer.toString('hex'));
    });
    
    it('should return empty string if input is empty', () => {
      // Act
      const result = encryption.encrypt('');
      
      // Assert
      expect(result).toBe('');
    });
    
    it('should throw an error if encryption fails', () => {
      // Arrange
      const text = 'test-data';
      
      // Mock crypto.randomBytes to throw an error
      (crypto.randomBytes as jest.Mock).mockImplementation(() => {
        throw new Error('Mock encryption error');
      });
      
      // Act & Assert
      expect(() => encryption.encrypt(text)).toThrow('Encryption failed');
    });
  });
  
  describe('decrypt', () => {
    it('should decrypt a string', () => {
      // Arrange
      const mockIv = Buffer.from('mockiv0123456789', 'utf8'); // 16 bytes
      const mockAuthTag = Buffer.from('mockauthtag012345', 'utf8'); // 16 bytes
      const mockEncrypted = Buffer.from('mockencrypteddata', 'utf8');
      
      // Combine IV, AuthTag, and encrypted data
      const combined = Buffer.concat([mockIv, mockAuthTag, mockEncrypted]);
      const hash = combined.toString('hex');
      
      // Mock decipher
      const mockDecipher = {
        update: jest.fn().mockReturnValue(Buffer.from('mockdecrypted', 'utf8')),
        final: jest.fn().mockReturnValue(Buffer.from('data', 'utf8')),
        setAuthTag: jest.fn(),
      };
      
      // Mock crypto.createDecipheriv
      (crypto.createDecipheriv as jest.Mock).mockReturnValue(mockDecipher);
      
      // Act
      const result = encryption.decrypt(hash);
      
      // Assert
      expect(crypto.createDecipheriv).toHaveBeenCalledWith('aes-256-gcm', mockEncryptionKey, mockIv);
      expect(mockDecipher.setAuthTag).toHaveBeenCalledWith(mockAuthTag);
      expect(mockDecipher.update).toHaveBeenCalled();
      expect(mockDecipher.final).toHaveBeenCalled();
      
      // The result should be the decrypted string
      expect(result).toBe('mockdecrypteddata');
    });
    
    it('should return empty string if input is empty', () => {
      // Act
      const result = encryption.decrypt('');
      
      // Assert
      expect(result).toBe('');
    });
    
    it('should throw an error if decryption fails', () => {
      // Arrange
      const hash = 'invalidhash';
      
      // Mock Buffer.from to return a valid buffer but make createDecipheriv throw
      (crypto.createDecipheriv as jest.Mock).mockImplementation(() => {
        throw new Error('Mock decryption error');
      });
      
      // Act & Assert
      expect(() => encryption.decrypt(hash)).toThrow('Decryption failed');
    });
  });
});