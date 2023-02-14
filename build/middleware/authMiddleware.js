"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const authMiddleware = async (req, res, next) => {
    const token = req.body.token || req.query.token || req.headers['x-auth-token'];
    if (!token) {
        return res.status(403).json({ message: 'No token, authorization denied' });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'jwt');
        req.token = decoded;
        req.user = decoded;
    }
    catch (error) {
        res.status(401).json({ message: 'Token is not valid' });
    }
    next();
};
exports.default = authMiddleware;
