import otpGenerator from 'otp-generator';
import jwt from "jsonwebtoken";

// Generate OTP
export const OTPGenerator = otpGenerator.generate(4, {
  digits: true,
  specialChars: false,
  lowerCaseAlphabets: false,
  upperCaseAlphabets: false
})


  // Generate Jwt token
export const generateToken = (id: any) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'jwt', {
      expiresIn: '30d'
    })
  }
