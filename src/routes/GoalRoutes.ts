import express from "express";
import { createGoal, deleteGoal, getGoal, updateGoal } from "@controllers/goalControllers";
import authMiddleware from "@middleware/authMiddleware";


const router = express.Router();

router.post("/create",authMiddleware , createGoal );
router.get("/allgoals", authMiddleware, getGoal);
router.put("/edit/:id", authMiddleware, updateGoal);
router.delete("/delete/:id", authMiddleware, deleteGoal);


export default router;