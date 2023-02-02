/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from "express";
import User from "@models/UserModel";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv"
import OTP from "@models/OtpModel";
import Mailgen from "mailgen";
import { OTPGenerator, sendEmail } from "@utils/util";
dotenv.config()


const mailGenerator = new Mailgen({
  theme: 'default',
  product: {
    name: 'Goals Base',
    link: 'http://yourproductname.com/'
  }
});

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
    res.json(createdOTP)
  } catch (error) {
    console.log(error)
  }
}

// FUNCTION THAT WILL GENERATE AND SEND THE OTP
export const sendOTP = async ({ email, subject, message, duration = 1 }: ISendMail) => {
      const generatedOtp = OTPGenerator

  const emailBody = mailGenerator.generate({
  body: {
    intro: 'Welcome to your new Goals Base account',
    action: {
      instructions: `To get started with your account, please enter this otp ${generatedOtp}, it will expiry in ${duration} hours time`,
      button: {
        color: 'green',
        text: 'Welcome to GoalBase',
        link: 'http://yourproductname.com/confirm'
      }
    }
  }
});
  try {
    if (!email && !subject && !message) {
      throw Error("Provide Value Fields For Email, Subject, Message")
    }
    // clear any old record
    await OTP.deleteOne({ email})
    // Generated OTP
  
    // send mail
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: 'Message From Goals Base',
      html: emailBody,
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
