import { PrismaClient } from "@prisma/client";
import moment from "moment";
const prisma = new PrismaClient();
import "moment/locale/es.js";

moment.locale("es");

export const createExpense = async (req, res) => {
    try {
        const { amount, categoryId, description, date } = req.body;

        const expense = await prisma.expense.create({
            data: {
                amount,
                description,
                ...(date && { createdAt: new Date(date) }), // sobreescribe el default
                user: { connect: { id: req.user.id } },
                ...(categoryId && { category: { connect: { id: categoryId } } }),
            },
        });

        res.json(expense);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error creating expense" });
    }
};


export const getExpenses = async (req, res) => {
    try {
        const expenses = await prisma.expense.findMany({
            where: { userId: req.user.id },
            include: {
                category: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        const formattedExpenses = expenses.map((exp) => ({
            ...exp,
            createdAtFormatted: moment(exp.createdAt).format("D [de] MMMM [del] YYYY [a la] h:mm A"),
        }));

        res.json(formattedExpenses);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching expenses" });
    }
};


export const updateExpense = async (req, res) => {
    try {
        const { id } = req.params;
        const { amount, categoryId, description, date } = req.body;


        const existingExpense = await prisma.expense.findFirst({
            where: {
                id,
                userId: req.user.id,
            },
        });

        if (!existingExpense) {
            return res.status(404).json({ message: "Expense not found" });
        }

        const updated = await prisma.expense.update({
            where: { id },
            data: {
                amount,
                description,
                ...(date && { createdAt: new Date(date) }),
                category: categoryId
                    ? { connect: { id: categoryId } }
                    : { disconnect: true },
            },
        });

        res.json(updated);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error updating expense" });
    }
};


export const deleteExpense = async (req, res) => {
    try {
        const { id } = req.params;


        const existingExpense = await prisma.expense.findFirst({
            where: {
                id,
                userId: req.user.id,
            },
        });

        if (!existingExpense) {
            return res.status(404).json({ message: "Expense not found" });
        }

        await prisma.expense.delete({
            where: { id },
        });

        res.json({ message: "Expense deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error deleting expense" });
    }
};