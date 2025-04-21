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
const admin_1 = __importDefault(require("../../routes/admin"));
const setup_1 = require("../../__tests__/setup");
// Mock dependencies
jest.mock('jsonwebtoken');
jest.mock('../../middleware/authMiddleware', () => ({
    authenticateToken: (req, res, next) => {
        if (req.headers.authorization) {
            req.user = { userId: 'admin123', email: 'admin@example.com' };
            next();
        }
        else {
            res.status(401).json({ message: 'No token provided' });
        }
    }
}));
// Mock admin middleware
jest.mock('../../middleware/adminMiddleware', () => ({
    checkAdmin: (req, res, next) => {
        if (req.user && req.user.userId === 'admin123') {
            next();
        }
        else {
            res.status(403).json({ message: 'Access denied. Admin privileges required.' });
        }
    }
}));
describe('Admin API', () => {
    // Create a test app
    const app = (0, express_1.default)();
    app.use(express_1.default.json());
    app.use('/api/admin', admin_1.default);
    // Add prisma mock to app.locals
    app.locals.prisma = setup_1.prismaMock;
    beforeEach(() => {
        jest.clearAllMocks();
    });
    describe('DELETE /api/admin/devices/:id', () => {
        it('should delete a device as admin', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            setup_1.prismaMock.device.deleteMany.mockResolvedValue({ count: 1 });
            // Act
            const response = yield (0, supertest_1.default)(app)
                .delete('/api/admin/devices/device1')
                .set('Authorization', 'Bearer valid-admin-token');
            // Assert
            expect(setup_1.prismaMock.device.deleteMany).toHaveBeenCalledWith({
                where: {
                    id: 'device1'
                }
            });
            expect(response.status).toBe(204);
        }));
        it('should return 404 if device is not found', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            setup_1.prismaMock.device.deleteMany.mockResolvedValue({ count: 0 });
            // Act
            const response = yield (0, supertest_1.default)(app)
                .delete('/api/admin/devices/nonexistent')
                .set('Authorization', 'Bearer valid-admin-token');
            // Assert
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('message', 'Device not found');
        }));
        it('should return 401 if not authenticated', () => __awaiter(void 0, void 0, void 0, function* () {
            // Act
            const response = yield (0, supertest_1.default)(app)
                .delete('/api/admin/devices/device1');
            // Assert
            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('message', 'No token provided');
        }));
        it('should return 403 if authenticated but not admin', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange - Override the mock for this test
            jest.requireMock('../../middleware/adminMiddleware').checkAdmin =
                (req, res, next) => {
                    res.status(403).json({ message: 'Access denied. Admin privileges required.' });
                };
            // Act
            const response = yield (0, supertest_1.default)(app)
                .delete('/api/admin/devices/device1')
                .set('Authorization', 'Bearer valid-non-admin-token');
            // Assert
            expect(response.status).toBe(403);
            expect(response.body).toHaveProperty('message', 'Access denied. Admin privileges required.');
        }));
        it('should handle database errors', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            const dbError = new Error('Database error');
            setup_1.prismaMock.device.deleteMany.mockRejectedValue(dbError);
            // Act
            const response = yield (0, supertest_1.default)(app)
                .delete('/api/admin/devices/device1')
                .set('Authorization', 'Bearer valid-admin-token');
            // Assert
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('message', 'Internal server error');
        }));
    });
});
