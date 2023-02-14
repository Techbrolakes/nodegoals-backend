"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendOTP = void 0;
const mailgen_1 = __importDefault(require("mailgen"));
const OtpModel_1 = __importDefault(require("../../models/OtpModel"));
const nodemailer_1 = require("../nodemailer");
const util_1 = require("../../utils/util");
const mailGenerator = new mailgen_1.default({
    theme: 'default',
    product: {
        name: 'Goals Base',
        link: 'https://www.linkedin.com/in/lekandar/',
    },
});
const sendOTP = async ({ email, subject, message, duration = 1 }) => {
    const payload = { email, subject, message };
    const emailBody = mailGenerator.generate({
        body: {
            intro: message,
            action: {
                instructions: `To get started with your account, please enter this otp ${util_1.OTPGenerator}, it will expiry in ${duration} hours time`,
                button: {
                    color: 'green',
                    text: 'Welcome to GoalBase',
                    link: 'https://www.linkedin.com/in/lekandar/',
                },
            },
        },
    });
    try {
        if (!payload) {
            throw Error('Provide Value Fields For Email, Subject, Message');
        }
        await OtpModel_1.default.deleteOne({ email });
        const mailOptions = {
            from: process.env.SMTP_USER,
            to: email,
            subject: subject,
            html: emailBody,
        };
        await (0, nodemailer_1.sendEmail)(mailOptions);
        const newOTP = await new OtpModel_1.default({
            email,
            otp: util_1.OTPGenerator,
            createdAt: Date.now(),
            expiresAt: Date.now() + 3600000 * +duration,
        });
        const createdOTPRecord = await newOTP.save();
        return createdOTPRecord;
    }
    catch (error) {
        console.log(error);
    }
};
exports.sendOTP = sendOTP;
