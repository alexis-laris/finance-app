import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, ArrowUpRight } from "lucide-react";

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
    getSavingGoalsRequest,
    createSavingGoalRequest,
    updateSavingGoalRequest,
    deleteSavingGoalRequest,
} from "../services/savings.service";
import Loader from "../components/utils/Loader";
import SavingGoalForm from "../components/SavingGoalForm";
import formatToMXN from "../lib/formatMXN";

export default function Savings() {
    const [open, setOpen] = useState(false);
    const [editingGoal, setEditingGoal] = useState(null);
    const [deletingGoal, setDeletingGoal] = useState(null);

    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: goals = [], isLoading } = useQuery({
        queryKey: ["saving-goals"],
        queryFn: getSavingGoalsRequest,
    });

    const invalidate = () =>
        queryClient.invalidateQueries({ queryKey: ["saving-goals"] });

    const createMutation = useMutation({
        mutationFn: createSavingGoalRequest,
        onSuccess: () => {
            invalidate();
            setOpen(false);
        },
    });

    const updateMutation = useMutation({
        mutationFn: updateSavingGoalRequest,
        onSuccess: () => {
            invalidate();
            setOpen(false);
            setEditingGoal(null);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteSavingGoalRequest,
        onSuccess: () => {
            invalidate();
            setDeletingGoal(null);
        },
    });


    const isSubmitting =
        createMutation.isPending ||
        updateMutation.isPending ||
        deleteMutation.isPending;


    const openCreateModal = () => {
        setEditingGoal(null);
        setOpen(true);
    };

    const openEditModal = (goal) => {
        setEditingGoal(goal);
        setOpen(true);
    };

    const handleSubmit = (data) => {
        if (editingGoal) {
            updateMutation.mutate({ id: editingGoal.id, data });
        } else {
            createMutation.mutate(data);
        }
    };

    const handleCloseModal = () => {
        setOpen(false);
        setEditingGoal(null);
    };

    const handleConfirmDelete = () => {
        if (deletingGoal) {
            deleteMutation.mutate(deletingGoal.id);
        }
    };

    const goToDetail = (goal) => {
        navigate(`/dashboard/savings/${goal.id}`);
    };

    if (isLoading) {
        return <Loader />;
    }

    return (
        <>

            {isSubmitting && <Loader />}


            <div className="space-y-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Metas de ahorro</h1>
                        <p className="text-sm text-gray-400">
                            Administra tus objetivos financieros
                        </p>
                    </div>

                    <Button
                        onClick={openCreateModal}
                        className="cursor-pointer flex items-center gap-2 rounded-full px-5 py-5 text-sm bg-[#0f1115] text-[#07D896] border border-[#07D896]/40 hover:border-[#07D896]"
                    >
                        <Plus size={18} />
                        Nueva meta
                    </Button>
                </div>


                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    {goals.map((goal) => {
                        const progress =
                            goal.targetAmount > 0
                                ? (goal.currentAmount / goal.targetAmount) * 100
                                : 0;

                        const isCompleted = progress >= 100;

                        return (
                            <div
                                key={goal.id}
                                className="
                    group relative overflow-hidden
                    rounded-2xl border border-white/10
                    bg-linear-to-br from-[#0B0F27] to-[#0f1115]
                    p-5
                    transition-all duration-300
                    hover:scale-[1.02] hover:border-white/20
                "
                            >

                                <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full blur-3xl opacity-20 bg-[#07D896]" />


                                <div className="absolute right-3 top-3 flex gap-1 transition-opacity opacity-100">
                                    <Button
                                        onClick={() => openEditModal(goal)}
                                        className="rounded-md bg-black/40 p-1.5 h-auto w-auto text-white hover:border-[#07D896] cursor-pointer"
                                    >
                                        <Pencil size={14} />
                                    </Button>
                                    <Button
                                        onClick={() => setDeletingGoal(goal)}
                                        className="rounded-md bg-black/40 p-1.5 h-auto w-auto text-gray-300 hover:border-red-500 hover:text-white cursor-pointer"
                                    >
                                        <Trash2 size={14} />
                                    </Button>
                                </div>


                                <h2 className="text-lg font-bold text-white pr-14">
                                    {goal.name}
                                </h2>


                                <p className="text-4xl font-bold tracking-tight text-[#07D896] mt-3">
                                    {formatToMXN(goal.currentAmount)}
                                </p>
                                <p className="text-sm text-gray-400 mt-1">
                                    de {formatToMXN(goal.targetAmount)}
                                </p>


                                <div className="w-full h-1.5 bg-white/10 rounded-full mt-4 overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-500 ${isCompleted ? "bg-emerald-400" : "bg-[#07D896]"}`}
                                        style={{ width: `${Math.min(progress, 100)}%` }}
                                    />
                                </div>




                                <div className="flex items-center justify-between mt-2">
                                    <span className={`text-xs font-medium ${isCompleted ? "text-emerald-400" : "text-[#07D896]"}`}>
                                        {isCompleted ? "¡Meta completada!" : `${progress.toFixed(1)}%`}
                                    </span>
                                    {!isCompleted && (
                                        <span className="text-xs text-gray-500">
                                            Faltan {formatToMXN(goal.targetAmount - goal.currentAmount)}
                                        </span>
                                    )}
                                </div>

                                <p className="text-xs text-gray-500 mt-2">
                                    Finaliza: <span className="text-white font-bold"> {goal.deadlineLabel}</span>
                                </p>

                                <p className="text-xs text-gray-500 mt-2">
                                    Nota: {goal.note}
                                </p>

                                <div className="flex justify-end mt-4">



                                    <Button
                                        onClick={() => goToDetail(goal)}
                                        className="
                            text-xs rounded-full px-4 py-2 h-auto
                            border border-white/10 bg-transparent
                            text-gray-400 hover:bg-white/5 hover:text-white
                            flex items-center gap-1 cursor-pointer
                        "
                                    >
                                        Ver detalle
                                        <ArrowUpRight size={14} />
                                    </Button>
                                </div>

                                <div className="absolute bottom-0 left-0 h-1 w-full bg-[#07D896]" />
                            </div>
                        );
                    })}
                </div>


                <Dialog open={open} onOpenChange={(v) => !v && handleCloseModal()}>
                    <DialogContent>
                        <SavingGoalForm
                            key={editingGoal?.id ?? "new"}
                            goal={editingGoal}
                            onSubmit={handleSubmit}
                            onClose={handleCloseModal}
                        />
                    </DialogContent>
                </Dialog>


                <AlertDialog
                    open={Boolean(deletingGoal)}
                    onOpenChange={(v) => !v && setDeletingGoal(null)}
                >
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>
                                ¿Eliminar "{deletingGoal?.name}"?
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