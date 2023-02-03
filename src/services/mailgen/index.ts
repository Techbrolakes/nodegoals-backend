import Mailgen from "mailgen";
import OTP from "@models/OtpModel";
import { IMailOptions } from "@utils/interfaces";
import { OTPGenerator } from "@utils/util";
import { sendEmail } from "@services/nodemailer";

// Configure mailgen by setting a theme and your product info
const mailGenerator = new Mailgen({
  theme: 'default',
  product: {
    name: 'Goals Base',
    link: 'https://www.linkedin.com/in/lekandar/'
  }
});

// This is the function in charge of sending the email and generating the OTP
export const sendOTP = async ({ email, subject, message, duration = 1 }: IMailOptions) => {
  const payload = {email, subject, message}
  const emailBody = mailGenerator.generate({
  body: {
    intro: message,
    action: {
      instructions: `To get started with your account, please enter this otp ${OTPGenerator}, it will expiry in ${duration} hours time`,
      button: {
        color: 'green',
        text: 'Welcome to GoalBase',
        link: 'https://www.linkedin.com/in/lekandar/'
      }
    }
  }
  });
     
  try {
    if (!payload) {
      throw Error("Provide Value Fields For Email, Subject, Message")
      }
    await OTP.deleteOne({ email})
    const mailOptions = {
      from: process.env.SMTP_USER as string,
      to: email,
      subject: subject,
      html: emailBody,
      };
      await sendEmail(mailOptions)
      
    const newOTP = await new OTP({
      email,
      otp: OTPGenerator,
      createdAt: Date.now(),
      expiresAt: Date.now() + 3600000 * +duration,
    })  
    const createdOTPRecord = await newOTP.save()
    return createdOTPRecord
  } catch (error) {
    console.log(error)
  }
}