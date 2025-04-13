import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '../../prisma/src/generated/prisma'; 
import { encrypt, decrypt } from '../utils/encryption'; 

// Extend Request interface to include user from authMiddleware
interface AuthenticatedRequest extends Request {
  user?: { userId: string; email: string };
}

// --- Add Account Secret --- 
export const addAccountSecret = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.user?.userId;
    const { issuer, label, secret } = req.body; // Get data from request body
    const prisma: PrismaClient = req.app.locals.prisma; // Get prisma from app.locals

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
        const encryptedSecret = encrypt(secret);

        // 3. Save to DB (linking to userId)
        const newSecret = await prisma.accountSecret.create({
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

    } catch (error) {
        console.error('Add account secret error:', error);
        // Check if it's an encryption error or DB error
        if (error instanceof Error && error.message === 'Encryption failed') {
             res.status(500).json({ message: 'Failed to secure secret data.' });
        } else {
            next(error); // Pass other errors (like DB errors) to generic handler
        }
    }
};

// --- List Account Secrets --- 
export const listAccountSecrets = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.user?.userId;
    const prisma: PrismaClient = req.app.locals.prisma; // Get prisma from app.locals
    if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
    
    try {
        // 1. Fetch secrets from DB for the userId, selecting only necessary fields
        const secrets = await prisma.accountSecret.findMany({
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

    } catch (error) {
        console.error('List account secrets error:', error);
        next(error); // Pass DB errors to generic handler
    }
};

// --- Delete Account Secret --- 
export const deleteAccountSecret = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.user?.userId;
    const { id: secretId } = req.params; // Get secret ID from URL parameters
    const prisma: PrismaClient = req.app.locals.prisma; // Get prisma from app.locals

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
        const deleteResult = await prisma.accountSecret.deleteMany({
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

    } catch (error) {
        console.error('Delete account secret error:', error);
        next(error); // Pass DB errors to generic handler
    }
};
