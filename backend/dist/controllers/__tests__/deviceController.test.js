"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const jest_mock_extended_1 = require("jest-mock-extended");
const setup_1 = require("../../__tests__/setup");
const deviceController = __importStar(require("../deviceController"));
describe('Device Controller', () => {
    // Create mock request and response objects
    const mockRequest = (0, jest_mock_extended_1.mockDeep)();
    const mockResponse = (0, jest_mock_extended_1.mockDeep)();
    const mockNext = jest.fn();
    // Reset mocks before each test
    beforeEach(() => {
        (0, jest_mock_extended_1.mockReset)(mockRequest);
        (0, jest_mock_extended_1.mockReset)(mockResponse);
        mockNext.mockClear();
        mockResponse.status.mockReturnThis();
        mockResponse.json.mockReturnThis();
        mockResponse.send.mockReturnThis();
        // Set up common request properties
        mockRequest.user = { userId: 'user123', email: 'test@example.com' };
        mockRequest.app = {
            locals: {
                prisma: setup_1.prismaMock
            }
        };
    });
    describe('registerDevice', () => {
        it('should return 401 if user is not authenticated', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            mockRequest.user = undefined;
            // Act
            yield deviceController.registerDevice(mockRequest, mockResponse, mockNext);
            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
                message: expect.stringContaining('Unauthorized')
            }));
        }));
        it('should return 400 if required fields are missing', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            mockRequest.body = { name: 'My Phone', type: 'MOBILE' }; // Missing identifier
            // Act
            yield deviceController.registerDevice(mockRequest, mockResponse, mockNext);
            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
                message: 'Device name, type, and identifier are required'
            }));
        }));
        it('should return 400 if device type is invalid', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            mockRequest.body = {
                name: 'My Phone',
                type: 'INVALID_TYPE',
                identifier: 'device-123'
            };
            // Act
            yield deviceController.registerDevice(mockRequest, mockResponse, mockNext);
            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
                message: expect.stringContaining('Invalid device type')
            }));
        }));
        it('should return existing device if already registered', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            mockRequest.body = {
                name: 'My Phone',
                type: 'MOBILE',
                identifier: 'device-123'
            };
            const existingDevice = {
                id: 'device1',
                name: 'My Phone',
                type: 'MOBILE',
                identifier: 'device-123',
                userId: 'user123',
                lastSeen: new Date(),
                createdAt: new Date(),
                updatedAt: new Date()
            };
            setup_1.prismaMock.device.findUnique.mockResolvedValue(existingDevice);
            // Act
            yield deviceController.registerDevice(mockRequest, mockResponse, mockNext);
            // Assert
            expect(setup_1.prismaMock.device.findUnique).toHaveBeenCalledWith({
                where: {
                    userId_identifier: {
                        userId: 'user123',
                        identifier: 'device-123'
                    }
                }
            });
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
                message: 'Device already registered',
                device: expect.objectContaining({
                    id: 'device1',
                    name: 'My Phone',
                    type: 'MOBILE',
                    identifier: 'device-123'
                })
            }));
        }));
        it('should register a new device successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            mockRequest.body = {
                name: 'My Phone',
                type: 'mobile', // lowercase to test conversion
                identifier: 'device-123'
            };
            setup_1.prismaMock.device.findUnique.mockResolvedValue(null);
            const newDevice = {
                id: 'device1',
                name: 'My Phone',
                type: 'MOBILE',
                identifier: 'device-123',
                userId: 'user123',
                lastSeen: new Date(),
                createdAt: new Date(),
                updatedAt: new Date()
            };
            setup_1.prismaMock.device.create.mockResolvedValue(newDevice);
            // Act
            yield deviceController.registerDevice(mockRequest, mockResponse, mockNext);
            // Assert
            expect(setup_1.prismaMock.device.create).toHaveBeenCalledWith({
                data: {
                    name: 'My Phone',
                    type: 'MOBILE',
                    identifier: 'device-123',
                    userId: 'user123',
                    lastSeen: expect.any(Date)
                }
            });
            expect(mockResponse.status).toHaveBeenCalledWith(201);
            expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
                id: 'device1',
                name: 'My Phone',
                type: 'MOBILE',
                identifier: 'device-123',
                message: 'Device registered successfully'
            }));
        }));
        it('should handle database errors', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            mockRequest.body = {
                name: 'My Phone',
                type: 'MOBILE',
                identifier: 'device-123'
            };
            setup_1.prismaMock.device.findUnique.mockResolvedValue(null);
            const dbError = new Error('Database error');
            setup_1.prismaMock.device.create.mockRejectedValue(dbError);
            // Act
            yield deviceController.registerDevice(mockRequest, mockResponse, mockNext);
            // Assert
            expect(mockNext).toHaveBeenCalledWith(dbError);
        }));
    });
    describe('listDevices', () => {
        it('should return 401 if user is not authenticated', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            mockRequest.user = undefined;
            // Act
            yield deviceController.listDevices(mockRequest, mockResponse, mockNext);
            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
                message: 'Unauthorized'
            }));
        }));
        it('should return a list of devices', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            const mockDevices = [
                {
                    id: 'device1',
                    name: 'My Phone',
                    type: 'MOBILE',
                    identifier: 'device-123',
                    lastSeen: new Date(),
                    createdAt: new Date(),
                    updatedAt: new Date()
                },
                {
                    id: 'device2',
                    name: 'My Laptop',
                    type: 'DESKTOP',
                    identifier: 'device-456',
                    lastSeen: new Date(),
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            ];
            setup_1.prismaMock.device.findMany.mockResolvedValue(mockDevices);
            // Act
            yield deviceController.listDevices(mockRequest, mockResponse, mockNext);
            // Assert
            expect(setup_1.prismaMock.device.findMany).toHaveBeenCalledWith({
                where: { userId: 'user123' },
                select: {
                    id: true,
                    identifier: true,
                    name: true,
                    type: true,
                    lastSeen: true,
                    createdAt: true,
                    updatedAt: true
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith(mockDevices);
        }));
        it('should handle database errors', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            const dbError = new Error('Database error');
            setup_1.prismaMock.device.findMany.mockRejectedValue(dbError);
            // Act
            yield deviceController.listDevices(mockRequest, mockResponse, mockNext);
            // Assert
            expect(mockNext).toHaveBeenCalledWith(dbError);
        }));
    });
    describe('updateDevice', () => {
        it('should return 401 if user is not authenticated', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            mockRequest.user = undefined;
            // Act
            yield deviceController.updateDevice(mockRequest, mockResponse, mockNext);
            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
                message: 'Unauthorized'
            }));
        }));
        it('should return 400 if device ID is missing', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            mockRequest.params = {};
            // Act
            yield deviceController.updateDevice(mockRequest, mockResponse, mockNext);
            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
                message: 'Device ID is required'
            }));
        }));
        it('should return 400 if no fields are provided for update', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            mockRequest.params = { id: 'device1' };
            mockRequest.body = {};
            // Act
            yield deviceController.updateDevice(mockRequest, mockResponse, mockNext);
            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
                message: 'At least one field (name or type) must be provided for update'
            }));
        }));
        it('should return 400 if device type is invalid', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            mockRequest.params = { id: 'device1' };
            mockRequest.body = { type: 'INVALID_TYPE' };
            // Act
            yield deviceController.updateDevice(mockRequest, mockResponse, mockNext);
            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
                message: expect.stringContaining('Invalid device type')
            }));
        }));
        it('should return 404 if device is not found', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            mockRequest.params = { id: 'nonexistent-device' };
            mockRequest.body = { name: 'Updated Name' };
            setup_1.prismaMock.device.findFirst.mockResolvedValue(null);
            // Act
            yield deviceController.updateDevice(mockRequest, mockResponse, mockNext);
            // Assert
            expect(setup_1.prismaMock.device.findFirst).toHaveBeenCalledWith({
                where: {
                    id: 'nonexistent-device',
                    userId: 'user123'
                }
            });
            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
                message: 'Device not found or does not belong to the user'
            }));
        }));
        it('should update device name successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            mockRequest.params = { id: 'device1' };
            mockRequest.body = { name: 'Updated Name' };
            const existingDevice = {
                id: 'device1',
                name: 'My Phone',
                type: 'MOBILE',
                identifier: 'device-123',
                userId: 'user123',
                lastSeen: new Date(),
                createdAt: new Date(),
                updatedAt: new Date()
            };
            const updatedDevice = Object.assign(Object.assign({}, existingDevice), { name: 'Updated Name', lastSeen: new Date() });
            setup_1.prismaMock.device.findFirst.mockResolvedValue(existingDevice);
            setup_1.prismaMock.device.update.mockResolvedValue(updatedDevice);
            // Act
            yield deviceController.updateDevice(mockRequest, mockResponse, mockNext);
            // Assert
            expect(setup_1.prismaMock.device.update).toHaveBeenCalledWith({
                where: {
                    id: 'device1'
                },
                data: {
                    name: 'Updated Name',
                    lastSeen: expect.any(Date)
                }
            });
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
                id: 'device1',
                name: 'Updated Name',
                type: 'MOBILE',
                identifier: 'device-123',
                message: 'Device updated successfully'
            }));
        }));
        it('should update device type successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            mockRequest.params = { id: 'device1' };
            mockRequest.body = { type: 'desktop' }; // lowercase to test conversion
            const existingDevice = {
                id: 'device1',
                name: 'My Phone',
                type: 'MOBILE',
                identifier: 'device-123',
                userId: 'user123',
                lastSeen: new Date(),
                createdAt: new Date(),
                updatedAt: new Date()
            };
            const updatedDevice = Object.assign(Object.assign({}, existingDevice), { type: 'DESKTOP', lastSeen: new Date() });
            setup_1.prismaMock.device.findFirst.mockResolvedValue(existingDevice);
            setup_1.prismaMock.device.update.mockResolvedValue(updatedDevice);
            // Act
            yield deviceController.updateDevice(mockRequest, mockResponse, mockNext);
            // Assert
            expect(setup_1.prismaMock.device.update).toHaveBeenCalledWith({
                where: {
                    id: 'device1'
                },
                data: {
                    type: 'DESKTOP',
                    lastSeen: expect.any(Date)
                }
            });
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
                id: 'device1',
                name: 'My Phone',
                type: 'DESKTOP',
                identifier: 'device-123',
                message: 'Device updated successfully'
            }));
        }));
        it('should handle database errors', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            mockRequest.params = { id: 'device1' };
            mockRequest.body = { name: 'Updated Name' };
            setup_1.prismaMock.device.findFirst.mockResolvedValue({
                id: 'device1',
                name: 'My Phone',
                type: 'MOBILE',
                identifier: 'device-123',
                userId: 'user123',
                lastSeen: new Date(),
                createdAt: new Date(),
                updatedAt: new Date()
            });
            const dbError = new Error('Database error');
            setup_1.prismaMock.device.update.mockRejectedValue(dbError);
            // Act
            yield deviceController.updateDevice(mockRequest, mockResponse, mockNext);
            // Assert
            expect(mockNext).toHaveBeenCalledWith(dbError);
        }));
    });
    describe('deleteDevice', () => {
        it('should delete device successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            mockRequest.params = { id: 'device1' };
            setup_1.prismaMock.device.findFirst.mockResolvedValue({
                id: 'device1',
                name: 'My Phone',
                type: 'MOBILE',
                identifier: 'device-123',
                userId: 'user123',
                lastSeen: new Date(),
                createdAt: new Date(),
                updatedAt: new Date()
            });
            setup_1.prismaMock.device.delete.mockResolvedValue({});
            // Act
            yield deviceController.deleteDevice(mockRequest, mockResponse, mockNext);
            // Assert
            expect(setup_1.prismaMock.device.delete).toHaveBeenCalledWith({
                where: {
                    id: 'device1'
                }
            });
            expect(mockResponse.status).toHaveBeenCalledWith(204);
            expect(mockResponse.send).toHaveBeenCalled();
        }));
    });
    describe('verifyDevice', () => {
        it('should verify device successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            mockRequest.params = { id: 'device1' };
            mockRequest.body = { verificationCode: '123456' };
            const existingDevice = {
                id: 'device1',
                name: 'My Phone',
                type: 'MOBILE',
                identifier: 'device-123',
                userId: 'user123',
                lastSeen: new Date(),
                createdAt: new Date(),
                updatedAt: new Date()
            };
            const updatedDevice = Object.assign(Object.assign({}, existingDevice), { lastSeen: new Date() });
            setup_1.prismaMock.device.findFirst.mockResolvedValue(existingDevice);
            setup_1.prismaMock.device.update.mockResolvedValue(updatedDevice);
            // Act
            yield deviceController.verifyDevice(mockRequest, mockResponse, mockNext);
            // Assert
            expect(setup_1.prismaMock.device.update).toHaveBeenCalledWith({
                where: {
                    id: 'device1'
                },
                data: {
                    lastSeen: expect.any(Date)
                }
            });
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
                id: 'device1',
                name: 'My Phone',
                type: 'MOBILE',
                identifier: 'device-123',
                message: 'Device verified successfully'
            }));
        }));
        it('should return 400 if verification code is invalid', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            mockRequest.params = { id: 'device1' };
            mockRequest.body = { verificationCode: '12345' }; // Not 6 digits
            // Act
            yield deviceController.verifyDevice(mockRequest, mockResponse, mockNext);
            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
                message: 'Invalid verification code format. Must be a 6-digit number.'
            }));
        }));
    });
});
