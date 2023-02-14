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

// source/routes/GoalRoutes.ts
var GoalRoutes_exports = {};
__export(GoalRoutes_exports, {
  default: () => GoalRoutes_default
});
module.exports = __toCommonJS(GoalRoutes_exports);
var import_express = __toESM(require("express"));

// source/models/GoalModel.ts
var import_mongoose = __toESM(require("mongoose"));
var goalSchema = new import_mongoose.Schema({
  user: {
    type: import_mongoose.default.Schema.Types.ObjectId,
    required: true,
    ref: "User"
  },
  text: {
    type: String,
    required: [true, "Please add a text value"]
  }
}, {
  timestamps: true
});
var Goal = (0, import_mongoose.model)("Goals", goalSchema);
var GoalModel_default = Goal;

// source/controllers/goalControllers.ts
var import_lodash = require("lodash");
var createGoal = async (req, res) => {
  const userId = req.user.id;
  if (!req.body.text) {
    return res.status(400).json({ message: "Please Kindly Enter Goal" });
  }
  const goal = await GoalModel_default.create({
    text: req.body.text,
    user: userId
  });
  res.status(201).json({
    success: true,
    mesaage: "Goal Created successfully",
    data: {
      goal
    }
  });
};
var getGoal = async (req, res) => {
  const userId = req.user.id;
  const goals = await GoalModel_default.find({ user: userId });
  if ((0, import_lodash.isEmpty)(goals)) {
    return res.status(200).json({ success: true, message: "No Goals Yet" });
  }
  res.status(200).json(goals);
};
var updateGoal = async (req, res) => {
  const userId = req.user.id;
  const goal = await GoalModel_default.findById(req.params.id);
  if (!goal)
    return res.status(400).json({ success: false, message: "Goal Not Found" });
  if (goal.user.toString() != userId)
    return res.status(400).json({ success: false, message: "User Not Found" });
  const updatedGoal = await GoalModel_default.findByIdAndUpdate(req.params.id, req.body, {
    new: true
  });
  res.status(200).json({
    success: true,
    mesaage: "Goal updated successfully",
    data: {
      updatedGoal
    }
  });
};
var deleteGoal = async (req, res) => {
  const userId = req.user.id;
  const goal = await GoalModel_default.findById(req.params.id);
  if (!goal)
    return res.status(400).json({ success: false, message: "Goal Not Found" });
  if (goal.user.toString() != userId)
    return res.status(400).json({ success: false, message: "User Not Found" });
  const deletedGoal = await GoalModel_default.findByIdAndDelete(req.params.id, req.body);
  res.status(200).json({
    success: true,
    mesaage: "Goal deleted successfully",
    data: {
      deletedGoal
    }
  });
};

// source/middleware/authMiddleware.ts
var import_jsonwebtoken = __toESM(require("jsonwebtoken"));
var import_dotenv = __toESM(require("dotenv"));
import_dotenv.default.config();
var authMiddleware = async (req, res, next) => {
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
};
var authMiddleware_default = authMiddleware;

// source/routes/GoalRoutes.ts
var router = import_express.default.Router();
router.post("/create", authMiddleware_default, createGoal);
router.get("/allgoals", authMiddleware_default, getGoal);
router.put("/edit/:id", authMiddleware_default, updateGoal);
router.delete("/delete/:id", authMiddleware_default, deleteGoal);
var GoalRoutes_default = router;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {});
