import { useEffect, useMemo, useState } from "react";
import {
    UtensilsCrossed,
    Car,
    Home,
    ShoppingBag,
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
import { cn } from "@/lib/utils";

export const CATEGORY_ICONS = {
    utensils: { icon: UtensilsCrossed, label: "Comida" },
    car: { icon: Car, label: "Transporte" },
    home: { icon: Home, label: "Hogar" },
    shopping: { icon: ShoppingBag, label: "Compras" },
    health: { icon: HeartPulse, label: "Salud" },
    creditcard: { icon: CreditCard, label: "Pagos" },
    gamepad: { icon: Gamepad2, label: "Entretenimiento" },
    wifi: { icon: Wifi, label: "Internet" },
    smartphone: { icon: Smartphone, label: "Tecnología" },
    piggyBank: { icon: PiggyBank, label: "Ahorro" },
};

const ICON_KEYS = Object.keys(CATEGORY_ICONS);

export const resolveCategoryIcon = (key) =>
    CATEGORY_ICONS[key]?.icon ?? CATEGORY_ICONS.utensils.icon;

const COLOR_SWATCHES = [
    "#3b82f6",
    "#22c55e",
    "#f59e0b",
    "#ef4444",
    "#a855f7",
    "#06b6d4",
    "#ec4899",
    "#64748b",
    "#84cc16",
    "#f97316",
    "#14b8a6",
    "#6366f1",
    "#eab308",
    "#0ea5e9",
];

const DEFAULT_FORM = {
    name: "",
    description: "",
    color: COLOR_SWATCHES[0],
    icon: ICON_KEYS[0],
};

export default function CategoryForm({ category, onSubmit, onClose }) {
    const isEditing = Boolean(category);

    const initialForm = useMemo(() => {
        if (category) {
            return {
                name: category.name ?? "",
                description: category.description ?? "",
                color: category.color ?? COLOR_SWATCHES[0],
                icon: category.icon ?? ICON_KEYS[0],
            };
        }
        return DEFAULT_FORM;
    }, [category]);

    const [form, setForm] = useState(initialForm);
    const [showExitConfirm, setShowExitConfirm] = useState(false);

    useEffect(() => {
        setForm(initialForm);
    }, [initialForm]);

    const isDirty = useMemo(() => {
        return (
            form.name !== initialForm.name ||
            form.color !== initialForm.color ||
            form.icon !== initialForm.icon
        );
    }, [form, initialForm]);

    const resetForm = () => setForm(DEFAULT_FORM);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.name.trim()) return;
        onSubmit(form);
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

    const SelectedIcon = resolveCategoryIcon(form.icon);

    return (
        <>
            <form onSubmit={handleSubmit} className="font-Montserrat text-white bg-[#0B0F27] p-6">
                <div className="flex flex-col items-center gap-4 pb-2 pt-1">
                    <div
                        className="flex h-20 w-20 items-center justify-center rounded-2xl border transition-colors"
                        style={{
                            backgroundColor: `${form.color}1a`,
                            borderColor: `${form.color}40`,
                            color: form.color,
                        }}
                    >
                        <SelectedIcon size={36} strokeWidth={1.75} />
                    </div>
                    <h2 className="text-xl font-semibold">
                        {isEditing ? "Editar categoría" : "Nueva categoría"}
                    </h2>
                </div>

                <div className="mt-6 space-y-1.5">
                    <label className="text-xs font-medium text-[#A9ACB7]">
                        Nombre
                    </label>
                    <input
                        type="text"
                        placeholder="Nombre de la categoría"
                        value={form.name}
                        onChange={(e) =>
                            setForm({ ...form, name: e.target.value })
                        }
                        autoFocus
                        className="w-full rounded-lg border border-white/10 bg-[#0B0F27] px-4 py-3 text-sm outline-none transition-colors focus:border-[#07D896]"
                    />
                </div>

                <div className="mt-6 space-y-1.5">
                    <label className="text-xs font-medium text-[#A9ACB7]">
                        Descripción
                    </label>

                    <textarea
                        placeholder="Descripción de la categoría"
                        value={form.description}
                        onChange={(e) =>
                            setForm({ ...form, description: e.target.value })
                        }
                        className="w-full min-h-25 resize-none rounded-lg border border-white/10 bg-[#0B0F27] px-4 py-3 text-sm outline-none transition-colors focus:border-[#07D896]"
                    />
                </div>

                <div className="mt-5 space-y-1.5">
                    <label className="text-xs font-medium text-[#A9ACB7]">
                        Icono
                    </label>
                    <div className="grid grid-cols-5 gap-2">
                        {ICON_KEYS.map((key) => {
                            const { icon: ItemIcon, label } =
                                CATEGORY_ICONS[key];
                            const selected = form.icon === key;
                            return (
                                <button
                                    key={key}
                                    type="button"
                                    title={label}
                                    onClick={() =>
                                        setForm({ ...form, icon: key })
                                    }
                                    className={cn(
                                        "flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border transition-all",
                                        selected
                                            ? "border-[#07D896]/50 bg-[#07D896]/10"
                                            : "border-white/10 bg-white/5 hover:bg-white/10"
                                    )}
                                    style={
                                        selected
                                            ? { color: form.color }
                                            : undefined
                                    }
                                >
                                    <ItemIcon size={20} strokeWidth={1.75} />
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="mt-5 space-y-1.5">
                    <label className="text-xs font-medium text-[#A9ACB7]">
                        Color
                    </label>
                    <div className="flex flex-wrap items-center gap-2.5">
                        {COLOR_SWATCHES.map((swatch) => {
                            const selected = form.color === swatch;
                            return (
                                <button
                                    key={swatch}
                                    type="button"
                                    onClick={() =>
                                        setForm({ ...form, color: swatch })
                                    }
                                    className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition-transform hover:scale-110"
                                    style={{
                                        backgroundColor: swatch,
                                        boxShadow: selected
                                            ? `0 0 0 2px #0B0F27, 0 0 0 4px ${swatch}`
                                            : "none",
                                    }}
                                >
                                    {selected && (
                                        <Check size={14} className="text-white" />
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    <label
                        className="relative mt-6 flex h-9 w-full cursor-pointer items-center gap-2 rounded-lg border border-dashed border-white/20 px-3 text-xs text-[#A9ACB7] hover:bg-white/10"
                        title="Color personalizado"
                    >
                        <Pipette size={14} />
                        <span>Color personalizado</span>
                        <span
                            className="ml-auto h-5 w-5 rounded-full border border-white/20"
                            style={{ backgroundColor: form.color }}
                        />
                        <input
                            type="color"
                            value={form.color}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    color: e.target.value,
                                })
                            }
                            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                        />
                    </label>
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
                        type="submit"
                        disabled={!form.name.trim()}
                        className="flex-1   bg-[#0f1115]
                        text-[#07D896]
                        border border-[#07D896]/40
                        transition
                        rounded-full
                        hover:border-[#07D896]
                        cursor-pointer"
                    >
                        {isEditing ? "Guardar" : "Crear categoría"}
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
                            Tienes cambios sin guardar en esta categoría. Si
                            sales ahora, se perderán.
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