import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
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

const DEFAULT_FORM = {
    name: "",
    targetAmount: "",
    deadline: "",
    note: "",
};

export default function SavingGoalForm({ goal, onSubmit, onClose }) {
    const isEditing = Boolean(goal);

    const toLocalDatetimeString = (isoString) => {
        if (!isoString) return "";
        const date = new Date(isoString);
        const offset = date.getTimezoneOffset() * 60000;
        return new Date(date - offset).toISOString().slice(0, 16);
    };

    const initialForm = useMemo(() => {
        if (goal) {
            return {
                name: goal.name ?? "",
                targetAmount: goal.targetAmount ?? "",
                deadline: toLocalDatetimeString(goal.deadline),
                note: goal.note ?? "",
            };
        }
        return DEFAULT_FORM;
    }, [goal]);

    const [form, setForm] = useState(initialForm);
    const [showExitConfirm, setShowExitConfirm] = useState(false);

    useEffect(() => {
        setForm(initialForm);
    }, [initialForm]);

    const isDirty = useMemo(() => {
        return (
            form.name !== initialForm.name ||
            form.targetAmount !== initialForm.targetAmount ||
            form.deadline !== initialForm.deadline ||
            form.note !== initialForm.note
        );
    }, [form, initialForm]);

    const resetForm = () => setForm(DEFAULT_FORM);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.name.trim()) return;

        onSubmit({
            ...form,
            targetAmount: Number(form.targetAmount),
        });

        if (!isEditing) resetForm();
    };

    const handleCloseRequest = () => {
        if (isDirty) {
            setShowExitConfirm(true);
            return;
        }
        onClose();
    };

    const handleConfirmExit = () => {
        setShowExitConfirm(false);
        if (!isEditing) resetForm();
        onClose();
    };

    return (
        <>
            <form className="font-Montserrat text-white bg-[#0B0F27] p-6">

                <div className="flex flex-col items-center gap-4 pb-2 pt-1">
                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-[#07D896]">
                        💰
                    </div>

                    <h2 className="text-xl font-semibold">
                        {isEditing ? "Editar meta" : "Nueva meta de ahorro"}
                    </h2>
                </div>


                <div className="mt-6 space-y-1.5">
                    <label className="text-xs font-medium text-[#A9ACB7]">
                        Nombre
                    </label>
                    <input
                        type="text"
                        placeholder="Ej. Viaje a Japón"
                        value={form.name}
                        onChange={(e) =>
                            setForm({ ...form, name: e.target.value })
                        }
                        autoFocus
                        className="w-full rounded-lg border border-white/10 bg-[#0B0F27] px-4 py-3 text-sm outline-none transition-colors focus:border-[#07D896]"
                    />
                </div>


                <div className="mt-5 space-y-1.5">
                    <label className="text-xs font-medium text-[#A9ACB7]">
                        Meta de ahorro
                    </label>
                    <input
                        type="number"
                        placeholder="Ej. 50000"
                        value={form.targetAmount}
                        onChange={(e) =>
                            setForm({ ...form, targetAmount: e.target.value })
                        }
                        className="w-full rounded-lg border border-white/10 bg-[#0B0F27] px-4 py-3 text-sm outline-none transition-colors focus:border-[#07D896]"
                    />
                </div>


                <div className="mt-5 space-y-1.5">
                    <label className="text-xs font-medium text-[#A9ACB7]">
                        Fecha límite
                    </label>
                    <input
                        type="datetime-local"
                        value={form.deadline}
                        onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                        className="w-full rounded-lg border border-white/10 bg-[#0B0F27] px-4 py-3 text-sm outline-none transition-colors focus:border-[#07D896]"
                    />
                </div>


                <div className="mt-5 space-y-1.5">
                    <label className="text-xs font-medium text-[#A9ACB7]">
                        Nota (opcional)
                    </label>
                    <textarea
                        placeholder="Ej. ahorrar cada quincena"
                        value={form.note}
                        onChange={(e) =>
                            setForm({ ...form, note: e.target.value })
                        }
                        className="w-full min-h-25 resize-none rounded-lg border border-white/10 bg-[#0B0F27] px-4 py-3 text-sm outline-none transition-colors focus:border-[#07D896]"
                    />
                </div>


                <div className="mt-8 flex gap-3">
                    <Button
                        type="button"
                        onClick={handleCloseRequest}
                        className="flex-1 cursor-pointer rounded-full border border-white/10 bg-transparent py-3 text-sm text-[#A9ACB7] hover:bg-white/5"
                    >
                        Cancelar
                    </Button>

                    <Button
                        type="button"
                        onClick={handleSubmit}
                        disabled={!form.name.trim() || !form.targetAmount}
                        className="flex-1 bg-[#0f1115] text-[#07D896] border border-[#07D896]/40 hover:border-[#07D896] rounded-full cursor-pointer"
                    >
                        {isEditing ? "Guardar" : "Crear meta"}
                    </Button>
                </div>
            </form>


            <AlertDialog open={showExitConfirm} onOpenChange={setShowExitConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            ¿Descartar cambios?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-[#A9ACB7]">
                            Tienes cambios sin guardar en esta meta.
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                        <AlertDialogCancel className="cursor-pointer rounded-full border border-white/10 bg-transparent text-[#A9ACB7] hover:bg-white/5 hover:text-white">
                            Seguir editando
                        </AlertDialogCancel>

                        <AlertDialogAction
                            onClick={handleConfirmExit}
                            className="cursor-pointer rounded-full bg-red-500 hover:bg-red-800"
                        >
                            Descartar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}