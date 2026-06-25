import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription,
    AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Trash2, Pencil, ArrowLeft, Calendar, TrendingUp } from "lucide-react";
import SavingContributionForm from "../components/SavingContributionForm";
import {
    getSavingGoalByIdRequest,
    addSavingContributionRequest,
    updateContributionRequest,
    deleteContributionRequest,
} from "../services/savings.service";
import formatToMXN from "../lib/formatMXN";

export default function SavingGoalDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [open, setOpen] = useState(false);
    const [editingContribution, setEditingContribution] = useState(null);
    const [deletingContribution, setDeletingContribution] = useState(null);

    const { data: goal, isLoading } = useQuery({
        queryKey: ["saving-goal", id],
        queryFn: () => getSavingGoalByIdRequest(id),
    });

    const invalidate = () =>
        queryClient.invalidateQueries({ queryKey: ["saving-goal", id] });

    const contributionMutation = useMutation({
        mutationFn: ({ id, data }) => addSavingContributionRequest(id, data),
        onSuccess: () => { invalidate(); setOpen(false); },
    });

    const updateContributionMutation = useMutation({
        mutationFn: updateContributionRequest,
        onSuccess: () => { invalidate(); setEditingContribution(null); },
    });

    const deleteContributionMutation = useMutation({
        mutationFn: deleteContributionRequest,
        onSuccess: () => { invalidate(); setDeletingContribution(null); },
        onError: (err) => console.error("DELETE ERROR:", err),  // 👈
    });

    if (isLoading) return <div className="text-gray-400 text-sm">Cargando...</div>;
    if (!goal) return <div className="text-gray-400 text-sm">Meta no encontrada</div>;

    const stats = goal.stats;
    const progress = Math.min(stats.progress, 100);
    const isCompleted = progress >= 100;

    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        return new Date(dateStr).toLocaleDateString("es-MX", {
            day: "2-digit", month: "short", year: "numeric",
        });
    };

    return (
        <div className="space-y-5 text-white">

            <div>
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition mb-4 cursor-pointer"
                >
                    <ArrowLeft size={15} />
                    Mis metas
                </button>

                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">{goal.name}</h1>

                    </div>
                    <Button
                        onClick={() => setOpen(true)}
                        className="flex items-center gap-2 shrink-0 rounded-full px-4 py-4 text-sm bg-[#0f1115] text-[#07D896] border border-[#07D896]/40 hover:border-[#07D896] cursor-pointer"
                    >
                        <Plus size={16} />
                        Agregar dinero
                    </Button>
                </div>
            </div>


            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">


                <div className="lg:col-span-3 space-y-5">


                    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-linear-to-br from-[#0B0F27] to-[#0f1115] p-5">

                        <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full blur-3xl opacity-20 bg-[#07D896]" />

                        <p className="text-xs text-gray-400 mb-2">
                            Meta de ahorro
                        </p>

                        <h2 className="text-xl font-bold text-white">
                            {goal.name}
                        </h2>

                        <div className="mt-2">
                            <p className="text-4xl font-bold">
                                {formatToMXN(stats.totalSaved)}
                            </p>

                            <p className="text-sm text-gray-400">
                                de {formatToMXN(goal.targetAmount)}
                            </p>
                        </div>

                        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mt-5">
                            <div
                                className="h-full bg-[#07D896] rounded-full transition-all duration-500"
                                style={{ width: `${progress}%` }}
                            />
                        </div>

                        <div className="flex justify-between mt-2">
                            <span className="text-xs text-[#07D896]">
                                {progress.toFixed(1)}% completado

                            </span>


                        </div>

                        <div className="absolute bottom-0 left-0 h-1 w-full bg-[#07D896]" />
                    </div>


                    <div className="rounded-2xl bg-[#07D896] p-5 text-black">

                        <p className="text-sm font-medium opacity-80">
                            Te faltan ahorrar
                        </p>

                        <h3 className="text-4xl font-bold mt-2">
                            {formatToMXN(stats.remaining)}
                        </h3>

                        <p className="text-sm mt-2 opacity-80">
                            para completar tu meta
                        </p>

                    </div>


                    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-linear-to-br from-[#0B0F27] to-[#0f1115] p-5">

                        <div className="flex items-center gap-2 mb-4">
                            <TrendingUp size={15} className="text-[#07D896]" />
                            <h2 className="text-sm font-semibold text-gray-300">
                                ¿Cuánto necesito ahorrar?
                            </h2>
                        </div>

                        <div className="space-y-4">

                            <div className="flex justify-between">
                                <span className="text-gray-400">
                                    Cada día
                                </span>

                                <span className="font-semibold">
                                    {formatToMXN(stats.dailyNeeded)}
                                </span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-gray-400">
                                    Cada semana
                                </span>

                                <span className="font-semibold">
                                    {formatToMXN(stats.weeklyNeeded)}
                                </span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-gray-400">
                                    Cada mes
                                </span>

                                <span className="font-semibold">
                                    {formatToMXN(stats.monthlyNeeded)}
                                </span>
                            </div>

                        </div>

                        <div className="absolute bottom-0 left-0 h-1 w-full bg-[#07D896]" />
                    </div>

                </div>


                <div className="lg:col-span-2 max-h-187.5">

                    <div className="relative overflow-hidden h-full rounded-2xl border border-white/10 bg-linear-to-br from-[#0B0F27] to-[#0f1115] p-5">

                        <div className="flex items-center gap-2 mb-6">
                            <Calendar size={15} className="text-[#07D896]" />

                            <h2 className="text-sm font-semibold text-gray-300">
                                Historial de contribuciones
                            </h2>

                            <span className="ml-auto text-xs text-gray-500">
                                {goal.contributions.length} aportaciones
                            </span>
                        </div>

                        {goal.contributions.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-24">
                                <p className="text-sm text-gray-500">
                                    Aún no hay contribuciones
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">

                                {goal.contributions.map((c) => (
                                    <div
                                        key={c.id}
                                        className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 p-4"
                                    >
                                        <div>
                                            <p className="text-white font-medium">
                                                {c.note || "Ahorro"}
                                            </p>

                                            <p className="text-xs text-gray-500 mt-1">
                                                {formatDate(c.createdAt)}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-3">

                                            <span className="font-semibold text-[#07D896]">
                                                +{formatToMXN(c.amount)}
                                            </span>

                                            <Button
                                                onClick={() => setEditingContribution(c)}
                                                className="rounded-md bg-black/40 p-1.5 h-auto w-auto text-white hover:bg-blue-600 cursor-pointer"
                                            >
                                                <Pencil size={14} />
                                            </Button>

                                            <Button
                                                onClick={() => setDeletingContribution(c)}
                                                className="rounded-md bg-black/40 p-1.5 h-auto w-auto text-gray-400 hover:bg-red-600 hover:text-white cursor-pointer"
                                            >
                                                <Trash2 size={14} />
                                            </Button>

                                        </div>
                                    </div>
                                ))}

                            </div>
                        )}

                        <div className="absolute bottom-0 left-0 h-1 w-full bg-[#07D896]" />
                    </div>

                </div>

            </div>


            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <SavingContributionForm
                        onSubmit={(data) => contributionMutation.mutate({ id, data })}
                        onClose={() => setOpen(false)}
                    />
                </DialogContent>
            </Dialog>


            <Dialog
                open={Boolean(editingContribution)}
                onOpenChange={(v) => !v && setEditingContribution(null)}
            >
                <DialogContent>
                    <SavingContributionForm
                        key={editingContribution?.id}
                        contribution={editingContribution}
                        onSubmit={(data) =>
                            updateContributionMutation.mutate({
                                id,
                                contributionId: editingContribution.id,
                                data,
                            })
                        }
                        onClose={() => setEditingContribution(null)}
                    />
                </DialogContent>
            </Dialog>


            <AlertDialog
                open={Boolean(deletingContribution)}
                onOpenChange={(v) => !v && setDeletingContribution(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar esta contribución?</AlertDialogTitle>
                        <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="cursor-pointer rounded-full border border-white/10 bg-transparent py-3 text-sm text-[#A9ACB7] hover:bg-white/5 hover:text-white">
                            Cancelar
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                deleteContributionMutation.mutate({
                                    id,
                                    contributionId: deletingContribution.id,
                                });
                            }}
                            className="cursor-pointer bg-red-600 hover:bg-red-800 rounded-full"
                        >
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}