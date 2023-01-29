/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from "express";
import User from "@models/UserModel";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv"
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


  // Generate Jwt token
  const generateToken = (id: any) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'jwt', {
      expiresIn: '30d'
    })
  }
