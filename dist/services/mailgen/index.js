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

// source/services/mailgen/index.ts
var mailgen_exports = {};
__export(mailgen_exports, {
  sendOTP: () => sendOTP
});
module.exports = __toCommonJS(mailgen_exports);
var import_mailgen2 = __toESM(require("mailgen"));

// source/models/OtpModel.ts
var import_mongoose = require("mongoose");
var OTPSchema = new import_mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  otp: String,
  createdAt: Date,
  expiresAt: Date
});
var OTP = (0, import_mongoose.model)("OTP", OTPSchema);
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

// source/utils/util.ts
var import_otp_generator = __toESM(require("otp-generator"));
var import_jsonwebtoken = __toESM(require("jsonwebtoken"));

// source/models/UserModel.ts
var import_mongoose2 = require("mongoose");
var userSchema = new import_mongoose2.Schema({
  first_name: { type: String, required: [true, "first name required"] },
  last_name: { type: String, required: [true, "last name required"] },
  email: { type: String, required: [true, "email required"], unique: true },
  password: { type: String, required: [true, "password required"] },
  confirm_password: { type: String, required: [true, "confirm password required"] },
  verified: { type: Boolean, default: false }
});
var User = (0, import_mongoose2.model)("Users", userSchema);

// source/utils/util.ts
var OTPGenerator = import_otp_generator.default.generate(4, {
  digits: true,
  specialChars: false,
  lowerCaseAlphabets: false,
  upperCaseAlphabets: false
});

// source/services/mailgen/index.ts
var mailGenerator = new import_mailgen2.default({
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  sendOTP
});
