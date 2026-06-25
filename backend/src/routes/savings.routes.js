import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";

import {
    createSavingGoal,
    getSavingGoals,
    getSavingGoalById,
    addContribution,
    updateSavingGoal,
    deleteSavingGoal,
    updateContribution,
    deleteContribution
} from "../controllers/savings.controllers.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/", createSavingGoal);
router.get("/", getSavingGoals);
router.get("/:id", getSavingGoalById);
router.post("/:id/contributions", addContribution);
router.put("/:id", updateSavingGoal);
router.delete("/:id", deleteSavingGoal);
router.put("/:id/contributions/:contributionId", updateContribution);
router.delete("/:id/contributions/:contributionId", deleteContribution);

export default router;