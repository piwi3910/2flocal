import QRCode from 'qrcode';
import jsQR from 'jsqr';
import { createCanvas, loadImage } from 'canvas';

/**
 * QR Code Handler for 2FLocal
 * Provides functionality for generating and parsing QR codes for TOTP secrets
 */

/**
 * Generate a QR code from a TOTP URI
 * 
 * @param totpUri - The TOTP URI (otpauth://) to encode in the QR code
 * @param options - Optional parameters for QR code generation
 * @returns Promise resolving to the QR code as a data URL
 */
export const generateQRCode = async (
  totpUri: string,
  options: {
    errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H'; // Error correction level
    width?: number; // QR code width in pixels
    margin?: number; // Margin around the QR code
  } = {}
): Promise<string> => {
  // Set default options
  const errorCorrectionLevel = options.errorCorrectionLevel || 'M';
  const width = options.width || 300;
  const margin = options.margin || 4;

  try {
    // Generate QR code as data URL
    const dataUrl = await QRCode.toDataURL(totpUri, {
      errorCorrectionLevel,
      width,
      margin,
    });
    
    return dataUrl;
  } catch (error) {
    console.error('QR code generation error:', error);
    throw new Error('Failed to generate QR code');
  }
};

/**
 * Parse a QR code image to extract the TOTP URI
 * 
 * @param imageData - The QR code image as a Buffer or Base64 string
 * @returns Promise resolving to the parsed TOTP URI
 */
export const parseQRCode = async (imageData: Buffer | string): Promise<string> => {
  try {
    // If imageData is a base64 string, convert it to a buffer
    const buffer = typeof imageData === 'string' 
      ? Buffer.from(imageData.replace(/^data:image\/\w+;base64,/, ''), 'base64')
      : imageData;
    
    // Load the image
    const image = await loadImage(buffer);
    
    // Create a canvas and draw the image
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0);
    
    // Get the image data from the canvas
    const imageDataFromCanvas = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    // Parse the QR code
    const code = jsQR(
      imageDataFromCanvas.data,
      imageDataFromCanvas.width,
      imageDataFromCanvas.height
    );
    
    if (!code) {
      throw new Error('No QR code found in the image');
    }
    
    // Validate that the QR code contains a TOTP URI
    if (!code.data.startsWith('otpauth://')) {
      throw new Error('QR code does not contain a valid TOTP URI');
    }
    
    return code.data;
  } catch (error) {
    console.error('QR code parsing error:', error);
    throw error instanceof Error ? error : new Error('Failed to parse QR code');
  }
};

/**
 * Parse a TOTP URI to extract the components
 * 
 * @param uri - The TOTP URI (otpauth://)
 * @returns Object containing the parsed components
 */
export const parseTOTPUri = (uri: string): {
  type: string;
  label: string;
  issuer: string;
  secret: string;
  algorithm?: string;
  digits?: number;
  period?: number;
} => {
  try {
    // Validate URI format
    if (!uri.startsWith('otpauth://')) {
      throw new Error('Invalid TOTP URI format');
    }
    
    // Parse the URI
    const url = new URL(uri);
    
    // Get the type (totp or hotp)
    const type = url.protocol.replace('otpauth:', '').replace(/\//g, '');
    
    if (type !== 'totp') {
      throw new Error(`Unsupported OTP type: ${type}`);
    }
    
    // Get the label (which may contain issuer and account name)
    const label = decodeURIComponent(url.pathname.substring(1));
    
    // Get the parameters
    const params = url.searchParams;
    const secret = params.get('secret');
    
    if (!secret) {
      throw new Error('Missing secret parameter in TOTP URI');
    }
    
    // Get the issuer (either from the parameter or from the label)
    let issuer = params.get('issuer') || '';
    
    if (!issuer && label.includes(':')) {
      issuer = label.split(':')[0].trim();
    }
    
    // Get optional parameters
    const algorithm = params.get('algorithm') || undefined;
    const digits = params.get('digits') ? parseInt(params.get('digits')!) : undefined;
    const period = params.get('period') ? parseInt(params.get('period')!) : undefined;
    
    return {
      type,
      label,
      issuer,
      secret,
      algorithm,
      digits,
      period
    };
  } catch (error) {
    console.error('TOTP URI parsing error:', error);
    throw error instanceof Error ? error : new Error('Failed to parse TOTP URI');
  }
};

/**
 * Generate a TOTP URI from components
 * 
 * @param components - The TOTP URI components
 * @returns The generated TOTP URI
 */
export const generateTOTPUri = (components: {
  type?: string;
  label: string;
  issuer: string;
  secret: string;
  algorithm?: string;
  digits?: number;
  period?: number;
}): string => {
  try {
    // Set default values
    const type = components.type || 'totp';
    
    // Create the base URI
    let uri = `otpauth://${type}/${encodeURIComponent(components.label)}?secret=${components.secret}`;
    
    // Add issuer if provided
    if (components.issuer) {
      uri += `&issuer=${encodeURIComponent(components.issuer)}`;
    }
    
    // Add optional parameters if provided
    if (components.algorithm) {
      uri += `&algorithm=${components.algorithm}`;
    }
    
    if (components.digits) {
      uri += `&digits=${components.digits}`;
    }
    
    if (components.period) {
      uri += `&period=${components.period}`;
    }
    
    return uri;
  } catch (error) {
    console.error('TOTP URI generation error:', error);
    throw error instanceof Error ? error : new Error('Failed to generate TOTP URI');
  }
};