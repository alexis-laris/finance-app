import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Plus,
    Pencil,
    Trash2,
    Car,
    Home,
    ShoppingBag,
    Folder,
    UtensilsCrossed,
    HeartPulse,
    CreditCard,
    Gamepad2,
    Wifi,
    Smartphone,
    PiggyBank,
    Pipette,
    Check
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import {
    getPaymentsRequest,
    createPaymentRequest,
    updatePaymentRequest,
    deletePaymentRequest,
    togglePaymentStatusRequest,
} from "../services/payments.service";

import PaymentForm from "../components/PaymentsForm";
import formatToMXN from "../lib/formatMXN";
import Loader from "../components/utils/Loader";

const categoryIcons = {
    car: Car,
    home: Home,
    shopping: ShoppingBag,
    utensils: UtensilsCrossed,
    health: HeartPulse,
    creditcard: CreditCard,
    gamepad2: Gamepad2,
    wifi: Wifi,
    smartphone: Smartphone,
    piggybank: PiggyBank,
    default: Folder,
};

export default function Payments() {
    const [open, setOpen] = useState(false);
    const [editingPayment, setEditingPayment] = useState(null);
    const [deletingPayment, setDeletingPayment] = useState(null);

    const queryClient = useQueryClient();

    const { data: payments = [], isLoading } = useQuery({
        queryKey: ["payments"],
        queryFn: getPaymentsRequest,
    });

    const invalidate = () =>
        queryClient.invalidateQueries({ queryKey: ["payments"] });

    const createMutation = useMutation({
        mutationFn: createPaymentRequest,
        onSuccess: () => {
            invalidate();
            setOpen(false);
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => updatePaymentRequest(id, data),
        onSuccess: () => {
            invalidate();
            setOpen(false);
            setEditingPayment(null);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deletePaymentRequest,
        onSuccess: () => {
            invalidate();
            setDeletingPayment(null);
        },
    });

    const toggleMutation = useMutation({
        mutationFn: togglePaymentStatusRequest,
        onSuccess: () => invalidate(),
    });

    const isSubmitting =
        createMutation.isPending ||
        updateMutation.isPending ||
        toggleMutation.isPending ||
        deleteMutation.isPending;

    const openCreateModal = () => {
        setEditingPayment(null);
        setOpen(true);
    };

    const openEditModal = (p) => {
        setEditingPayment(p);
        setOpen(true);
    };

    const handleSubmit = (data) => {
        if (editingPayment) {
            updateMutation.mutate({ id: editingPayment.id, data });
        } else {
            createMutation.mutate(data);
        }
    };

    const handleCloseModal = () => {
        setOpen(false);
        setEditingPayment(null);
    };

    const handleConfirmDelete = () => {
        if (deletingPayment) {
            deleteMutation.mutate(deletingPayment.id);
        }
    };

    const groupedPayments = useMemo(() => {
        return payments.reduce((acc, p) => {
            const key = p.category?.name || "Sin categoría";

            if (!acc[key]) {
                acc[key] = {
                    category: p.category,
                    items: [],
                    total: 0,
                };
            }

            acc[key].items.push(p);
            acc[key].total += Number(p.amount);

            return acc;
        }, {});
    }, [payments]);

    if (isLoading) {
        return <Loader />;
    }

    return (
        <>
            {isSubmitting && <Loader />}

            <div className="space-y-6">


                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Pagos</h1>
                        <p className="text-sm text-gray-400">
                            Administra tus pagos programados
                        </p>
                    </div>

                    <Button
                        onClick={openCreateModal}
                        className="cursor-pointer flex items-center gap-2 rounded-full px-5 py-5 text-sm bg-[#0f1115] text-[#07D896] border border-[#07D896]/40 hover:border-[#07D896]"
                    >
                        <Plus size={18} />
                        Programar pago
                    </Button>
                </div>


                <div className="space-y-10">
                    {Object.entries(groupedPayments).map(([name, group], index) => {
                        const Icon =
                            categoryIcons[group.category?.icon?.toLowerCase()] ||
                            categoryIcons.default;

                        return (
                            <div key={name} className="space-y-4">

                                {index !== 0 && (
                                    <div className="border-t border-white/10" />
                                )}


                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <span
                                            className="flex items-center justify-center rounded-lg p-2"
                                            style={{
                                                backgroundColor: `${group.category?.color || "#07D896"}20`,
                                                color: group.category?.color || "#07D896",
                                            }}
                                        >
                                            <Icon size={16} />
                                        </span>

                                        <div>
                                            <h2 className="text-base font-semibold text-white">
                                                {name}
                                            </h2>
                                            <p className="text-xs text-gray-400">
                                                {group.items.length} pagos
                                            </p>
                                        </div>
                                    </div>

                                    <div
                                        className="text-xl font-bold"
                                        style={{
                                            color: group.category?.color || "#07D896",
                                        }}
                                    >
                                        {formatToMXN(group.total)}
                                    </div>
                                </div>


                                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                    {group.items.map((p) => {
                                        const category = p.category;

                                        const Icon =
                                            categoryIcons[category?.icon] ||
                                            categoryIcons.default;

                                        const isPaid = p.status === "PAID";

                                        return (
                                            <div
                                                key={p.id}
                                                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-linear-to-br from-[#0B0F27] to-[#0f1115] p-5 hover:scale-[1.02] transition"
                                            >


                                                <div
                                                    className="absolute -top-10 -right-10 h-32 w-32 rounded-full blur-3xl opacity-20"
                                                    style={{
                                                        backgroundColor: category?.color || "#07D896",
                                                    }}
                                                />


                                                <div className="absolute right-3 flex items-center gap-2 opacity-100">

                                                    <button
                                                        onClick={() => toggleMutation.mutate(p.id)}
                                                        className="cursor-pointer flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium border transition-all"
                                                        style={{
                                                            backgroundColor: isPaid ? "rgba(34,197,94,0.15)" : "rgba(0,0,0,0.4)",
                                                            borderColor: isPaid ? "rgba(34,197,94,0.4)" : "rgba(255,255,255,0.1)",
                                                            color: isPaid ? "#4ade80" : "#9ca3af",
                                                        }}
                                                    >

                                                        <span
                                                            className="relative inline-flex h-4 w-7 shrink-0 rounded-full transition-colors duration-200"
                                                            style={{ backgroundColor: isPaid ? "#16a34a" : "#374151" }}
                                                        >
                                                            <span
                                                                className="inline-block h-3 w-3 rounded-full bg-white shadow transform transition-transform duration-200 absolute top-0.5"
                                                                style={{ left: isPaid ? "14px" : "2px" }}
                                                            />
                                                        </span>
                                                        {isPaid ? "Pagado" : "Pendiente"}
                                                    </button>

                                                    <Button
                                                        onClick={() => openEditModal(p)}
                                                        className="cursor-pointer rounded-md bg-black/40 p-1.5 h-auto w-auto hover:border-[#07D896]"
                                                    >
                                                        <Pencil size={14} />
                                                    </Button>

                                                    <Button
                                                        onClick={() => setDeletingPayment(p)}
                                                        className="cursor-pointer rounded-md bg-black/40 p-1.5 h-auto w-auto hover:border-red-500"
                                                    >
                                                        <Trash2 size={14} />
                                                    </Button>
                                                </div>


                                                <div className="flex items-center gap-2 mb-4">
                                                    <span
                                                        className="flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full border"
                                                        style={{
                                                            backgroundColor: `${category?.color || "#07D896"}20`,
                                                            color: category?.color || "#07D896",
                                                            borderColor: `${category?.color || "#07D896"}40`,
                                                        }}
                                                    >
                                                        <Icon size={14} />
                                                        {category?.name || "Sin categoría"}
                                                    </span>

                                                    <span
                                                        className={`text-xs px-2 py-1 rounded-full ${isPaid
                                                            ? "bg-green-500/20 text-green-400"
                                                            : "bg-yellow-500/20 text-yellow-400"
                                                            }`}
                                                    >
                                                        {isPaid ? "Pagado" : "Pendiente"}
                                                    </span>
                                                </div>

                                                <h2 className="text-3xl font-bold text-white">
                                                    {formatToMXN(p.amount)}
                                                </h2>

                                                <p className="text-sm text-gray-400 mt-3">
                                                    {p.name}
                                                </p>

                                                <p className="text-xs text-gray-500 mt-2">
                                                    Fecha programada: <span className="text-white font-bold">{p.scheduledAtLabel}</span>
                                                </p>

                                                {p.paidAt && (
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        Pagado el: <span className="text-green-400 font-bold">{p.paidAtLabel}</span>
                                                    </p>
                                                )}


                                                <div
                                                    className="absolute bottom-0 left-0 h-1 w-full"
                                                    style={{
                                                        backgroundColor:
                                                            category?.color || "#07D896",
                                                    }}
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>


                <Dialog open={open} onOpenChange={(v) => !v && handleCloseModal()}>
                    <DialogContent>
                        <PaymentForm
                            payment={editingPayment}
                            onSubmit={handleSubmit}
                            onClose={handleCloseModal}
                        />
                    </DialogContent>
                </Dialog>


                <AlertDialog
                    open={Boolean(deletingPayment)}
                    onOpenChange={(v) => !v && setDeletingPayment(null)}
                >
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>
                                ¿Eliminar este pago?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                Esta acción no se puede deshacer.
                            </AlertDialogDescription>
                        </AlertDialogHeader>

                        <AlertDialogFooter>
                            <AlertDialogCancel className="cursor-pointer rounded-full border border-white/10 bg-transparent py-3 text-sm text-[#A9ACB7] hover:bg-white/5 hover:text-white"> Cancelar
                            </AlertDialogCancel>

                            <AlertDialogAction
                                onClick={handleConfirmDelete}
                                className="cursor-pointer bg-red-600 hover:bg-red-800 rounded-full"
                            >
                                Eliminar
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>

        </>
    );
}