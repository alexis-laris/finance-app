import express from "express";
import { getDashboardResume } from "../controllers/resume.controller.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";


const router = express.Router();


router.use(authMiddleware);

router.get("/", getDashboardResume);

export default router;