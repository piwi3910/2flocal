import { Request, Response, NextFunction } from 'express';
import { 
    registerDevice, 
    listDevices, 
    updateDevice, 
    deleteDevice, 
    verifyDevice 
} from '../deviceController';

// Mock the Prisma client
const mockPrismaClient = {
    device: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        deleteMany: jest.fn(),
    }
};

// Mock request, response, and next function
const mockRequest = (data: any = {}) => {
    return {
        body: data.body || {},
        params: data.params || {},
        user: data.user || { userId: 'user123', email: 'user@example.com' },
        app: {
            locals: {
                prisma: mockPrismaClient
            }
        }
    } as unknown as Request;
};

const mockResponse = () => {
    const res: any = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    return res as Response;
};

const mockNext = jest.fn() as NextFunction;

describe('Device Controller', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('registerDevice', () => {
        it('should return 401 if user is not authenticated', async () => {
            const req = mockRequest({ user: undefined });
            const res = mockResponse();
            
            await registerDevice(req, res, mockNext);
            
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ message: expect.any(String) });
        });

        it('should return 400 if required fields are missing', async () => {
            const req = mockRequest({ body: { name: 'My Device' } });
            const res = mockResponse();
            
            await registerDevice(req, res, mockNext);
            
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: expect.any(String) });
        });

        it('should return 400 if device type is invalid', async () => {
            const req = mockRequest({ 
                body: { 
                    name: 'My Device', 
                    type: 'INVALID_TYPE', 
                    identifier: 'device123' 
                } 
            });
            const res = mockResponse();
            
            await registerDevice(req, res, mockNext);
            
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: expect.any(String) });
        });

        it('should return 200 if device already exists', async () => {
            const existingDevice = {
                id: 'device123',
                name: 'My Device',
                type: 'MOBILE',
                identifier: 'device123',
                lastSeen: new Date(),
                userId: 'user123',
                createdAt: new Date(),
                updatedAt: new Date()
            };
            
            mockPrismaClient.device.findUnique.mockResolvedValue(existingDevice);
            
            const req = mockRequest({ 
                body: { 
                    name: 'My Device', 
                    type: 'MOBILE', 
                    identifier: 'device123' 
                } 
            });
            const res = mockResponse();
            
            await registerDevice(req, res, mockNext);
            
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ 
                message: 'Device already registered', 
                device: expect.objectContaining({
                    id: existingDevice.id,
                    name: existingDevice.name,
                    type: existingDevice.type,
                    identifier: existingDevice.identifier,
                    lastSeen: existingDevice.lastSeen
                })
            });
        });

        it('should create and return a new device if it does not exist', async () => {
            mockPrismaClient.device.findUnique.mockResolvedValue(null);
            
            const newDevice = {
                id: 'device123',
                name: 'My Device',
                type: 'MOBILE',
                identifier: 'device123',
                lastSeen: new Date(),
                userId: 'user123',
                createdAt: new Date(),
                updatedAt: new Date()
            };
            
            mockPrismaClient.device.create.mockResolvedValue(newDevice);
            
            const req = mockRequest({ 
                body: { 
                    name: 'My Device', 
                    type: 'MOBILE', 
                    identifier: 'device123' 
                } 
            });
            const res = mockResponse();
            
            await registerDevice(req, res, mockNext);
            
            expect(mockPrismaClient.device.create).toHaveBeenCalledWith({
                data: expect.objectContaining({
                    name: 'My Device',
                    type: 'MOBILE',
                    identifier: 'device123',
                    userId: 'user123'
                })
            });
            
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                id: newDevice.id,
                name: newDevice.name,
                type: newDevice.type,
                identifier: newDevice.identifier,
                message: 'Device registered successfully'
            }));
        });

        it('should pass errors to the next middleware', async () => {
            mockPrismaClient.device.findUnique.mockRejectedValue(new Error('Database error'));
            
            const req = mockRequest({ 
                body: { 
                    name: 'My Device', 
                    type: 'MOBILE', 
                    identifier: 'device123' 
                } 
            });
            const res = mockResponse();
            
            await registerDevice(req, res, mockNext);
            
            expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
        });
    });

    describe('listDevices', () => {
        it('should return 401 if user is not authenticated', async () => {
            const req = mockRequest({ user: undefined });
            const res = mockResponse();
            
            await listDevices(req, res, mockNext);
            
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ message: expect.any(String) });
        });

        it('should return a list of devices for the authenticated user', async () => {
            const devices = [
                {
                    id: 'device1',
                    identifier: 'device123',
                    name: 'My Device',
                    type: 'MOBILE',
                    lastSeen: new Date(),
                    createdAt: new Date(),
                    updatedAt: new Date()
                },
                {
                    id: 'device2',
                    identifier: 'device456',
                    name: 'My Other Device',
                    type: 'DESKTOP',
                    lastSeen: new Date(),
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            ];
            
            mockPrismaClient.device.findMany.mockResolvedValue(devices);
            
            const req = mockRequest();
            const res = mockResponse();
            
            await listDevices(req, res, mockNext);
            
            expect(mockPrismaClient.device.findMany).toHaveBeenCalledWith({
                where: { userId: 'user123' },
                select: expect.any(Object),
                orderBy: expect.any(Object)
            });
            
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(devices);
        });

        it('should pass errors to the next middleware', async () => {
            mockPrismaClient.device.findMany.mockRejectedValue(new Error('Database error'));
            
            const req = mockRequest();
            const res = mockResponse();
            
            await listDevices(req, res, mockNext);
            
            expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
        });
    });

    describe('updateDevice', () => {
        it('should return 401 if user is not authenticated', async () => {
            const req = mockRequest({ user: undefined });
            const res = mockResponse();
            
            await updateDevice(req, res, mockNext);
            
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ message: expect.any(String) });
        });

        it('should return 400 if device ID is missing', async () => {
            const req = mockRequest({ params: {} });
            const res = mockResponse();
            
            await updateDevice(req, res, mockNext);
            
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: expect.any(String) });
        });

        it('should return 400 if no fields are provided for update', async () => {
            const req = mockRequest({ 
                params: { id: 'device123' },
                body: {}
            });
            const res = mockResponse();
            
            await updateDevice(req, res, mockNext);
            
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: expect.any(String) });
        });

        it('should return 400 if device type is invalid', async () => {
            const req = mockRequest({ 
                params: { id: 'device123' },
                body: { type: 'INVALID_TYPE' }
            });
            const res = mockResponse();
            
            await updateDevice(req, res, mockNext);
            
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: expect.any(String) });
        });

        it('should return 404 if device is not found or does not belong to the user', async () => {
            mockPrismaClient.device.findFirst.mockResolvedValue(null);
            
            const req = mockRequest({ 
                params: { id: 'device123' },
                body: { name: 'Updated Device' }
            });
            const res = mockResponse();
            
            await updateDevice(req, res, mockNext);
            
            expect(mockPrismaClient.device.findFirst).toHaveBeenCalledWith({
                where: {
                    id: 'device123',
                    userId: 'user123'
                }
            });
            
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: expect.any(String) });
        });

        it('should update and return the device if it exists and belongs to the user', async () => {
            const device = {
                id: 'device123',
                name: 'My Device',
                type: 'MOBILE',
                identifier: 'device123',
                lastSeen: new Date(),
                userId: 'user123',
                createdAt: new Date(),
                updatedAt: new Date()
            };
            
            mockPrismaClient.device.findFirst.mockResolvedValue(device);
            
            const updatedDevice = {
                ...device,
                name: 'Updated Device',
                lastSeen: new Date()
            };
            
            mockPrismaClient.device.update.mockResolvedValue(updatedDevice);
            
            const req = mockRequest({ 
                params: { id: 'device123' },
                body: { name: 'Updated Device' }
            });
            const res = mockResponse();
            
            await updateDevice(req, res, mockNext);
            
            expect(mockPrismaClient.device.update).toHaveBeenCalledWith({
                where: { id: 'device123' },
                data: expect.objectContaining({
                    name: 'Updated Device',
                    lastSeen: expect.any(Date)
                })
            });
            
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                id: updatedDevice.id,
                name: updatedDevice.name,
                type: updatedDevice.type,
                identifier: updatedDevice.identifier,
                lastSeen: updatedDevice.lastSeen,
                message: 'Device updated successfully'
            }));
        });

        it('should pass errors to the next middleware', async () => {
            mockPrismaClient.device.findFirst.mockRejectedValue(new Error('Database error'));
            
            const req = mockRequest({ 
                params: { id: 'device123' },
                body: { name: 'Updated Device' }
            });
            const res = mockResponse();
            
            await updateDevice(req, res, mockNext);
            
            expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
        });
    });

    describe('deleteDevice', () => {
        it('should return 401 if user is not authenticated', async () => {
            const req = mockRequest({ user: undefined });
            const res = mockResponse();
            
            await deleteDevice(req, res, mockNext);
            
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ message: expect.any(String) });
        });

        it('should return 400 if device ID is missing', async () => {
            const req = mockRequest({ params: {} });
            const res = mockResponse();
            
            await deleteDevice(req, res, mockNext);
            
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: expect.any(String) });
        });

        it('should return 404 if device is not found or does not belong to the user', async () => {
            mockPrismaClient.device.findFirst.mockResolvedValue(null);
            
            const req = mockRequest({ params: { id: 'device123' } });
            const res = mockResponse();
            
            await deleteDevice(req, res, mockNext);
            
            expect(mockPrismaClient.device.findFirst).toHaveBeenCalledWith({
                where: {
                    id: 'device123',
                    userId: 'user123'
                }
            });
            
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: expect.any(String) });
        });

        it('should delete the device if it exists and belongs to the user', async () => {
            const device = {
                id: 'device123',
                name: 'My Device',
                type: 'MOBILE',
                identifier: 'device123',
                lastSeen: new Date(),
                userId: 'user123',
                createdAt: new Date(),
                updatedAt: new Date()
            };
            
            mockPrismaClient.device.findFirst.mockResolvedValue(device);
            mockPrismaClient.device.delete.mockResolvedValue(device);
            
            const req = mockRequest({ params: { id: 'device123' } });
            const res = mockResponse();
            
            await deleteDevice(req, res, mockNext);
            
            expect(mockPrismaClient.device.delete).toHaveBeenCalledWith({
                where: { id: 'device123' }
            });
            
            expect(res.status).toHaveBeenCalledWith(204);
            expect(res.send).toHaveBeenCalled();
        });

        it('should pass errors to the next middleware', async () => {
            mockPrismaClient.device.findFirst.mockRejectedValue(new Error('Database error'));
            
            const req = mockRequest({ params: { id: 'device123' } });
            const res = mockResponse();
            
            await deleteDevice(req, res, mockNext);
            
            expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
        });
    });

    describe('verifyDevice', () => {
        it('should return 401 if user is not authenticated', async () => {
            const req = mockRequest({ user: undefined });
            const res = mockResponse();
            
            await verifyDevice(req, res, mockNext);
            
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ message: expect.any(String) });
        });

        it('should return 400 if device ID is missing', async () => {
            const req = mockRequest({ 
                params: {},
                body: { verificationCode: '123456' }
            });
            const res = mockResponse();
            
            await verifyDevice(req, res, mockNext);
            
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: expect.any(String) });
        });

        it('should return 400 if verification code is missing', async () => {
            const req = mockRequest({ 
                params: { id: 'device123' },
                body: {}
            });
            const res = mockResponse();
            
            await verifyDevice(req, res, mockNext);
            
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: expect.any(String) });
        });

        it('should return 400 if verification code format is invalid', async () => {
            const req = mockRequest({ 
                params: { id: 'device123' },
                body: { verificationCode: '12345' } // Not 6 digits
            });
            const res = mockResponse();
            
            await verifyDevice(req, res, mockNext);
            
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: expect.any(String) });
        });

        it('should return 404 if device is not found or does not belong to the user', async () => {
            mockPrismaClient.device.findFirst.mockResolvedValue(null);
            
            const req = mockRequest({ 
                params: { id: 'device123' },
                body: { verificationCode: '123456' }
            });
            const res = mockResponse();
            
            await verifyDevice(req, res, mockNext);
            
            expect(mockPrismaClient.device.findFirst).toHaveBeenCalledWith({
                where: {
                    id: 'device123',
                    userId: 'user123'
                }
            });
            
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: expect.any(String) });
        });

        it('should verify the device if it exists and belongs to the user', async () => {
            const device = {
                id: 'device123',
                name: 'My Device',
                type: 'MOBILE',
                identifier: 'device123',
                lastSeen: new Date(),
                userId: 'user123',
                createdAt: new Date(),
                updatedAt: new Date()
            };
            
            mockPrismaClient.device.findFirst.mockResolvedValue(device);
            
            const updatedDevice = {
                ...device,
                lastSeen: new Date()
            };
            
            mockPrismaClient.device.update.mockResolvedValue(updatedDevice);
            
            const req = mockRequest({ 
                params: { id: 'device123' },
                body: { verificationCode: '123456' }
            });
            const res = mockResponse();
            
            await verifyDevice(req, res, mockNext);
            
            expect(mockPrismaClient.device.update).toHaveBeenCalledWith({
                where: { id: 'device123' },
                data: {
                    lastSeen: expect.any(Date)
                }
            });
            
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                id: updatedDevice.id,
                name: updatedDevice.name,
                type: updatedDevice.type,
                identifier: updatedDevice.identifier,
                lastSeen: updatedDevice.lastSeen,
                message: 'Device verified successfully'
            }));
        });

        it('should pass errors to the next middleware', async () => {
            mockPrismaClient.device.findFirst.mockRejectedValue(new Error('Database error'));
            
            const req = mockRequest({ 
                params: { id: 'device123' },
                body: { verificationCode: '123456' }
            });
            const res = mockResponse();
            
            await verifyDevice(req, res, mockNext);
            
            expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
        });
    });
});