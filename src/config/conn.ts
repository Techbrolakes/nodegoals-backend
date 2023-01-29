import mongoose from "mongoose";
import colors from "colors"
import dotenv from "dotenv"
dotenv.config();

const connectDB = async () => {
    try {
        mongoose.set('strictQuery',false);
        const conn = await mongoose.connect(process.env.DB_HOST || "")
        console.log(colors.blue("MongoDB Connected Boss On " + conn.connection.host))
    } catch (error) {
        console.log(error)
    }
}


export default connectDB