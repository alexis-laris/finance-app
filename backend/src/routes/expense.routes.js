import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";

import {
    createExpense,
    getExpenses,
    updateExpense,
    deleteExpense,
} from "../controllers/expense.controller.js";

const router = express.Router();


router.use(authMiddleware);


router.post("/", createExpense);
router.get("/", getExpenses);
router.put("/:id", updateExpense);
router.delete("/:id", deleteExpense);

export default router;