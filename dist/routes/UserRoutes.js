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

// src/routes/UserRoutes.ts
var UserRoutes_exports = {};
__export(UserRoutes_exports, {
  default: () => UserRoutes_default
});
module.exports = __toCommonJS(UserRoutes_exports);
var import_express = __toESM(require("express"));

// src/models/UserModel.ts
var import_mongoose = require("mongoose");
var userSchema = new import_mongoose.Schema({
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  confirm_password: { type: String, required: true }
});
var User = (0, import_mongoose.model)("Users", userSchema);
var UserModel_default = User;

// src/controllers/userController.ts
var registerUser = (req, res) => __async(void 0, null, function* () {
  const { first_name, last_name, email, password, confirm_password } = req.body;
  if (!first_name || !last_name || !email || !password || !confirm_password) {
    return res.status(400).json({ message: "Please add all fields" });
  }
  const newUser = new UserModel_default({ first_name, last_name, email, password, confirm_password });
  try {
    yield newUser.save();
    res.send({ message: "User registered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Server error" });
  }
});

// src/routes/UserRoutes.ts
var router = import_express.default.Router();
router.post("/register", registerUser);
var UserRoutes_default = router;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {});
