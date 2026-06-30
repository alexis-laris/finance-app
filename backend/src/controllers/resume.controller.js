import { PrismaClient } from "@prisma/client";
import moment from "moment-timezone";

moment.locale("es");

const prisma = new PrismaClient();

const TZ = "America/Mexico_City";
const DATETIME_FORMAT = "D [de] MMMM [del] YYYY [a la] h:mm A";
const fmt = (date) => date ? moment(date).tz(TZ).locale("es").format(DATETIME_FORMAT) : null;
const now = () => moment().tz(TZ);

export const getDashboardResume = async (req, res) => {
    try {
        const userId = req.user.id;

        const startOfWeek = now().startOf("isoWeek").toDate();
        const startOfMonth = now().startOf("month").toDate();
        const startOf3Months = now().subtract(3, "months").startOf("month").toDate();

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
                    where: { userId, status: "PAID", type: "EXPENSE", paidAt: { gte: startOfMonth } },
                    select: {
                        amount: true,
                        paidAt: true,
                        categoryId: true,
                        category: { select: { name: true, icon: true } },
                    },
                }),
                prisma.payment.findMany({
                    where: { userId, status: "PAID", type: "EXPENSE", paidAt: { gte: startOf3Months } },
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
                        id: true, name: true, targetAmount: true,
                        currentAmount: true, deadline: true, note: true,
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
            moment(e.createdAt).tz(TZ).isSameOrAfter(startOfWeek)
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
            const m = moment(e.createdAt).tz(TZ).locale("es");
            const day = m.format("D [de] MMMM");
            const sortKey = m.format("YYYYMMDD");

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
            scheduledAtLabel: fmt(p.scheduledAt),
            category: p.category ?? null,
        }));

        const savingGoalsFormatted = savingGoals.map((g) => ({
            ...g,
            deadlineLabel: fmt(g.deadline),
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

export const getNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const today = now();
        const in3Days = now().add(3, "days").toDate();

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { notificationsLastSeenAt: true },
        });
        // Si el usuario nunca abrió el menú de notificaciones, todo cuenta como nuevo
        const lastSeenAt = user?.notificationsLastSeenAt ?? new Date(0);
        const startOfToday = today.clone().startOf("day").toDate();

        const [overduePayments, soonPayments, soonGoals] = await Promise.all([
            // Pagos vencidos
            prisma.payment.findMany({
                where: { userId, status: "PENDING", scheduledAt: { lt: today.toDate() } },
                orderBy: { scheduledAt: "asc" },
                select: { id: true, name: true, amount: true, scheduledAt: true, type: true },
            }),
            // Pagos próximos a vencer (próximos 3 días)
            prisma.payment.findMany({
                where: {
                    userId,
                    status: "PENDING",
                    scheduledAt: { gte: today.toDate(), lte: in3Days },
                },
                orderBy: { scheduledAt: "asc" },
                select: { id: true, name: true, amount: true, scheduledAt: true, type: true },
            }),
            // Metas de ahorro próximas a vencer y no completadas
            prisma.savingGoal.findMany({
                where: {
                    userId,
                    status: "ACTIVE",
                    deadline: { gte: today.toDate(), lte: in3Days },
                },
                select: { id: true, name: true, targetAmount: true, currentAmount: true, deadline: true },
            }),
        ]);

        // El "isNew" no depende de la fecha del pago/meta, sino de si el
        // usuario ya abrió el menú HOY. Comparamos contra el inicio del día
        // (no contra "ahora") para que no se reactive solo por el paso del
        // tiempo entre que se marca como visto y el siguiente refetch.
        const isNew = lastSeenAt < startOfToday;

        const notifications = [
            ...overduePayments.map((p) => ({
                id: `payment-overdue-${p.id}`,
                type: "PAYMENT_OVERDUE",
                title: "Pago vencido",
                message: `"${p.name}" venció el ${fmt(p.scheduledAt)}`,
                severity: "danger",
                date: p.scheduledAt,
                dateLabel: fmt(p.scheduledAt),
                isNew,
            })),
            ...soonPayments.map((p) => ({
                id: `payment-soon-${p.id}`,
                type: "PAYMENT_DUE_SOON",
                title: "Pago próximo",
                message: `"${p.name}" vence el ${fmt(p.scheduledAt)}`,
                severity: "warning",
                date: p.scheduledAt,
                dateLabel: fmt(p.scheduledAt),
                isNew,
            })),
            ...soonGoals.map((g) => ({
                id: `goal-soon-${g.id}`,
                type: "GOAL_DEADLINE_SOON",
                title: "Meta por vencer",
                message: `"${g.name}" vence el ${fmt(g.deadline)} (llevas ${g.currentAmount}/${g.targetAmount})`,
                severity: "info",
                date: g.deadline,
                dateLabel: fmt(g.deadline),
                isNew,
            })),
        ].sort((a, b) => a.date - b.date);

        const unseenCount = notifications.filter((n) => n.isNew).length;

        return res.json({
            count: notifications.length,
            unseenCount,
            notifications,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error al obtener notificaciones" });
    }
};

export const markNotificationsSeen = async (req, res) => {
    try {
        const userId = req.user.id;

        await prisma.user.update({
            where: { id: userId },
            data: { notificationsLastSeenAt: new Date() },
        });

        return res.json({ ok: true });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error al marcar notificaciones como vistas" });
    }
};