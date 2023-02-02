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
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// src/controllers/userController.ts
var userController_exports = {};
__export(userController_exports, {
  loginUser: () => loginUser,
  registerUser: () => registerUser,
  sendOTP: () => sendOTP,
  verifyAccount: () => verifyAccount
});
module.exports = __toCommonJS(userController_exports);

// src/models/UserModel.ts
var import_mongoose = require("mongoose");
var userSchema = new import_mongoose.Schema({
  first_name: { type: String, required: [true, "first name required"] },
  last_name: { type: String, required: [true, "last name required"] },
  email: { type: String, required: [true, "email required"], unique: true },
  password: { type: String, required: [true, "password required"] },
  confirm_password: { type: String, required: [true, "confirm password required"] }
});
var User = (0, import_mongoose.model)("Users", userSchema);
var UserModel_default = User;

// src/controllers/userController.ts
var import_jsonwebtoken = __toESM(require("jsonwebtoken"));
var import_bcrypt = __toESM(require("bcrypt"));
var import_dotenv2 = __toESM(require("dotenv"));

// src/models/OtpModel.ts
var import_mongoose2 = require("mongoose");
var OTPSchema = new import_mongoose2.Schema({
  email: {
    type: String,
    required: true
  },
  otp: String
});
var OTP = (0, import_mongoose2.model)("OTP", OTPSchema);
var OtpModel_default = OTP;

// src/utils/util.ts
var import_otp_generator = __toESM(require("otp-generator"));
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
var sendEmail = (mailOptions) => __async(void 0, null, function* () {
  try {
    yield transporter.sendMail(mailOptions);
    return;
  } catch (error) {
    console.log(error);
  }
});
var OTPGenerator = import_otp_generator.default.generate(4, { digits: true, specialChars: false, lowerCaseAlphabets: false, upperCaseAlphabets: false });

// src/controllers/userController.ts
import_dotenv2.default.config();
var registerUser = (req, res) => __async(void 0, null, function* () {
  const { first_name, last_name, email, password, confirm_password } = req.body;
  const userExists = yield UserModel_default.findOne({ email });
  if (userExists) {
    return res.status(400).json({ message: "User already exists" });
  }
  if (!password) {
    return res.status(400).json({ message: "password required" });
  }
  if (!confirm_password) {
    return res.status(400).json({ message: "confirm password required" });
  }
  const salt = yield import_bcrypt.default.genSalt(10);
  const hash_password = yield import_bcrypt.default.hash(password, salt);
  const hash_confirm_password = yield import_bcrypt.default.hash(confirm_password, salt);
  try {
    const user = yield UserModel_default.create({ first_name, last_name, email, password: hash_password, confirm_password: hash_confirm_password });
    if (user) {
      res.status(201).json({
        success: true,
        message: "User created successfully",
        data: {
          _id: user._id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          password: user.password,
          confirm_password: user.confirm_password,
          token: generateToken(user._id)
        }
      });
    }
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});
var loginUser = (req, res) => __async(void 0, null, function* () {
  const { email, password } = req.body;
  const user = yield UserModel_default.findOne({ email });
  if (!user) {
    return res.status(400).json({ success: false, message: "Email does not exist" });
  }
  if (user && (yield import_bcrypt.default.compare(password, user.password))) {
    res.status(201).json({
      success: true,
      message: "User Successfully Logged in",
      token: generateToken(user._id)
    });
  } else {
    return res.status(400).json({ success: false, message: "Invalid Password" });
  }
});
var verifyAccount = (req, res) => __async(void 0, null, function* () {
  try {
    const { email, subject, message, duration } = req.body;
    const createdOTP = yield sendOTP({
      email,
      subject,
      message,
      duration
    });
    res.json(createdOTP);
  } catch (error) {
    console.log(error);
  }
});
var sendOTP = (_0) => __async(void 0, [_0], function* ({ email, subject, message, duration = 1 }) {
  try {
    if (!email && !subject && !message) {
      throw Error("Provide Value Fields For Email, Subject, Message");
    }
    yield OtpModel_default.deleteOne({ email });
    const generatedOtp = OTPGenerator;
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject,
      html: `
      <div
        class="container"
        style="max-width: 90%; margin: auto; padding-top: 20px"
      >
        <h2>${message}</h2>
        <h4>You are officially In \u2714</h4>
        <p style="margin-bottom: 30px;">Pleas enter the sign up OTP to get started</p>
        <h1 style="font-size: 40px; letter-spacing: 2px; text-align:center;">${generatedOtp} it will expire in ${duration} hour.</h1>
   </div>
    `
    };
    yield sendEmail(mailOptions);
    const newOTP = yield new OtpModel_default({
      email,
      otp: generatedOtp
    });
    const createdOTPRecord = yield newOTP.save();
    return createdOTPRecord;
  } catch (error) {
    console.log(error);
  }
});
var generateToken = (id) => {
  return import_jsonwebtoken.default.sign({ id }, process.env.JWT_SECRET || "jwt", {
    expiresIn: "30d"
  });
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  loginUser,
  registerUser,
  sendOTP,
  verifyAccount
});
