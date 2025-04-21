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
exports.verifyDevice = exports.deleteDevice = exports.updateDevice = exports.listDevices = exports.registerDevice = void 0;
// --- Register Device ---
const registerDevice = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { name, type, identifier } = req.body;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    const prisma = req.app.locals.prisma;
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
        const existingDevice = yield prisma.device.findUnique({
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
        const newDevice = yield prisma.device.create({
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
    }
    catch (error) {
        console.error('Error registering device:', error);
        if (error instanceof Error) {
            console.log('Error details:', error.message, error.stack);
        }
        else {
            console.log('Caught a non-Error object:', error);
        }
        next(error);
    }
});
exports.registerDevice = registerDevice;
// --- List Devices ---
const listDevices = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    const prisma = req.app.locals.prisma;
    if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
    try {
        // 1. Fetch devices from DB for the userId
        const devices = yield prisma.device.findMany({
            where: { userId },
            select: {
                id: true,
                identifier: true,
                name: true,
                type: true,
                lastSeen: true,
                createdAt: true,
                updatedAt: true,
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        // 2. Return the list
        res.status(200).json(devices);
    }
    catch (error) {
        console.error('List devices error:', error);
        next(error);
    }
});
exports.listDevices = listDevices;
// --- Update Device ---
const updateDevice = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { id } = req.params;
    const { name, type } = req.body;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    const prisma = req.app.locals.prisma;
    if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
    if (!id) {
        res.status(400).json({ message: 'Device ID is required' });
        return;
    }
    // Validate input data
    if (!name && !type) {
        res.status(400).json({ message: 'At least one field (name or type) must be provided for update' });
        return;
    }
    // Validate device type if provided
    if (type) {
        const allowedTypes = ['MOBILE', 'DESKTOP', 'WEB', 'OTHER'];
        if (!allowedTypes.includes(type.toUpperCase())) {
            res.status(400).json({ message: `Invalid device type. Allowed types: ${allowedTypes.join(', ')}` });
            return;
        }
    }
    try {
        // 1. Check if the device exists and belongs to the user
        const device = yield prisma.device.findFirst({
            where: {
                id,
                userId
            }
        });
        if (!device) {
            res.status(404).json({ message: 'Device not found or does not belong to the user' });
            return;
        }
        // 2. Update the device
        const updatedDevice = yield prisma.device.update({
            where: {
                id
            },
            data: Object.assign(Object.assign(Object.assign({}, (name && { name })), (type && { type: type.toUpperCase() })), { lastSeen: new Date() // Update lastSeen timestamp
             })
        });
        // 3. Return the updated device
        res.status(200).json({
            id: updatedDevice.id,
            name: updatedDevice.name,
            type: updatedDevice.type,
            identifier: updatedDevice.identifier,
            lastSeen: updatedDevice.lastSeen,
            message: 'Device updated successfully'
        });
    }
    catch (error) {
        console.error('Update device error:', error);
        next(error);
    }
});
exports.updateDevice = updateDevice;
// --- Delete Device ---
const deleteDevice = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { id } = req.params;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    const prisma = req.app.locals.prisma;
    if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
    if (!id) {
        res.status(400).json({ message: 'Device ID is required' });
        return;
    }
    try {
        // 1. Check if the device exists and belongs to the user
        const device = yield prisma.device.findFirst({
            where: {
                id,
                userId
            }
        });
        if (!device) {
            res.status(404).json({ message: 'Device not found or does not belong to the user' });
            return;
        }
        // 2. Delete the device
        yield prisma.device.delete({
            where: {
                id
            }
        });
        // 3. Return success response
        res.status(204).send();
    }
    catch (error) {
        console.error('Delete device error:', error);
        next(error);
    }
});
exports.deleteDevice = deleteDevice;
// --- Verify Device ---
const verifyDevice = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { id } = req.params;
    const { verificationCode } = req.body;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    const prisma = req.app.locals.prisma;
    if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
    if (!id) {
        res.status(400).json({ message: 'Device ID is required' });
        return;
    }
    if (!verificationCode) {
        res.status(400).json({ message: 'Verification code is required' });
        return;
    }
    // For this implementation, we'll use a simple verification code check
    // In a real-world scenario, you might want to implement a more secure verification process
    // such as sending a code via email or SMS and verifying it
    // For demo purposes, we'll accept any 6-digit code
    const codeRegex = /^\d{6}$/;
    if (!codeRegex.test(verificationCode)) {
        res.status(400).json({ message: 'Invalid verification code format. Must be a 6-digit number.' });
        return;
    }
    try {
        // 1. Check if the device exists and belongs to the user
        const device = yield prisma.device.findFirst({
            where: {
                id,
                userId
            }
        });
        if (!device) {
            res.status(404).json({ message: 'Device not found or does not belong to the user' });
            return;
        }
        // 2. Update the device with lastSeen timestamp
        // In a real implementation, you might want to add a 'verified' field to the Device model
        const updatedDevice = yield prisma.device.update({
            where: {
                id
            },
            data: {
                lastSeen: new Date()
            }
        });
        // 3. Return success response
        res.status(200).json({
            id: updatedDevice.id,
            name: updatedDevice.name,
            type: updatedDevice.type,
            identifier: updatedDevice.identifier,
            lastSeen: updatedDevice.lastSeen,
            message: 'Device verified successfully'
        });
    }
    catch (error) {
        console.error('Verify device error:', error);
        next(error);
    }
});
exports.verifyDevice = verifyDevice;
