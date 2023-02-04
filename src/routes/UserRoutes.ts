import express from "express";
import {  ResendVerification, VerifyUserEmail, loginUser, registerUser } from "@controllers/userController";


const router = express.Router();

router.post("/register", registerUser );
router.post("/login", loginUser);
router.post("/resend", ResendVerification)
router.post("/verify", VerifyUserEmail)                          





export default router;