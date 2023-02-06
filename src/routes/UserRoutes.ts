import express from 'express';
import {
    RecoverPassword,
    ResendVerification,
    ResetPassword,
    VerifyEmail,
    VerifyPasswordOTP,
    loginUser,
    registerUser,
} from '@controllers/userController';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/resend', ResendVerification);
router.post('/verify', VerifyEmail);
router.post('/recover', RecoverPassword);
router.post('/verifypasswordotp', VerifyPasswordOTP);
router.post('/reset', ResetPassword);

export default router;
