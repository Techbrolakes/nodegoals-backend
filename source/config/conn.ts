import mongoose from "mongoose";
import dotenv from "dotenv"
dotenv.config();

const connectDB = async () => {
    mongoose.set('strictQuery',false);
    const conn = await mongoose.connect(process.env.DB_HOST || "")    
    return conn
}


export default connectDB