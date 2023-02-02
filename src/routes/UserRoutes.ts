import express from "express";
import {  loginUser, registerUser, verifyAccount } from "@controllers/userController";


const router = express.Router();

router.post("/register", registerUser );

router.post("/login", loginUser);

// OTP
router.post("/verify", verifyAccount );


export default router;