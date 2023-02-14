"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const userSchema = new mongoose_1.Schema({
    first_name: { type: String, required: [true, 'first name required'] },
    last_name: { type: String, required: [true, 'last name required'] },
    email: { type: String, required: [true, 'email required'], unique: true },
    password: { type: String, required: [true, 'password required'] },
    confirm_password: { type: String, required: [true, 'confirm password required'] },
    verified: { type: Boolean, default: false },
});
const User = (0, mongoose_1.model)('Users', userSchema);
exports.default = User;
