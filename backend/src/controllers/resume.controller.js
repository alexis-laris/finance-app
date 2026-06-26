import { PrismaClient } from "@prisma/client";
import moment from "moment";

const prisma = new PrismaClient();

export const getDashboardResume = async (req, res) => {
    try {
        const userId = req.user.id;

        const startOfWeek = moment().startOf("isoWeek").toDate();
        const startOfMonth = moment().startOf("month").toDate();
        const startOf3Months = moment().subtract(3, "months").startOf("month").toDate();


        const [expenses, historyExpenses, paidPayments, historyPaidPayments, upcomingPayments, savingGoals] =
            await Promise.all([
                prisma.expense.findMany({
                    where: { userId, createdAt: { gte: startOfMonth } },
                    select: {
                        amount: true,
                        createdAt: true,
                        categoryId: true,
                        category: { select: { name: true, icon: true } },
                    },
                }),

                prisma.expense.findMany({
                    where: { userId, createdAt: { gte: startOf3Months } },
                    select: { amount: true, createdAt: true },
                }),


                prisma.payment.findMany({
                    where: {
                        userId,
                        status: "PAID",
                        type: "EXPENSE",
                        paidAt: { gte: startOfMonth },
                    },
                    select: {
                        amount: true,
                        paidAt: true,
                        categoryId: true,
                        category: { select: { name: true, icon: true } },
                    },
                }),


                prisma.payment.findMany({
                    where: {
                        userId,
                        status: "PAID",
                        type: "EXPENSE",
                        paidAt: { gte: startOf3Months },
                    },
                    select: { amount: true, paidAt: true },
                }),

                prisma.payment.findMany({
                    where: { userId, status: "PENDING" },
                    orderBy: { scheduledAt: "asc" },
                    select: {
                        id: true,
                        name: true,
                        amount: true,
                        scheduledAt: true,
                        type: true,
                        category: { select: { name: true, icon: true } },
                    },
                }),

                prisma.savingGoal.findMany({
                    where: { userId, status: { in: ["ACTIVE", "COMPLETED"] } },
                    orderBy: { deadline: "asc" },
                    select: {
                        id: true,
                        name: true,
                        targetAmount: true,
                        currentAmount: true,
                        deadline: true,
                        note: true,
                    },
                }),
            ]);


        const paidAsExpenses = paidPayments.map((p) => ({
            amount: p.amount,
            createdAt: p.paidAt,
            categoryId: p.categoryId,
            category: p.category,
        }));

        const paidAsHistoryExpenses = historyPaidPayments.map((p) => ({
            amount: p.amount,
            createdAt: p.paidAt,
        }));


        const allExpenses = [...expenses, ...paidAsExpenses];
        const allHistoryExpenses = [...historyExpenses, ...paidAsHistoryExpenses];


        const weekExpenses = allExpenses.filter((e) =>
            moment(e.createdAt).isSameOrAfter(startOfWeek)
        );

        const weekTotal = weekExpenses.reduce((acc, e) => acc + e.amount, 0);
        const monthTotal = allExpenses.reduce((acc, e) => acc + e.amount, 0);

        const categoryMap = {};

        allExpenses.forEach((e) => {
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


        const historyMap = {};

        allHistoryExpenses.forEach((e) => {
            const day = moment(e.createdAt).format("D [de] MMMM");
            const sortKey = moment(e.createdAt).format("YYYYMMDD");

            if (!historyMap[day]) {
                historyMap[day] = { day, total: 0, sortKey };
            }

            historyMap[day].total += e.amount;
        });

        const history = Object.values(historyMap)
            .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
            .map(({ day, total }) => ({ day, total }));


        const upcomingPaymentsFormatted = upcomingPayments.map((p) => ({
            ...p,
            scheduledAtLabel: p.scheduledAt
                ? moment(p.scheduledAt).format("D [de] MMMM [del] YYYY [a la] h:mm A")
                : null,
            category: p.category ?? null,
        }));

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
            history,
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error al obtener dashboard" });
    }
};

