/* eslint-disable @typescript-eslint/no-explicit-any */
import otpGenerator from "otp-generator"
import nodemailer from "nodemailer"
import dotenv from "dotenv"

dotenv.config()
 
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,// use SSL
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
    tls: {
    rejectUnauthorized: false,
  },
})
// test transporter 
transporter.verify((error) => {
  if (error) {
    console.log(error);
  }else{
    console.log("Server is ready to take our messages");
  }
})


export const sendEmail = async (mailOptions: any) => {
  try {
    await transporter.sendMail(mailOptions)
    return;
  } catch (error) {
    console.log(error);
  }
}



// Generate OTP
export const OTPGenerator = otpGenerator.generate(4, { digits: true, specialChars: false, lowerCaseAlphabets: false, upperCaseAlphabets: false })


