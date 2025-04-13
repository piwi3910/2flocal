require('dotenv').config(); // Load .env file

import express, { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '../prisma/src/generated/prisma'; // Corrected relative path
import authRouter from './routes/auth'; // Import the auth router
import accountsRouter from './routes/accounts'; // Import the accounts router
import devicesRouter from './routes/devices'; // Import the devices router
import adminRouter from './routes/admin'; // Import the admin router

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json()); // Middleware to parse JSON bodies

// Simple health check endpoint
app.get('/', (req: Request, res: Response) => {
  res.send('2FLocal Backend is running!');
});

// --- Mount API routes --- 
app.use('/api/auth', authRouter); // Use the auth routes
app.use('/api/accounts', accountsRouter); // Use the accounts routes
app.use('/api/devices', devicesRouter); // Use the devices routes
app.use('/api/admin', adminRouter); // Use the admin routes

// --- TODO: Add other API routes --- 

// --- Basic Error Handling Middleware ---
// This should be placed after all routes and other middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("Unhandled Error:", err.stack); // Log the error stack for debugging
  res.status(500).json({ message: 'Internal Server Error' }); // Send generic error response
});

async function main(): Promise<void> { // Explicit return type
  const prisma = new PrismaClient(); // Instantiate Prisma here
  console.log('PrismaClient instantiated in main()');
  app.locals.prisma = prisma; // Make Prisma client accessible in routes via req.app.locals.prisma

  // You can add any startup logic here, e.g., connecting to DB (Prisma does it lazily)
  console.log('Starting server...');
  const server = app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
  });

  // Handle server errors
  server.on('error', (error) => {
    console.error('Server error:', error);
    // Attempt graceful shutdown
    prisma.$disconnect().catch(console.error).finally(() => process.exit(1));
  });

  // Keep the process alive indefinitely
  return new Promise(() => {});
}

main()
  .catch(async (e) => { // Catch errors during startup *within* main()
    console.error('Error during server startup in main():', e);
    // Attempt to disconnect Prisma if it was initialized
    const prisma = app.locals.prisma as PrismaClient | undefined;
    if (prisma) {
      await prisma.$disconnect().catch(console.error);
    }
    console.log('Attempting to exit process due to startup error.');
    process.exit(1);
  });
