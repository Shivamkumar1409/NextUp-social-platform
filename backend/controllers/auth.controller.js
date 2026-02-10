import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import crypto from 'crypto';
import { OAuth2Client } from "google-auth-library";

// --- 1. REGISTER ---
export const register = async (req, res) => {
    try {
        const { name, email, phoneNumber, password, username } = req.body;
        const existingUser = await User.findOne({ 
            $or: [{ email }, { phoneNumber }, { username }] 
        });

        if (existingUser) return res.status(400).json({ message: "User already exists." });

        const hashedPassword = await bcrypt.hash(password, 10);
        const token = crypto.randomBytes(32).toString('hex');

        const newUser = new User({
            name, username, email, phoneNumber, password: hashedPassword, token
        });

        await newUser.save();
        res.status(201).json({ message: "User created", token });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- 2. LOGIN ---
export const login = async (req, res) => {
    try {
        const { identifier, password } = req.body;
        const user = await User.findOne({ 
            $or: [{ email: identifier }, { phoneNumber: identifier }, { username: identifier }] 
        }).select("+password");

        if (!user) return res.status(404).json({ message: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        const token = crypto.randomBytes(32).toString('hex');
        user.token = token;
        await user.save();

        res.json({ message: "Login successful", token, user });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- 3. GOOGLE AUTH ---
export const googleAuth = async (req, res) => {
    try {
        const { token } = req.body;

        // Hardcoded ID for stability during testing
        const CLIENT_ID = "606931447521-o3hpa0iuh7g5iosank9b7lpjmfvdrupl.apps.googleusercontent.com";
        
        const client = new OAuth2Client(CLIENT_ID);

        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: CLIENT_ID, 
        });

        const payload = ticket.getPayload();
        const { email, name, sub: googleId, picture } = payload;
        
        console.log("User Verified:", email);

        let user = await User.findOne({ $or: [{ email }, { googleId }] });

        if (user) {
            if (!user.googleId) {
                user.googleId = googleId;
                await user.save();
            }
        } else {
            const randomUsername = email.split("@")[0] + Math.floor(Math.random() * 1000);
            const newToken = crypto.randomBytes(32).toString('hex');
            
            user = new User({
                name,
                email,
                username: randomUsername,
                googleId,
                profilePicture: picture,
                token: newToken
            });
            await user.save();
        }

        if (!user.token) {
            user.token = crypto.randomBytes(32).toString('hex');
            await user.save();
        }

        return res.json({ message: "Google Login successful", token: user.token, user });

    } catch (error) {
        console.error("GOOGLE ERROR:", error.message);
        return res.status(500).json({ message: "Google Auth Failed", error: error.message });
    }
};

// --- 4. GET USER PROFILE (This was missing!) ---
export const getUserAndProfile = async (req, res) => {
    try {
        const { token } = req.query;

        if (!token) return res.status(400).json({ message: "Token is required" });

        const user = await User.findOne({ token: token });
        if (!user) return res.status(404).json({ message: "User not found" });

        return res.json(user);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// --- 5. UPDATE USER DETAILS ---
export const updateUserProfile = async (req, res) => {
    try {
        const { token, name } = req.body;

        const user = await User.findOne({ token: token });
        if (!user) return res.status(404).json({ message: "User not found" });

        user.name = name;
        await user.save();

        return res.json({ message: "User name updated" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// --- 6. UPDATE PROFILE DATA ---
export const updateProfileData = async (req, res) => {
    try {
        const { token, bio, currentPost, pastWork, education } = req.body;

        const user = await User.findOne({ token: token });
        if (!user) return res.status(404).json({ message: "User not found" });

        if (bio) user.bio = bio;
        if (currentPost) user.currentPost = currentPost;
        if (pastWork) user.pastWork = pastWork;
        if (education) user.education = education;

        await user.save();

        return res.json({ message: "Profile data updated" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// --- 7. DELETE ACCOUNT ---
export const deleteAccount = async (req, res) => {
    try {
      const userId = req.user._id; 
      const deletedUser = await User.findByIdAndDelete(userId);
      if (!deletedUser) return res.status(404).json({ message: "User not found" });
      return res.status(200).json({ message: "Account deleted successfully" });
    } catch (error) {
      console.error("Delete Error:", error);
      return res.status(500).json({ message: "Server error" });
    }
};