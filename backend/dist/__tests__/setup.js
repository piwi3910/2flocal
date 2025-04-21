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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prismaMock = void 0;
const client_1 = require("@prisma/client");
const jest_mock_extended_1 = require("jest-mock-extended");
const dotenv = __importStar(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Load test environment variables
dotenv.config({ path: path_1.default.resolve(__dirname, '../../.env.test') });
// Mock Prisma client
jest.mock('@prisma/client', () => ({
    PrismaClient: jest.fn(),
}));
// Create a mock instance of Prisma client
exports.prismaMock = (0, jest_mock_extended_1.mockDeep)();
// Reset mocks before each test
beforeEach(() => {
    (0, jest_mock_extended_1.mockReset)(exports.prismaMock);
    // Ensure $executeRaw is available for RefreshToken operations
    if (!exports.prismaMock.$executeRaw) {
        exports.prismaMock.$executeRaw = jest.fn().mockResolvedValue(1);
    }
    // Reset Date.now mock if it exists
    if (jest.isMockFunction(Date.now)) {
        jest.spyOn(Date, 'now').mockRestore();
    }
});
// Mock the Prisma client constructor to return our mock
client_1.PrismaClient.mockImplementation(() => exports.prismaMock);
// Mock QRCode, jsQR, and canvas modules
jest.mock('qrcode', () => ({
    toDataURL: jest.fn().mockResolvedValue('data:image/png;base64,mockQRCodeImage'),
}));
jest.mock('jsqr', () => jest.fn().mockReturnValue({
    data: 'otpauth://totp/Test:test@example.com?secret=ABCDEFGHIJKLMNOP&issuer=Test',
    location: { topLeftCorner: {}, topRightCorner: {}, bottomLeftCorner: {}, bottomRightCorner: {} }
}));
jest.mock('canvas', () => ({
    createCanvas: jest.fn().mockReturnValue({
        width: 200,
        height: 200,
        getContext: jest.fn().mockReturnValue({
            drawImage: jest.fn(),
            getImageData: jest.fn().mockReturnValue({
                data: new Uint8ClampedArray(200 * 200 * 4),
                width: 200,
                height: 200
            })
        })
    }),
    loadImage: jest.fn().mockResolvedValue({
        width: 200,
        height: 200
    })
}));
