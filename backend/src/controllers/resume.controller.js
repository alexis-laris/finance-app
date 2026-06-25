import { PrismaClient } from "@prisma/client";
import moment from "moment";

const prisma = new PrismaClient();

export const getDashboardResume = async (req, res) => {
    try {
        const userId = req.user.id;

        const startOfWeek = moment().startOf("isoWeek").toDate();
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
            const key = e.categoryId ?? "uncategorized";

            if (!categoryMap[key]) {
                categoryMap[key] = {
                    categoryId: key,
                    name: e.category?.name ?? "Sin categoría",
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

        const upcomingPaymentsFormatted = upcomingPayments.map((p) => ({
            ...p,
            scheduledAtLabel: p.scheduledAt
                ? moment(p.scheduledAt).format("D [de] MMMM [del] YYYY [a la] h:mm A")
                : null,
            category: p.category ?? null,
        }));


        const savingGoals = await prisma.savingGoal.findMany({
            where: {
                userId,
                status: { in: ["ACTIVE", "COMPLETED"] },
            },
            orderBy: {
                deadline: "asc",
            },
            select: {
                id: true,
                name: true,
                targetAmount: true,
                currentAmount: true,
                deadline: true,
                note: true,
            },
        });

        const savingGoalsFormatted = savingGoals.map((g) => ({
            ...g,
            deadlineLabel: g.deadline
                ? moment(g.deadline).format("D [de] MMMM [del] YYYY [a la] h:mm A")
                : null,
        }));

        return res.json({
            week: { total: weekTotal },
            month: { total: monthTotal },
            byCategory,
            upcomingPayments: upcomingPaymentsFormatted,
            savingGoals: savingGoalsFormatted,
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Error al obtener dashboard",
        });
    }
};

