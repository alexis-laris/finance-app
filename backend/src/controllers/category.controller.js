import { PrismaClient } from "@prisma/client";
import moment from "moment";
const prisma = new PrismaClient();

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
            where: {
                userId: req.user.id,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        const formattedCategories = categories.map((cat) => ({
            ...cat,
            createdAtFormatted: moment(cat.createdAt).format("DD MMM YYYY"),
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
            where: {
                id,
                userId: req.user.id,
            },
        });

        if (!existing) {
            return res.status(404).json({ message: "Category not found" });
        }

        const updated = await prisma.category.update({
            where: { id },
            data: {
                name,
                icon,
                color,
                description
            },
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
            where: {
                id,
                userId: req.user.id,
            },
        });

        if (!existing) {
            return res.status(404).json({ message: "Category not found" });
        }

        await prisma.category.delete({
            where: { id },
        });

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
            where: {
                id,
                userId: req.user.id,
            },
            include: {
                expenses: {
                    orderBy: {
                        createdAt: "desc",
                    },
                },
                payments: {
                    orderBy: {
                        createdAt: "desc",
                    },
                },
            },
        });

        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }


        const totalExpenses = category.expenses.reduce(
            (sum, exp) => sum + exp.amount,
            0
        );


        const totalPayments = category.payments.reduce(
            (sum, pay) => sum + pay.amount,
            0
        );

        const formattedCategory = {
            ...category,

            createdAtFormatted: moment(category.createdAt).format("DD MMM YYYY"),

            expensesCount: category.expenses.length,
            paymentsCount: category.payments.length,

            totalExpenses,
            totalPayments,

            // 🔥 solo últimos 10 para no saturar el front
            expenses: category.expenses.slice(0, 10),
            payments: category.payments.slice(0, 10),
        };

        res.json(formattedCategory);
    } catch (error) {
        console.error("GET_CATEGORY_BY_ID_ERROR:", error);
        res.status(500).json({ message: "Error fetching category" });
    }
};