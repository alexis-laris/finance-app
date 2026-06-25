import { useMemo, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCategoriesRequest } from "../services/categories.service";

import { Button } from "@/components/ui/button";

import {
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

const DEFAULT_FORM = {
    name: "",
    amount: "",
    description: "",
    categoryId: "",
    scheduledAt: "",
    type: "EXPENSE",
};

export default function PaymentForm({ payment, onSubmit, onClose }) {
    const isEditing = Boolean(payment);

    const { data: categories = [] } = useQuery({
        queryKey: ["categories"],
        queryFn: getCategoriesRequest,
    });

    const toLocalDatetimeString = (isoString) => {
        if (!isoString) return "";
        const date = new Date(isoString);
        const offset = date.getTimezoneOffset() * 60000;
        return new Date(date - offset).toISOString().slice(0, 16); // yyyy-MM-ddTHH:mm
    };

    const initialForm = useMemo(() => {
        if (payment) {
            return {
                name: payment.name ?? "",
                amount: payment.amount ?? "",
                description: payment.description ?? "",
                categoryId: payment.category?.id?.toString() ?? "",
                scheduledAt: toLocalDatetimeString(payment.scheduledAt),
                type: payment.type ?? "EXPENSE",
            };
        }

        return DEFAULT_FORM;
    }, [payment]);

    const [form, setForm] = useState(initialForm);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        setForm(initialForm);
    }, [initialForm]);

    const resetForm = () => {
        setForm(DEFAULT_FORM);
        setErrors({});
    };



    const handleSubmit = (e) => {
        e.preventDefault();

        const submitData = {
            name: form.name.trim(),
            amount: Number(form.amount),
            description: form.description.trim(),
            scheduledAt: form.scheduledAt,
            type: form.type,
            categoryId: form.categoryId,
        };

        console.log("Enviando pago:", submitData);

        onSubmit(submitData);

        if (!isEditing) resetForm();
    };

    const handleInputChange = (field, value) => {
        setForm({ ...form, [field]: value });

        if (errors[field]) {
            setErrors({ ...errors, [field]: undefined });
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="font-Montserrat text-white bg-[#0B0F27] p-6 rounded-xl space-y-5 max-h-[90vh] overflow-y-auto"
        >

            <div className="text-center">
                <h2 className="text-xl font-semibold">
                    {isEditing ? "Editar pago" : "Nuevo pago"}
                </h2>
            </div>


            <div className="space-y-1.5">
                <label className="text-xs text-[#A9ACB7]">Nombre del pago</label>
                <input
                    type="text"
                    placeholder="Ej: Renta, Netflix, Seguro..."
                    value={form.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className={`w-full rounded-lg border px-4 py-3 text-sm outline-none focus:border-[#07D896] bg-[#0B0F27] ${errors.name ? "border-red-500" : "border-white/10"
                        }`}
                />
                {errors.name && (
                    <p className="text-xs text-red-400 mt-1">{errors.name}</p>
                )}
            </div>


            <div className="space-y-1.5">
                <label className="text-xs text-[#A9ACB7]">Monto</label>
                <input
                    type="number"
                    step="0.01"
                    placeholder="$0.00"
                    value={form.amount}
                    onChange={(e) => handleInputChange("amount", e.target.value)}
                    className={`w-full rounded-lg border px-4 py-3 text-sm outline-none focus:border-[#07D896] bg-[#0B0F27] ${errors.amount ? "border-red-500" : "border-white/10"
                        }`}
                />
                {errors.amount && (
                    <p className="text-xs text-red-400 mt-1">{errors.amount}</p>
                )}
            </div>


            <div className="space-y-1.5">
                <label className="text-xs text-[#A9ACB7]">Fecha programada</label>
                <input
                    type="datetime-local"
                    value={form.scheduledAt}
                    onChange={(e) => handleInputChange("scheduledAt", e.target.value)}
                    className={`w-full rounded-lg border px-4 py-3 text-sm outline-none focus:border-[#07D896] bg-[#0B0F27]  ${errors.scheduledAt ? "border-red-500" : "border-white/10"
                        }`}
                />
                {errors.scheduledAt && (
                    <p className="text-xs text-red-400 mt-1">{errors.scheduledAt}</p>
                )}
            </div>


            <div className="space-y-1.5">
                <label className="text-xs text-[#A9ACB7]">Tipo</label>
                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={() => handleInputChange("type", "EXPENSE")}
                        className={`cursor-pointer flex-1 py-2 rounded-lg border text-sm transition ${form.type === "EXPENSE"
                            ? "border-red-500 text-red-400 bg-red-500/10"
                            : "border-white/10 text-gray-400 hover:border-white/20"
                            }`}
                    >
                        Gasto
                    </button>
                    <button
                        type="button"
                        onClick={() => handleInputChange("type", "INCOME")}
                        className={`cursor-pointer flex-1 py-2 rounded-lg border text-sm transition ${form.type === "INCOME"
                            ? "border-green-500 text-green-400 bg-green-500/10"
                            : "border-white/10 text-gray-400 hover:border-white/20"
                            }`}
                    >
                        Ingreso
                    </button>
                </div>
            </div>


            <div className="space-y-2">
                <label className="text-xs text-[#A9ACB7]">Categoría</label>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {categories.map((cat) => {
                        const Icon = categoryIcons[cat.icon] || categoryIcons.default;
                        const isSelected = form.categoryId === String(cat.id);

                        return (
                            <button
                                key={cat.id}
                                type="button"
                                onClick={() =>
                                    handleInputChange(
                                        "categoryId",
                                        form.categoryId === String(cat.id) ? "" : String(cat.id)
                                    )
                                }
                                className={`
                                    relative flex flex-col items-center justify-center gap-2
                                    rounded-xl p-3 border transition cursor-pointer
                                    bg-[#0f1115]
                                    hover:scale-[1.02]
                                `}
                                style={{
                                    borderColor: isSelected
                                        ? cat.color
                                        : "rgba(255,255,255,0.08)",
                                    boxShadow: isSelected
                                        ? `0 0 20px ${cat.color}40`
                                        : "none",
                                }}
                            >
                                <div
                                    className="absolute inset-0 rounded-xl opacity-10 blur-xl"
                                    style={{ backgroundColor: cat.color }}
                                />

                                <Icon size={20} style={{ color: cat.color }} />

                                <span
                                    className="text-xs text-center"
                                    style={{
                                        color: isSelected ? cat.color : "#A9ACB7",
                                    }}
                                >
                                    {cat.name}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>


            <div className="space-y-1.5">
                <label className="text-xs text-[#A9ACB7]">Descripción</label>
                <textarea
                    placeholder="Ej: Pago de renta, suscripción..."
                    value={form.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    className="min-h-25 resize-none w-full rounded-lg border border-white/10 bg-[#0B0F27] px-4 py-3 text-sm outline-none focus:border-[#07D896]"
                />
            </div>


            <div className="flex gap-3 pt-2">
                <Button
                    type="button"
                    onClick={onClose}
                    className="flex-1 rounded-full bg-transparent border border-white/10 text-[#A9ACB7] hover:bg-white/5 cursor-pointer"
                >
                    Cancelar
                </Button>

                <Button
                    type="submit"
                    disabled={!form.name || !form.amount || !form.scheduledAt}
                    className="flex-1 rounded-full bg-[#0f1115] text-[#07D896] border border-[#07D896]/40 hover:border-[#07D896] hover:bg-[#07D896]/10 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isEditing ? "Guardar" : "Crear"}
                </Button>
            </div>
        </form>
    );
}