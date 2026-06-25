import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import {
    createCategory,
    getCategories,
    updateCategory,
    deleteCategory,
} from "../controllers/category.controller.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/", createCategory);
router.get("/", getCategories);
router.put("/:id", updateCategory);
router.delete("/:id", deleteCategory);

export default router;