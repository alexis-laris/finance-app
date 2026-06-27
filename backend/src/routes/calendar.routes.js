import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import {
    getCalendar,
    getCalendarDay,
} from "../controllers/calendar.controller.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", getCalendar);
router.get("/day", getCalendarDay);

export default router;