import express from "express";
import morgan from "morgan";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.routes.js";
import expenseRoutes from "./routes/expense.routes.js";
import categories from "./routes/categories.routes.js";
import resume from "./routes/resume.routes.js";
import payment from "./routes/payment.routes.js";
import savings from "./routes/savings.routes.js";
import calendar from "./routes/calendar.routes.js";

dotenv.config();

const app = express();

app.use(cookieParser());

app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.json({
        status: "ok",
        message: "Finance API funcionando 🚀",
    });
});

app.use("/api/auth", authRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/categories", categories);
app.use("/api/resume", resume);
app.use("/api/payment", payment);
app.use("/api/savings", savings);
app.use("/api/calendar", calendar);

export default app;