import { Request, Response } from "express";
import User from "@models/UserModel";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

export const registerUser = async (req: Request, res: Response) => {
  const { first_name, last_name, email, password, confirm_password } = req.body;

  if (!first_name || !last_name || !email || !password || !confirm_password) {
    return res.status(400).json({ message: "Please add all fields" });
  }

  const newUser = new User({ first_name, last_name, email, password, confirm_password });
  try {
    await newUser.save();
    res.send({ message: "User registered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Server error" });
  }
};


