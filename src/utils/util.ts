import otpGenerator from 'otp-generator';
import jwt from "jsonwebtoken";
import OTP from '@models/OtpModel';
import { IMailOptions } from './interfaces';
import { sendOTP } from '@services/mailgen';
import { IEmail, IEmailOTP } from './types';
import User from '@models/UserModel';

// Send Verification Email
export const SendVerificationOTPEmail = async (email:any) => {
  try {
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      throw new Error("Email does not exist")
    }
    const otpDetails = {
      email,
      subject: "Email Verification",
      message: "Verify your email with the code below",
      duration: 1
    }
    const createdOTP = await sendOTP(otpDetails)
    return createdOTP
  } catch (error: any) {
    throw new Error(error)
  }
}

// Delete OTP 
export const deleteOtp = async( { email }:IEmail ) => {
  try {
    await OTP.deleteOne({email})    
  } catch (error:any) {
    throw new Error(error)
  }
}

// Verify OTP 
export const VerifyOtp = async ({email, otp}: IEmailOTP) => {
  try {
    if (!email && !otp) { 
      throw new Error("No Email or otp")
    }
    // ensure otp record exists
    const matchedOTPRecord = await OTP.findOne({ email })
    if (!matchedOTPRecord) {
      throw new Error("No otp record found ")
    }
    const { expiresAt } = matchedOTPRecord
    // checking for expired code
   if (typeof expiresAt === 'undefined' || expiresAt.getTime() < Date.now()) { 
     await OTP.deleteOne({ email });
     throw new Error("Code has expired")
  }
    const validOTP = otp
    return {valid: validOTP}
  } catch (error:any) {
    throw new Error(error)
  }
}

// Send Email Function
export const SendEmail = async ({duration,email,message,subject}:IMailOptions) => {
  try {
    const createdOTP = await sendOTP({email,subject,message,duration})
    return createdOTP
  } catch (error:any) {
    throw new Error(error)
  }
}



// Generate OTP
export const OTPGenerator = otpGenerator.generate(4, {
  digits: true,
  specialChars: false,
  lowerCaseAlphabets: false,
  upperCaseAlphabets: false
})


  // Generate Jwt token
export const generateToken = (id: any) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'jwt', {
      expiresIn: '30d'
    })
  }
