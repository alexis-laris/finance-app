import express from "express";
import {
    register,
    login,
    me,
    logout,
    updateProfile
} from "../controllers/auth.controller.js";
import { upload } from "../middlewares/upload.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", me);
router.post("/logout", logout);
router.put("/profile", upload.single("avatar"), updateProfile);

export default router;