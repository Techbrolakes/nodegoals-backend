import express from "express";
import {  ResendVerification, VerifyEmail, loginUser, registerUser } from "@controllers/userController";


const router = express.Router();

router.post("/register", registerUser );
router.post("/login", loginUser);
router.post("/resend", ResendVerification)
router.post("/verify", VerifyEmail)                          





export default router;