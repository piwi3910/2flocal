"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTOTPUri = exports.parseTOTPUri = exports.parseQRCode = exports.generateQRCode = void 0;
const qrcode_1 = __importDefault(require("qrcode"));
const jsqr_1 = __importDefault(require("jsqr"));
const canvas_1 = require("canvas");
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
const generateQRCode = (totpUri_1, ...args_1) => __awaiter(void 0, [totpUri_1, ...args_1], void 0, function* (totpUri, options = {}) {
    // Set default options
    const errorCorrectionLevel = options.errorCorrectionLevel || 'M';
    const width = options.width || 300;
    const margin = options.margin || 4;
    try {
        // Generate QR code as data URL
        const dataUrl = yield qrcode_1.default.toDataURL(totpUri, {
            errorCorrectionLevel,
            width,
            margin,
        });
        return dataUrl;
    }
    catch (error) {
        console.error('QR code generation error:', error);
        throw new Error('Failed to generate QR code');
    }
});
exports.generateQRCode = generateQRCode;
/**
 * Parse a QR code image to extract the TOTP URI
 *
 * @param imageData - The QR code image as a Buffer or Base64 string
 * @returns Promise resolving to the parsed TOTP URI
 */
const parseQRCode = (imageData) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // If imageData is a base64 string, convert it to a buffer
        const buffer = typeof imageData === 'string'
            ? Buffer.from(imageData.replace(/^data:image\/\w+;base64,/, ''), 'base64')
            : imageData;
        // Load the image
        const image = yield (0, canvas_1.loadImage)(buffer);
        // Create a canvas and draw the image
        const canvas = (0, canvas_1.createCanvas)(image.width, image.height);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0);
        // Get the image data from the canvas
        const imageDataFromCanvas = ctx.getImageData(0, 0, canvas.width, canvas.height);
        // Parse the QR code
        const code = (0, jsqr_1.default)(imageDataFromCanvas.data, imageDataFromCanvas.width, imageDataFromCanvas.height);
        if (!code) {
            throw new Error('No QR code found in the image');
        }
        // Validate that the QR code contains a TOTP URI
        if (!code.data.startsWith('otpauth://')) {
            throw new Error('QR code does not contain a valid TOTP URI');
        }
        return code.data;
    }
    catch (error) {
        console.error('QR code parsing error:', error);
        throw error instanceof Error ? error : new Error('Failed to parse QR code');
    }
});
exports.parseQRCode = parseQRCode;
/**
 * Parse a TOTP URI to extract the components
 *
 * @param uri - The TOTP URI (otpauth://)
 * @returns Object containing the parsed components
 */
const parseTOTPUri = (uri) => {
    try {
        // Validate URI format
        if (!uri.startsWith('otpauth://')) {
            throw new Error('Invalid TOTP URI format');
        }
        // Parse the URI
        const url = new URL(uri);
        // Get the type (totp or hotp)
        let type = url.protocol.replace('otpauth:', '').replace(/\//g, '');
        // Check if the type is supported (only totp is supported)
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
        const digits = params.get('digits') ? parseInt(params.get('digits')) : undefined;
        const period = params.get('period') ? parseInt(params.get('period')) : undefined;
        return {
            type,
            label,
            issuer,
            secret,
            algorithm,
            digits,
            period
        };
    }
    catch (error) {
        console.error('TOTP URI parsing error:', error);
        throw error instanceof Error ? error : new Error('Failed to parse TOTP URI');
    }
};
exports.parseTOTPUri = parseTOTPUri;
/**
 * Generate a TOTP URI from components
 *
 * @param components - The TOTP URI components
 * @returns The generated TOTP URI
 */
const generateTOTPUri = (components) => {
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
    }
    catch (error) {
        console.error('TOTP URI generation error:', error);
        throw error instanceof Error ? error : new Error('Failed to generate TOTP URI');
    }
};
exports.generateTOTPUri = generateTOTPUri;
