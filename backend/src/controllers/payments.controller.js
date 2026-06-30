import { PrismaClient } from "@prisma/client";
import moment from "moment-timezone";
import "moment/locale/es.js";

const prisma = new PrismaClient();

const TZ = "America/Mexico_City";
const DATETIME_FORMAT = "D [de] MMMM [del] YYYY [a la] h:mm A";

moment.locale("es");

const fmt = (date) =>
    date
        ? moment(date).tz(TZ).locale("es").format(DATETIME_FORMAT)
        : null;

const now = () => moment().tz(TZ);

export const createPayment = async (req, res) => {
    try {
        const userId = req.user.id;

        const {
            name,
            amount,
            description,
            type,
            scheduledAt,
            categoryId,
        } = req.body;

        const payment = await prisma.payment.create({
            data: {
                name,
                amount: parseFloat(amount),
                description,
                type,
                scheduledAt: new Date(scheduledAt),
                userId,
                categoryId: categoryId || null,
            },
        });

        res.status(201).json(payment);
    } catch (error) {
        console.error("createPayment error:", error);
        res.status(500).json({ message: "Error creating payment" });
    }
};

export const getPayments = async (req, res) => {
    try {
        const userId = req.user.id;

        const payments = await prisma.payment.findMany({
            where: { userId },
            include: {
                category: true,
            },
            orderBy: {
                scheduledAt: "asc",
            },
        });

        const formattedPayments = payments.map((p) => ({
            ...p,
            scheduledAtLabel: fmt(p.scheduledAt),
            paidAtLabel: fmt(p.paidAt),
        }));

        res.json(formattedPayments);
    } catch (error) {
        console.error("getPayments error:", error);
        res.status(500).json({ message: "Error fetching payments" });
    }
};

export const getPaymentById = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const payment = await prisma.payment.findFirst({
            where: {
                id,
                userId,
            },
            include: {
                category: true,
            },
        });

        if (!payment) {
            return res.status(404).json({ message: "Payment not found" });
        }

        res.json({
            ...payment,
            scheduledAtLabel: fmt(payment.scheduledAt),
            paidAtLabel: fmt(payment.paidAt),
        });
    } catch (error) {
        console.error("getPaymentById error:", error);
        res.status(500).json({ message: "Error fetching payment" });
    }
};

export const updatePayment = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const {
            name,
            amount,
            description,
            type,
            scheduledAt,
            categoryId,
        } = req.body;

        const payment = await prisma.payment.findFirst({
            where: { id, userId },
        });

        if (!payment) {
            return res.status(404).json({ message: "Payment not found" });
        }

        const updated = await prisma.payment.update({
            where: { id },
            data: {
                name,
                amount: amount ? parseFloat(amount) : undefined,
                description,
                type,
                scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
                category: categoryId
                    ? { connect: { id: categoryId } }
                    : { disconnect: true },
            },
        });

        res.json({
            ...updated,
            scheduledAtLabel: fmt(updated.scheduledAt),
            paidAtLabel: fmt(updated.paidAt),
        });
    } catch (error) {
        console.error("updatePayment error:", error);
        res.status(500).json({ message: "Error updating payment" });
    }
};

export const deletePayment = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const payment = await prisma.payment.findFirst({
            where: { id, userId },
        });

        if (!payment) {
            return res.status(404).json({ message: "Payment not found" });
        }

        await prisma.payment.delete({
            where: { id },
        });

        res.json({ message: "Payment deleted" });
    } catch (error) {
        console.error("deletePayment error:", error);
        res.status(500).json({ message: "Error deleting payment" });
    }
};

export const togglePaymentStatus = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const payment = await prisma.payment.findFirst({
            where: { id, userId },
        });

        if (!payment) {
            return res.status(404).json({ message: "Payment not found" });
        }

        const isPaid = payment.status === "PAID";

        const updated = await prisma.payment.update({
            where: { id },
            data: {
                status: isPaid ? "PENDING" : "PAID",
                paidAt: isPaid ? null : now().toDate(),
            },
        });

        res.json({
            ...updated,
            scheduledAtLabel: fmt(updated.scheduledAt),
            paidAtLabel: fmt(updated.paidAt),
        });
    } catch (error) {
        console.error("togglePaymentStatus error:", error);
        res.status(500).json({ message: "Error toggling payment status" });
    }
};