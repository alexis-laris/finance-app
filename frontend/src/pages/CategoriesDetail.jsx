import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getCategoryByIdRequest } from "../services/categories.service";

export default function CategoriesDetail() {
    const { id } = useParams();

    console.log("ID desde useParams:", id); // ← agrega esto

    const { data: category, isLoading, isError } = useQuery({
        queryKey: ["category", id],
        queryFn: () => getCategoryByIdRequest(id),
        enabled: !!id,
    });

    if (isLoading) return <p>Cargando...</p>;
    if (isError || !category) return <p>Error cargando categoría</p>;

    return (
        <div className="p-6 space-y-6">

            {/* HEADER */}
            <div>
                <h1 className="text-2xl font-bold">{category.name}</h1>

                <p className="text-gray-400 mt-1">
                    {category.description || "Sin descripción"}
                </p>

                <div className="mt-3">
                    <span
                        className="px-3 py-1 rounded-full text-sm"
                        style={{
                            backgroundColor: `${category.color || "#07D896"}20`,
                            color: category.color || "#07D896",
                        }}
                    >
                        {category.icon}
                    </span>
                </div>

                <p className="text-xs text-gray-500 mt-3">
                    Creada: {category.createdAtFormatted}
                </p>
            </div>

            {/* RESUMEN */}
            <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-white/5">
                    <p className="text-sm text-gray-400">Total gastos</p>
                    <p className="text-xl font-bold text-red-400">
                        ${category.totalExpenses}
                    </p>
                </div>

                <div className="p-4 rounded-xl bg-white/5">
                    <p className="text-sm text-gray-400">Gastos</p>
                    <p className="text-xl font-bold">
                        {category.expensesCount}
                    </p>
                </div>
            </div>

            {/* LISTA DE GASTOS */}
            <div>
                <h2 className="text-lg font-bold mb-3">
                    Últimos gastos
                </h2>

                {category.expenses?.length === 0 ? (
                    <p className="text-gray-500 text-sm">
                        No hay gastos aún
                    </p>
                ) : (
                    <div className="space-y-3">
                        {category.expenses.map((exp) => (
                            <div
                                key={exp.id}
                                className="flex justify-between items-center p-3 rounded-lg bg-white/5"
                            >
                                <div>
                                    <p className="text-sm text-white">
                                        {exp.description || "Sin descripción"}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {new Date(exp.createdAt).toLocaleDateString()}
                                    </p>
                                </div>

                                <p className="text-red-400 font-medium">
                                    -${exp.amount}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}