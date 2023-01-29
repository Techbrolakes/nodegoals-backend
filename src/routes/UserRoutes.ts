import express from "express";

const router = express.Router();

router.get("/register", (req, res) => {
   res.send("Registering Users.........");
});

export default router;