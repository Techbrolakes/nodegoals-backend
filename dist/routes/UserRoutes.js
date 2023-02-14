"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// source/routes/UserRoutes.ts
var UserRoutes_exports = {};
__export(UserRoutes_exports, {
  default: () => UserRoutes_default
});
module.exports = __toCommonJS(UserRoutes_exports);
var import_express = __toESM(require("express"));

// source/models/UserModel.ts
var import_mongoose = require("mongoose");
var userSchema = new import_mongoose.Schema({
  first_name: { type: String, required: [true, "first name required"] },
  last_name: { type: String, required: [true, "last name required"] },
  email: { type: String, required: [true, "email required"], unique: true },
  password: { type: String, required: [true, "password required"] },
  confirm_password: { type: String, required: [true, "confirm password required"] },
  verified: { type: Boolean, default: false }
});
var User = (0, import_mongoose.model)("Users", userSchema);
var UserModel_default = User;

// source/controllers/userController.ts
var import_bcrypt = __toESM(require("bcrypt"));
var import_dotenv2 = __toESM(require("dotenv"));

// source/utils/util.ts
var import_otp_generator = __toESM(require("otp-generator"));
var import_jsonwebtoken = __toESM(require("jsonwebtoken"));

// source/services/mailgen/index.ts
var import_mailgen = __toESM(require("mailgen"));

// source/models/OtpModel.ts
var import_mongoose2 = require("mongoose");
var OTPSchema = new import_mongoose2.Schema({
  email: {
    type: String,
    required: true
  },
  otp: String,
  createdAt: Date,
  expiresAt: Date
});
var OTP = (0, import_mongoose2.model)("OTP", OTPSchema);
var OtpModel_default = OTP;

// source/services/nodemailer/index.ts
var import_nodemailer = __toESM(require("nodemailer"));
var import_dotenv = __toESM(require("dotenv"));
import_dotenv.default.config();
var transporter = import_nodemailer.default.createTransport({
  host: process.env.SMTP_HOST,
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});
transporter.verify((error) => {
  if (error) {
    console.log(error);
  } else {
    console.log("Server is ready to take our messages");
  }
});
var sendEmail = async (mailOptions) => {
  try {
    await transporter.sendMail(mailOptions);
    return;
  } catch (error) {
    console.log(error);
  }
};

// source/services/mailgen/index.ts
var mailGenerator = new import_mailgen.default({
  theme: "default",
  product: {
    name: "Goals Base",
    link: "https://www.linkedin.com/in/lekandar/"
  }
});
var sendOTP = async ({ email, subject, message, duration = 1 }) => {
  const payload = { email, subject, message };
  const emailBody = mailGenerator.generate({
    body: {
      intro: message,
      action: {
        instructions: `To get started with your account, please enter this otp ${OTPGenerator}, it will expiry in ${duration} hours time`,
        button: {
          color: "green",
          text: "Welcome to GoalBase",
          link: "https://www.linkedin.com/in/lekandar/"
        }
      }
    }
  });
  try {
    if (!payload) {
      throw Error("Provide Value Fields For Email, Subject, Message");
    }
    await OtpModel_default.deleteOne({ email });
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject,
      html: emailBody
    };
    await sendEmail(mailOptions);
    const newOTP = await new OtpModel_default({
      email,
      otp: OTPGenerator,
      createdAt: Date.now(),
      expiresAt: Date.now() + 36e5 * +duration
    });
    const createdOTPRecord = await newOTP.save();
    return createdOTPRecord;
  } catch (error) {
    console.log(error);
  }
};

// source/utils/util.ts
var VerifyUserEmail = async ({ email, otp }) => {
  try {
    const validOTP = await VerifyOtp({ email, otp });
    if (!validOTP) {
      throw new Error("Invalid Code Passed, Check your inbox");
    }
    await UserModel_default.updateOne({ email }, { verified: true });
    await deleteOtp({ email });
    return;
  } catch (error) {
    throw error;
  }
};
var SendVerificationOTPEmail = async (email) => {
  try {
    const existingUser = await UserModel_default.findOne({ email });
    if (!existingUser) {
      throw new Error("Email does not exist");
    }
    const otpDetails = {
      email,
      subject: "Email Verification",
      message: "Verify your email with the code below",
      duration: 1
    };
    const createdOTP = await sendOTP(otpDetails);
    return createdOTP;
  } catch (error) {
    throw new Error(error);
  }
};
var deleteOtp = async ({ email }) => {
  try {
    await OtpModel_default.deleteOne({ email });
  } catch (error) {
    throw new Error(error);
  }
};
var VerifyOtp = async ({ email, otp }) => {
  try {
    if (!email && !otp) {
      throw new Error("No Email or otp");
    }
    const matchedOTPRecord = await OtpModel_default.findOne({ email });
    if (!matchedOTPRecord) {
      throw new Error("Try resending the otp record");
    }
    const { expiresAt } = matchedOTPRecord;
    if (typeof expiresAt === "undefined" || expiresAt.getTime() < Date.now()) {
      await OtpModel_default.deleteOne({ email });
      throw new Error("Code has expired");
    }
    if (matchedOTPRecord.otp === otp) {
      return true;
    } else {
      throw new Error("Incorrect OTP, Kindly Try Again");
    }
  } catch (error) {
    throw new Error(error);
  }
};
var OTPGenerator = import_otp_generator.default.generate(4, {
  digits: true,
  specialChars: false,
  lowerCaseAlphabets: false,
  upperCaseAlphabets: false
});
var generateToken = (id) => {
  return import_jsonwebtoken.default.sign({ id }, process.env.JWT_SECRET || "jwt", {
    expiresIn: "30d"
  });
};

