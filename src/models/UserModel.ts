import {model , Schema } from "mongoose";

interface IUser {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    confirm_password: string;
}

const userSchema = new Schema <IUser>({
    first_name: { type: String, required: true},
    last_name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    confirm_password: { type: String, required: true }
})

const User = model('Users', userSchema)

export default User