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

// src/utils/util.ts
var util_exports = {};
__export(util_exports, {
  OTPGenerator: () => OTPGenerator,
  SendEmail: () => SendEmail,
  SendVerificationOTPEmail: () => SendVerificationOTPEmail,
  VerifyOtp: () => VerifyOtp,
  VerifyUserEmail: () => VerifyUserEmail,
  deleteOtp: () => deleteOtp,
  generateToken: () => generateToken
});
module.exports = __toCommonJS(util_exports);
var import_otp_generator = __toESM(require("otp-generator"));
var import_jsonwebtoken = __toESM(require("jsonwebtoken"));

// src/models/OtpModel.ts
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

// src/models/UserModel.ts
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
var UserModel_default = User;

// src/utils/util.ts
var VerifyUserEmail = (_0) => __async(void 0, [_0], function* ({ email, otp }) {
  try {
    const validOTP = yield VerifyOtp({ email, otp });
    if (!validOTP) {
      throw new Error("Invalid Code Passed, Check your inbox");
    }
    yield UserModel_default.findOne({ email }, { verified: true });
    yield deleteOtp({ email });
    return;
  } catch (error) {
    throw error;
  }
});
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
    throw new Error(error);
  }
});
var deleteOtp = (_0) => __async(void 0, [_0], function* ({ email }) {
  try {
    yield OtpModel_default.deleteOne({ email });
  } catch (error) {
    throw new Error(error);
  }
});
var VerifyOtp = (_0) => __async(void 0, [_0], function* ({ email, otp }) {
  try {
    if (!email && !otp) {
      throw new Error("No Email or otp");
    }
    const matchedOTPRecord = yield OtpModel_default.findOne({ email });
    if (!matchedOTPRecord) {
      throw new Error("No otp record found ");
    }
    const { expiresAt } = matchedOTPRecord;
    if (typeof expiresAt === "undefined" || expiresAt.getTime() < Date.now()) {
      yield OtpModel_default.deleteOne({ email });
      throw new Error("Code has expired");
    }
    const validOTP = otp;
    return { valid: validOTP };
  } catch (error) {
    throw new Error(error);
  }
});
var SendEmail = (_0) => __async(void 0, [_0], function* ({ duration, email, message, subject }) {
  try {
    const createdOTP = yield sendOTP({ email, subject, message, duration });
    return createdOTP;
  } catch (error) {
    throw new Error(error);
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  OTPGenerator,
  SendEmail,
  SendVerificationOTPEmail,
  VerifyOtp,
  VerifyUserEmail,
  deleteOtp,
  generateToken
});
