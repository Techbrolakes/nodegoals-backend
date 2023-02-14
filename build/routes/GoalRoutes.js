"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const goalControllers_1 = require("../controllers/goalControllers");
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
const router = express_1.default.Router();
router.post('/create', authMiddleware_1.default, goalControllers_1.createGoal);
router.get('/allgoals', authMiddleware_1.default, goalControllers_1.getGoal);
router.put('/edit/:id', authMiddleware_1.default, goalControllers_1.updateGoal);
router.delete('/delete/:id', authMiddleware_1.default, goalControllers_1.deleteGoal);
exports.default = router;
