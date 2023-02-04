import otpGenerator from 'otp-generator';
import jwt from "jsonwebtoken";
import OTP from '@models/OtpModel';
import { IMailOptions } from './interfaces';
import { sendOTP } from '@services/mailgen';
import { IEmailOTP } from './types';




// Delete OTP 
export const deleteOtp = async (email:any) => {
  try {
    await OTP.deleteOne({email})    
  } catch (error) {
    throw error
  }
}

// Verify OTP 
export const VerifyOtp = async ({email, otp}: IEmailOTP) => {
  try {
    if (!email && !otp) { 
      throw Error("No Email or otp")
    }
    // ensure otp record exists
    const matchedOTPRecord = await OTP.findOne({ email })
    if (!matchedOTPRecord) {
      throw Error("No otp record found ")
    }
    const { expiresAt } = matchedOTPRecord
    // checking for expired code
   if (typeof expiresAt === 'undefined' || expiresAt.getTime() < Date.now()) { 
     await OTP.deleteOne({ email });
     throw Error("Code has expired")
  }
    const validOTP = otp
    return {valid: validOTP}
  } catch (error) {
    throw(error)
  }
}

// Send Email Function
export const SendEmail = async ({duration,email,message,subject}:IMailOptions) => {
  try {
    const createdOTP = await sendOTP({email,subject,message,duration})
    return createdOTP
  } catch (error) {
    throw(error)
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
