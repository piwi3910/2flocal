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
exports.checkAdmin = void 0;
const prisma_1 = require("../../prisma/src/generated/prisma");
const prisma = new prisma_1.PrismaClient();
const checkAdmin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    if (!userId) {
        // Should have been caught by authenticateToken, but double-check
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
    try {
        const user = yield prisma.user.findUnique({
            where: { id: userId },
            select: { isAdmin: true }, // Only select the isAdmin field
        });
        if (!user || !user.isAdmin) {
            res.status(403).json({ message: 'Forbidden: Requires admin privileges' });
            return;
        }
        // User is admin, proceed to the next handler
        next();
    }
    catch (error) {
        console.error('Admin check error:', error);
        res.status(500).json({ message: 'Internal server error during admin check' });
    }
});
exports.checkAdmin = checkAdmin;
