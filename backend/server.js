import authRoutes from "./routes/auth.routes.js";
import express from 'express';
import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { createServer } from 'http';
import { Server } from 'socket.io';
import postsRoutes from "./routes/posts.routes.js";
import userRoutes from "./routes/user.routes.js";
import messageRoutes from "./routes/messages.routes.js";

dotenv.config();

const app = express();
const server = createServer(app);

const io = new Server(server, {   
    cors: {
        origin: "http://localhost:3000", 
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(express.json());

// --- FIX: MOVE AUTH ROUTES TO THE TOP ---
app.use(authRoutes); 

// Then load the other routes
app.use(postsRoutes);
app.use(userRoutes);
app.use(messageRoutes);
app.use(express.static("uploads"));

// Store online users: Map<UserId, SocketId>
const onlineUsers = new Map();

io.on("connection", (socket) => {
    // ... (Your existing socket code is fine, keep it here) ...
    console.log("A user connected:", socket.id);

    // 1. REGISTER
    socket.on("register_user", (userId) => {
        if (userId) {
            onlineUsers.set(userId, socket.id);
            console.log(`User registered: ${userId} connected on ${socket.id}`);
            io.emit("get_online_users", Array.from(onlineUsers.keys()));
        }
    });

    // 2. SEND MESSAGE
    socket.on("send_message", (data) => {
        const { receiverId, message, senderId, image, _id, file } = data; 
        const receiverSocketId = onlineUsers.get(receiverId);

        if (receiverSocketId) {
            io.to(receiverSocketId).emit("receive_message", {
                message, senderId, image, file, _id,
                timestamp: new Date().toISOString()
            });
        }
    });

    // 3. SEEN EVENT
    socket.on("mark_as_seen", ({ senderId, receiverId }) => {
        const senderSocketId = onlineUsers.get(senderId);
        if (senderSocketId) io.to(senderSocketId).emit("messages_seen", { receiverId });
    });

    // 4. DELETE EVENT
    socket.on("delete_message", (data) => {
        const { receiverId, messageId } = data;
        const receiverSocketId = onlineUsers.get(receiverId);
        if (receiverSocketId) io.to(receiverSocketId).emit("message_deleted", { messageId });
    });

    // 5. DISCONNECT
    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
        for (let [userId, socketId] of onlineUsers.entries()) {
            if (socketId === socket.id) {
                onlineUsers.delete(userId);
                io.emit("get_online_users", Array.from(onlineUsers.keys()));
                break;
            }
        }
    });
});


const start = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || "mongodb+srv://nextup2027_db_user:XzilrE2EB7P5x6PL@nextup.o4hnvsh.mongodb.net/?appName=NextUp");
        server.listen(9090, () => {
            console.log("Server (with Socket.io) is running on port 9090")
        })
    } catch (error) {
        console.log(error);
    }
}
start();