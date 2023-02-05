/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import User from '@models/UserModel';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { SendVerificationOTPEmail, VerifyUserEmail, generateToken } from '@utils/util';
dotenv.config();

export const registerUser = async (req: Request, res: Response) => {
    const { first_name, last_name, email, password, confirm_password } = req.body;

    // Check if the user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
    }

    if (!password) {
        return res.status(400).json({ message: 'password required' });
    }

    if (!confirm_password) {
        return res.status(400).json({ message: 'confirm password required' });
    }
    // Hash Password
    const salt = await bcrypt.genSalt(10);
    const hash_password = await bcrypt.hash(password, salt);
    const hash_confirm_password = await bcrypt.hash(confirm_password, salt);

    try {
        const user = await User.create({
            first_name,
            last_name,
            email,
            password: hash_password,
            confirm_password: hash_confirm_password,
        });
        await SendVerificationOTPEmail(email);
        if (user) {
            res.status(201).json({
                success: true,
                message: `A verification mail has been sent to ${email}`,
                data: null,
            });
        }
    } catch (error: any) {
        return res.status(400).json({ message: error.message });
    }
};

// Login Function
export const loginUser = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
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

    if (user && (await bcrypt.compare(password, user.password))) {
        res.status(201).json({
            success: true,
            message: 'User Successfully Logged in',
            token: generateToken(user._id),
        });
    } else {
        return res.status(400).json({ success: false, message: 'Invalid Password' });
    }
};

// Resend OTP Code
export const ResendVerification = async (req: Request, res: Response) => {
    const { email } = req.body;
    try {
        const existingUser = User.findOne({ email });
        if (!existingUser) {
            return res.status(400).json({ success: false, message: 'Email does not exist' });
        }
        await SendVerificationOTPEmail(email);
        res.status(201).json({
            success: true,
            message: 'OTP Code Sent successfully',
        });
    } catch (error: any) {
        return res.status(404).json({ success: false, message: error.message });
    }
};

// Verify User Email Address
export const VerifyEmail = async (req: Request, res: Response) => {
    const { email, otp } = req.body;
    try {
        if (!email && !otp) {
            return res.status(404).json({ success: false, message: 'Otp & Email not found' });
        }
        const result = await VerifyUserEmail({ email, otp });
        console.log(result);
        res.status(200).json({ success: true, message: 'Email Successfully verified, Welcome to Goalbase' });
    } catch (error: any) {
        return res.status(404).json({ success: false, message: error.message });
    }
};
