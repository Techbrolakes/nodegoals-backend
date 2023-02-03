/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from "express";
import User from "@models/UserModel";
import bcrypt from "bcrypt";
import dotenv from "dotenv"
import OTP from "@models/OtpModel";
import { generateToken } from "@utils/util";
import { sendOTP } from "@services/mailgen";
dotenv.config()


export const registerUser = async (req: Request, res: Response) => {
  const { first_name, last_name, email, password, confirm_password } = req.body;

// Check if the user exists
  const userExists = await User.findOne({ email })
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
 const salt = await bcrypt.genSalt(10)
 const hash_password = await bcrypt.hash(password, salt)
 const hash_confirm_password = await bcrypt.hash(confirm_password, salt)

  try {
    const user = await User.create({ first_name, last_name, email, password: hash_password, confirm_password: hash_confirm_password });
    if (user) {
      res.status(201).json({
        success: true,
        message: "User created successfully",
        data: {
          _id: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        password: user.password,
        confirm_password: user.confirm_password,
        token: generateToken(user._id)
       }
      })
    }
  } catch (error:any) {
     return res.status(400).json({ message: error.message });
  }
};


export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  
  const user = await User.findOne({ email })
  if (!user) {
    return res.status(400).json({success: false , message: 'Email does not exist' });
  }
  
  if (user && (await bcrypt.compare(password, user.password))) {
        res.status(201).json({
        success: true,
        message: "User Successfully Logged in",
        token: generateToken(user._id)
      })
  } else {
     return res.status(400).json({ success: false, message: 'Invalid Password' });
  }
} 

// Verify Email
export const SendVerificationOTPEmail = async (req: Request, res: Response) => {
  const {email} = req.body
  try {
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      throw Error("Email does not exist")
    }

    const otpDetails = {
      email,
      subject: "Email Verification",
      message: "Verify your email with the code below",
      duration: 1
    }
    const createdOTP = await sendOTP(otpDetails)
     return res.status(200).json(createdOTP)
  } catch (error: any) {
    return res.status(400).send(error.message)
  }
}


// Verify OTP 
export const VerifyOtp = async (req: Request, res: Response) => {
  const { email, otp } = req.body;
  try {
    if (!email && !otp) { 
      return res.status(400).json({ success: false, message: 'No Email and Otp' });
    }
    // ensure otp record exists
    const matchedOTPRecord = await OTP.findOne({ email })
    if (!matchedOTPRecord) {
     return res.status(400).json({ success: false, message: 'No otp record' });
    }
    const { expiresAt } = matchedOTPRecord
    // checking for expired code
   if (typeof expiresAt === 'undefined' || expiresAt.getTime() < Date.now()) { 
     await OTP.deleteOne({ email });
     return res.status(400).json({ success: false, message: 'Code has expired. Request for a new' });
  }

    const validOTP = otp
    return res.status(200).json({valid: validOTP})
  } catch (error) {
    throw(error)
  }
}

// Delete OTP 
export const DeleteOtp = async (req: Request, res: Response) => {
  const {email} = req.body
  try {
    await OTP.deleteOne({email})    
  } catch (error) {
    throw error
  }
}



// Send Email Controller
export const SendEmail = async (req: Request, res: Response) => {
  try {
    const { email, subject, message, duration } = req.body;

    const createdOTP = await sendOTP({
      email,
      subject,
      message,
      duration,
    })
    res.json(createdOTP)
  } catch (error) {
    console.log(error)
  }
}

