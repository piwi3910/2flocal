import { parseTOTPUri, generateTOTPUri } from '../qrCodeHandler';

describe('QR Code Handler', () => {
  describe('parseTOTPUri', () => {
    it('should parse a valid TOTP URI', () => {
      const uri = 'otpauth://totp/Example:alice@example.com?secret=JBSWY3DPEHPK3PXP&issuer=Example&algorithm=SHA1&digits=6&period=30';
      const result = parseTOTPUri(uri);
      
      expect(result.type).toBe('totp');
      expect(result.label).toBe('Example:alice@example.com');
      expect(result.issuer).toBe('Example');
      expect(result.secret).toBe('JBSWY3DPEHPK3PXP');
      expect(result.algorithm).toBe('SHA1');
      expect(result.digits).toBe(6);
      expect(result.period).toBe(30);
    });

    it('should extract issuer from label if not provided as parameter', () => {
      const uri = 'otpauth://totp/Example:alice@example.com?secret=JBSWY3DPEHPK3PXP';
      const result = parseTOTPUri(uri);
      
      expect(result.issuer).toBe('Example');
    });

    it('should throw an error for invalid URI format', () => {
      const uri = 'invalid://totp/Example:alice@example.com?secret=JBSWY3DPEHPK3PXP';
      
      expect(() => parseTOTPUri(uri)).toThrow('Invalid TOTP URI format');
    });

    it('should throw an error for missing secret', () => {
      const uri = 'otpauth://totp/Example:alice@example.com';
      
      expect(() => parseTOTPUri(uri)).toThrow('Missing secret parameter in TOTP URI');
    });

    it('should throw an error for unsupported OTP type', () => {
      const uri = 'otpauth://hotp/Example:alice@example.com?secret=JBSWY3DPEHPK3PXP&counter=0';
      
      expect(() => parseTOTPUri(uri)).toThrow('Unsupported OTP type: hotp');
    });
  });

  describe('generateTOTPUri', () => {
    it('should generate a valid TOTP URI with all parameters', () => {
      const components = {
        label: 'Example:alice@example.com',
        issuer: 'Example',
        secret: 'JBSWY3DPEHPK3PXP',
        algorithm: 'SHA1',
        digits: 6,
        period: 30
      };
      
      const uri = generateTOTPUri(components);
      
      expect(uri).toBe('otpauth://totp/Example%3Aalice%40example.com?secret=JBSWY3DPEHPK3PXP&issuer=Example&algorithm=SHA1&digits=6&period=30');
    });

    it('should generate a valid TOTP URI with minimal parameters', () => {
      const components = {
        label: 'alice@example.com',
        issuer: 'Example',
        secret: 'JBSWY3DPEHPK3PXP'
      };
      
      const uri = generateTOTPUri(components);
      
      expect(uri).toBe('otpauth://totp/alice%40example.com?secret=JBSWY3DPEHPK3PXP&issuer=Example');
    });

    it('should handle special characters in label and issuer', () => {
      const components = {
        label: 'Example Inc:alice+test@example.com',
        issuer: 'Example Inc',
        secret: 'JBSWY3DPEHPK3PXP'
      };
      
      const uri = generateTOTPUri(components);
      
      expect(uri).toBe('otpauth://totp/Example%20Inc%3Aalice%2Btest%40example.com?secret=JBSWY3DPEHPK3PXP&issuer=Example%20Inc');
    });
  });
});