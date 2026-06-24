import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";

import {
    createPayment,
    getPayments,
    getPaymentById,
    updatePayment,
    deletePayment,
    togglePaymentStatus,
} from "../controllers/payments.controller.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", getPayments);
router.get("/:id", getPaymentById);
router.post("/", createPayment);
router.put("/:id", updatePayment);
router.delete("/:id", deletePayment);
router.patch("/:id/toggle", togglePaymentStatus);

export default router;