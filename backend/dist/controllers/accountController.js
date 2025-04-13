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
exports.deleteAccountSecret = exports.listAccountSecrets = exports.addAccountSecret = void 0;
const encryption_1 = require("../utils/encryption");
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
