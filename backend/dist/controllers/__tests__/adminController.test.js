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
const adminController = __importStar(require("../adminController"));
describe('Admin Controller', () => {
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
        mockRequest.app = {
            locals: {
                prisma: setup_1.prismaMock
            }
        };
    });
    describe('adminDeleteDevice', () => {
        it('should return 400 if device ID is missing', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            mockRequest.params = {};
            // Act
            yield adminController.adminDeleteDevice(mockRequest, mockResponse, mockNext);
            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
                message: 'Device ID is required in URL parameters'
            }));
        }));
        it('should return 404 if device is not found', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            mockRequest.params = { id: 'nonexistent-device' };
            setup_1.prismaMock.device.deleteMany.mockResolvedValue({ count: 0 });
            // Act
            yield adminController.adminDeleteDevice(mockRequest, mockResponse, mockNext);
            // Assert
            expect(setup_1.prismaMock.device.deleteMany).toHaveBeenCalledWith({
                where: {
                    id: 'nonexistent-device'
                }
            });
            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
                message: 'Device not found'
            }));
        }));
        it('should delete device successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            mockRequest.params = { id: 'device1' };
            setup_1.prismaMock.device.deleteMany.mockResolvedValue({ count: 1 });
            // Act
            yield adminController.adminDeleteDevice(mockRequest, mockResponse, mockNext);
            // Assert
            expect(setup_1.prismaMock.device.deleteMany).toHaveBeenCalledWith({
                where: {
                    id: 'device1'
                }
            });
            expect(mockResponse.status).toHaveBeenCalledWith(204);
            expect(mockResponse.send).toHaveBeenCalled();
        }));
        it('should handle database errors', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            mockRequest.params = { id: 'device1' };
            const dbError = new Error('Database error');
            setup_1.prismaMock.device.deleteMany.mockRejectedValue(dbError);
            // Act
            yield adminController.adminDeleteDevice(mockRequest, mockResponse, mockNext);
            // Assert
            expect(mockNext).toHaveBeenCalledWith(dbError);
        }));
    });
});
