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

// source/controllers/goalControllers.ts
var goalControllers_exports = {};
__export(goalControllers_exports, {
  createGoal: () => createGoal,
  deleteGoal: () => deleteGoal,
  getGoal: () => getGoal,
  updateGoal: () => updateGoal
});
module.exports = __toCommonJS(goalControllers_exports);

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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createGoal,
  deleteGoal,
  getGoal,
  updateGoal
});
