import { encrypt, decrypt } from '../encryption';

describe('Encryption Utility', () => {
  // Store the original environment variable
  const originalEnv = process.env.ENCRYPTION_KEY;

  beforeEach(() => {
    // Set a test encryption key (64 hex characters = 32 bytes)
    process.env.ENCRYPTION_KEY = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
  });

  afterEach(() => {
    // Restore the original environment variable
    process.env.ENCRYPTION_KEY = originalEnv;
  });

  it('should encrypt and decrypt text correctly', () => {
    // Arrange
    const plainText = 'test-secret-data';
    
    // Act
    const encrypted = encrypt(plainText);
    const decrypted = decrypt(encrypted);
    
    // Assert
    expect(encrypted).not.toBe(plainText); // Encrypted text should be different
    expect(decrypted).toBe(plainText); // Decrypted text should match original
  });

  it('should produce different ciphertexts for the same input', () => {
    // Arrange
    const plainText = 'test-secret-data';
    
    // Act
    const encrypted1 = encrypt(plainText);
    const encrypted2 = encrypt(plainText);
    
    // Assert
    expect(encrypted1).not.toBe(encrypted2); // Should use different IVs
  });

  it('should handle empty strings', () => {
    // Arrange
    const plainText = '';
    
    // Act
    const encrypted = encrypt(plainText);
    const decrypted = decrypt(encrypted);
    
    // Assert
    expect(decrypted).toBe(plainText);
  });

  it('should handle special characters', () => {
    // Arrange
    const plainText = 'Special @#$%^&*()_+{}|:"<>?~`-=[]\\;\',./';
    
    // Act
    const encrypted = encrypt(plainText);
    const decrypted = decrypt(encrypted);
    
    // Assert
    expect(decrypted).toBe(plainText);
  });

  it('should throw an error when decrypting invalid data', () => {
    // Arrange
    const invalidData = 'not-valid-encrypted-data';
    
    // Act & Assert
    expect(() => decrypt(invalidData)).toThrow();
  });
});