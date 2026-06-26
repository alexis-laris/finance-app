import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getCategoryByIdRequest } from "../services/categories.service";
import Loader from "../components/utils/Loader";
import {
    ArrowLeft,
    Car,
    Home,
    ShoppingBag,
    Folder,
    UtensilsCrossed,
    HeartPulse,
    Clock,
    CheckCircle2,
    XCircle,
    CreditCard,
    Gamepad2,
    Wifi,
    Smartphone,
    PiggyBank,
} from "lucide-react";
import formatToMXN from "../lib/formatMXN";

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

const paymentStatus = {
    PENDING: {
        label: "Pendiente",
        icon: Clock,
        color: "#f59e0b",
        bg: "#f59e0b15",
        border: "#f59e0b35",
    },
    PAID: {
        label: "Pagado",
        icon: CheckCircle2,
        color: "#10b981",
        bg: "#10b98115",
        border: "#10b98135",
    },
    CANCELLED: {
        label: "Cancelado",
        icon: XCircle,
        color: "#ef4444",
        bg: "#ef444415",
        border: "#ef444435",
    },
};

export default function CategoriesDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    const { data: category, isLoading, isError } = useQuery({
        queryKey: ["category", id],
        queryFn: () => getCategoryByIdRequest(id),
        enabled: !!id,
    });

    if (isLoading) return <Loader />;
    if (isError || !category) return <p>Error cargando categoría</p>;

    const color = category.color || "#07D896";
    const IconComponent = categoryIcons[category.icon] || categoryIcons.default;

    const colorBg = `${color}12`;
    const colorBorder = `${color}40`;
    const colorBorderHover = `${color}70`;

    const hasExpenses = category.expenses?.length > 0;
    const hasPayments = category.payments?.length > 0;

    return (
        <div className="space-y-4 pb-8">

            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition cursor-pointer"
            >
                <ArrowLeft size={15} />
                Mis categorías
            </button>


            <div
                className="rounded-2xl p-6 relative overflow-hidden"
                style={{ background: colorBg, border: `1px solid ${colorBorder}` }}
            >
                <div className="relative z-10 flex flex-col items-center sm:items-start text-center sm:text-left">


                    <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 mx-auto sm:mx-0"
                        style={{ background: color }}
                    >
                        <IconComponent size={26} color="#fff" />
                    </div>


                    <div className="mt-4 w-full">
                        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white wrap-break-word">
                            {category.name}
                        </h1>

                        <p className="text-gray-400 mt-1 text-sm">
                            {category.description || "Sin descripción"}
                        </p>

                        <p className="text-xs text-gray-500 mt-3 flex items-center gap-1.5 justify-center sm:justify-start">
                            Creada:{" "}
                            <span className="text-white font-bold">
                                {category.createdAtFormatted}
                            </span>
                        </p>
                    </div>
                </div>
            </div>


            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                    className="rounded-xl p-4"
                    style={{ background: colorBg, border: `1px solid ${colorBorder}` }}
                >
                    <p className="text-xs text-gray-400 mb-1 text-center sm:text-left">
                        Total gastos
                    </p>

                    <p className="text-xl sm:text-2xl md:text-3xl font-bold text-white text-center sm:text-left">
                        {formatToMXN(category.totalExpenses)}
                    </p>

                    <p
                        className="text-xs mt-1 text-center sm:text-left"
                        style={{ color }}
                    >
                        {category.expensesCount}{" "}
                        {category.expensesCount === 1 ? "registro" : "registros"}
                    </p>
                </div>

                <div className="rounded-xl p-4 bg-white/5 border border-white/10">
                    <p className="text-xs text-gray-400 mb-1 text-center sm:text-left">
                        Total pagos
                    </p>

                    <p className="text-xl sm:text-2xl md:text-3xl font-bold text-white text-center sm:text-left">
                        {formatToMXN(category.totalPayments ?? 0)}
                    </p>

                    <p className="text-xs mt-1 text-gray-500 text-center sm:text-left">
                        {category.paymentsCount ?? 0}{" "}
                        {(category.paymentsCount ?? 0) === 1 ? "registro" : "registros"}
                    </p>
                </div>
            </div>


            <Section
                title="Últimos gastos"
                color={color}
                empty={!hasExpenses}
                emptyText="No hay gastos aún"
            >
                {category.expenses.map((exp) => (
                    <ExpenseItem
                        key={exp.id}
                        exp={exp}
                        color={color}
                        colorBg={colorBg}
                        colorBorder={colorBorder}
                        colorBorderHover={colorBorderHover}
                        IconComponent={IconComponent}
                    />
                ))}
            </Section>


            <Section
                title="Pagos programados"
                color={color}
                empty={!hasPayments}
                emptyText="No hay pagos programados"
            >
                {category.payments.map((pay) => (
                    <PaymentItem
                        key={pay.id}
                        pay={pay}
                        color={color}
                        colorBg={colorBg}
                        colorBorder={colorBorder}
                        colorBorderHover={colorBorderHover}
                        IconComponent={IconComponent}
                    />
                ))}
            </Section>
        </div>
    );
}


