import {model , Schema } from "mongoose";

export interface IUser {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    confirm_password: string;
    verified: boolean;
}

const userSchema = new Schema <IUser>({
    first_name: { type: String, required: [true, "first name required"]},
    last_name: { type: String, required: [true, "last name required"] },
    email: { type: String, required: [true, "email required"], unique : true },
    password: { type: String, required: [true, "password required"] },
    confirm_password: { type: String, required: [true, "confirm password required"] },
    verified: { type: Boolean, default: false}
})

const User = model('Users', userSchema)

export default User