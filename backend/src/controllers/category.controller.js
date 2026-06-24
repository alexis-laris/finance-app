import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createCategory = async (req, res) => {
    try {
        const { name, icon, color } = req.body;

        if (!name) {
            return res.status(400).json({ message: "Name is required" });
        }

        const category = await prisma.category.create({
            data: {
                name,
                icon: icon || "Folder",
                color: color || "text-gray-500",
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

        res.json(categories);
    } catch (error) {
        console.error("GET_CATEGORIES_ERROR:", error);
        res.status(500).json({ message: "Error fetching categories" });
    }
};

export const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, icon, color } = req.body;

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