function Section({ title, color, empty, emptyText, children }) {
    return (
        <div>
            <div className="flex items-center gap-2 mb-3">
                <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ background: color }}
                />
                <h2 className="text-sm font-semibold text-white">{title}</h2>
            </div>

            {empty ? (
                <p className="text-sm text-gray-500 text-center py-6">
                    {emptyText}
                </p>
            ) : (
                <div className="space-y-2">{children}</div>
            )}
        </div>
    );
}



function ExpenseItem({ exp, color, colorBg, colorBorder, colorBorderHover, IconComponent }) {
    return (
        <div
            className="flex items-center justify-between p-3.5 rounded-xl transition-all"
            style={{
                background: "rgba(255,255,255,0.04)",
                border: "0.5px solid rgba(255,255,255,0.08)",
            }}
            onMouseEnter={(e) =>
                (e.currentTarget.style.borderColor = colorBorderHover)
            }
            onMouseLeave={(e) =>
                (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")
            }
        >
            <div className="flex items-center gap-3">
                <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: colorBg, border: `1px solid ${colorBorder}` }}
                >
                    <IconComponent size={15} color={color} />
                </div>
                <div>
                    <p className="text-sm text-white">
                        {exp.description || "Sin descripción"}
                    </p>


                    <p className="text-xs text-gray-500 mt-0.5">
                        Registrado: <span className="text-white font-bold">{exp.createdAtFormatted}</span>
                    </p>
                </div>
            </div>

            <p className="text-sm font-semibold" style={{ color }}>
                -{formatToMXN(exp.amount)}
            </p>
        </div>
    );
}


function PaymentItem({
    pay,
    color,
    colorBg,
    colorBorder,
    colorBorderHover,
    IconComponent,
}) {
    const status = paymentStatus[pay.status] ?? paymentStatus.PENDING;
    const StatusIcon = status.icon;

    return (
        <div
            className="flex items-center justify-between p-3.5 rounded-xl transition-all"
            style={{
                background: "rgba(255,255,255,0.04)",
                border: "0.5px solid rgba(255,255,255,0.08)",
            }}
            onMouseEnter={(e) =>
                (e.currentTarget.style.borderColor = colorBorderHover)
            }
            onMouseLeave={(e) =>
                (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")
            }
        >
            {/* LEFT */}
            <div className="flex items-start gap-3 min-w-0">
                <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: colorBg, border: `1px solid ${colorBorder}` }}
                >
                    <IconComponent size={15} color={color} />
                </div>

                <div className="min-w-0">
                    <p className="text-sm text-white truncate">
                        {pay.name || "Sin descripción"}
                    </p>

                    {/* INFO BLOCK */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mt-1">

                        {/* STATUS */}
                        <span
                            className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full w-fit"
                            style={{
                                background: status.bg,
                                border: `1px solid ${status.border}`,
                                color: status.color,
                            }}
                        >
                            <StatusIcon size={10} />
                            {status.label}
                        </span>

                        {/* FECHA PROGRAMADA */}
                        <p className="text-xs text-gray-500">
                            Fecha programada:{" "}
                            <span className="text-white font-bold">
                                {pay.scheduledAtFormatted || "-"}
                            </span>
                        </p>

                        {/* FECHA PAGADO */}
                        {pay.paidAt && (
                            <p className="text-xs text-gray-500">
                                Pagado el:{" "}
                                <span className="text-green-400 font-bold">
                                    {pay.paidAtFormatted || "-"}
                                </span>
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* AMOUNT */}
            <p className="text-sm font-semibold shrink-0 ml-3" style={{ color }}>
                -{formatToMXN(pay.amount)}
            </p>
        </div>
    );
}