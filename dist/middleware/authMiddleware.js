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

// src/middleware/authMiddleware.ts
var authMiddleware_exports = {};
__export(authMiddleware_exports, {
  default: () => authMiddleware_default
});
module.exports = __toCommonJS(authMiddleware_exports);
var import_jsonwebtoken = __toESM(require("jsonwebtoken"));
var import_dotenv = __toESM(require("dotenv"));
import_dotenv.default.config();
var authMiddleware = (req, res, next) => __async(void 0, null, function* () {
  const token = req.body.token || req.query.token || req.headers["x-auth-token"];
  if (!token) {
    return res.status(403).json({ message: "No token, authorization denied" });
  }
  try {
    const decoded = import_jsonwebtoken.default.verify(token, process.env.JWT_SECRET || "jwt");
    req.token = decoded;
    req.user = decoded;
  } catch (error) {
    res.status(401).json({ message: "Token is not valid" });
  }
  next();
});
var authMiddleware_default = authMiddleware;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {});
