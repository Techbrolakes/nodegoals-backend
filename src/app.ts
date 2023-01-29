import express, { NextFunction, Request, Response } from "express"
import dotenv from "dotenv"
import 'module-alias/register';
import connectDB from "@config/conn";
import morgan from "morgan";
const port = process.env.PORT || 5000

const app = express();

app.use(express.json())
app.use(morgan('tiny'))
dotenv.config();

app.all("*", async (req: Request, res: Response, next: NextFunction) => {
    return next(res.status(404).json({
        message: "Invalid Route Boss"
    }))
})

app.use("*", async (err: Error, req: Request, res: Response) => {
    res.status(400).json({
        message: err.message || "An Unknown Error occurred"
    })
})
 

app.get('/', (req, res) => {
    res.send("Hello Node Js!");
})

/** start server only when we have valid connection */
connectDB().then(() => {
    try {
        app.listen(port, () => console.log(`Server listening & database connected on ${port}`));
    } catch (e) { 
        console.log('Cannot connect to the server')
    }
}).catch((e) => {
    console.log("Invalid database connection...! ", + e);
})