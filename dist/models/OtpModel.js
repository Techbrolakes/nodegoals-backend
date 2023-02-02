"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/models/OtpModel.ts
var OtpModel_exports = {};
__export(OtpModel_exports, {
  default: () => OtpModel_default
});
module.exports = __toCommonJS(OtpModel_exports);
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {});
