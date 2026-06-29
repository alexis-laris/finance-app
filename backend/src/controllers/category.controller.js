import { PrismaClient } from "@prisma/client";
import moment from "moment-timezone";

moment.locale("es");

const prisma = new PrismaClient();

const TZ = "America/Mexico_City";
const DATETIME_FORMAT = "D [de] MMMM [del] YYYY [a la] h:mm A";
const MXN = (amount) => new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(amount);

const fmt = (date) => date ? moment(date).tz(TZ).locale("es").format(DATETIME_FORMAT) : null;

export const createCategory = async (req, res) => {
    try {
        const { name, icon, color, description } = req.body;

        if (!name) {
            return res.status(400).json({ message: "Name is required" });
        }

        const category = await prisma.category.create({
            data: {
                name,
                icon: icon || "Folder",
                color: color || "#64748b",
                description: description || "",
                userId: req.user.id,
            },
        });

        res.status(201).json(category);
    } catch (error) {
        console.error("CREATE_CATEGORY_ERROR:", error);
        res.status(500).json({ message: "Error creating category" });
    }
};

export const getCategories = async (req, res) => {
    try {
        const categories = await prisma.category.findMany({
            where: { userId: req.user.id },
            orderBy: { createdAt: "desc" },
        });

        const formattedCategories = categories.map((cat) => ({
            ...cat,
            createdAtFormatted: fmt(cat.createdAt),
        }));

        res.json(formattedCategories);
    } catch (error) {
        console.error("GET_CATEGORIES_ERROR:", error);
        res.status(500).json({ message: "Error fetching categories" });
    }
};

export const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, icon, color, description } = req.body;

        const existing = await prisma.category.findFirst({
            where: { id, userId: req.user.id },
        });

        if (!existing) {
            return res.status(404).json({ message: "Category not found" });
        }

        const updated = await prisma.category.update({
            where: { id },
            data: { name, icon, color, description },
        });

        res.json(updated);
    } catch (error) {
        console.error("UPDATE_CATEGORY_ERROR:", error);
        res.status(500).json({ message: "Error updating category" });
    }
};

export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const existing = await prisma.category.findFirst({
            where: { id, userId: req.user.id },
        });

        if (!existing) {
            return res.status(404).json({ message: "Category not found" });
        }

        await prisma.category.delete({ where: { id } });

        res.json({ message: "Category deleted successfully" });
    } catch (error) {
        console.error("DELETE_CATEGORY_ERROR:", error);
        res.status(500).json({ message: "Error deleting category" });
    }
};

export const getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;

        const category = await prisma.category.findFirst({
            where: { id, userId: req.user.id },
            include: {
                expenses: { orderBy: { createdAt: "desc" } },
                payments: { orderBy: { createdAt: "desc" } },
            },
        });

        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }

        const totalExpenses = category.expenses.reduce((sum, e) => sum + e.amount, 0);
        const totalPayments = category.payments.reduce((sum, p) => sum + p.amount, 0);

        const formattedCategory = {
            ...category,
            createdAtFormatted: fmt(category.createdAt),
            expensesCount: category.expenses.length,
            paymentsCount: category.payments.length,
            totalExpenses,
            totalPayments,
            expenses: category.expenses.slice(0, 10).map((e) => ({
                ...e,
                createdAtFormatted: fmt(e.createdAt),
                amountFormatted: MXN(e.amount),
            })),
            payments: category.payments.slice(0, 10).map((p) => ({
                ...p,
                createdAtFormatted: fmt(p.createdAt),
                scheduledAtFormatted: fmt(p.scheduledAt),
                paidAtFormatted: fmt(p.paidAt), // ya maneja null con el helper
                amountFormatted: MXN(p.amount),
            })),
        };

        res.json(formattedCategory);
    } catch (error) {
        console.error("GET_CATEGORY_BY_ID_ERROR:", error);
        res.status(500).json({ message: "Error fetching category" });
    }
};