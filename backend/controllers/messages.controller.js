import Message from "../models/message.model.js";

//  Get Chat History
export const getMessages = async (req, res) => {
    try {
        const { sender, receiver } = req.query;

        const messages = await Message.find({
            $or: [
                { sender: sender, receiver: receiver },
                { sender: receiver, receiver: sender }
            ]
        }).sort({ createdAt: 1 });

        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const sendMessage = async (req, res) => {
    try {
        const { sender, receiver, message } = req.body;
        
        let image = "";
        let file = "";

        // Check for Image (in 'image' field)
        if (req.files && req.files.image) {
            image = req.files.image[0].filename;
        }

        // Check for File (in 'file' field)
        if (req.files && req.files.file) {
            file = req.files.file[0].filename;
        }

        const newMessage = new Message({
            sender,
            receiver,
            message: message || "", 
            image,
            file 
        });

        await newMessage.save();

        res.json(newMessage);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// Mark Messages as Seen
export const markMessagesAsSeen = async (req, res) => {
    try {
        const { sender, receiver } = req.body;

        await Message.updateMany(
            { sender: sender, receiver: receiver, isSeen: false },
            { $set: { isSeen: true } }
        );

        res.json({ message: "Messages marked as seen" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// Delete Message
export const deleteMessage = async (req, res) => {
    try {
        const { messageId, userId, type } = req.body; 

        const msg = await Message.findById(messageId);
        if (!msg) return res.status(404).json({ message: "Message not found" });

        // LOGIC 1: Delete for Everyone (Hard Delete)
        if (type === "everyone") {
            // Check if user is the sender
            if (msg.sender.toString() !== userId) {
                return res.status(403).json({ message: "You can only delete your own messages for everyone" });
            }

            // Check time limit (30 seconds)
            const timeDiff = (Date.now() - new Date(msg.createdAt).getTime()) / 1000;
            if (timeDiff > 30) {
                return res.status(400).json({ message: "Time limit exceeded (30s)" });
            }

            await Message.findByIdAndDelete(messageId);
            return res.json({ message: "Message deleted for everyone", deletedId: messageId, type: "everyone" });
        }

        // LOGIC 2: Delete for Me (Soft Delete)
        if (type === "me") {
            if (!msg.deletedBy.includes(userId)) {
                msg.deletedBy.push(userId);
                await msg.save();
            }
            return res.json({ message: "Message deleted for you", deletedId: messageId, type: "me" });
        }

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}