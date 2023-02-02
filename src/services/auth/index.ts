import OTP from "@models/OtpModel";
import Mailgen from "mailgen";
import { OTPGenerator, sendEmail } from "@utils/util";

const mailGenerator = new Mailgen({
  theme: 'default',
  product: {
    name: 'Goals Base',
    link: 'http://yourproductname.com/'
  }
});
interface ISendMail {
  email: string,
  message: string,
  subject: string,
  duration: number



}


// FUNCTION THAT WILL GENERATE AND SEND THE OTP
export const sendOTP = async ({ email, subject, message, duration = 1 }: ISendMail) => {
      const generatedOtp = OTPGenerator

  const emailBody = mailGenerator.generate({
  body: {
    intro: 'Welcome to your new Goals Base account',
    action: {
      instructions: `To get started with your account, please enter this otp ${generatedOtp}, it will expiry in ${duration} hours time`,
      button: {
        color: 'green',
        text: 'Welcome to GoalBase',
        link: 'http://yourproductname.com/confirm'
      }
    }
  }
  });
    
    
  try {
    if (!email && !subject && !message) {
      throw Error("Provide Value Fields For Email, Subject, Message")
    }
    // clear any old record
    await OTP.deleteOne({ email})
    // Generated OTP
  
    // send mail
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: 'Message From Goals Base',
      html: emailBody,
    };

    await sendEmail(mailOptions)

    const newOTP = await new OTP({
      email,
      otp: generatedOtp
    })
    
    const createdOTPRecord = await newOTP.save()
    return createdOTPRecord
  } catch (error) {
    console.log(error)
  }
}