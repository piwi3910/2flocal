import crypto from 'crypto';

/**
 * TOTP Generator implementation according to RFC 6238
 * https://datatracker.ietf.org/doc/html/rfc6238
 */

// Default TOTP parameters
const DEFAULT_PERIOD = 30; // Time step in seconds (standard is 30)
const DEFAULT_DIGITS = 6; // Number of digits in the code (standard is 6)
const DEFAULT_ALGORITHM = 'sha1'; // HMAC algorithm (standard is SHA-1)

/**
 * Generate a TOTP code from a secret
 * 
 * @param secret - The secret key (base32 encoded)
 * @param options - Optional parameters
 * @returns The generated TOTP code
 */
export const generateTOTP = (
  secret: string,
  options: {
    timestamp?: number; // Current time in milliseconds
    period?: number; // Time step in seconds
    digits?: number; // Number of digits in the code
    algorithm?: 'sha1' | 'sha256' | 'sha512'; // HMAC algorithm
  } = {}
): string => {
  // Set default options
  const timestamp = options.timestamp || Date.now();
  const period = options.period || DEFAULT_PERIOD;
  const digits = options.digits || DEFAULT_DIGITS;
  const algorithm = options.algorithm || DEFAULT_ALGORITHM;

  // Convert base32 secret to buffer
  const secretBuffer = base32ToBuffer(secret);

  // Calculate the counter value (number of time steps)
  const counter = Math.floor(timestamp / 1000 / period);

  // Generate HOTP value
  return generateHOTP(secretBuffer, counter, digits, algorithm);
};

/**
 * Generate an HOTP (HMAC-based One-Time Password) value
 * 
 * @param secret - The secret key as a buffer
 * @param counter - The counter value
 * @param digits - Number of digits in the code
 * @param algorithm - HMAC algorithm
 * @returns The generated HOTP code
 */
const generateHOTP = (
  secret: Buffer,
  counter: number,
  digits: number,
  algorithm: string
): string => {
  // Convert counter to buffer (8 bytes, big endian)
  const counterBuffer = Buffer.alloc(8);
  for (let i = 0; i < 8; i++) {
    counterBuffer[7 - i] = counter & 0xff;
    counter = counter >> 8;
  }

  // Calculate HMAC
  const hmac = crypto.createHmac(algorithm, secret);
  hmac.update(counterBuffer);
  const hmacResult = hmac.digest();

  // Dynamic truncation
  const offset = hmacResult[hmacResult.length - 1] & 0xf;
  
  // Extract 4 bytes from the HMAC result starting at the offset
  let binary = ((hmacResult[offset] & 0x7f) << 24) |
               ((hmacResult[offset + 1] & 0xff) << 16) |
               ((hmacResult[offset + 2] & 0xff) << 8) |
               (hmacResult[offset + 3] & 0xff);

  // Generate the OTP value
  const otp = binary % Math.pow(10, digits);
  
  // Pad with leading zeros if necessary
  return otp.toString().padStart(digits, '0');
};

/**
 * Convert a base32 encoded string to a buffer
 * 
 * @param base32 - The base32 encoded string
 * @returns The decoded buffer
 */
const base32ToBuffer = (base32: string): Buffer => {
  // Remove spaces and convert to uppercase
  const sanitized = base32.replace(/\s+/g, '').toUpperCase();
  
  // Base32 character set (RFC 4648)
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  
  let bits = 0;
  let value = 0;
  let output = [];

  for (let i = 0; i < sanitized.length; i++) {
    const charValue = charset.indexOf(sanitized[i]);
    
    if (charValue === -1) {
      throw new Error(`Invalid base32 character: ${sanitized[i]}`);
    }

    // Accumulate bits
    value = (value << 5) | charValue;
    bits += 5;

    // If we have at least 8 bits, extract a byte
    if (bits >= 8) {
      output.push((value >> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }

  return Buffer.from(output);
};

/**
 * Calculate the time remaining until the next TOTP code generation
 * 
 * @param period - Time step in seconds
 * @returns Time remaining in seconds
 */
export const getRemainingSeconds = (period: number = DEFAULT_PERIOD): number => {
  const seconds = Math.floor(Date.now() / 1000);
  return period - (seconds % period);
};

/**
 * Get the current TOTP code and time information
 * 
 * @param secret - The secret key (base32 encoded)
 * @param options - Optional parameters
 * @returns Object containing the code and time information
 */
export const getCurrentTOTP = (
  secret: string,
  options: {
    period?: number;
    digits?: number;
    algorithm?: 'sha1' | 'sha256' | 'sha512';
  } = {}
): { 
  code: string; 
  remainingSeconds: number; 
  period: number;
} => {
  const period = options.period || DEFAULT_PERIOD;
  
  return {
    code: generateTOTP(secret, options),
    remainingSeconds: getRemainingSeconds(period),
    period
  };
};