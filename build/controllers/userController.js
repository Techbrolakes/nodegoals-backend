"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResetPassword = exports.VerifyPasswordOTP = exports.RecoverPassword = exports.VerifyEmail = exports.ResendVerification = exports.loginUser = exports.registerUser = void 0;
const UserModel_1 = __importDefault(require("../models/UserModel"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const dotenv_1 = __importDefault(require("dotenv"));
const util_1 = require("../utils/util");
const mailgen_1 = require("../services/mailgen");
dotenv_1.default.config();
const registerUser = async (req, res) => {
    const { first_name, last_name, email, password, confirm_password } = req.body;
    const userExists = await UserModel_1.default.findOne({ email });
    if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
    }
    if (!password) {
        return res.status(400).json({ message: 'password required' });
    }
    if (!confirm_password) {
        return res.status(400).json({ message: 'confirm password required' });
    }
    const salt = await bcrypt_1.default.genSalt(10);
    const hash_password = await bcrypt_1.default.hash(password, salt);
    const hash_confirm_password = await bcrypt_1.default.hash(confirm_password, salt);
    try {
        const user = await UserModel_1.default.create({
            first_name,
            last_name,
            email,
            password: hash_password,
            confirm_password: hash_confirm_password,
        });
        await (0, util_1.SendVerificationOTPEmail)(email);
        if (user) {
            res.status(201).json({
                success: true,
                message: `A verification mail has been sent to ${email}`,
                data: null,
            });
        }
    }
    catch (error) {
        return res.status(400).json({ message: error.message });
    }
};
exports.registerUser = registerUser;
const loginUser = async (req, res) => {
    const { email, password } = req.body;
    const user = await UserModel_1.default.findOne({ email });
    if (!user) {
        return res.status(400).json({ success: false, message: 'Email does not exist' });
    }
    if (!user.verified) {
        return res.status(400).json({
            success: false,
            isVerified: user.verified,
            message: 'Email has not been verified yet, Check your inbox',
        });
    }
    if (user && (await bcrypt_1.default.compare(password, user.password))) {
        res.status(201).json({
            success: true,
            message: 'User Successfully Logged in',
            token: (0, util_1.generateToken)(user._id),
        });
    }
    else {
        return res.status(400).json({ success: false, message: 'Invalid Password' });
    }
};
exports.loginUser = loginUser;
const ResendVerification = async (req, res) => {
    const { email } = req.body;
    try {
        const existingUser = UserModel_1.default.findOne({ email });
        if (!existingUser) {
            return res.status(400).json({ success: false, message: 'Email does not exist' });
        }
        await (0, util_1.SendVerificationOTPEmail)(email);
        res.status(201).json({
            success: true,
            message: 'OTP Code Sent successfully',
        });
    }
    catch (error) {
        return res.status(404).json({ success: false, message: error.message });
    }
};
exports.ResendVerification = ResendVerification;
const VerifyEmail = async (req, res) => {
    const { email, otp } = req.body;
    try {
        if (!email && !otp) {
            return res.status(404).json({ success: false, message: 'Otp & Email not found' });
        }
        await (0, util_1.VerifyUserEmail)({ email, otp });
        res.status(200).json({ success: true, message: 'Email Successfully verified, Welcome to Goalbase' });
    }
    catch (error) {
        return res.status(404).json({ success: false, message: error.message });
    }
};
exports.VerifyEmail = VerifyEmail;
const RecoverPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await UserModel_1.default.findOne({ email });
        if (!user?.verified) {
            await (0, util_1.SendVerificationOTPEmail)(email);
            return res
                .status(404)
                .json({ success: false, message: `Email is not verified yet, A mail has been sent to your inbox` });
        }
        if (user) {
            const otpDetails = {
                email,
                subject: 'Reset Password',
                message: 'Enter the code below to reset your password',
                duration: 1,
            };
            await (0, mailgen_1.sendOTP)(otpDetails);
            return res.status(404).json({ success: true, message: `A reset email has been sent to ${email}` });
        }
        else {
            return res.status(404).json({ success: false, message: `Email Does Not Exist` });
        }
    }
    catch (error) {
        return res.status(404).json({ success: false, message: error.message });
    }
};
exports.RecoverPassword = RecoverPassword;
const VerifyPasswordOTP = async (req, res) => {
    const { email, otp } = req.body;
    try {
        const user = await UserModel_1.default.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, message: 'Email does not exist' });
        }
        if (!email && !otp) {
            return res.status(404).json({ success: false, message: 'Otp & Email not found' });
        }
        await (0, util_1.VerifyUserEmail)({ email, otp });
        res.status(200).json({
            success: true,
            message: 'OTP Successfully Verified, Kindly Reset Password',
            token: (0, util_1.generateToken)(user._id),
        });
    }
    catch (error) {
        return res.status(404).json({ success: false, message: error.message });
    }
};
exports.VerifyPasswordOTP = VerifyPasswordOTP;
const ResetPassword = async (req, res) => {
    const { password, email, otp, confirm_password } = req.body;
    try {
        if (!email) {
            throw Error('Email Field is required');
        }
        if (!otp) {
            throw Error('OTP Field is required');
        }
        if (!password) {
            throw Error('Password Field is required');
        }
        if (!confirm_password) {
            throw Error('Confirm Passsword Field is required');
        }
        if (password !== confirm_password) {
            throw Error('Password Mismatch');
        }
        const validOTP = await (0, util_1.VerifyOtp)({ email, otp });
        if (!validOTP) {
            throw Error('Invalid code passed. check your inbox');
        }
        const salt = await bcrypt_1.default.genSalt(10);
        const hash_password = await bcrypt_1.default.hash(password, salt);
        const hash_confirm_password = await bcrypt_1.default.hash(confirm_password, salt);
        await UserModel_1.default.updateOne({ email }, {
            confirm_password: hash_confirm_password,
            password: hash_password,
        });
        await (0, util_1.deleteOtp)(email);
        return res.status(200).json({ succes: true, message: 'Password Successfully Changed' });
    }
    catch (error) {
        return res.status(404).json({ success: false, message: error.message });
    }
};
exports.ResetPassword = ResetPassword;
