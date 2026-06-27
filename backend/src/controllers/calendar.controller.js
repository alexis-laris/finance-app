import { PrismaClient } from "@prisma/client";
import moment from "moment";
import "moment/locale/es.js";

moment.locale("es");

const prisma = new PrismaClient();

const DATE_FORMAT = "D [de] MMMM [del] YYYY [a la] h:mm A";
const DATETIME_FORMAT = "D [de] MMMM [del] YYYY [a la] h:mm A";
const MXN = (amount) => new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(amount);


export const getCalendar = async (req, res) => {
    try {
        const userId = req.user.id;
        const { month } = req.query;

        const reference = month ? moment(`${month}-01`, "YYYY-MM-DD") : moment();
        const from = reference.clone().startOf("month").toDate();
        const to = reference.clone().endOf("month").toDate();

        const [expenses, incomes, payments, savingGoals] = await Promise.all([
            prisma.expense.findMany({
                where: { userId, date: { gte: from, lte: to } },
                select: {
                    id: true,
                    amount: true,
                    description: true,
                    date: true,
                    category: { select: { id: true, name: true, icon: true, color: true } },
                },
                orderBy: { date: "asc" },
            }),

            prisma.income.findMany({
                where: { userId, date: { gte: from, lte: to } },
                select: {
                    id: true,
                    amount: true,
                    description: true,
                    date: true,
                },
                orderBy: { date: "asc" },
            }),

            prisma.payment.findMany({
                where: { userId, scheduledAt: { gte: from, lte: to } },
                select: {
                    id: true,
                    name: true,
                    amount: true,
                    description: true,
                    type: true,
                    status: true,
                    scheduledAt: true,
                    category: { select: { id: true, name: true, icon: true, color: true } },
                },
                orderBy: { scheduledAt: "asc" },
            }),

            prisma.savingGoal.findMany({
                where: { userId, deadline: { gte: from, lte: to } },
                select: {
                    id: true,
                    name: true,
                    targetAmount: true,
                    currentAmount: true,
                    deadline: true,
                    status: true,
                },
                orderBy: { deadline: "asc" },
            }),
        ]);

        const grouped = {};

        const addToDay = (dateKey, type, item) => {
            if (!grouped[dateKey]) {
                grouped[dateKey] = { expenses: [], incomes: [], payments: [], savingGoals: [] };
            }
            grouped[dateKey][type].push(item);
        };

        expenses.forEach((e) =>
            addToDay(
                toDateKey(e.date),
                "expenses",
                {
                    ...e,
                    eventType: "expense",

                    date: e.date.toISOString(),
                    dateFormatted: moment(e.date).format(DATETIME_FORMAT),
                    amountFormatted: MXN(e.amount),
                }
            )
        );

        incomes.forEach((i) =>
            addToDay(
                toDateKey(i.date),
                "incomes",
                {
                    ...i,
                    eventType: "income",

                    date: i.date.toISOString(),
                    dateFormatted: moment(i.date).format(DATETIME_FORMAT),
                    amountFormatted: MXN(i.amount),
                }
            )
        );

        payments.forEach((p) =>
            addToDay(
                toDateKey(p.scheduledAt),
                "payments",
                {
                    ...p,
                    eventType: "payment",
                    scheduledAtFormatted: moment(p.scheduledAt).format(DATETIME_FORMAT),
                    amountFormatted: MXN(p.amount),
                }
            )
        );

        savingGoals.forEach((g) =>
            addToDay(
                toDateKey(g.deadline),
                "savingGoals",
                {
                    ...g,
                    eventType: "savingGoal",
                    deadlineFormatted: moment(g.deadline).format(DATE_FORMAT),
                    targetAmountFormatted: MXN(g.targetAmount),
                    currentAmountFormatted: MXN(g.currentAmount),
                    progressPercent: Math.min(
                        Math.round((g.currentAmount / g.targetAmount) * 100),
                        100
                    ),
                }
            )
        );

        return res.status(200).json({
            month: reference.format("YYYY-MM"),
            monthFormatted: reference.format("MMMM [del] YYYY"),
            data: grouped,
        });
    } catch (error) {
        console.error("GET_CALENDAR_ERROR:", error);
        return res.status(500).json({ message: "Error al obtener el calendario" });
    }
};


