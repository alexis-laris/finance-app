import { PrismaClient } from "@prisma/client";
import moment from "moment";

const prisma = new PrismaClient();

export const getDashboardResume = async (req, res) => {
    try {
        const userId = req.user.id;




        const startOfWeek = moment().startOf("isoWeek").toDate(); // lunes
        const startOfMonth = moment().startOf("month").toDate();


        const expenses = await prisma.expense.findMany({
            where: {
                userId,
                createdAt: {
                    gte: startOfMonth,
                },
            },
            select: {
                amount: true,
                createdAt: true,
                categoryId: true,
                category: {
                    select: {
                        name: true,
                        icon: true,
                    },
                },
            },
        });


        const weekExpenses = expenses.filter((e) =>
            moment(e.createdAt).isSameOrAfter(startOfWeek)
        );

        const weekTotal = weekExpenses.reduce(
            (acc, e) => acc + e.amount,
            0
        );


        const monthTotal = expenses.reduce(
            (acc, e) => acc + e.amount,
            0
        );


        const categoryMap = {};

        expenses.forEach((e) => {
            const key = e.categoryId;

            if (!categoryMap[key]) {
                categoryMap[key] = {
                    categoryId: key,
                    name: e.category.name,
                    total: 0,
                };
            }

            categoryMap[key].total += e.amount;
        });

        const byCategory = Object.values(categoryMap);


        const now = new Date();

        const upcomingPayments = await prisma.payment.findMany({
            where: {
                userId,
                status: "PENDING",
                scheduledAt: {
                    gte: now,
                },
            },
            orderBy: {
                scheduledAt: "asc",
            },
            select: {
                id: true,
                name: true,
                amount: true,
                scheduledAt: true,
                type: true,
                category: {
                    select: {
                        name: true,
                        icon: true,
                    },
                },
            },
        });

        return res.json({
            week: {
                total: weekTotal,
            },
            month: {
                total: monthTotal,
            },
            byCategory,
            upcomingPayments
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Error al obtener dashboard",
        });
    }
};