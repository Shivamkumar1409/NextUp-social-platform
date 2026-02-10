import { Router } from "express";
import { getMessages, sendMessage, markMessagesAsSeen, deleteMessage } from "../controllers/messages.controller.js";
import multer from "multer";
import path from "path";

const router = Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

router.route("/get_messages").get(getMessages);
router.route("/send_message").post(upload.fields([{ name: 'image' }, { name: 'file' }]), sendMessage); 
router.route("/mark_seen").post(markMessagesAsSeen);
router.route("/delete_message").post(deleteMessage);

export default router;