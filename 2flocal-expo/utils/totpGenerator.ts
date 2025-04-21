import * as crypto from 'crypto';

/**
 * Generate a TOTP code based on the given parameters
 * @param secret The secret key (base32 encoded)
 * @param algorithm The hash algorithm to use (SHA1, SHA256, SHA512)
 * @param digits The number of digits in the code (usually 6 or 8)
 * @param period The time period in seconds (usually 30)
 * @returns The generated TOTP code
 */
export function generateTOTP(
  secret: string,
  algorithm: string = 'SHA1',
  digits: number = 6,
  period: number = 30
): string {
  try {
    // Convert base32 secret to buffer
    const secretBuffer = base32ToBuffer(secret);
    
    // Get the current time counter
    const counter = Math.floor(Date.now() / 1000 / period);
    
    // Generate HMAC
    const counterBuffer = Buffer.alloc(8);
    counterBuffer.writeBigUInt64BE(BigInt(counter), 0);
    
    const hmac = crypto.createHmac(algorithm.toLowerCase(), secretBuffer);
    hmac.update(counterBuffer);
    const hmacResult = hmac.digest();
    
    // Dynamic truncation
    const offset = hmacResult[hmacResult.length - 1] & 0xf;
    const binary = ((hmacResult[offset] & 0x7f) << 24) |
                  ((hmacResult[offset + 1] & 0xff) << 16) |
                  ((hmacResult[offset + 2] & 0xff) << 8) |
                  (hmacResult[offset + 3] & 0xff);
    
    // Generate code
    const otp = binary % Math.pow(10, digits);
    return otp.toString().padStart(digits, '0');
  } catch (error) {
    console.error('Error generating TOTP:', error);
    return '000000'; // Return a default code in case of error
  }
}

/**
 * Convert a base32 string to a buffer
 * @param base32 The base32 encoded string
 * @returns The buffer representation
 */
function base32ToBuffer(base32: string): Buffer {
  // Remove spaces and convert to uppercase
  const sanitized = base32.replace(/\s+/g, '').toUpperCase();
  
  // Base32 character set
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  
  // Convert to binary
  let bits = '';
  for (let i = 0; i < sanitized.length; i++) {
    const val = charset.indexOf(sanitized[i]);
    if (val === -1) {
      throw new Error('Invalid base32 character: ' + sanitized[i]);
    }
    bits += val.toString(2).padStart(5, '0');
  }
  
  // Convert binary to bytes
  const bytes = new Uint8Array(Math.floor(bits.length / 8));
  for (let i = 0; i < bytes.length; i++) {
    const byteStr = bits.substr(i * 8, 8);
    bytes[i] = parseInt(byteStr, 2);
  }
  
  return Buffer.from(bytes);
}