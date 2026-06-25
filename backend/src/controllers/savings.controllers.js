import { PrismaClient } from "@prisma/client";
import moment from "moment";
import "moment/locale/es.js";

moment.locale("es");
const prisma = new PrismaClient();


export const createSavingGoal = async (req, res) => {
    try {
        const userId = req.user.id;

        const { name, targetAmount, deadline, note } = req.body;

        const goal = await prisma.savingGoal.create({
            data: {
                name,
                targetAmount: Number(targetAmount),
                deadline: new Date(deadline),
                note,
                userId,
            },
        });

        return res.json(goal);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error creando meta de ahorro" });
    }
};


export const getSavingGoals = async (req, res) => {
    try {
        const userId = req.user.id;

        const goals = await prisma.savingGoal.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            include: {
                contributions: true,
            },
        });

        const formattedGoals = goals.map((goal) => ({
            ...goal,
            deadlineLabel: goal.deadline
                ? moment(goal.deadline).format("D [de] MMMM [del] YYYY [a la] h:mm A")
                : null,
        }));

        return res.json(formattedGoals);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error obteniendo metas" });
    }
};


export const getSavingGoalById = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const goal = await prisma.savingGoal.findFirst({
            where: { id, userId },
            include: {
                contributions: {
                    orderBy: { createdAt: "desc" },
                },
            },
        });

        if (!goal) {
            return res.status(404).json({ message: "Meta no encontrada" });
        }

        const totalSaved = goal.currentAmount;
        const remaining = Math.max(goal.targetAmount - totalSaved, 0);

        const now = new Date();
        const deadline = new Date(goal.deadline);

        const daysLeft = Math.ceil(
            (deadline - now) / (1000 * 60 * 60 * 24)
        );

        const dailyNeeded =
            daysLeft > 0 && remaining > 0 ? remaining / daysLeft : 0;

        const weeklyNeeded = dailyNeeded * 7;
        const monthlyNeeded = dailyNeeded * 30;

        const progress =
            goal.targetAmount > 0
                ? Math.min((totalSaved / goal.targetAmount) * 100, 100)
                : 0;

        return res.json({
            ...goal,
            contributions: goal.contributions.map((c) => ({
                ...c,
                createdAtLabel: moment(c.createdAt).format("D [de] MMMM [del] YYYY [a la] h:mm A"),
            })),
            deadlineLabel: goal.deadline
                ? moment(goal.deadline).format("D [de] MMMM [del] YYYY [a la] h:mm A")
                : null,
            createdAtLabel: goal.createdAt
                ? moment(goal.createdAt).format("D [de] MMMM [del] YYYY [a la] h:mm A")
                : null,
            stats: {
                totalSaved,
                remaining,
                progress: parseFloat(progress.toFixed(2)),
                daysLeft,
                dailyNeeded: parseFloat(dailyNeeded.toFixed(2)),
                weeklyNeeded: parseFloat(weeklyNeeded.toFixed(2)),
                monthlyNeeded: parseFloat(monthlyNeeded.toFixed(2)),
            },
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error obteniendo meta" });
    }
};


export const addContribution = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const { amount, note, date } = req.body;

        const goal = await prisma.savingGoal.findFirst({
            where: { id, userId },
        });

        if (!goal) {
            return res.status(404).json({ message: "Meta no encontrada" });
        }

        const updatedGoal = await prisma.$transaction(async (tx) => {
            const contribution = await tx.savingGoalContribution.create({
                data: {
                    amount: Number(amount),
                    note,
                    ...(date && { createdAt: new Date(date) }),
                    savingGoalId: id,
                },
            });

            const newTotal =
                goal.currentAmount + Number(amount);

            let status = goal.status;

            if (newTotal >= goal.targetAmount) {
                status = "COMPLETED";
            }

            if (new Date(goal.deadline) < new Date() && newTotal < goal.targetAmount) {
                status = "FAILED";
            }

            const updated = await tx.savingGoal.update({
                where: { id },
                data: {
                    currentAmount: newTotal,
                    status,
                },
            });

            return { updated, contribution };
        });

        return res.json(updatedGoal);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error agregando contribución" });
    }
};


export const updateSavingGoal = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const { name, targetAmount, deadline, note, status } = req.body;

        const goal = await prisma.savingGoal.findFirst({
            where: { id, userId },
        });

        if (!goal) {
            return res.status(404).json({ message: "Meta no encontrada" });
        }

        const updated = await prisma.savingGoal.update({
            where: { id },
            data: {
                name,
                targetAmount: targetAmount ? Number(targetAmount) : undefined,
                deadline: deadline ? new Date(deadline) : undefined,
                note,
                status,
            },
        });

        return res.json(updated);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error actualizando meta" });
    }
};


export const deleteSavingGoal = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const goal = await prisma.savingGoal.findFirst({
            where: { id, userId },
        });

        if (!goal) {
            return res.status(404).json({ message: "Meta no encontrada" });
        }

        await prisma.savingGoal.delete({
            where: { id },
        });

        return res.json({ message: "Meta eliminada correctamente" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error eliminando meta" });
    }
};


export const updateContribution = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id, contributionId } = req.params;
        const { amount, note, date } = req.body;


        const goal = await prisma.savingGoal.findFirst({
            where: { id, userId },
        });

        if (!goal) {
            return res.status(404).json({ message: "Meta no encontrada" });
        }


        const contribution = await prisma.savingGoalContribution.findFirst({
            where: { id: contributionId, savingGoalId: id },
        });

        if (!contribution) {
            return res.status(404).json({ message: "Contribución no encontrada" });
        }

        const diff = Number(amount) - contribution.amount;

        const result = await prisma.$transaction(async (tx) => {
            const updated = await tx.savingGoalContribution.update({
                where: { id: contributionId },
                data: {
                    amount: Number(amount),
                    note,
                    ...(date && { createdAt: new Date(date) }),
                },
            });

            const newTotal = goal.currentAmount + diff;

            let status = goal.status;
            if (newTotal >= goal.targetAmount) status = "COMPLETED";
            if (new Date(goal.deadline) < new Date() && newTotal < goal.targetAmount) status = "FAILED";

            await tx.savingGoal.update({
                where: { id },
                data: { currentAmount: newTotal, status },
            });

            return updated;
        });

        return res.json(result);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error actualizando contribución" });
    }
};


export const deleteContribution = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id, contributionId } = req.params;


        const goal = await prisma.savingGoal.findFirst({
            where: { id, userId },
        });

        if (!goal) {
            return res.status(404).json({ message: "Meta no encontrada" });
        }

        const contribution = await prisma.savingGoalContribution.findFirst({
            where: { id: contributionId, savingGoalId: id },
        });

        if (!contribution) {
            return res.status(404).json({ message: "Contribución no encontrada" });
        }

        await prisma.$transaction(async (tx) => {
            await tx.savingGoalContribution.delete({
                where: { id: contributionId },
            });

            const newTotal = goal.currentAmount - contribution.amount;

            let status = goal.status;
            if (newTotal >= goal.targetAmount) status = "COMPLETED";
            if (new Date(goal.deadline) < new Date() && newTotal < goal.targetAmount) status = "FAILED";

            if (newTotal < goal.targetAmount && new Date(goal.deadline) >= new Date()) status = "ACTIVE"; // 👈

            await tx.savingGoal.update({
                where: { id },
                data: { currentAmount: Math.max(newTotal, 0), status },
            });
        });

        return res.json({ message: "Contribución eliminada correctamente" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error eliminando contribución" });
    }
};