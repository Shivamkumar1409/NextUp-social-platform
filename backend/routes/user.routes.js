import { Router } from "express";
import { 
    uploadProfilePicture, 
    uploadBackgroundWallpaper, 
    updateUserProfile, 
    updateProfileData, 
    getAllUserProfile, 
    downloadProfile, 
    getUserProfileAndUserBasedOnUsername, 
    sendConnectionRequest, 
    getMyConnectionRequests, 
    whatAreMyConnections, 
    acceptConnectionRequest, 
    commentPost,
    deleteProfile
} from "../controllers/user.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js"; 
import multer from "multer";

const router = Router();

// --- MULTER CONFIGURATION ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/"); 
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});
const upload = multer({ storage });

// --- PROFILE ROUTES ---
router.post("/upload_profile_picture", upload.single("profile_picture"), uploadProfilePicture);

// --- BANNER/COVER IMAGE ROUTE ---
router.post("/upload_background_wallpaper", upload.single("background_wallpaper"), uploadBackgroundWallpaper);

router.post("/user_update", updateUserProfile);
router.post("/update_profile_data", updateProfileData);
router.get("/user/get_all_users", getAllUserProfile); 
router.get("/user/download_resume", downloadProfile);
router.get("/get_user_profile_based_on_username", getUserProfileAndUserBasedOnUsername);

// --- CONNECTION ROUTES ---
router.post("/send_connection_request", sendConnectionRequest);
router.get("/my_connections_requests", getMyConnectionRequests);
router.get("/my_connections", whatAreMyConnections);
router.post("/connection_request_response", acceptConnectionRequest);

// --- OTHER ROUTES ---
router.post("/user/comment", commentPost);
router.delete("/delete_profile", deleteProfile);

export default router;