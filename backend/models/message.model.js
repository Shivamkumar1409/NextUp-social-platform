import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    message: {
        type: String,
        required: false // <--- CHANGED FROM TRUE TO FALSE
    },
    image: {
        type: String,
        default: "" 
    },
    file: {
        type: String,
        default: ""
    },
    isSeen: {
        type: Boolean,
        default: false
    },
    deletedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }]
}, { timestamps: true });

const Message = mongoose.model("Message", messageSchema);
export default Message;