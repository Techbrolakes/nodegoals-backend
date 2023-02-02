import express from "express";
import {  VerifyOtp, loginUser, registerUser } from "@controllers/userController";


const router = express.Router();

router.post("/register", registerUser );

router.post("/login", loginUser);

router.post("/verify", VerifyOtp)




export default router;