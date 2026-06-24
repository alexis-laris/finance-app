import { useQuery } from "@tanstack/react-query";
import { useEffect, useState, useMemo } from "react";
import { getDashboardResumeRequest } from "../services/resume.service";
import formatToMXN from "../lib/formatMXN";

import {
    Calendar,
    Clock,
    TrendingUp,
    Target,
    ShoppingCart,
    BarChart3,
} from "lucide-react";

/* ---------------- HELPERS ---------------- */
function getNext15na() {
    const today = new Date();
    const day = today.getDate();
    const year = today.getFullYear();
    const month = today.getMonth();

    if (day <= 15) return new Date(year, month, 15);
    return new Date(year, month + 1, 0);
}

function formatDate(date) {
    return date.toLocaleDateString("es-MX", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

/* ---------------- COMPONENT ---------------- */
export default function Resume() {
    const { data, isLoading } = useQuery({
        queryKey: ["dashboard-resume"],
        queryFn: getDashboardResumeRequest,
    });

    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);

    const next15na = useMemo(() => getNext15na(), []);

    const upcomingExpenses = data?.upcomingPayments ?? [];

    if (isLoading) {
        return <p className="text-cyan-300">Cargando resumen...</p>;
    }

    return (
        <div className="space-y-6 text-white">

            {/* HEADER */}
            <div className="rounded-2xl p-5 border border-white/10 bg-linear-to-br from-[#0B0F27] to-[#0f1115]">
                <h1 className="text-2xl font-bold text-cyan-300">
                    Panel de Finanzas 👋
                </h1>
                <p className="text-gray-400 text-sm">
                    Controla tus gastos, metas y evolución financiera
                </p>
            </div>

            {/* 🔥 KPI IMPORTANTES (ESTO ES LO MÁS IMPORTANTE AHORA) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                {/* SEMANA (ROJO / ALERTA) */}
                <div className="p-5 rounded-2xl border border-red-500/20 bg-red-500/10  transition">
                    <p className="text-red-300 text-sm flex items-center gap-2">
                        <TrendingUp size={14} />
                        Gastos semana
                    </p>

                    <p className="text-3xl font-bold mt-2 text-white">
                        {formatToMXN(data?.week?.total ?? 0)}
                    </p>
                </div>

                {/* MES (VERDE PRINCIPAL) */}
                <div className="p-5 rounded-2xl border border-green-500/20 bg-green-500/10  transition">
                    <p className="text-green-300 text-sm flex items-center gap-2">
                        <TrendingUp size={14} />
                        Gastos mes
                    </p>

                    <p className="text-3xl font-bold mt-2 text-white">
                        {formatToMXN(data?.month?.total ?? 0)}
                    </p>
                </div>

                {/* CATEGORÍAS (AZUL / INSIGHT) */}
                <div className="p-5 rounded-2xl border border-blue-500/20 bg-blue-500/10  transition">
                    <p className="text-blue-300 text-sm flex items-center gap-2">
                        <BarChart3 size={14} />
                        Categorías activas
                    </p>

                    <p className="text-3xl font-bold mt-2 text-white">
                        {data?.byCategory?.length ?? 0}
                    </p>
                </div>

            </div>

            {/* TOP INFO */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                {/* 15NA HERO */}
                <div className="lg:col-span-2 relative overflow-hidden rounded-2xl border border-cyan-400/20 bg-linear-to-br from-cyan-500/10 to-blue-500/5 p-6">

                    <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-cyan-500/20 blur-3xl" />

                    <p className="text-cyan-300 flex items-center gap-2 text-sm">
                        <Calendar size={16} />
                        Próximo ingreso 15na
                    </p>

                    <h2 className="text-3xl font-bold mt-2">
                        {formatDate(next15na)}
                    </h2>

                    <div className="flex justify-between mt-6 text-sm text-gray-400">
                        <span className="flex items-center gap-2">
                            <Clock size={14} />
                            {now.toLocaleTimeString("es-MX")}
                        </span>

                        <span className="text-cyan-300">
                            Quincena activa
                        </span>
                    </div>
                </div>

                {/* META */}
                <div className="rounded-2xl border border-purple-500/20 bg-purple-500/10 p-6">

                    <div className="text-purple-300 flex items-center gap-2 text-sm">
                        <Target size={16} />
                        Meta principal
                    </div>

                    <p className="text-lg font-bold mt-2">
                        Ahorro mensual
                    </p>

                    <div className="mt-4">
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-linear-to-r from-purple-400 to-pink-500"
                                style={{ width: "65%" }}
                            />
                        </div>

                        <p className="text-xs text-purple-300 mt-2">
                            65% completado
                        </p>
                    </div>
                </div>

            </div>

            {/* MAIN GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                {/* CATEGORÍAS */}
                <div className="rounded-2xl border border-white/10 bg-linear-to-br from-[#0B0F27] to-[#0f1115] p-5">
                    <h2 className="text-cyan-300 font-bold mb-4">
                        Gastos por categoría
                    </h2>

                    <div className="space-y-3">
                        {data?.byCategory?.map((cat) => (
                            <div
                                key={cat.categoryId}
                                className="flex justify-between p-2 rounded-lg hover:bg-white/5"
                            >
                                <span className="text-gray-300">
                                    {cat.name}
                                </span>
                                <span className="text-orange-300 font-bold">
                                    {formatToMXN(cat.total)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* PRÓXIMOS GASTOS */}
                <div className="rounded-2xl border border-white/10 bg-linear-to-br from-[#0B0F27] to-[#0f1115] p-5">

                    <h2 className="text-pink-300 font-bold flex items-center gap-2 mb-4">
                        <ShoppingCart size={16} />
                        Próximos gastos
                    </h2>

                    <div className="space-y-3">
                        {upcomingExpenses.map((exp) => (
                            <div
                                key={exp.id}
                                className="p-3 rounded-xl border border-white/10 hover:bg-white/5"
                            >
                                <p className="text-white">{exp.name}</p>

                                <p className="text-xs text-gray-400">
                                    {new Date(exp.scheduledAt).toLocaleDateString("es-MX")}
                                </p>

                                <p className="text-sm font-bold text-red-300">
                                    {formatToMXN(exp.amount)}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* GRÁFICA */}
                <div className="rounded-2xl border border-white/10 bg-linear-to-br from-purple-500/10 to-pink-500/5 flex items-center justify-center p-5">
                    <div className="text-center text-purple-300">
                        <BarChart3 className="mx-auto mb-2" />
                        <p>Gráfica futura</p>
                        <p className="text-xs text-gray-500">coming soon</p>
                    </div>
                </div>

            </div>
        </div>
    );
}