import {Schema, model} from "mongoose";

const OTPSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    otp: String
})


const OTP = model('OTP', OTPSchema)

export default OTP