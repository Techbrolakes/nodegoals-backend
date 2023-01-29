import express from "express"
import dotenv from "dotenv"
import 'module-alias/register';
import connectDB from "@config/conn";
const port = process.env.PORT || 5000
const app = express();
// END OF IMPORTS

// SOME CONFIGS SETUP
connectDB()
dotenv.config();

app.get('/', (req, res) => {
    res.send("Hello Node Js!");
})

app.listen(port, () => console.log(`Server listening on ${port}`));