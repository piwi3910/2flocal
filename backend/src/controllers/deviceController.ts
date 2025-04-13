import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '../../prisma/src/generated/prisma'; 

// Extend Request interface to include user from authMiddleware
interface AuthenticatedRequest extends Request {
  user?: { userId: string; email: string };
}

// --- Register Device --- 
export const registerDevice = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    const { name, type, identifier } = req.body; 
    const userId = req.user?.userId; 
    const prisma: PrismaClient = req.app.locals.prisma; 

    if (!userId) {
        res.status(401).json({ message: "Unauthorized: User ID not found in token" });
        return;
    }

    if (!name || !type || !identifier) { 
        res.status(400).json({ message: 'Device name, type, and identifier are required' });
        return;
    }

    // Basic validation for type (adjust as needed)
    const allowedTypes = ['MOBILE', 'DESKTOP', 'WEB', 'OTHER'];
    if (!allowedTypes.includes(type.toUpperCase())) {
        res.status(400).json({ message: `Invalid device type. Allowed types: ${allowedTypes.join(', ')}` });
        return;
    }

    try {
        // Optional: Check if a device with the same identifier already exists for this user
        const existingDevice = await prisma.device.findUnique({
            where: {
                userId_identifier: { 
                    userId: userId,
                    identifier: identifier,
                },
            },
        });

        if (existingDevice) {
            // Decide how to handle: update lastSeen, return error, etc.
            // For now, let's just return the existing device info
            res.status(200).json({ 
                message: 'Device already registered', 
                device: {
                    id: existingDevice.id,
                    name: existingDevice.name,
                    type: existingDevice.type,
                    identifier: existingDevice.identifier,
                    lastSeen: existingDevice.lastSeen,
                }
            });
            return;
        }

        // Create new device
        const newDevice = await prisma.device.create({
            data: {
                name,
                type: type.toUpperCase(), 
                identifier,
                userId: userId,
                lastSeen: new Date(), 
            },
        });

        res.status(201).json({ 
            id: newDevice.id,
            name: newDevice.name,
            type: newDevice.type,
            identifier: newDevice.identifier,
            message: 'Device registered successfully' 
        });

    } catch (error) {
        console.error('Error registering device:', error);
        if (error instanceof Error) {
            console.log('Error details:', error.message, error.stack); 
        } else {
            console.log('Caught a non-Error object:', error);
        }
        next(error); 
    }
};

// --- List Devices --- 
export const listDevices = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.user?.userId;
    const prisma: PrismaClient = req.app.locals.prisma; 

    if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
    
    try {
        // 1. Fetch devices from DB for the userId
        const devices = await prisma.device.findMany({
            where: { userId },
            select: { 
                id: true,
                identifier: true,
                name: true,
                createdAt: true,
                updatedAt: true,
            },
            orderBy: {
                createdAt: 'desc' 
            }
        });

        // 2. Return the list
        res.status(200).json(devices);

    } catch (error) {
        console.error('List devices error:', error);
        next(error); 
    }
};
