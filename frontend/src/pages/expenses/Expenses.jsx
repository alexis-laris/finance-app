import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Plus, Pencil, Trash2, Car, Home, ShoppingBag, Folder, UtensilsCrossed, HeartPulse, CreditCard, Gamepad2,
    Wifi,
    Smartphone,
    PiggyBank,
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
    getExpensesRequest,
    createExpenseRequest,
    updateExpenseRequest,
    deleteExpenseRequest
} from "../../services/expenses.service";

import ExpenseForm from "../../components/ExpenseForm";
import formatToMXN from "../../lib/formatMXN"
import Loader from "../../components/utils/Loader";

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

export default function Expenses() {
    const [open, setOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState(null);
    const [deletingExpense, setDeletingExpense] = useState(null);

    const queryClient = useQueryClient();

    const { data: expenses = [], isLoading } = useQuery({
        queryKey: ["expenses"],
        queryFn: getExpensesRequest,
    });

    const invalidate = () =>
        queryClient.invalidateQueries({ queryKey: ["expenses"] });

    const createMutation = useMutation({
        mutationFn: createExpenseRequest,
        onSuccess: () => {
            invalidate();
            setOpen(false);
        },
    });


    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => updateExpenseRequest(id, data),
        onSuccess: () => {
            invalidate();
            setOpen(false);
            setEditingExpense(null);
        },
        onError: (error) => {
            console.error("Error updating expense:", error);
        },
    });


    const deleteMutation = useMutation({
        mutationFn: deleteExpenseRequest,
        onSuccess: () => {
            invalidate();
            setDeletingExpense(null);
        },
        onError: (error) => {
            console.error("Error deleting expense:", error);
        },
    });

    const isSubmitting =
        createMutation.isPending ||
        updateMutation.isPending ||
        deleteMutation.isPending;

    const openCreateModal = () => {
        setEditingExpense(null);
        setOpen(true);
    };

    const openEditModal = (exp) => {
        setEditingExpense(exp);
        setOpen(true);
    };

    const handleSubmit = (data) => {
        if (editingExpense) {

            updateMutation.mutate({ id: editingExpense.id, data });
        } else {
            createMutation.mutate(data);
        }
    };

    const handleCloseModal = () => {
        setOpen(false);
        setEditingExpense(null);
    };

    const handleConfirmDelete = () => {
        if (deletingExpense) {
            deleteMutation.mutate(deletingExpense.id);
        }
    };

    const groupedExpenses = useMemo(() => {
        return expenses.reduce((acc, exp) => {
            const key = exp.category?.name || "Sin categoría";

            if (!acc[key]) {
                acc[key] = {
                    category: exp.category,
                    items: [],
                    total: 0,
                };
            }

            acc[key].items.push(exp);
            acc[key].total += Number(exp.amount);

            return acc;
        }, {});
    }, [expenses]);

    if (isLoading) {
        return <Loader />;
    }


    return (
        <>
            {isSubmitting && <Loader />}

            <div className="space-y-6">


                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Gastos</h1>
                        <p className="text-sm text-gray-400">
                            Administra tus gastos realizados
                        </p>
                    </div>

                    <Button
                        onClick={openCreateModal}
                        className="
                        flex items-center gap-2
                        rounded-full px-5 py-5 text-sm
                        bg-[#0f1115]
                        text-[#07D896]
                        border border-[#07D896]/40
                        transition
                        hover:border-[#07D896]
                        cursor-pointer
                    "
                    >
                        <Plus size={18} />
                        Nuevo gasto
                    </Button>
                </div>

                <div className="space-y-10">

                    {Object.entries(groupedExpenses).map(([name, group], index) => {
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
                                                {group.items.length} gastos
                                            </p>
                                        </div>
                                    </div>

                                    <div
                                        className="text-xl sm:text-2xl font-bold"
                                        style={{
                                            color: group.category?.color || "#07D896",
                                        }}
                                    >
                                        {formatToMXN(group.total)}
                                    </div>
                                </div>

                                <div className="
                                grid gap-4
                                grid-cols-1
                                sm:grid-cols-2
                                lg:grid-cols-3
                                xl:grid-cols-4
                            ">
                                    {group.items.map((exp) => {
                                        const category = exp.category;

                                        const Icon =
                                            categoryIcons[category?.icon] ||
                                            categoryIcons.default;

                                        return (
                                            <div
                                                key={exp.id}
                                                className="
                                                group relative overflow-hidden
                                                rounded-2xl border border-white/10
                                                bg-linear-to-br from-[#0B0F27] to-[#0f1115]
                                                p-5
                                                transition-all duration-300
                                                hover:scale-[1.02] hover:border-white/20
                                            "
                                            >

                                                <div
                                                    className="absolute -top-10 -right-10 h-32 w-32 rounded-full blur-3xl opacity-20"
                                                    style={{
                                                        backgroundColor:
                                                            category?.color || "#07D896",
                                                    }}
                                                />

                                                <div className="absolute right-3 top-3 flex gap-1 opacity-100">
                                                    <Button
                                                        onClick={() => openEditModal(exp)}
                                                        className="rounded-md bg-black/40 p-1.5 h-auto w-auto text-white  hover:border-[#07D896] cursor-pointer"
                                                    >
                                                        <Pencil size={14} />
                                                    </Button>

                                                    <Button
                                                        onClick={() => setDeletingExpense(exp)}
                                                        className="rounded-md bg-black/40 p-1.5 h-auto w-auto text-gray-300  hover:border-red-500 hover:text-white cursor-pointer"
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
                                                </div>

                                                <h2 className="text-4xl font-bold tracking-tight text-white">
                                                    {formatToMXN(exp.amount)}
                                                </h2>




                                                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mt-5">

                                                    <p className="text-sm text-gray-400 leading-relaxed">
                                                        {exp.description || "Sin descripción"}
                                                    </p>

                                                    <p className="text-xs text-gray-500 shrink-0">
                                                        Registrado:{" "}
                                                        <span className="text-white font-bold">
                                                            {exp.createdAtFormatted}
                                                        </span>
                                                    </p>

                                                </div>

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
                    <DialogContent
                        className="
            w-[95vw]
            sm:max-w-lg
            lg:max-w-xl
            max-h-[90vh]
            overflow-y-auto
            p-0
        "
                    >
                        <ExpenseForm
                            expense={editingExpense}
                            onSubmit={handleSubmit}
                            onClose={handleCloseModal}
                        />
                    </DialogContent>
                </Dialog>


                <AlertDialog
                    open={Boolean(deletingExpense)}
                    onOpenChange={(v) => !v && setDeletingExpense(null)}
                >
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>
                                ¿Eliminar este gasto?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                Esta acción no se puede deshacer.
                            </AlertDialogDescription>
                        </AlertDialogHeader>

                        <AlertDialogFooter>
                            <AlertDialogCancel className="cursor-pointer rounded-full border border-white/10 bg-transparent py-3 text-sm text-[#A9ACB7] hover:bg-white/5 hover:text-white">
                                Cancelar
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