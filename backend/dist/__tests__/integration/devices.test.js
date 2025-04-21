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
const supertest_1 = __importDefault(require("supertest"));
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const devices_1 = __importDefault(require("../../routes/devices"));
const setup_1 = require("../../__tests__/setup");
// Mock dependencies
jest.mock('jsonwebtoken');
describe('Devices API', () => {
    // Create a test app
    const app = (0, express_1.default)();
    app.use(express_1.default.json());
    app.use('/api/devices', devices_1.default);
    // Add prisma mock to app.locals
    app.locals.prisma = setup_1.prismaMock;
    // Mock user for authentication
    const mockUser = {
        userId: 'user123',
        email: 'test@example.com'
    };
    beforeEach(() => {
        jest.clearAllMocks();
        // Mock JWT verification for all tests
        jsonwebtoken_1.default.verify.mockReturnValue(mockUser);
    });
    describe('POST /api/devices', () => {
        // Increase timeout to 15 seconds for all integration tests
        jest.setTimeout(15000);
        it('should register a new device', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            const deviceData = {
                name: 'My Phone',
                type: 'MOBILE',
                identifier: 'device-123'
            };
            // Mock device creation
            setup_1.prismaMock.device.findUnique.mockResolvedValue(null); // Device doesn't exist yet
            setup_1.prismaMock.device.create.mockResolvedValue({
                id: 'device1',
                name: deviceData.name,
                type: deviceData.type,
                identifier: deviceData.identifier,
                userId: mockUser.userId,
                lastSeen: new Date(),
                createdAt: new Date(),
                updatedAt: new Date()
            });
            // Act
            const response = yield (0, supertest_1.default)(app)
                .post('/api/devices')
                .set('Authorization', 'Bearer valid-token')
                .send(deviceData);
            // Assert
            expect(setup_1.prismaMock.device.findUnique).toHaveBeenCalledWith({
                where: {
                    userId_identifier: {
                        userId: mockUser.userId,
                        identifier: deviceData.identifier
                    }
                }
            });
            expect(setup_1.prismaMock.device.create).toHaveBeenCalledWith({
                data: {
                    name: deviceData.name,
                    type: deviceData.type,
                    identifier: deviceData.identifier,
                    userId: mockUser.userId,
                    lastSeen: expect.any(Date)
                }
            });
            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('id', 'device1');
            expect(response.body).toHaveProperty('name', deviceData.name);
            expect(response.body).toHaveProperty('type', deviceData.type);
            expect(response.body).toHaveProperty('identifier', deviceData.identifier);
            expect(response.body).toHaveProperty('message', 'Device registered successfully');
        }));
        it('should return existing device if already registered', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            const deviceData = {
                name: 'My Phone',
                type: 'MOBILE',
                identifier: 'device-123'
            };
            const existingDevice = {
                id: 'device1',
                name: deviceData.name,
                type: deviceData.type,
                identifier: deviceData.identifier,
                userId: mockUser.userId,
                lastSeen: new Date(),
                createdAt: new Date(),
                updatedAt: new Date()
            };
            // Mock device already exists
            setup_1.prismaMock.device.findUnique.mockResolvedValue(existingDevice);
            // Act
            const response = yield (0, supertest_1.default)(app)
                .post('/api/devices')
                .set('Authorization', 'Bearer valid-token')
                .send(deviceData);
            // Assert
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('message', 'Device already registered');
            expect(response.body).toHaveProperty('device');
            expect(response.body.device).toHaveProperty('id', 'device1');
        }));
        it('should return 400 if required fields are missing', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            const deviceData = {
                name: 'My Phone',
                // Missing type and identifier
            };
            // Act
            const response = yield (0, supertest_1.default)(app)
                .post('/api/devices')
                .set('Authorization', 'Bearer valid-token')
                .send(deviceData);
            // Assert
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('message', 'Device name, type, and identifier are required');
        }));
        it('should return 400 if device type is invalid', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            const deviceData = {
                name: 'My Phone',
                type: 'INVALID_TYPE',
                identifier: 'device-123'
            };
            // Act
            const response = yield (0, supertest_1.default)(app)
                .post('/api/devices')
                .set('Authorization', 'Bearer valid-token')
                .send(deviceData);
            // Assert
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('message', expect.stringContaining('Invalid device type'));
        }));
        it('should return 401 if not authenticated', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            jsonwebtoken_1.default.verify.mockImplementation(() => {
                throw new Error('Invalid token');
            });
            // Act
            const response = yield (0, supertest_1.default)(app)
                .post('/api/devices')
                .set('Authorization', 'Bearer invalid-token')
                .send({});
            // Assert
            expect(response.status).toBe(401);
        }));
    });
    describe('GET /api/devices', () => {
        it('should list devices for the authenticated user', () => __awaiter(void 0, void 0, void 0, function* () {
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
            const response = yield (0, supertest_1.default)(app)
                .get('/api/devices')
                .set('Authorization', 'Bearer valid-token');
            // Assert
            expect(setup_1.prismaMock.device.findMany).toHaveBeenCalledWith({
                where: { userId: mockUser.userId },
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
            expect(response.status).toBe(200);
            expect(response.body).toHaveLength(2);
            expect(response.body[0]).toHaveProperty('id', 'device1');
            expect(response.body[1]).toHaveProperty('id', 'device2');
        }));
    });
    describe('PUT /api/devices/:id', () => {
        it('should update a device', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            const updateData = {
                name: 'Updated Phone Name'
            };
            const existingDevice = {
                id: 'device1',
                name: 'My Phone',
                type: 'MOBILE',
                identifier: 'device-123',
                userId: mockUser.userId,
                lastSeen: new Date(),
                createdAt: new Date(),
                updatedAt: new Date()
            };
            const updatedDevice = Object.assign(Object.assign({}, existingDevice), { name: 'Updated Phone Name', lastSeen: new Date() });
            setup_1.prismaMock.device.findFirst.mockResolvedValue(existingDevice);
            setup_1.prismaMock.device.update.mockResolvedValue(updatedDevice);
            // Act
            const response = yield (0, supertest_1.default)(app)
                .put('/api/devices/device1')
                .set('Authorization', 'Bearer valid-token')
                .send(updateData);
            // Assert
            expect(setup_1.prismaMock.device.findFirst).toHaveBeenCalledWith({
                where: {
                    id: 'device1',
                    userId: mockUser.userId
                }
            });
            expect(setup_1.prismaMock.device.update).toHaveBeenCalledWith({
                where: {
                    id: 'device1'
                },
                data: {
                    name: 'Updated Phone Name',
                    lastSeen: expect.any(Date)
                }
            });
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('id', 'device1');
            expect(response.body).toHaveProperty('name', 'Updated Phone Name');
            expect(response.body).toHaveProperty('message', 'Device updated successfully');
        }));
        it('should return 404 if device is not found', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            const updateData = {
                name: 'Updated Phone Name'
            };
            setup_1.prismaMock.device.findFirst.mockResolvedValue(null);
            // Act
            const response = yield (0, supertest_1.default)(app)
                .put('/api/devices/nonexistent')
                .set('Authorization', 'Bearer valid-token')
                .send(updateData);
            // Assert
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('message', 'Device not found or does not belong to the user');
        }));
        it('should return 400 if no fields are provided for update', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            const updateData = {};
            // Act
            const response = yield (0, supertest_1.default)(app)
                .put('/api/devices/device1')
                .set('Authorization', 'Bearer valid-token')
                .send(updateData);
            // Assert
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('message', 'At least one field (name or type) must be provided for update');
        }));
        it('should return 400 if device type is invalid', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            const updateData = {
                type: 'INVALID_TYPE'
            };
            // Act
            const response = yield (0, supertest_1.default)(app)
                .put('/api/devices/device1')
                .set('Authorization', 'Bearer valid-token')
                .send(updateData);
            // Assert
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('message', expect.stringContaining('Invalid device type'));
        }));
    });
    describe('DELETE /api/devices/:id', () => {
        it('should delete a device', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            const existingDevice = {
                id: 'device1',
                name: 'My Phone',
                type: 'MOBILE',
                identifier: 'device-123',
                userId: mockUser.userId,
                lastSeen: new Date(),
                createdAt: new Date(),
                updatedAt: new Date()
            };
            setup_1.prismaMock.device.findFirst.mockResolvedValue(existingDevice);
            setup_1.prismaMock.device.delete.mockResolvedValue({});
            // Act
            const response = yield (0, supertest_1.default)(app)
                .delete('/api/devices/device1')
                .set('Authorization', 'Bearer valid-token');
            // Assert
            expect(setup_1.prismaMock.device.findFirst).toHaveBeenCalledWith({
                where: {
                    id: 'device1',
                    userId: mockUser.userId
                }
            });
            expect(setup_1.prismaMock.device.delete).toHaveBeenCalledWith({
                where: {
                    id: 'device1'
                }
            });
            expect(response.status).toBe(204);
        }));
        it('should return 404 if device is not found', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            setup_1.prismaMock.device.findFirst.mockResolvedValue(null);
            // Act
            const response = yield (0, supertest_1.default)(app)
                .delete('/api/devices/nonexistent')
                .set('Authorization', 'Bearer valid-token');
            // Assert
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('message', 'Device not found or does not belong to the user');
        }));
    });
    describe('POST /api/devices/:id/verify', () => {
        it('should verify a device', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            const verificationData = {
                verificationCode: '123456'
            };
            const existingDevice = {
                id: 'device1',
                name: 'My Phone',
                type: 'MOBILE',
                identifier: 'device-123',
                userId: mockUser.userId,
                lastSeen: new Date(),
                createdAt: new Date(),
                updatedAt: new Date()
            };
            const updatedDevice = Object.assign(Object.assign({}, existingDevice), { lastSeen: new Date() });
            setup_1.prismaMock.device.findFirst.mockResolvedValue(existingDevice);
            setup_1.prismaMock.device.update.mockResolvedValue(updatedDevice);
            // Act
            const response = yield (0, supertest_1.default)(app)
                .post('/api/devices/device1/verify')
                .set('Authorization', 'Bearer valid-token')
                .send(verificationData);
            // Assert
            expect(setup_1.prismaMock.device.findFirst).toHaveBeenCalledWith({
                where: {
                    id: 'device1',
                    userId: mockUser.userId
                }
            });
            expect(setup_1.prismaMock.device.update).toHaveBeenCalledWith({
                where: {
                    id: 'device1'
                },
                data: {
                    lastSeen: expect.any(Date)
                }
            });
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('id', 'device1');
            expect(response.body).toHaveProperty('message', 'Device verified successfully');
        }));
        it('should return 400 if verification code is invalid', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            const verificationData = {
                verificationCode: '12345' // Not 6 digits
            };
            // Act
            const response = yield (0, supertest_1.default)(app)
                .post('/api/devices/device1/verify')
                .set('Authorization', 'Bearer valid-token')
                .send(verificationData);
            // Assert
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('message', 'Invalid verification code format. Must be a 6-digit number.');
        }));
        it('should return 404 if device is not found', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            const verificationData = {
                verificationCode: '123456'
            };
            setup_1.prismaMock.device.findFirst.mockResolvedValue(null);
            // Act
            const response = yield (0, supertest_1.default)(app)
                .post('/api/devices/nonexistent/verify')
                .set('Authorization', 'Bearer valid-token')
                .send(verificationData);
            // Assert
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('message', 'Device not found or does not belong to the user');
        }));
    });
});
