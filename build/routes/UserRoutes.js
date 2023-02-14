"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controllers/userController");
const router = express_1.default.Router();
router.post('/register', userController_1.registerUser);
router.post('/login', userController_1.loginUser);
router.post('/resend', userController_1.ResendVerification);
router.post('/verify', userController_1.VerifyEmail);
router.post('/recover', userController_1.RecoverPassword);
router.post('/verifypasswordotp', userController_1.VerifyPasswordOTP);
router.post('/reset', userController_1.ResetPassword);
exports.default = router;
