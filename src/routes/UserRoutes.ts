import express from "express";
import { SendVerificationOTPEmail, VerifyUserEmail, loginUser, registerUser } from "@controllers/userController";


const router = express.Router();

router.post("/register", registerUser );
router.post("/login", loginUser);
router.post("/sendmail", SendVerificationOTPEmail)
router.post("/verify", VerifyUserEmail)                          





export default router;