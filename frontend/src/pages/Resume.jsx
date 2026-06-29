import { useQuery } from "@tanstack/react-query";
import { useEffect, useState, useMemo } from "react";
import { getDashboardResumeRequest } from "../services/resume.service";
import formatToMXN from "../lib/formatMXN";

import {
    Calendar,
    Clock,
    TrendingUp,
    Target,
    BarChart3,
} from "lucide-react";

import Loader from "../components/utils/Loader";
import ExpensesChart from "../components/charts/ExpensesChart";

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

const cardBase = `
    relative overflow-hidden
    rounded-2xl border border-white/10
    bg-linear-to-br from-[#0B0F27] to-[#0f1115]
    p-5
    transition-all duration-300
    hover:scale-[1.02] hover:border-white/20
`;

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
        return <Loader />;
    }

    return (
        <div className="space-y-6 text-white">

            <div className={cardBase}>
                <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full blur-3xl opacity-10 bg-white" />
                <h1 className="text-2xl font-bold text-white">Panel de Finanzas 👋</h1>
                <p className="text-sm text-gray-400">Controla tus gastos, metas y evolución financiera</p>
                <div className="absolute bottom-0 left-0 h-1 w-full bg-white/20" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                <div className={`${cardBase} border-red-500/20 bg-red-500/10 from-red-950/40 to-[#0f1115]`}>
                    <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full blur-3xl opacity-20 bg-red-500" />
                    <p className="text-red-300 text-sm flex items-center gap-2">
                        <TrendingUp size={14} />
                        Gastos semana
                    </p>
                    <p className="text-4xl font-bold tracking-tight text-white mt-3">
                        {formatToMXN(data?.week?.total ?? 0)}
                    </p>
                    <div className="absolute bottom-0 left-0 h-1 w-full bg-red-500/40" />
                </div>

                <div className={`${cardBase} border-green-500/20 bg-green-500/10 from-green-950/40 to-[#0f1115]`}>
                    <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full blur-3xl opacity-20 bg-green-500" />
                    <p className="text-green-300 text-sm flex items-center gap-2">
                        <TrendingUp size={14} />
                        Gastos mes
                    </p>
                    <p className="text-4xl font-bold tracking-tight text-white mt-3">
                        {formatToMXN(data?.month?.total ?? 0)}
                    </p>
                    <div className="absolute bottom-0 left-0 h-1 w-full bg-green-500/40" />
                </div>

                <div className={cardBase}>
                    <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full blur-3xl opacity-10 bg-white" />
                    <p className="text-gray-400 text-sm flex items-center gap-2">
                        <BarChart3 size={14} />
                        Categorías activas
                    </p>
                    <p className="text-4xl font-bold tracking-tight text-white mt-3">
                        {data?.byCategory?.length ?? 0}
                    </p>
                    <div className="absolute bottom-0 left-0 h-1 w-full bg-white/20" />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                <div className={`${cardBase} lg:col-span-2`}>
                    <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full blur-3xl opacity-10 bg-white" />
                    <p className="text-gray-400 flex items-center gap-2 text-sm">
                        <Calendar size={16} />
                        Próximo ingreso 15na
                    </p>
                    <h2 className="text-3xl font-bold mt-3 text-white">
                        {formatDate(next15na)}
                    </h2>
                    <div className="flex justify-between mt-6 text-sm text-gray-400">
                        <span className="flex items-center gap-2">
                            <Clock size={14} />
                            {now.toLocaleTimeString("es-MX")}
                        </span>
                        <span className="text-gray-300">Quincena activa</span>
                    </div>
                    <div className="absolute bottom-0 left-0 h-1 w-full bg-white/20" />
                </div>

                <div className={cardBase}>
                    <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full blur-3xl opacity-10 bg-white" />
                    <p className="text-gray-400 flex items-center gap-2 text-sm font-bold mb-4">
                        <Target size={16} />
                        Metas de ahorro
                    </p>

                    {data?.savingGoals?.length === 0 && (
                        <p className="text-xs text-gray-500">Sin metas activas</p>
                    )}

                    <div className="space-y-4">
                        {data?.savingGoals?.map((goal) => {
                            const raw = (goal.currentAmount / goal.targetAmount) * 100;
                            const pct = Math.min(100, raw);
                            const pctDisplay = pct < 1 ? pct.toFixed(1) : Math.round(pct);

                            return (
                                <div key={goal.id}>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-white font-medium">{goal.name}</span>
                                        <span className="text-gray-400">{pctDisplay}%</span>
                                    </div>
                                    <div
                                        className="mt-1 h-1.5 rounded-full overflow-hidden"
                                        style={{ background: "rgba(255,255,255,0.08)" }}
                                    >
                                        <div
                                            className="h-full rounded-full transition-all duration-500"
                                            style={{
                                                width: `${pct}%`,
                                                background: pct >= 100 ? "#ffffff" : "#a1a1aa",
                                            }}
                                        />
                                    </div>
                                    <div className="flex justify-between text-xs text-[#07D896] mt-1">
                                        <span>{formatToMXN(goal.currentAmount)}</span>
                                        <span>{formatToMXN(goal.targetAmount)}</span>
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        Fecha límite:{" "}
                                        <span className="font-bold text-white">{goal.deadlineLabel}</span>
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                    <div className="absolute bottom-0 left-0 h-1 w-full bg-white/20" />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                <div className={cardBase}>
                    <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full blur-3xl opacity-10 bg-white" />
                    <h2 className="text-gray-400 font-bold mb-4">Gastos por categoría</h2>
                    <div className="space-y-1">
                        {data?.byCategory?.map((cat) => (
                            <div
                                key={cat.categoryId}
                                className="flex justify-between p-3 rounded-xl border border-white/10 hover:bg-white/5"
                            >
                                <span className="text-gray-300 text-sm">{cat.name}</span>
                                <span className="text-[#07D896] font-bold text-sm">
                                    {formatToMXN(cat.total)}
                                </span>
                            </div>
                        ))}
                    </div>
                    <div className="absolute bottom-0 left-0 h-1 w-full bg-white/20" />
                </div>

                <div className={cardBase}>
                    <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full blur-3xl opacity-10 bg-white" />
                    <h2 className="text-gray-400 font-bold flex items-center gap-2 mb-4">
                        <Clock size={16} />
                        Próximos pagos
                    </h2>
                    <div className="space-y-3">
                        {upcomingExpenses.map((exp) => (
                            <div
                                key={exp.id}
                                className="p-3 rounded-xl border border-white/10 hover:bg-white/5"
                            >
                                <p className="text-white text-sm font-medium">{exp.name}</p>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    Fecha límite:{" "}
                                    <span className="font-bold text-white">{exp.scheduledAtLabel}</span>
                                </p>
                                <p className="text-sm font-bold text-[#07D896] mt-0.5">
                                    {formatToMXN(exp.amount)}
                                </p>
                            </div>
                        ))}
                    </div>
                    <div className="absolute bottom-0 left-0 h-1 w-full bg-white/20" />
                </div>

                <div className={cardBase}>
                    <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full blur-3xl opacity-10 bg-white" />
                    <h2 className="text-gray-400 font-bold mb-5">Evolución de gastos</h2>
                    <ExpensesChart data={data?.history ?? []} />
                    <div className="absolute bottom-0 left-0 h-1 w-full bg-white/20" />
                </div>
            </div>
        </div>
    );
}