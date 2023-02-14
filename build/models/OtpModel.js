"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const OTPSchema = new mongoose_1.Schema({
    email: {
        type: String,
        required: true
    },
    otp: String,
    createdAt: Date,
    expiresAt: Date
});
const OTP = (0, mongoose_1.model)('OTP', OTPSchema);
exports.default = OTP;
