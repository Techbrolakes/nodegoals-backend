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

// src/services/auth/index.ts
var auth_exports = {};
__export(auth_exports, {
  sendOTP: () => sendOTP
});
module.exports = __toCommonJS(auth_exports);

// src/models/OtpModel.ts
var import_mongoose = require("mongoose");
var OTPSchema = new import_mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  otp: String
});
var OTP = (0, import_mongoose.model)("OTP", OTPSchema);
var OtpModel_default = OTP;

// src/services/auth/index.ts
var import_mailgen = __toESM(require("mailgen"));

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

// src/services/auth/index.ts
var mailGenerator = new import_mailgen.default({
  theme: "default",
  product: {
    name: "Goals Base",
    link: "http://yourproductname.com/"
  }
});
var sendOTP = (_0) => __async(void 0, [_0], function* ({ email, subject, message, duration = 1 }) {
  const generatedOtp = OTPGenerator;
  const emailBody = mailGenerator.generate({
    body: {
      intro: "Welcome to your new Goals Base account",
      action: {
        instructions: `To get started with your account, please enter this otp ${generatedOtp}, it will expiry in ${duration} hours time`,
        button: {
          color: "green",
          text: "Welcome to GoalBase",
          link: "http://yourproductname.com/confirm"
        }
      }
    }
  });
  try {
    if (!email && !subject && !message) {
      throw Error("Provide Value Fields For Email, Subject, Message");
    }
    yield OtpModel_default.deleteOne({ email });
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: "Message From Goals Base",
      html: emailBody
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  sendOTP
});
