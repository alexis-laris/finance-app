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
    HeartPulse
} from "lucide-react";


const categoryIcons = {
    car: Car,
    home: Home,
    shopping: ShoppingBag,
    utensils: UtensilsCrossed,
    health: HeartPulse,
    default: Folder,
};

const DEFAULT_FORM = {
    amount: "",
    description: "",
    categoryId: "",
};

export default function ExpenseForm({ expense, onSubmit, onClose }) {
    const isEditing = Boolean(expense);

    const { data: categories = [] } = useQuery({
        queryKey: ["categories"],
        queryFn: getCategoriesRequest,
    });

    const initialForm = useMemo(() => {
        if (expense) {
            return {
                amount: expense.amount ?? "",
                description: expense.description ?? "",
                categoryId: expense.category?.id ?? "",
            };
        }

        return DEFAULT_FORM;
    }, [expense]);

    const [form, setForm] = useState(initialForm);

    useEffect(() => {
        setForm(initialForm);
    }, [initialForm]);

    const resetForm = () => setForm(DEFAULT_FORM);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!form.amount || !form.categoryId) return;

        onSubmit({
            ...form,
            amount: Number(form.amount),
        });

        if (!isEditing) resetForm();
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="font-Montserrat text-white bg-[#0B0F27] p-6 rounded-xl space-y-5"
        >

            <div className="text-center">
                <h2 className="text-xl font-semibold">
                    {isEditing ? "Editar gasto" : "Nuevo gasto"}
                </h2>
            </div>


            <div className="space-y-1.5">
                <label className="text-xs text-[#A9ACB7]">Monto</label>
                <input
                    type="number"
                    placeholder="$0.00"
                    value={form.amount}
                    onChange={(e) =>
                        setForm({ ...form, amount: e.target.value })
                    }
                    className="w-full rounded-lg border border-white/10 bg-[#0B0F27] px-4 py-3 text-sm outline-none focus:border-[#07D896]"
                />
            </div>


            <div className="space-y-2">
                <label className="text-xs text-[#A9ACB7]">
                    Categoría
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {categories.map((cat) => {
                        const Icon =
                            categoryIcons[cat.icon] ||
                            categoryIcons.default;

                        const isSelected =
                            form.categoryId === String(cat.id);

                        return (
                            <button
                                key={cat.id}
                                type="button"
                                onClick={() =>
                                    setForm({
                                        ...form,
                                        categoryId: String(cat.id),
                                    })
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
                                    style={{
                                        backgroundColor: cat.color,
                                    }}
                                />

                                <Icon
                                    size={20}
                                    style={{
                                        color: cat.color,
                                    }}
                                />

                                <span
                                    className="text-xs text-center"
                                    style={{
                                        color: isSelected
                                            ? cat.color
                                            : "#A9ACB7",
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
                <label className="text-xs text-[#A9ACB7]">
                    Descripción
                </label>
                <input
                    type="text"
                    placeholder="Ej: comida, uber, renta..."
                    value={form.description}
                    onChange={(e) =>
                        setForm({
                            ...form,
                            description: e.target.value,
                        })
                    }
                    className="w-full rounded-lg border border-white/10 bg-[#0B0F27] px-4 py-3 text-sm outline-none focus:border-[#07D896]"
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
                    disabled={!form.amount || !form.categoryId}
                    className="flex-1 rounded-full bg-[#0f1115] text-[#07D896] border border-[#07D896]/40 hover:border-[#07D896] cursor-pointer"
                >
                    {isEditing ? "Guardar" : "Crear"}
                </Button>
            </div>
        </form>
    );
}