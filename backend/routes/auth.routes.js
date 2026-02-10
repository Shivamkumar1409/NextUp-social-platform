import { Router } from "express";
import { 
    register, 
    login, 
    googleAuth, 
    getUserAndProfile, 
    updateUserProfile,   
    updateProfileData, 
    deleteAccount 
} from "../controllers/auth.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();

// --- AUTHENTICATION ---
router.post("/register", register);
router.post("/login", login);
router.post("/google_login", googleAuth);

// --- PROFILE DATA ---
router.get("/get_user_and_profile", getUserAndProfile);

// --- UPDATES ---
router.post("/user_update", updateUserProfile);       
router.post("/update_profile_data", updateProfileData); 

// --- ACCOUNT DELETION ---
router.delete("/delete_account", verifyToken, deleteAccount);

export default router;