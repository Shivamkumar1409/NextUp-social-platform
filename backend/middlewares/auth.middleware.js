import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.headers["authorization"];
        const token = authHeader && authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }

        // Check if token matches the custom token stored in DB
        const user = await User.findOne({ token: token });

        if (!user) {
            return res.status(403).json({ message: "Invalid token" });
        }

        req.user = user; // Attach user to request
        next();
    } catch (error) {
        return res.status(500).json({ message: "Server error during authentication" });
    }
};