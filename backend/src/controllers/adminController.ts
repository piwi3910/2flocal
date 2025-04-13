import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '../../prisma/src/generated/prisma';

// Note: Admin check is done in middleware, so we can assume req.user is an admin here.
// Still good practice to check for req.user existence if needed, though technically redundant.

// --- Admin Delete Device --- 
export const adminDeleteDevice = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id: deviceId } = req.params; // Get device primary ID from URL parameters
    const prisma: PrismaClient = req.app.locals.prisma; // Get prisma from app.locals

    if (!deviceId) {
        res.status(400).json({ message: 'Device ID is required in URL parameters' });
        return;
    }

    try {
        // 1. Attempt to delete the device by its primary ID
        // Use deleteMany for consistency and to get a count, or use delete and catch P2025 error
        const deleteResult = await prisma.device.deleteMany({
            where: {
                id: deviceId, // Use the primary key 'id'
            },
        });

        // 2. Check if a record was actually deleted
        if (deleteResult.count === 0) {
            // Device not found with that ID
            res.status(404).json({ message: 'Device not found' });
            return;
        }

        // 3. Return success
        res.status(204).send();

    } catch (error) {
        console.error('Admin delete device error:', error);
        next(error); // Pass DB errors etc. to generic handler
    }
};
