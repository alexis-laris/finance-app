import express from "express";
import { getDashboardResume, getNotifications, markNotificationsSeen } from "../controllers/resume.controller.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";


const router = express.Router();


router.use(authMiddleware);

router.get("/", getDashboardResume);
router.get("/notifications", getNotifications);
router.post("/notifications/seen", markNotificationsSeen);

export default router;