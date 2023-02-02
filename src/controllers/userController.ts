/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from "express";
import User from "@models/UserModel";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv"
import OTP from "@models/OtpModel";
import { generateOtp, sendEmail } from "@utils/util";
dotenv.config()

interface ISendMail {
  email: string,
  message: string,
  subject: string,
  duration: number
}
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


// VERIFY OTP CONTROLLER
export const verifyAccount = async (req: Request, res: Response) => {
  try {
    const { email, subject, message, duration } = req.body;

    const createdOTP = await sendOTP({
      email,
      subject,
      message,
      duration,
    })
    res.send(200).json(createdOTP)
  } catch (error) {
    console.log(error)
  }
}

// FUNCTION THAT WILL GENERATE AND SEND THE OTP
export const sendOTP = async ({ email, subject, message, duration = 1 }: ISendMail) => {
  try {
    if (!email && !subject && !message) {
      throw Error("Provide Value Fields For Email, Subject, Message")
    }
    // clear any old record
    await OTP.deleteOne({ email})
    // Generated OTP
    const generatedOtp = await generateOtp()
    // send mail
    const mailOptions = {
      from: "lekandar@hotmail.com",
      to: email,
      subject,
      html: `
      <div
        class="container"
        style="max-width: 90%; margin: auto; padding-top: 20px"
      >
        <h2>${message}</h2>
        <h4>You are officially In ✔</h4>
        <p style="margin-bottom: 30px;">Pleas enter the sign up OTP to get started</p>
        <h1 style="font-size: 40px; letter-spacing: 2px; text-align:center;">${generatedOtp} it will expire in ${duration} hour.</h1>
   </div>
    `,
    };

    await sendEmail(mailOptions)

    const newOTP = await new OTP({
      email,
      otp: generatedOtp
    })
    
    const createdOTPRecord = await newOTP.save()
    return createdOTPRecord
  } catch (error) {
    console.log(error)
  }
}

  // Generate Jwt token
  const generateToken = (id: any) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'jwt', {
      expiresIn: '30d'
    })
  }
