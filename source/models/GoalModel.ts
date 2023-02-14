import mongoose, {Schema, model} from "mongoose";

const goalSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    text: {
        type: String,
        required: [true, 'Please add a text value'],
    }
}, {
    timestamps: true,
})


const Goal = model('Goals', goalSchema);


export default Goal;