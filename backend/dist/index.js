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
require('dotenv').config(); // Load .env file
const express_1 = __importDefault(require("express"));
const prisma_1 = require("../prisma/src/generated/prisma"); // Corrected relative path
const auth_1 = __importDefault(require("./routes/auth")); // Import the auth router
const accounts_1 = __importDefault(require("./routes/accounts")); // Import the accounts router
const devices_1 = __importDefault(require("./routes/devices")); // Import the devices router
const admin_1 = __importDefault(require("./routes/admin")); // Import the admin router
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
app.use(express_1.default.json()); // Middleware to parse JSON bodies
// Simple health check endpoint
app.get('/', (req, res) => {
    res.send('2FLocal Backend is running!');
});
// --- Mount API routes --- 
app.use('/api/auth', auth_1.default); // Use the auth routes
app.use('/api/accounts', accounts_1.default); // Use the accounts routes
app.use('/api/devices', devices_1.default); // Use the devices routes
app.use('/api/admin', admin_1.default); // Use the admin routes
// --- TODO: Add other API routes --- 
// --- Basic Error Handling Middleware ---
// This should be placed after all routes and other middleware
app.use((err, req, res, next) => {
    console.error("Unhandled Error:", err.stack); // Log the error stack for debugging
    res.status(500).json({ message: 'Internal Server Error' }); // Send generic error response
});
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const prisma = new prisma_1.PrismaClient(); // Instantiate Prisma here
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
        return new Promise(() => { });
    });
}
main()
    .catch((e) => __awaiter(void 0, void 0, void 0, function* () {
    console.error('Error during server startup in main():', e);
    // Attempt to disconnect Prisma if it was initialized
    const prisma = app.locals.prisma;
    if (prisma) {
        yield prisma.$disconnect().catch(console.error);
    }
    console.log('Attempting to exit process due to startup error.');
    process.exit(1);
}));
