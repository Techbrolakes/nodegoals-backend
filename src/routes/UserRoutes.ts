import express from "express";
import { loginUser, registerUser } from "@controllers/userController";
import authMiddleware from "@middleware/authMiddleware";


const router = express.Router();

router.post("/register", registerUser );
router.post("/login", loginUser);
router.get("/private", authMiddleware, (req, res) => {
  res.json({ msg: "Welcome to private route" });
});

export default router;