"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteGoal = exports.updateGoal = exports.getGoal = exports.createGoal = void 0;
const GoalModel_1 = __importDefault(require("../models/GoalModel"));
const lodash_1 = require("lodash");
const createGoal = async (req, res) => {
    const userId = req.user.id;
    if (!req.body.text) {
        return res.status(400).json({ message: 'Please Kindly Enter Goal' });
    }
    const goal = await GoalModel_1.default.create({
        text: req.body.text,
        user: userId,
    });
    res.status(201).json({
        success: true,
        mesaage: 'Goal Created successfully',
        data: {
            goal,
        },
    });
};
exports.createGoal = createGoal;
const getGoal = async (req, res) => {
    const userId = req.user.id;
    const goals = await GoalModel_1.default.find({ user: userId });
    if ((0, lodash_1.isEmpty)(goals)) {
        return res.status(200).json({ success: true, message: 'No Goals Yet' });
    }
    res.status(200).json(goals);
};
exports.getGoal = getGoal;
const updateGoal = async (req, res) => {
    const userId = req.user.id;
    const goal = await GoalModel_1.default.findById(req.params.id);
    if (!goal)
        return res.status(400).json({ success: false, message: 'Goal Not Found' });
    if (goal.user.toString() != userId)
        return res.status(400).json({ success: false, message: 'User Not Found' });
    const updatedGoal = await GoalModel_1.default.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
    });
    res.status(200).json({
        success: true,
        mesaage: 'Goal updated successfully',
        data: {
            updatedGoal,
        },
    });
};
exports.updateGoal = updateGoal;
const deleteGoal = async (req, res) => {
    const userId = req.user.id;
    const goal = await GoalModel_1.default.findById(req.params.id);
    if (!goal)
        return res.status(400).json({ success: false, message: 'Goal Not Found' });
    if (goal.user.toString() != userId)
        return res.status(400).json({ success: false, message: 'User Not Found' });
    const deletedGoal = await GoalModel_1.default.findByIdAndDelete(req.params.id, req.body);
    res.status(200).json({
        success: true,
        mesaage: 'Goal deleted successfully',
        data: {
            deletedGoal,
        },
    });
};
exports.deleteGoal = deleteGoal;
