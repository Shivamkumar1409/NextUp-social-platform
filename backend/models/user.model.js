import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phoneNumber: {
        type: String,
        required: false
    },
    active: {
        type: Boolean,
        default: true   
    },
    password: {
        type: String,
        required: false, 
        select: false
    },
    googleId: {
        type: String,
        required: false,
        unique: true,
        sparse: true 
    },
    profilePicture: {
        type: String,
        default: 'default.jpg'
    },
    backgroundWallpaper: {
        type: String,
        default: ""
    },

    createdAt: {
        type: Date,
        default: Date.now
    },
    token: {
        type: String,
        default: ''
    },
    bio: { 
        type: String, 
        default: "" 
    },
    currentPost: { 
        type: String, 
        default: "" 
    },
    
    // Array of objects for History
    pastWork: [{
        company: { type: String, default: "" },
        position: { type: String, default: "" },
        years: { type: String, default: "" }
    }],
    
    education: [{
        institution: { type: String, default: "" },
        degree: { type: String, default: "" },
        year: { type: String, default: "" }
    }]
});

const User = mongoose.model("User", UserSchema);
export default User;