export const getCalendarDay = async (req, res) => {
    try {
        const userId = req.user.id;
        const { date } = req.query;

        if (!date) {
            return res.status(400).json({ message: "El parámetro date es requerido (YYYY-MM-DD)" });
        }

        const parsed = moment(date, "YYYY-MM-DD", true);
        if (!parsed.isValid()) {
            return res.status(400).json({ message: "Formato de fecha inválido. Usa YYYY-MM-DD" });
        }

        const from = parsed.clone().startOf("day").toDate();
        const to = parsed.clone().endOf("day").toDate();

        const [expenses, incomes, payments, savingGoals] = await Promise.all([
            prisma.expense.findMany({
                where: { userId, date: { gte: from, lte: to } },
                include: { category: true },
                orderBy: { date: "asc" },
            }),

            prisma.income.findMany({
                where: { userId, date: { gte: from, lte: to } },
                orderBy: { date: "asc" },
            }),

            prisma.payment.findMany({
                where: { userId, scheduledAt: { gte: from, lte: to } },
                include: { category: true },
                orderBy: { scheduledAt: "asc" },
            }),

            prisma.savingGoal.findMany({
                where: { userId, deadline: { gte: from, lte: to } },
                include: { contributions: { orderBy: { createdAt: "desc" }, take: 5 } },
                orderBy: { deadline: "asc" },
            }),
        ]);

        const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
        const totalIncomes = incomes.reduce((sum, i) => sum + i.amount, 0);
        const totalPayments = payments.reduce((sum, p) => sum + p.amount, 0);

        const summary = {
            totalExpenses,
            totalIncomes,
            totalPayments,
            totalExpensesFormatted: MXN(totalExpenses),
            totalIncomesFormatted: MXN(totalIncomes),
            totalPaymentsFormatted: MXN(totalPayments),
            eventCount: expenses.length + incomes.length + payments.length + savingGoals.length,
        };


        const formattedExpenses = expenses.map((e) => ({
            ...e,
            dateFormatted: moment(e.date).format(DATETIME_FORMAT),
            amountFormatted: MXN(e.amount),
        }));

        const formattedIncomes = incomes.map((i) => ({
            ...i,
            dateFormatted: moment(i.date).format(DATETIME_FORMAT),
            amountFormatted: MXN(i.amount),
        }));

        const formattedPayments = payments.map((p) => ({
            ...p,
            scheduledAtFormatted: moment(p.scheduledAt).format(DATETIME_FORMAT),
            paidAtFormatted: p.paidAt ? moment(p.paidAt).format(DATETIME_FORMAT) : null,
            amountFormatted: MXN(p.amount),
        }));

        const formattedSavingGoals = savingGoals.map((g) => ({
            ...g,
            deadlineFormatted: moment(g.deadline).format(DATE_FORMAT),
            targetAmountFormatted: MXN(g.targetAmount),
            currentAmountFormatted: MXN(g.currentAmount),
            progressPercent: Math.min(
                Math.round((g.currentAmount / g.targetAmount) * 100),
                100
            ),
            contributions: g.contributions.map((c) => ({
                ...c,
                createdAtFormatted: moment(c.createdAt).format(DATETIME_FORMAT),
                amountFormatted: MXN(c.amount),
            })),
        }));

        return res.status(200).json({
            date,
            dateFormatted: parsed.format("dddd, D [de] MMMM [del] YYYY"),
            summary,
            expenses: formattedExpenses,
            incomes: formattedIncomes,
            payments: formattedPayments,
            savingGoals: formattedSavingGoals,
        });
    } catch (error) {
        console.error("GET_CALENDAR_DAY_ERROR:", error);
        return res.status(500).json({ message: "Error al obtener el día" });
    }
};

const toDateKey = (date) => moment(date).format("YYYY-MM-DD");