// source/controllers/userController.ts
import_dotenv2.default.config();
var registerUser = async (req, res) => {
  const { first_name, last_name, email, password, confirm_password } = req.body;
  const userExists = await UserModel_default.findOne({ email });
  if (userExists) {
    return res.status(400).json({ message: "User already exists" });
  }
  if (!password) {
    return res.status(400).json({ message: "password required" });
  }
  if (!confirm_password) {
    return res.status(400).json({ message: "confirm password required" });
  }
  const salt = await import_bcrypt.default.genSalt(10);
  const hash_password = await import_bcrypt.default.hash(password, salt);
  const hash_confirm_password = await import_bcrypt.default.hash(confirm_password, salt);
  try {
    const user = await UserModel_default.create({
      first_name,
      last_name,
      email,
      password: hash_password,
      confirm_password: hash_confirm_password
    });
    await SendVerificationOTPEmail(email);
    if (user) {
      res.status(201).json({
        success: true,
        message: `A verification mail has been sent to ${email}`,
        data: null
      });
    }
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};
var loginUser = async (req, res) => {
  const { email, password } = req.body;
  const user = await UserModel_default.findOne({ email });
  if (!user) {
    return res.status(400).json({ success: false, message: "Email does not exist" });
  }
  if (!user.verified) {
    return res.status(400).json({
      success: false,
      isVerified: user.verified,
      message: "Email has not been verified yet, Check your inbox"
    });
  }
  if (user && await import_bcrypt.default.compare(password, user.password)) {
    res.status(201).json({
      success: true,
      message: "User Successfully Logged in",
      token: generateToken(user._id)
    });
  } else {
    return res.status(400).json({ success: false, message: "Invalid Password" });
  }
};
var ResendVerification = async (req, res) => {
  const { email } = req.body;
  try {
    const existingUser = UserModel_default.findOne({ email });
    if (!existingUser) {
      return res.status(400).json({ success: false, message: "Email does not exist" });
    }
    await SendVerificationOTPEmail(email);
    res.status(201).json({
      success: true,
      message: "OTP Code Sent successfully"
    });
  } catch (error) {
    return res.status(404).json({ success: false, message: error.message });
  }
};
var VerifyEmail = async (req, res) => {
  const { email, otp } = req.body;
  try {
    if (!email && !otp) {
      return res.status(404).json({ success: false, message: "Otp & Email not found" });
    }
    await VerifyUserEmail({ email, otp });
    res.status(200).json({ success: true, message: "Email Successfully verified, Welcome to Goalbase" });
  } catch (error) {
    return res.status(404).json({ success: false, message: error.message });
  }
};
var RecoverPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await UserModel_default.findOne({ email });
    if (!user?.verified) {
      await SendVerificationOTPEmail(email);
      return res.status(404).json({ success: false, message: `Email is not verified yet, A mail has been sent to your inbox` });
    }
    if (user) {
      const otpDetails = {
        email,
        subject: "Reset Password",
        message: "Enter the code below to reset your password",
        duration: 1
      };
      await sendOTP(otpDetails);
      return res.status(404).json({ success: true, message: `A reset email has been sent to ${email}` });
    } else {
      return res.status(404).json({ success: false, message: `Email Does Not Exist` });
    }
  } catch (error) {
    return res.status(404).json({ success: false, message: error.message });
  }
};
var VerifyPasswordOTP = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const user = await UserModel_default.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: "Email does not exist" });
    }
    if (!email && !otp) {
      return res.status(404).json({ success: false, message: "Otp & Email not found" });
    }
    await VerifyUserEmail({ email, otp });
    res.status(200).json({
      success: true,
      message: "OTP Successfully Verified, Kindly Reset Password",
      token: generateToken(user._id)
    });
  } catch (error) {
    return res.status(404).json({ success: false, message: error.message });
  }
};
var ResetPassword = async (req, res) => {
  const { password, email, otp, confirm_password } = req.body;
  try {
    if (!email) {
      throw Error("Email Field is required");
    }
    if (!otp) {
      throw Error("OTP Field is required");
    }
    if (!password) {
      throw Error("Password Field is required");
    }
    if (!confirm_password) {
      throw Error("Confirm Passsword Field is required");
    }
    if (password !== confirm_password) {
      throw Error("Password Mismatch");
    }
    const validOTP = await VerifyOtp({ email, otp });
    if (!validOTP) {
      throw Error("Invalid code passed. check your inbox");
    }
    const salt = await import_bcrypt.default.genSalt(10);
    const hash_password = await import_bcrypt.default.hash(password, salt);
    const hash_confirm_password = await import_bcrypt.default.hash(confirm_password, salt);
    await UserModel_default.updateOne(
      { email },
      {
        confirm_password: hash_confirm_password,
        password: hash_password
      }
    );
    await deleteOtp(email);
    return res.status(200).json({ succes: true, message: "Password Successfully Changed" });
  } catch (error) {
    return res.status(404).json({ success: false, message: error.message });
  }
};

// source/routes/UserRoutes.ts
var router = import_express.default.Router();
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/resend", ResendVerification);
router.post("/verify", VerifyEmail);
router.post("/recover", RecoverPassword);
router.post("/verifypasswordotp", VerifyPasswordOTP);
router.post("/reset", ResetPassword);
var UserRoutes_default = router;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {});
