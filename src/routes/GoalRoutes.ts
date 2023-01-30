import express from "express";
import { createGoal, getGoal } from "@controllers/goalControllers";
import authMiddleware from "@middleware/authMiddleware";


const router = express.Router();

router.post("/create",authMiddleware , createGoal );
router.get("/allgoals", authMiddleware, getGoal);


export default router;