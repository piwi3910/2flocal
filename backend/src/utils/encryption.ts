import crypto from 'crypto';

// Ensure the key is 32 bytes (256 bits) for AES-256
// IMPORTANT: Store this securely in .env and ensure it's 32 bytes!
const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY || '', 'hex'); // Use 'hex' encoding! Check length AFTER conversion.
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // AES-GCM standard IV length
const AUTH_TAG_LENGTH = 16; // AES-GCM standard auth tag length

if (!process.env.ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 32) { // Add check for missing env var
    console.error('FATAL: ENCRYPTION_KEY environment variable must be set and be a 64-character hex string (32 bytes).');
    // In a real app, you should throw an error or exit to prevent using insecure defaults or incorrect keys.
    // throw new Error('Invalid or missing ENCRYPTION_KEY.'); 
    // For development, we might proceed with a warning, but this is insecure:
    console.warn('WARNING: Using potentially insecure or invalid encryption key due to configuration error.'); 
}

export const encrypt = (text: string): string => {
    if (!text) return '';
    try {
        const iv = crypto.randomBytes(IV_LENGTH);
        const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
        const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
        const authTag = cipher.getAuthTag();
        // Prepend IV and authTag to the encrypted data for storage
        return Buffer.concat([iv, authTag, encrypted]).toString('hex');
    } catch (error) {
        console.error('Encryption failed:', error);
        // Handle error appropriately - perhaps throw or return a specific error indicator
        throw new Error('Encryption failed');
    }
};

export const decrypt = (hash: string): string => {
    if (!hash) return '';
    try {
        const dataBuffer = Buffer.from(hash, 'hex');
        // Extract IV, authTag, and encrypted text from the combined buffer
        const iv = dataBuffer.subarray(0, IV_LENGTH);
        const authTag = dataBuffer.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
        const encryptedText = dataBuffer.subarray(IV_LENGTH + AUTH_TAG_LENGTH);

        const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
        decipher.setAuthTag(authTag);
        const decrypted = Buffer.concat([decipher.update(encryptedText), decipher.final()]);
        return decrypted.toString('utf8');
    } catch (error) {
        console.error('Decryption failed:', error);
        // Handle specific errors like invalid key, incorrect auth tag, etc.
        // For example, 'Unsupported state or unable to authenticate data' often means bad key or corrupted data.
        // Returning an empty string might be misleading; throwing an error is often better.
        throw new Error('Decryption failed');
    }
};
