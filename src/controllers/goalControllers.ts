import Goal from "@models/GoalModel";
import User from "@models/UserModel";
import { Request, Response } from "express";
import { isEmpty } from "lodash";
export interface CustomRequest extends Request {
    user: {
     id: string;
 }
}


// Create a new Goal
export const createGoal = async (req: Request, res: Response) => {
    const userId = (req as CustomRequest).user.id

    if (!req.body.text) {
            return res.status(400).json({ message: 'Please Kindly Enter Goal' });
    }
    const goal = await Goal.create({
        text: req.body.text,
        user: userId,
    })

    res.status(201).json(goal)
}

// Get goals

export const getGoal = async (req: Request, res: Response) => {
    const userId = (req as CustomRequest).user.id

    const goals = await Goal.find({ user: userId })

    if (isEmpty(goals)) {
       return res.status(200).json({success: true,  message: 'No Goals Yet' });
    }
    
     res.status(200).json(goals)
}


