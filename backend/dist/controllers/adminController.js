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
exports.adminDeleteDevice = void 0;
// Note: Admin check is done in middleware, so we can assume req.user is an admin here.
// Still good practice to check for req.user existence if needed, though technically redundant.
// --- Admin Delete Device --- 
const adminDeleteDevice = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id: deviceId } = req.params; // Get device primary ID from URL parameters
    const prisma = req.app.locals.prisma; // Get prisma from app.locals
    if (!deviceId) {
        res.status(400).json({ message: 'Device ID is required in URL parameters' });
        return;
    }
    try {
        // 1. Attempt to delete the device by its primary ID
        // Use deleteMany for consistency and to get a count, or use delete and catch P2025 error
        const deleteResult = yield prisma.device.deleteMany({
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
    }
    catch (error) {
        console.error('Admin delete device error:', error);
        next(error); // Pass DB errors etc. to generic handler
    }
});
exports.adminDeleteDevice = adminDeleteDevice;
