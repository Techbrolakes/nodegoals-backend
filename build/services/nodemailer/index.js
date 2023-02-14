"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const transporter = nodemailer_1.default.createTransport({
    host: process.env.SMTP_HOST,
    port: 465,
    secure: true,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
    tls: {
        rejectUnauthorized: false,
    },
});
transporter.verify((error) => {
    if (error) {
        console.log(error);
    }
    else {
        console.log('Server is ready to take our messages');
    }
});
const sendEmail = async (mailOptions) => {
    try {
        await transporter.sendMail(mailOptions);
        return;
    }
    catch (error) {
        console.log(error);
    }
};
exports.sendEmail = sendEmail;
