import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '../../prisma/src/generated/prisma'; 
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const SALT_ROUNDS = 10; 
const JWT_SECRET = process.env.JWT_SECRET || 'DEFAULT_SECRET_CHANGE_ME'; 

// --- Register User --- 
export const registerUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    console.log('Entering registerUser function...'); // Added log
    const { email, password } = req.body;
    const prisma: PrismaClient = req.app.locals.prisma; // Get prisma from app.locals

    // 1. Validate input
    if (!email || !password) {
        res.status(400).json({ message: 'Email and password are required' });
        return;
    }
    // Add more robust email validation if needed

    try {
        // 2. Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            res.status(409).json({ message: 'User with this email already exists' });
            return;
        }

        // 3. Hash password
        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

        // 4. Create user in DB
        const newUser = await prisma.user.create({
            data: {
                email,
                passwordHash, 
            },
        });

        // 5. Return success (excluding sensitive info)
        res.status(201).json({ 
            id: newUser.id, 
            email: newUser.email, 
            message: 'User registered successfully' 
        });

    } catch (error) {
        console.error('Registration error:', error);
        if (error instanceof Error) {
            console.log('Error details:', error.message, error.stack); // Enhanced logging
        } else {
            console.log('Caught a non-Error object:', error);
        }
        next(error); // Pass error to the centralized error handler
    }
};

// --- Login User --- 
export const loginUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { email, password } = req.body;
    const prisma: PrismaClient = req.app.locals.prisma; // Get prisma from app.locals

    // 1. Validate input
    if (!email || !password) {
        res.status(400).json({ message: 'Email and password are required' });
        return;
    }

    try {
        // 2. Find user by email
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            res.status(401).json({ message: 'Invalid credentials' }); // Use generic message for security
            return;
        }

        // 3. Compare hashed password
        const passwordMatch = await bcrypt.compare(password, user.passwordHash);

        if (!passwordMatch) {
            res.status(401).json({ message: 'Invalid credentials' }); // Use generic message
            return;
        }

        // 4. Generate JWT token
        const tokenPayload = { userId: user.id, email: user.email };
        const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '1h' }); // Token expires in 1 hour

        // 5. Return token
        res.status(200).json({ 
            message: 'Login successful', 
            token: token 
        });

    } catch (error) {
        console.error('Login error:', error);
        if (error instanceof Error) {
            console.log('Error details:', error.message, error.stack); // Enhanced logging
        } else {
            console.log('Caught a non-Error object:', error);
        }
        next(error); // Pass error to the centralized error handler
    }
};

// --- Get Current User Info --- 
export const getCurrentUser = async (req: any, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.user?.userId;

    if (!userId) {
        // This should technically not happen if authenticateToken middleware is used correctly
        res.status(401).json({ message: 'Unauthorized - User ID not found in token' });
        return;
    }

    try {
        const prisma: PrismaClient = req.app.locals.prisma; // Get prisma from app.locals
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                isAdmin: true, // Include admin status
                createdAt: true,
                updatedAt: true,
            },
        });

        if (!user) {
            // This would imply a mismatch between token and DB, which is problematic
            res.status(404).json({ message: 'User not found in database' });
            return;
        }

        res.status(200).json(user);

    } catch (error) {
        console.error('Get current user error:', error);
        if (error instanceof Error) {
            console.log('Error details:', error.message, error.stack); // Enhanced logging
        } else {
            console.log('Caught a non-Error object:', error);
        }
        next(error); // Pass error to the centralized error handler
    }
};
