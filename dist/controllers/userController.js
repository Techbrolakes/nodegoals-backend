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
  ResendVerification: () => ResendVerification,
  VerifyUserEmail: () => VerifyUserEmail,
  loginUser: () => loginUser,
  registerUser: () => registerUser
});
module.exports = __toCommonJS(userController_exports);

// src/models/UserModel.ts
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

// src/controllers/userController.ts
var import_bcrypt = __toESM(require("bcrypt"));
var import_dotenv2 = __toESM(require("dotenv"));

// src/utils/util.ts
var import_otp_generator = __toESM(require("otp-generator"));
var import_jsonwebtoken = __toESM(require("jsonwebtoken"));

// src/models/OtpModel.ts
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

// src/services/mailgen/index.ts
var import_mailgen = __toESM(require("mailgen"));

// src/services/nodemailer/index.ts
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

// src/services/mailgen/index.ts
var mailGenerator = new import_mailgen.default({
  theme: "default",
  product: {
    name: "Goals Base",
    link: "https://www.linkedin.com/in/lekandar/"
  }
});
var sendOTP = (_0) => __async(void 0, [_0], function* ({ email, subject, message, duration = 1 }) {
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
    yield OtpModel_default.deleteOne({ email });
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject,
      html: emailBody
    };
    yield sendEmail(mailOptions);
    const newOTP = yield new OtpModel_default({
      email,
      otp: OTPGenerator,
      createdAt: Date.now(),
      expiresAt: Date.now() + 36e5 * +duration
    });
    const createdOTPRecord = yield newOTP.save();
    return createdOTPRecord;
  } catch (error) {
    console.log(error);
  }
});

// src/utils/util.ts
var SendVerificationOTPEmail = (email) => __async(void 0, null, function* () {
  try {
    const existingUser = yield UserModel_default.findOne({ email });
    if (!existingUser) {
      throw new Error("Email does not exist");
    }
    const otpDetails = {
      email,
      subject: "Email Verification",
      message: "Verify your email with the code below",
      duration: 1
    };
    const createdOTP = yield sendOTP(otpDetails);
    return createdOTP;
  } catch (error) {
    throw error(error);
  }
});
var deleteOtp = (_0) => __async(void 0, [_0], function* ({ email }) {
  try {
    yield OtpModel_default.deleteOne({ email });
  } catch (error) {
    throw error;
  }
});
var VerifyOtp = (_0) => __async(void 0, [_0], function* ({ email, otp }) {
  try {
    if (!email && !otp) {
      throw Error("No Email or otp");
    }
    const matchedOTPRecord = yield OtpModel_default.findOne({ email });
    if (!matchedOTPRecord) {
      throw Error("No otp record found ");
    }
    const { expiresAt } = matchedOTPRecord;
    if (typeof expiresAt === "undefined" || expiresAt.getTime() < Date.now()) {
      yield OtpModel_default.deleteOne({ email });
      throw Error("Code has expired");
    }
    const validOTP = otp;
    return { valid: validOTP };
  } catch (error) {
    throw error;
  }
});
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
    yield SendVerificationOTPEmail(email);
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
  if (!user.verified) {
    return res.status(400).json({ success: false, message: "Email has not been verified yet, Check your inbox" });
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
var ResendVerification = (req, res) => __async(void 0, null, function* () {
  const { email } = req.body;
  try {
    const existingUser = UserModel_default.findOne({ email });
    if (!existingUser) {
      return res.status(400).json({ success: false, message: "Email does not exist" });
    }
    yield SendVerificationOTPEmail(email);
    res.status(201).json({
      success: true,
      message: "OTP Code Sent successfully"
    });
  } catch (error) {
    return res.status(404).json({ success: false, message: error });
  }
});
var VerifyUserEmail = (req, res) => __async(void 0, null, function* () {
  const { email, otp } = req.body;
  try {
    const validOTP = yield VerifyOtp({ email, otp });
    if (!validOTP) {
      throw new Error("Invalid code passed. Check your inbox");
    }
    yield UserModel_default.updateOne({ email }, { verified: true });
    yield deleteOtp(email);
    res.status(200).json({ email, verified: true });
  } catch (error) {
    throw error;
  }
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ResendVerification,
  VerifyUserEmail,
  loginUser,
  registerUser
});
