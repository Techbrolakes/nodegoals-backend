import otpGenerator from 'otp-generator';
import jwt from 'jsonwebtoken';
import OTP from '@models/OtpModel';
import { sendOTP } from '@services/mailgen';
import { IEmail, IEmailOTP } from './types';
import User from '@models/UserModel';

// Verify Email
export const VerifyUserEmail = async ({ email, otp }: IEmailOTP) => {
    try {
        const validOTP = await VerifyOtp({ email, otp });
        if (!validOTP) {
            throw new Error('Invalid Code Passed, Check your inbox');
        }
        await User.updateOne({ email }, { verified: true });
        await deleteOtp({ email });
        return;
    } catch (error) {
        throw error;
    }
};

// Send Verification Email
export const SendVerificationOTPEmail = async (email: any) => {
    try {
        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            throw new Error('Email does not exist');
        }
        const otpDetails = {
            email,
            subject: 'Email Verification',
            message: 'Verify your email with the code below',
            duration: 1,
        };
        const createdOTP = await sendOTP(otpDetails);
        return createdOTP;
    } catch (error: any) {
        throw new Error(error);
    }
};

// Delete OTP
export const deleteOtp = async ({ email }: IEmail) => {
    try {
        await OTP.deleteOne({ email });
    } catch (error: any) {
        throw new Error(error);
    }
};

// Verify OTP
export const VerifyOtp = async ({ email, otp }: IEmailOTP) => {
    try {
        if (!email && !otp) {
            throw new Error('No Email or otp');
        }
        // ensure otp record exists
        const matchedOTPRecord = await OTP.findOne({ email });
        if (!matchedOTPRecord) {
            throw new Error('User Does Not Exist');
        }
        const { expiresAt } = matchedOTPRecord;
        // checking for expired code
        if (typeof expiresAt === 'undefined' || expiresAt.getTime() < Date.now()) {
            await OTP.deleteOne({ email });
            throw new Error('Code has expired');
        }
        if (matchedOTPRecord.otp === otp) {
            return true;
        } else {
            throw new Error('Incorrect OTP, Kindly Try Again');
        }
    } catch (error: any) {
        throw new Error(error);
    }
};

// Generate OTP
export const OTPGenerator = otpGenerator.generate(4, {
    digits: true,
    specialChars: false,
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
});

// Generate Jwt token
export const generateToken = (id: any) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'jwt', {
        expiresIn: '30d',
    });
};
