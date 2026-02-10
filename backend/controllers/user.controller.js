import User from "../models/user.model.js";
import ConnectionRequest from "../models/connections.model.js";
import Post from "../models/posts.model.js";
import Comment from "../models/comments.model.js";
import crypto from 'crypto';
import PDFDocument from 'pdfkit';
import fs from "fs";

// --- HELPER: PDF GENERATION ---
const convertUserDataTOPDF = async (user) => {
    const doc = new PDFDocument();
    const outputPath = crypto.randomBytes(32).toString("hex") + ".pdf";
    const stream = fs.createWriteStream("uploads/" + outputPath);

    doc.pipe(stream);

    if (user.profilePicture) {
        try {
            if (fs.existsSync(`uploads/${user.profilePicture}`)) {
                doc.image(`uploads/${user.profilePicture}`, { align: "center", width: 100 });
            }
        } catch (err) {
            console.error("Image error in PDF generation:", err);
        }
    }
    
    doc.fontSize(20).text(`User Profile`, { align: 'center' });
    doc.moveDown();

    doc.fontSize(14).text(`Name: ${user.name}`);
    doc.fontSize(14).text(`Username: ${user.username}`);
    doc.fontSize(14).text(`Email: ${user.email}`);
    doc.fontSize(14).text(`Bio: ${user.bio || "N/A"}`);
    doc.fontSize(14).text(`Current Position: ${user.currentPost || "N/A"}`);

    doc.moveDown();
    doc.fontSize(16).text(`Past Work:`, { underline: true });
    
    if (user.pastWork && user.pastWork.length > 0) {
        user.pastWork.forEach((work) => {
            doc.moveDown(0.5);
            doc.fontSize(14).text(`Company: ${work.company}`);
            doc.fontSize(14).text(`Position: ${work.position}`);
            doc.fontSize(14).text(`Years: ${work.years}`);
        });
    } else {
        doc.fontSize(14).text("No past work listed.");
    }

    doc.end();
    return outputPath;
};

// --- PROFILE CONTROLLERS ---

export const uploadProfilePicture = async (req, res) => {
    const { token } = req.body;
    try {
        const user = await User.findOne({ token: token });
        if (!user) return res.status(404).json({ message: "User not found" });

        if (!req.file) return res.status(400).json({ message: "No file uploaded" });

        user.profilePicture = req.file.filename;
        await user.save();
        
        return res.json({ message: "Profile picture updated" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const uploadBackgroundWallpaper = async (req, res) => {
    const { token } = req.body;
    try {
        const user = await User.findOne({ token: token });
        if (!user) return res.status(404).json({ message: "User not found" });

        if (!req.file) return res.status(400).json({ message: "No file uploaded" });

        user.backgroundWallpaper = req.file.filename;
        await user.save();
        
        return res.json({ message: "Background wallpaper updated" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const updateUserProfile = async (req, res) => {
    try {
        const { token, ...newUserData } = req.body;
        const user = await User.findOne({ token: token });

        if (!user) return res.status(404).json({ message: "User not found" });

        const { username, email } = newUserData;
        if (username || email) {
            const existingUser = await User.findOne({ 
                $or: [{ username }, { email }],
                _id: { $ne: user._id }
            });

            if (existingUser) {
                return res.status(400).json({ message: "Username or Email already exists" });
            }
        }

        Object.assign(user, newUserData);
        await user.save();
        
        return res.json({ message: "User updated" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

// --- ARRAY UPDATE HANDLER (Fixed & Kept) ---
export const updateProfileData = async (req, res) => {
    try {
        const { token, ...newProfileData } = req.body;
        const user = await User.findOne({ token: token });

        if (!user) return res.status(404).json({ message: "User not found" });

        if (newProfileData.pastWork) user.pastWork = newProfileData.pastWork;
        if (newProfileData.education) user.education = newProfileData.education;
        if (newProfileData.bio !== undefined) user.bio = newProfileData.bio;
        if (newProfileData.currentPost !== undefined) user.currentPost = newProfileData.currentPost;
        if (newProfileData.name !== undefined) user.name = newProfileData.name;

        await user.save();
        
        return res.json({ message: "Profile updated" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

export const getAllUserProfile = async (req, res) => {
    try {
        const profiles = await User.find().select("-password -token");
        return res.json({ profiles });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

export const downloadProfile = async (req, res) => {
    const user_id = req.query.id;
    try {
        const user = await User.findById(user_id);
        if (!user) return res.status(404).json({ message: "Profile not found" });

        let outputPath = await convertUserDataTOPDF(user);
        return res.json({ "message": outputPath })
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

export const getUserProfileAndUserBasedOnUsername = async (req, res) => {
    const { username } = req.query;
    try {
        const user = await User.findOne({ username }).select("-password -token");
        if (!user) return res.status(404).json({ message: "User not found" });

        return res.json({ "profile": user }) 
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

// --- CONNECTION CONTROLLERS ---

export const sendConnectionRequest = async (req, res) => {
    const { token, connectionId } = req.body;
    try {
        const user = await User.findOne({ token });
        if (!user) return res.status(404).json({ message: "User not found" });

        const connectionUser = await User.findOne({ _id: connectionId });
        if (!connectionUser) return res.status(404).json({ message: "Connection user not found" });

        const existingRequest = await ConnectionRequest.findOne({ 
            userId: user._id, 
            connectionId: connectionUser._id 
        });

        if (existingRequest) return res.status(400).json({ message: "Request already sent" });

        const request = new ConnectionRequest({
            userId: user._id,
            connectionId: connectionUser._id,
        });

        await request.save();
        return res.json({ message: "Connection request sent" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

export const getMyConnectionRequests = async (req, res) => {
    const { token } = req.query;
    try {
        const user = await User.findOne({ token });
        if (!user) return res.status(404).json({ message: "User not found" });

        const connection = await ConnectionRequest.find({ userId: user._id })
            .populate('connectionId', 'name username email profilePicture');

        return res.json({ connection });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

export const whatAreMyConnections = async (req, res) => {
    const { token } = req.query;
    try {
        const user = await User.findOne({ token });
        if (!user) return res.status(404).json({ message: "User not found" });

        const connections = await ConnectionRequest.find({ connectionId: user._id })
            .populate('userId', 'name username email profilePicture');

        return res.json( connections );
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

export const acceptConnectionRequest = async (req, res) => {
    const { token, requestId, action_type } = req.body;
    try {
        const user = await User.findOne({ token });
        if (!user) return res.status(404).json({ message: "User not found" });

        const connection = await ConnectionRequest.findOne({ _id: requestId });
        if (!connection) return res.status(404).json({ message: "Connection not found" });

        if (action_type === "accept") {
            connection.status_accepted = true;
        } else {
            connection.status_accepted = false;
        } 

        await connection.save();
        return res.json({ message: "Request updated" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

// --- POST/COMMENT CONTROLLERS ---

export const commentPost = async (req, res) => {
    const { token, post_id, commentBody } = req.body;
    try {
        const user = await User.findOne({ token: token }).select("_id");
        if (!user) return res.status(404).json({ message: "User not found" });

        const post = await Post.findOne({ _id: post_id });
        if (!post) return res.status(404).json({ message: "Post not found" });

        const comment = new Comment({
            userId: user._id,
            postId: post_id,
            body: commentBody
        });

        await comment.save();
        return res.status(200).json({ message: "Comment Added" })
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

export const deleteProfile = async (req, res) => {
    try {
        const { userId } = req.body;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        await Post.deleteMany({ userId: userId });
        await User.findByIdAndDelete(userId);

        res.json({ message: "Account deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};