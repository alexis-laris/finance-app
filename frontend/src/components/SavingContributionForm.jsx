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
    amount: "",
    note: "",
    date: "",
};

export default function SavingContributionForm({ contribution, onSubmit, onClose }) {
    const isEditing = Boolean(contribution);

    const toLocalDatetimeString = (isoString) => {
        if (!isoString) return "";
        const date = new Date(isoString);
        const offset = date.getTimezoneOffset() * 60000;
        return new Date(date - offset).toISOString().slice(0, 16);
    };

    const initialForm = useMemo(() => ({
        amount: contribution?.amount ?? "",
        note: contribution?.note ?? "",
        date: toLocalDatetimeString(contribution?.createdAt),
    }), [contribution]);

    const [form, setForm] = useState(initialForm);
    const [showExit, setShowExit] = useState(false);

    useEffect(() => {
        setForm(initialForm);
    }, [initialForm]);

    const isDirty = useMemo(() => {
        return (
            String(form.amount) !== String(initialForm.amount) ||
            form.note !== initialForm.note
        );
    }, [form, initialForm]);

    const reset = () => setForm(DEFAULT_FORM);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.amount) return;
        onSubmit({
            amount: Number(form.amount),
            note: form.note,
            date: form.date ? new Date(form.date).toISOString() : undefined,
        });
        if (!isEditing) reset();
    };

    const handleClose = () => {
        if (isDirty) {
            setShowExit(true);
            return;
        }
        onClose();
    };

    const confirmExit = () => {
        setShowExit(false);
        reset();
        onClose();
    };

    return (
        <>
            <form className="font-Montserrat text-white bg-[#0B0F27] p-6">

                <div className="flex flex-col items-center gap-3 pb-2 pt-1">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-[#07D896]">
                        💰
                    </div>
                    <h2 className="text-lg font-semibold">
                        {isEditing ? "Editar contribución" : "Nueva contribución"}
                    </h2>
                </div>


                <div className="mt-6 space-y-1.5">
                    <label className="text-xs text-[#A9ACB7]">Cantidad</label>
                    <input
                        type="number"
                        placeholder="Ej. 500"
                        value={form.amount}
                        onChange={(e) => setForm({ ...form, amount: e.target.value })}
                        className="w-full rounded-lg border border-white/10 bg-[#0B0F27] px-4 py-3 text-sm outline-none focus:border-[#07D896]"
                    />
                </div>


                <div className="mt-5 space-y-1.5">
                    <label className="text-xs text-[#A9ACB7]">Nota (opcional)</label>
                    <textarea
                        placeholder="Ej. ahorro semanal"
                        value={form.note}
                        onChange={(e) => setForm({ ...form, note: e.target.value })}
                        className="min-h-25 resize-none w-full rounded-lg border border-white/10 bg-[#0B0F27] px-4 py-3 text-sm outline-none focus:border-[#07D896]"
                    />
                </div>

                <div className="mt-5 space-y-1.5">
                    <label className="text-xs text-[#A9ACB7]">Fecha y hora</label>
                    <input
                        type="datetime-local"
                        value={form.date}
                        onChange={(e) => setForm({ ...form, date: e.target.value })}
                        className="w-full rounded-lg border border-white/10 bg-[#0B0F27] px-4 py-3 text-sm outline-none focus:border-[#07D896]"
                    />
                </div>


                <div className="mt-8 flex gap-3">
                    <Button
                        type="button"
                        onClick={handleClose}
                        className="flex-1 rounded-full border border-white/10 bg-transparent py-3 text-sm text-[#A9ACB7] hover:bg-white/5 cursor-pointer"
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="button"
                        onClick={handleSubmit}
                        disabled={!form.amount}
                        className="flex-1 bg-[#0f1115] text-[#07D896] border border-[#07D896]/40 hover:border-[#07D896] rounded-full cursor-pointer"
                    >
                        {isEditing ? "Guardar" : "Agregar"}
                    </Button>
                </div>
            </form>


            <AlertDialog open={showExit} onOpenChange={setShowExit}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Descartar cambios?</AlertDialogTitle>
                        <AlertDialogDescription className="text-[#A9ACB7]">
                            Tienes una contribución sin guardar.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-full border border-white/10 bg-transparent text-[#A9ACB7] hover:bg-white/5 hover:text-white">
                            Seguir editando
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmExit}
                            className="rounded-full bg-red-500 hover:bg-red-800"
                        >
                            Descartar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}