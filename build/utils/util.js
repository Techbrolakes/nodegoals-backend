"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateToken = exports.OTPGenerator = exports.VerifyOtp = exports.deleteOtp = exports.SendVerificationOTPEmail = exports.VerifyUserEmail = void 0;
const otp_generator_1 = __importDefault(require("otp-generator"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const UserModel_1 = __importDefault(require("../models/UserModel"));
const mailgen_1 = require("../services/mailgen");
const OtpModel_1 = __importDefault(require("../models/OtpModel"));
const VerifyUserEmail = async ({ email, otp }) => {
    try {
        const validOTP = await (0, exports.VerifyOtp)({ email, otp });
        if (!validOTP) {
            throw new Error('Invalid Code Passed, Check your inbox');
        }
        await UserModel_1.default.updateOne({ email }, { verified: true });
        await (0, exports.deleteOtp)({ email });
        return;
    }
    catch (error) {
        throw error;
    }
};
exports.VerifyUserEmail = VerifyUserEmail;
const SendVerificationOTPEmail = async (email) => {
    try {
        const existingUser = await UserModel_1.default.findOne({ email });
        if (!existingUser) {
            throw new Error('Email does not exist');
        }
        const otpDetails = {
            email,
            subject: 'Email Verification',
            message: 'Verify your email with the code below',
            duration: 1,
        };
        const createdOTP = await (0, mailgen_1.sendOTP)(otpDetails);
        return createdOTP;
    }
    catch (error) {
        throw new Error(error);
    }
};
exports.SendVerificationOTPEmail = SendVerificationOTPEmail;
const deleteOtp = async ({ email }) => {
    try {
        await OtpModel_1.default.deleteOne({ email });
    }
    catch (error) {
        throw new Error(error);
    }
};
exports.deleteOtp = deleteOtp;
const VerifyOtp = async ({ email, otp }) => {
    try {
        if (!email && !otp) {
            throw new Error('No Email or otp');
        }
        const matchedOTPRecord = await OtpModel_1.default.findOne({ email });
        if (!matchedOTPRecord) {
            throw new Error('Try resending the otp record');
        }
        const { expiresAt } = matchedOTPRecord;
        if (typeof expiresAt === 'undefined' || expiresAt.getTime() < Date.now()) {
            await OtpModel_1.default.deleteOne({ email });
            throw new Error('Code has expired');
        }
        if (matchedOTPRecord.otp === otp) {
            return true;
        }
        else {
            throw new Error('Incorrect OTP, Kindly Try Again');
        }
    }
    catch (error) {
        throw new Error(error);
    }
};
exports.VerifyOtp = VerifyOtp;
exports.OTPGenerator = otp_generator_1.default.generate(4, {
    digits: true,
    specialChars: false,
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
});
const generateToken = (id) => {
    return jsonwebtoken_1.default.sign({ id }, process.env.JWT_SECRET || 'jwt', {
        expiresIn: '30d',
    });
};
exports.generateToken = generateToken;
