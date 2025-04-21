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
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseQRCodeImage = exports.generateQRCodeForAccount = exports.generateTOTPCode = exports.deleteAccountSecret = exports.listAccountSecrets = exports.addAccountSecret = void 0;
const encryption_1 = require("../utils/encryption");
const totpGenerator_1 = require("../utils/totpGenerator");
const qrCodeHandler_1 = require("../utils/qrCodeHandler");
// --- Add Account Secret --- 
const addAccountSecret = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    const { issuer, label, secret } = req.body; // Get data from request body
    const prisma = req.app.locals.prisma; // Get prisma from app.locals
    if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
    // 1. Validate input
    if (!issuer || !label || !secret) {
        res.status(400).json({ message: 'Issuer, label, and secret are required' });
        return;
    }
    try {
        // 2. Encrypt the secret before saving!
        const encryptedSecret = (0, encryption_1.encrypt)(secret);
        // 3. Save to DB (linking to userId)
        const newSecret = yield prisma.accountSecret.create({
            data: {
                issuer,
                label,
                encryptedSecret, // Store the encrypted version
                userId,
            },
        });
        // 4. Return success (don't return the secret, even encrypted)
        res.status(201).json({
            id: newSecret.id,
            issuer: newSecret.issuer,
            label: newSecret.label,
            message: 'Account secret added successfully'
        });
    }
    catch (error) {
        console.error('Add account secret error:', error);
        // Check if it's an encryption error or DB error
        if (error instanceof Error && error.message === 'Encryption failed') {
            res.status(500).json({ message: 'Failed to secure secret data.' });
        }
        else {
            next(error); // Pass other errors (like DB errors) to generic handler
        }
    }
});
exports.addAccountSecret = addAccountSecret;
// --- List Account Secrets --- 
const listAccountSecrets = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    const prisma = req.app.locals.prisma; // Get prisma from app.locals
    if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
    try {
        // 1. Fetch secrets from DB for the userId, selecting only necessary fields
        const secrets = yield prisma.accountSecret.findMany({
            where: { userId },
            select: {
                id: true,
                issuer: true,
                label: true,
                createdAt: true, // Optional: useful for sorting/display
                updatedAt: true, // Optional
            },
            orderBy: [
                { issuer: 'asc' }, // Example sorting
                { label: 'asc' }
            ]
        });
        // 3. Return the list
        res.status(200).json(secrets);
    }
    catch (error) {
        console.error('List account secrets error:', error);
        next(error); // Pass DB errors to generic handler
    }
});
exports.listAccountSecrets = listAccountSecrets;
// --- Delete Account Secret --- 
const deleteAccountSecret = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    const { id: secretId } = req.params; // Get secret ID from URL parameters
    const prisma = req.app.locals.prisma; // Get prisma from app.locals
    if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
    if (!secretId) {
        res.status(400).json({ message: 'Account Secret ID is required in URL parameters' });
        return;
    }
    try {
        // 1. Attempt to delete the secret only if the ID matches and it belongs to the user
        const deleteResult = yield prisma.accountSecret.deleteMany({
            where: {
                id: secretId,
                userId: userId, // Crucial check: ensures user owns the secret
            },
        });
        // 2. Check if a record was actually deleted
        if (deleteResult.count === 0) {
            // Secret not found OR it didn't belong to the user
            res.status(404).json({ message: 'Account Secret not found or access denied' });
            return;
        }
        // 3. Return success (204 No Content is standard for successful DELETE)
        res.status(204).send();
    }
    catch (error) {
        console.error('Delete account secret error:', error);
        next(error); // Pass DB errors to generic handler
    }
});
exports.deleteAccountSecret = deleteAccountSecret;
// --- Generate TOTP Code ---
const generateTOTPCode = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    const { id: secretId } = req.params; // Get secret ID from URL parameters
    const prisma = req.app.locals.prisma; // Get prisma from app.locals
    if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
    if (!secretId) {
        res.status(400).json({ message: 'Account Secret ID is required in URL parameters' });
        return;
    }
    try {
        // 1. Fetch the account secret, ensuring it belongs to the user
        const accountSecret = yield prisma.accountSecret.findFirst({
            where: {
                id: secretId,
                userId: userId, // Crucial check: ensures user owns the secret
            },
        });
        // 2. Check if the secret exists
        if (!accountSecret) {
            res.status(404).json({ message: 'Account Secret not found or access denied' });
            return;
        }
        // 3. Decrypt the secret
        const decryptedSecret = (0, encryption_1.decrypt)(accountSecret.encryptedSecret);
        // 4. Generate the TOTP code
        const totpData = (0, totpGenerator_1.getCurrentTOTP)(decryptedSecret);
        // 5. Return the TOTP code and time information
        res.status(200).json({
            code: totpData.code,
            remainingSeconds: totpData.remainingSeconds,
            period: totpData.period,
            issuer: accountSecret.issuer,
            label: accountSecret.label
        });
    }
    catch (error) {
        console.error('Generate TOTP code error:', error);
        // Check if it's a decryption error
        if (error instanceof Error && error.message === 'Decryption failed') {
            res.status(500).json({ message: 'Failed to decrypt secret data.' });
        }
        else if (error instanceof Error && error.message.includes('Invalid base32')) {
            res.status(400).json({ message: 'Invalid secret format.' });
        }
        else {
            next(error); // Pass other errors to generic handler
        }
    }
});
exports.generateTOTPCode = generateTOTPCode;
// --- Generate QR Code for Account Secret ---
const generateQRCodeForAccount = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    const { id: secretId } = req.params; // Get secret ID from URL parameters
    const prisma = req.app.locals.prisma; // Get prisma from app.locals
    if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
    if (!secretId) {
        res.status(400).json({ message: 'Account Secret ID is required in URL parameters' });
        return;
    }
    try {
        // 1. Fetch the account secret, ensuring it belongs to the user
        const accountSecret = yield prisma.accountSecret.findFirst({
            where: {
                id: secretId,
                userId: userId, // Crucial check: ensures user owns the secret
            },
        });
        // 2. Check if the secret exists
        if (!accountSecret) {
            res.status(404).json({ message: 'Account Secret not found or access denied' });
            return;
        }
        // 3. Decrypt the secret
        const decryptedSecret = (0, encryption_1.decrypt)(accountSecret.encryptedSecret);
        // 4. Generate the TOTP URI
        const totpUri = (0, qrCodeHandler_1.generateTOTPUri)({
            label: accountSecret.label,
            issuer: accountSecret.issuer,
            secret: decryptedSecret
        });
        // 5. Generate the QR code
        const qrCodeDataUrl = yield (0, qrCodeHandler_1.generateQRCode)(totpUri);
        // 6. Return the QR code
        res.status(200).json({
            qrCode: qrCodeDataUrl,
            uri: totpUri
        });
    }
    catch (error) {
        console.error('Generate QR code error:', error);
        // Check if it's a decryption error
        if (error instanceof Error && error.message === 'Decryption failed') {
            res.status(500).json({ message: 'Failed to decrypt secret data.' });
        }
        else if (error instanceof Error && error.message.includes('Failed to generate QR code')) {
            res.status(500).json({ message: 'Failed to generate QR code.' });
        }
        else {
            next(error); // Pass other errors to generic handler
        }
    }
});
exports.generateQRCodeForAccount = generateQRCodeForAccount;
// --- Parse QR Code ---
const parseQRCodeImage = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
    // Check if request has the required data
    if (!req.body.image) {
        res.status(400).json({ message: 'QR code image data is required' });
        return;
    }
    try {
        // 1. Parse the QR code from the image
        const totpUri = yield (0, qrCodeHandler_1.parseQRCode)(req.body.image);
        // 2. Parse the TOTP URI to extract components
        const parsedUri = (0, qrCodeHandler_1.parseTOTPUri)(totpUri);
        // 3. Return the parsed data
        res.status(200).json({
            uri: totpUri,
            secret: parsedUri.secret,
            issuer: parsedUri.issuer,
            label: parsedUri.label,
            algorithm: parsedUri.algorithm,
            digits: parsedUri.digits,
            period: parsedUri.period
        });
    }
    catch (error) {
        console.error('Parse QR code error:', error);
        if (error instanceof Error && error.message.includes('No QR code found')) {
            res.status(400).json({ message: 'No valid QR code found in the image.' });
        }
        else if (error instanceof Error && error.message.includes('not contain a valid TOTP URI')) {
            res.status(400).json({ message: 'QR code does not contain a valid TOTP URI.' });
        }
        else if (error instanceof Error && error.message.includes('Invalid TOTP URI format')) {
            res.status(400).json({ message: 'Invalid TOTP URI format.' });
        }
        else {
            res.status(500).json({ message: 'Failed to parse QR code.' });
        }
    }
});
exports.parseQRCodeImage = parseQRCodeImage;
