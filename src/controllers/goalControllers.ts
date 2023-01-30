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

    res.status(201).json({
        success: true,
        mesaage: "Goal Created successfully",
        data: {
            goal
        }
     })
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

// Update goals
export const updateGoal = async (req: Request, res: Response) => {
    const userId = (req as CustomRequest).user.id

    const goal = await Goal.findById(req.params.id)
    if (!goal) return res.status(400).json({ success: false, message: 'Goal Not Found' });
    
    if (goal.user.toString() != userId) return res.status(400).json({ success: false, message: 'User Not Found' });
    
    const updatedGoal = await Goal.findByIdAndUpdate(req.params.id, req.body, {
        new: true
    })
    res.status(200).json({
        success: true,
        mesaage: "Goal updated successfully",
        data: {
            updatedGoal
        }
     })


}

// delete goal
export const deleteGoal = async (req: Request, res: Response) => {
    const userId = (req as CustomRequest).user.id
    
    const goal = await Goal.findById(req.params.id)
    if (!goal) return res.status(400).json({ success: false, message: 'Goal Not Found' });

    if (goal.user.toString() != userId) return res.status(400).json({ success: false, message: 'User Not Found' });
        const deletedGoal = await Goal.findByIdAndDelete(req.params.id, req.body)
    res.status(200).json({
        success: true,
        mesaage: "Goal deleted successfully",
        data: {
            deletedGoal
        }
     })

}

