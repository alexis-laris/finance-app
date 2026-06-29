import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import esLocale from "@fullcalendar/core/locales/es";
import {
    Loader2, Car, Home, ShoppingBag, Folder, UtensilsCrossed,
    HeartPulse, CreditCard, Gamepad2, Wifi, Smartphone,
    PiggyBank, CalendarX, ChevronLeft, ChevronRight,
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from "@/components/ui/dialog";
import { getCalendarRequest, getCalendarDayRequest } from "../../services/calendar.service";
import { resolveCategoryIcon } from "../../components/CategoryForm";
import formatToMXN from "../../lib/formatMXN";

const EVENT_CONFIG = {
    expense: { label: "Gastos", fallbackColor: "#07D896", text: "#07D896" },
    income: { label: "Ingresos", fallbackColor: "#07D896", text: "#07D896" },
    payment: { label: "Pagos programados", fallbackColor: "#3b82f6", text: "#93c5fd" },
    savingGoal: { label: "Metas de ahorro", fallbackColor: "#a855f7", text: "#d8b4fe" },
};

const SAVING_GOAL_COLOR = "#07D896";

const STATUS_STYLES = {
    PENDING: { bg: "rgba(234,179,8,0.15)", border: "rgba(234,179,8,0.4)", color: "#facc15" },
    PAID: { bg: "rgba(34,197,94,0.15)", border: "rgba(34,197,94,0.4)", color: "#4ade80" },
    CANCELLED: { bg: "rgba(239,68,68,0.15)", border: "rgba(239,68,68,0.4)", color: "#f87171" },
};
const STATUS_LABELS = { PENDING: "Pendiente", PAID: "Pagado", CANCELLED: "Cancelado" };

const CATEGORY_ICONS = {
    car: Car, home: Home, shopping: ShoppingBag,
    utensils: UtensilsCrossed, health: HeartPulse,
    creditcard: CreditCard, gamepad2: Gamepad2,
    wifi: Wifi, smartphone: Smartphone, piggybank: PiggyBank,
    default: Folder,
};

const MONTHS_ES = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const MOBILE_BP = 640;

const currentMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

const eventColor = (type, category) =>
    category?.color || EVENT_CONFIG[type]?.fallbackColor || "#6b7280";

const fmtTime = (date) => {
    if (!date) return "";
    let h = date.getHours();
    const m = String(date.getMinutes()).padStart(2, "0");
    const apm = h < 12 ? "a.m." : "p.m.";
    h = h % 12 || 12;
    return `${h}:${m} ${apm}`;
};

const hourRange = (h) => {
    const start = new Date(2000, 0, 1, h, 0);
    const end = new Date(2000, 0, 1, h, 59);
    return `${fmtTime(start)} – ${fmtTime(end)}`;
};

const getCategoryIcon = (category) => {
    if (!category) return CATEGORY_ICONS.default;
    try { return resolveCategoryIcon(category.icon); } catch { }
    return CATEGORY_ICONS[category.icon?.toLowerCase()] || CATEGORY_ICONS.default;
};

const parseMonth = (str) => {
    const [y, m] = str.split("-").map(Number);
    return { year: y, month0: m - 1 };
};

const getWeeksOfMonth = (year, month0) => {
    const weeks = [];
    const firstDay = new Date(year, month0, 1);
    const lastDay = new Date(year, month0 + 1, 0);
    const startMonday = new Date(firstDay);
    const dow = startMonday.getDay();
    startMonday.setDate(startMonday.getDate() + (dow === 0 ? -6 : 1 - dow));
    let cursor = new Date(startMonday);
    while (cursor <= lastDay) {
        const weekStart = new Date(cursor);
        const weekEnd = new Date(cursor);
        weekEnd.setDate(weekEnd.getDate() + 6);
        const overlapStart = weekStart < firstDay ? firstDay : weekStart;
        if (overlapStart <= lastDay) weeks.push({ start: new Date(weekStart), end: new Date(weekEnd) });
        cursor.setDate(cursor.getDate() + 7);
    }
    return weeks;
};

const getWeekIndexForDate = (date, year, month0) => {
    const weeks = getWeeksOfMonth(year, month0);
    return weeks.findIndex((w) => date >= w.start && date <= w.end);
};

const fmtDayLabel = (date) =>
    date.toLocaleDateString("es-MX", { weekday: "short", day: "numeric", month: "short" });

function MonthNavigator({ activeMonth, activeDate, calendarRef, isWeekView, isDayView }) {
    const [dropOpen, setDropOpen] = useState(false);
    const { year, month0 } = parseMonth(activeMonth);

    const thisYear = new Date().getFullYear();
    const years = Array.from({ length: 11 }, (_, i) => thisYear - 5 + i);
    const weeks = useMemo(() => getWeeksOfMonth(year, month0), [year, month0]);

    const activeWeekIdx = useMemo(() => {
        if (!isWeekView && !isDayView) return -1;
        if (!activeDate) return -1;
        return getWeekIndexForDate(activeDate, year, month0);
    }, [isWeekView, isDayView, activeDate, year, month0]);

    const navigate = useCallback((dir) => {
        const api = calendarRef.current?.getApi();
        if (api) dir === "prev" ? api.prev() : api.next();
    }, [calendarRef]);

    const goToMonth = useCallback((y, m0) => {
        const api = calendarRef.current?.getApi();
        if (!api) return;
        api.changeView("dayGridMonth");
        api.gotoDate(new Date(y, m0, 1));
        setDropOpen(false);
    }, [calendarRef]);

    const goToWeek = useCallback((weekStart) => {
        const api = calendarRef.current?.getApi();
        if (!api) return;
        const view = window.innerWidth < MOBILE_BP ? "timeGridDay" : "timeGridWeek";
        api.changeView(view);
        api.gotoDate(weekStart);
        setDropOpen(false);
    }, [calendarRef]);

    const goToday = useCallback(() => {
        const api = calendarRef.current?.getApi();
        if (api) { api.today(); setDropOpen(false); }
    }, [calendarRef]);

    const fmtWeekRange = (w) => {
        const opts = { day: "numeric", month: "short" };
        return `${w.start.toLocaleDateString("es-MX", opts)} – ${w.end.toLocaleDateString("es-MX", opts)}`;
    };

    const label = isDayView && activeDate
        ? fmtDayLabel(activeDate)
        : isWeekView
            ? `Semana · ${MONTHS_ES[month0]} ${year}`
            : `${MONTHS_ES[month0]} ${year}`;

    return (
        <div className="flex items-center gap-1.5 sm:gap-2 relative">
            <button onClick={() => navigate("prev")}
                className="flex items-center justify-center h-8 w-8 rounded-full border border-white/10 bg-white/5 text-gray-400 hover:border-[#07D896]/60 hover:text-[#07D896] transition cursor-pointer">
                <ChevronLeft size={15} />
            </button>

            <button onClick={() => setDropOpen((v) => !v)}
                className="flex items-center gap-1 sm:gap-1.5 h-8 px-2 sm:px-3 rounded-full border border-white/10 bg-white/5 text-xs sm:text-sm font-semibold text-white hover:border-[#07D896]/60 hover:text-[#07D896] transition cursor-pointer capitalize min-w-32.5 sm:min-w-40 justify-center">
                {label}
                <ChevronRight size={13} className={`transition-transform ${dropOpen ? "rotate-90" : ""}`} />
            </button>

            <button onClick={() => navigate("next")}
                className="flex items-center justify-center h-8 w-8 rounded-full border border-white/10 bg-white/5 text-gray-400 hover:border-[#07D896]/60 hover:text-[#07D896] transition cursor-pointer">
                <ChevronRight size={15} />
            </button>

            <button onClick={goToday}
                className="h-8 px-2 sm:px-3 rounded-full border border-white/10 bg-white/5 text-xs font-medium text-gray-400 hover:border-[#07D896]/60 hover:text-[#07D896] transition cursor-pointer">
                Hoy
            </button>

            {dropOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setDropOpen(false)} />
                    <div className="absolute top-10 left-0 z-50 w-72 sm:w-80 rounded-2xl border border-white/10 bg-[#0B0F27] shadow-2xl p-3 sm:p-4 space-y-3">
                        <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-500">Año</span>
                            <div className="flex gap-1 flex-wrap justify-end">
                                {years.map((y) => (
                                    <button key={y} onClick={() => goToMonth(y, month0)}
                                        className={`px-2 py-0.5 rounded-full text-xs font-medium transition cursor-pointer
                                            ${y === year ? "bg-[#07D896]/20 text-[#07D896] border border-[#07D896]/40" : "text-gray-400 hover:text-white border border-transparent hover:border-white/10"}`}>
                                        {y}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="border-t border-white/10" />
                        <div className="grid grid-cols-3 gap-1 sm:gap-1.5">
                            {MONTHS_ES.map((name, i) => (
                                <button key={i} onClick={() => goToMonth(year, i)}
                                    className={`py-1.5 rounded-full text-xs font-medium transition cursor-pointer
                                        ${i === month0 ? "bg-[#07D896]/20 text-[#07D896] border border-[#07D896]/40" : "text-gray-400 hover:bg-white/5 hover:text-white border border-transparent"}`}>
                                    {name}
                                </button>
                            ))}
                        </div>
                        <div className="border-t border-white/10" />
                        <div className="space-y-1">
                            <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-500">
                                Semanas de {MONTHS_ES[month0]}
                            </span>
                            <div className="space-y-1 mt-1.5">
                                {weeks.map((w, i) => {
                                    const isActive = (isWeekView || isDayView) && i === activeWeekIdx;
                                    return (
                                        <button key={i} onClick={() => goToWeek(w.start)}
                                            className={`w-full flex items-center justify-between px-3 py-1.5 rounded-full text-xs font-medium transition cursor-pointer
                                                ${isActive ? "bg-[#07D896]/20 text-[#07D896] border border-[#07D896]/40" : "text-gray-400 hover:bg-white/5 hover:text-white border border-transparent"}`}>
                                            <span className="text-gray-500 mr-2 shrink-0">S{i + 1}</span>
                                            <span className="capitalize">{fmtWeekRange(w)}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

function CategoryBadge({ category }) {
    const Icon = getCategoryIcon(category);
    const color = category?.color || "#07D896";
    return (
        <span className="w-fit flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full border"
            style={{ backgroundColor: `${color}20`, color, borderColor: `${color}40` }}>
            <Icon size={14} strokeWidth={1.8} />
            {category?.name || "Sin categoría"}
        </span>
    );
}

function StatusBadge({ status }) {
    if (!status) return null;
    const s = STATUS_STYLES[status] || STATUS_STYLES.PENDING;
    return (
        <span className="w-fit flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium border"
            style={{ backgroundColor: s.bg, borderColor: s.border, color: s.color }}>
            {STATUS_LABELS[status]}
        </span>
    );
}

function EventCard({ item, type, highlighted }) {
    const isSaving = type === "savingGoal";
    const color = isSaving ? SAVING_GOAL_COLOR : eventColor(type, item.category);
    const cfg = EVENT_CONFIG[type];

    const targetAmt = item.targetAmount ?? 0;
    const currentAmt = item.currentAmount ?? 0;
    const progress = isSaving && targetAmt > 0
        ? (currentAmt / targetAmt) * 100
        : (item.progressPercent ?? 0);
    const isCompleted = progress >= 100;
    const remaining = targetAmt - currentAmt;

    const displayLabel = type === "payment"
        ? (item.name || cfg.label)
        : (item.description || item.name || cfg.label);

    return (
        <div className={`group relative overflow-hidden rounded-2xl border bg-linear-to-br from-[#0B0F27] to-[#0f1115] p-4 sm:p-5 transition-all duration-300
            ${highlighted ? "border-white/30 scale-[1.01]" : "border-white/10 hover:scale-[1.02] hover:border-white/20"}`}>
            <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full blur-3xl opacity-20 pointer-events-none"
                style={{ backgroundColor: color }} />

            {!isSaving && (
                <div className="flex flex-wrap items-center gap-2 mb-3 sm:mb-4">
                    <CategoryBadge category={item.category} />
                    {type === "payment" && <StatusBadge status={item.status} />}
                </div>
            )}

            <p className="text-2xl sm:text-3xl font-bold tracking-tight leading-none"
                style={{ color: isSaving ? color : "white" }}>
                {isSaving ? formatToMXN(item.currentAmount ?? 0) : formatToMXN(item.amount ?? 0)}
            </p>

            {isSaving && (
                <p className="text-sm text-gray-400 mt-1">de {formatToMXN(item.targetAmount ?? 0)}</p>
            )}

            <p className="text-sm text-gray-400 mt-3 truncate">{displayLabel}</p>

            {isSaving && (
                <>
                    <div className="w-full h-1.5 bg-white/10 rounded-full mt-4 overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(progress, 100)}%`, backgroundColor: isCompleted ? "#34d399" : SAVING_GOAL_COLOR }} />
                    </div>
                    <div className="flex items-center justify-between mt-2">
                        <span className="text-xs font-medium" style={{ color: isCompleted ? "#34d399" : SAVING_GOAL_COLOR }}>
                            {isCompleted ? "¡Meta completada!" : `${progress.toFixed(1)}%`}
                        </span>
                        {!isCompleted && remaining > 0 && (
                            <span className="text-xs text-gray-500">Faltan {formatToMXN(remaining)}</span>
                        )}
                    </div>
                    {item.deadlineFormatted && (
                        <p className="text-xs text-gray-500 mt-2">
                            Finaliza: <span className="text-white font-bold capitalize">{item.deadlineFormatted}</span>
                        </p>
                    )}
                </>
            )}

            {type === "payment" && (
                <>
                    {item.scheduledAtFormatted && (
                        <p className="text-xs text-gray-500 mt-2">
                            Fecha programada: <span className="text-white font-bold">{item.scheduledAtFormatted}</span>
                        </p>
                    )}
                    {item.paidAtFormatted && (
                        <p className="text-xs text-gray-500 mt-1">
                            Pagado el: <span className="text-green-400 font-bold">{item.paidAtFormatted}</span>
                        </p>
                    )}
                </>
            )}

            {(type === "expense" || type === "income") && item.dateFormatted && (
                <p className="text-xs text-gray-500 mt-1">
                    Registrado: <span className="text-white font-bold">{item.dateFormatted}</span>
                </p>
            )}

            <div className="absolute bottom-0 left-0 h-1 w-full" style={{ backgroundColor: color }} />
        </div>
    );
}

function DayModal({ dateStr, dayData, isLoading, open, onClose, focusItem, focusType }) {
    const hasEvents = Boolean(dayData && (
        (dayData.expenses?.length ?? 0) +
        (dayData.incomes?.length ?? 0) +
        (dayData.payments?.length ?? 0) +
        (dayData.savingGoals?.length ?? 0) > 0
    ));

    const SECTIONS = [
        { key: "expenses", type: "expense" },
        { key: "incomes", type: "income" },
        { key: "payments", type: "payment" },
        { key: "savingGoals", type: "savingGoal" },
    ];

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="w-[95vw] sm:max-w-lg lg:max-w-xl max-h-[90vh] overflow-y-auto p-0 bg-[#0B0F27] border border-white/10 text-white flex flex-col">
                <div className="px-4 sm:px-5 pt-4 pb-3 border-b border-white/10 shrink-0">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-[#07D896]">Detalle del día</p>
                    <DialogTitle className="mt-0.5 text-base sm:text-lg font-bold text-white capitalize">
                        {dayData?.dateFormatted ?? dateStr ?? "—"}
                    </DialogTitle>
                </div>

                <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-4 sm:py-5 space-y-6">
                    {isLoading && (
                        <div className="flex justify-center py-16">
                            <Loader2 size={24} className="animate-spin text-[#07D896]" />
                        </div>
                    )}

                    {!isLoading && !hasEvents && (
                        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-gray-600">
                                <CalendarX size={24} strokeWidth={1.5} />
                            </div>
                            <p className="text-sm font-medium text-gray-400">Sin eventos este día</p>
                            <p className="text-xs text-gray-600 max-w-55">
                                No hay gastos, ingresos ni pagos registrados para esta fecha.
                            </p>
                        </div>
                    )}

                    {!isLoading && hasEvents && SECTIONS.map(({ key, type }) => {
                        const items = dayData?.[key];
                        if (!items?.length) return null;
                        const cfg = EVENT_CONFIG[type];
                        return (
                            <div key={key} className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor: cfg.fallbackColor }} />
                                    <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-500 flex-1">{cfg.label}</span>
                                    <span className="text-[10px] text-gray-600 bg-white/5 rounded-full px-2 py-0.5">{items.length}</span>
                                </div>
                                <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
                                    {items.map((item) => (
                                        <EventCard key={item.id} item={item} type={type}
                                            highlighted={focusItem && focusType === type && String(item.id) === String(focusItem.id)} />
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default function Calendar() {
    const calendarRef = useRef(null);

    const [activeMonth, setActiveMonth] = useState(currentMonth);
    const [activeDate, setActiveDate] = useState(() => new Date());
    const [viewType, setViewType] = useState("dayGridMonth");

    const isWeekView = viewType === "timeGridWeek";
    const isDayView = viewType === "timeGridDay";

    const [modalOpen, setModalOpen] = useState(false);
    const [modalDate, setModalDate] = useState(null);
    const [focusItem, setFocusItem] = useState(null);
    const [focusType, setFocusType] = useState(null);

    useEffect(() => {
        const handleResize = () => {
            if (!calendarRef.current) return;
            const api = calendarRef.current.getApi();
            const vt = api.view.type;
            if (vt === "timeGridWeek" && window.innerWidth < MOBILE_BP) {
                api.changeView("timeGridDay");
            } else if (vt === "timeGridDay" && window.innerWidth >= MOBILE_BP) {
                api.changeView("timeGridWeek");
            }
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const { data: calendarData, isLoading: calendarLoading } = useQuery({
        queryKey: ["calendar", activeMonth],
        queryFn: () => getCalendarRequest(activeMonth),
        staleTime: 1000 * 60 * 5,
    });

    const { data: dayData, isLoading: dayLoading } = useQuery({
        queryKey: ["calendarDay", modalDate],
        queryFn: () => getCalendarDayRequest(modalDate),
        enabled: !!modalDate,
        staleTime: 1000 * 60 * 2,
    });

    const fcEvents = useMemo(() => {
        if (!calendarData?.data) return [];
        const events = [];

        const pushTimed = (type, id, title, isoFull, dateKey, category) => {
            const color = eventColor(type, category);
            events.push({
                id: `${type}-${id}`,
                title,
                start: isoFull,
                allDay: false,
                backgroundColor: `${color}22`,
                borderColor: color,
                textColor: color,
                extendedProps: { eventType: type, itemId: id, dateKey },
            });
        };

        const pushAllDay = (type, id, title, dateKey, category) => {
            const color = eventColor(type, category);
            events.push({
                id: `${type}-${id}`,
                title,
                start: dateKey,
                allDay: true,
                backgroundColor: `${color}22`,
                borderColor: color,
                textColor: color,
                extendedProps: { eventType: type, itemId: id, dateKey },
            });
        };

        Object.entries(calendarData.data).forEach(([dateKey, day]) => {
            day.expenses?.forEach(e =>
                pushTimed("expense", e.id, e.description || "Gasto", e.date ?? dateKey, dateKey, e.category)
            );
            day.incomes?.forEach(i =>
                pushTimed("income", i.id, i.description || "Ingreso", i.date ?? dateKey, dateKey, null)
            );
            day.payments?.forEach(p =>
                pushAllDay("payment", p.id, p.name || "Pago", dateKey, p.category)
            );
            day.savingGoals?.forEach(g =>
                pushAllDay("savingGoal", g.id, g.name || "Meta", dateKey, null)
            );
        });
        return events;
    }, [calendarData]);

    const KEY_MAP = {
        expense: "expenses", income: "incomes",
        payment: "payments", savingGoal: "savingGoals",
    };

    const openModal = useCallback((dateStr, eventType = null, itemId = null) => {
        setModalDate(dateStr);
        setModalOpen(true);
        if (eventType && itemId) {
            const found = calendarData?.data?.[dateStr]?.[KEY_MAP[eventType]]
                ?.find(i => String(i.id) === String(itemId));
            setFocusItem(found ?? null);
            setFocusType(eventType);
        } else {
            setFocusItem(null);
            setFocusType(null);
        }
    }, [calendarData]);

    const closeModal = () => {
        setModalOpen(false);
        setModalDate(null);
        setFocusItem(null);
        setFocusType(null);
    };

    const handleDateClick = (info) => openModal(info.dateStr);
    const handleEventClick = (info) => {
        info.jsEvent.stopPropagation();
        const { eventType, itemId, dateKey } = info.event.extendedProps;
        openModal(dateKey ?? info.event.startStr?.slice(0, 10), eventType, itemId);
    };

    const handleDatesSet = (info) => {
        const d = info.view.currentStart;
        setActiveMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
        setActiveDate(new Date(d));
        setViewType(info.view.type);
    };

    const activateWeekView = () => {
        const api = calendarRef.current?.getApi();
        if (!api) return;
        api.changeView(window.innerWidth < MOBILE_BP ? "timeGridDay" : "timeGridWeek");
    };

    return (
        <div className="space-y-4 sm:space-y-6">

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Calendario</h1>
                    <p className="text-sm text-gray-400">Visualiza tus finanzas en el tiempo</p>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                    {Object.entries(EVENT_CONFIG).map(([type, cfg]) => (
                        <div key={type} className="flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: cfg.fallbackColor }} />
                            <span className="text-xs text-gray-400">{cfg.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-linear-to-br from-[#0B0F27] to-[#0f1115] p-2 sm:p-4 lg:p-6">
                <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-[#07D896] opacity-5 blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 sm:gap-3 mb-3 sm:mb-4">
                    <MonthNavigator
                        activeMonth={activeMonth}
                        activeDate={activeDate}
                        calendarRef={calendarRef}
                        isWeekView={isWeekView}
                        isDayView={isDayView}
                    />

                    <div className="flex items-center gap-2">
                        {calendarLoading && <Loader2 size={13} className="animate-spin text-[#07D896]" />}
                        <div className="flex rounded-full border border-white/10 overflow-hidden">
                            <button
                                onClick={() => calendarRef.current?.getApi().changeView("dayGridMonth")}
                                className={`rounded-full px-2.5 sm:px-3 py-1.5 text-xs font-medium transition cursor-pointer
                                    ${viewType === "dayGridMonth"
                                        ? "bg-[#07D896]/10 text-[#07D896] border-r border-[#07D896]/30"
                                        : "bg-transparent text-gray-400 hover:text-white border-r border-white/10"}`}>
                                Mes
                            </button>
                            <button
                                onClick={activateWeekView}
                                className={`px-2.5 sm:px-3 py-1.5 text-xs font-medium transition cursor-pointer rounded-full
                                    ${isWeekView || isDayView
                                        ? "bg-[#07D896]/10 text-[#07D896]"
                                        : "bg-transparent text-gray-400 hover:text-white"}`}>
                                {isDayView ? "Día" : "Semana"}
                            </button>
                        </div>
                    </div>
                </div>

                <style>{`
                    .fc-header-toolbar { display: none !important; }
                    .fc { color: #e5e7eb; }
                    .fc-theme-standard td,
                    .fc-theme-standard th,
                    .fc-theme-standard .fc-scrollgrid { border-color: rgba(255,255,255,0.06) !important; }

                    .fc-col-header-cell-cushion {
                        font-size: 11px; font-weight: 600; color: #6b7280 !important;
                        text-transform: uppercase; letter-spacing: 0.05em; text-decoration: none !important;
                    }
                    .fc-daygrid-day-number {
                        font-size: 12px; color: #9ca3af !important;
                        text-decoration: none !important; padding: 4px 6px;
                    }
                    .fc-day-today .fc-daygrid-day-number { color: #07D896 !important; font-weight: 700; }
                    .fc-day-today { background: rgba(7,216,150,0.04) !important; }

                    .fc-daygrid-day,
                    .fc-timegrid-col,
                    .fc-timegrid-slot,
                    .fc-timegrid-slot-lane { cursor: pointer !important; }
                    .fc-daygrid-day:hover        { background: rgba(255,255,255,0.025) !important; }
                    .fc-timegrid-slot-lane:hover { background: rgba(255,255,255,0.02) !important; }

                    .fc-timegrid-slot-label-cushion,
                    .fc-timegrid-axis-cushion { font-size: 10px; color: #6b7280 !important; white-space: nowrap; }
                    .fc-timegrid-slot-minor   { display: none !important; }

                    .fc-timegrid-slot { height: 64px !important; }

                    .fc-timegrid-event-harness { margin-right: 0 !important; }

                    .fc-event {
                        border-radius: 5px !important; font-size: 10px !important;
                        padding: 2px 5px !important; font-weight: 500 !important;
                        border-width: 1px !important; cursor: pointer !important;
                        box-shadow: none !important; line-height: 1.4 !important;
                    }
                    .fc-timegrid-event {
                        overflow: hidden !important;
                        max-height: 58px !important;
                    }
                    .fc-daygrid-event { overflow: hidden !important; }
                    .fc-event-title {
                        white-space: nowrap !important;
                        overflow: hidden !important;
                        text-overflow: ellipsis !important;
                    }
                    .fc-event:focus,
                    .fc-event:focus-within { outline: none !important; box-shadow: none !important; }

                    .fc-timegrid-col-events {
                        display: flex !important;
                        flex-direction: column !important;
                    }

                    .fc-day-today.fc-timegrid-col {
                        background: rgba(7,216,150,0.04) !important;
                        border-left: 1px solid rgba(7,216,150,0.25) !important;
                        border-right: 1px solid rgba(7,216,150,0.25) !important;
                    }

                    .fc-timegrid-now-indicator-line  { border-color: #07D896 !important; border-width: 1.5px !important; }
                    .fc-timegrid-now-indicator-arrow { border-top-color: #07D896 !important; border-bottom-color: #07D896 !important; }

                    .fc-daygrid-more-link       { color: #6b7280 !important; font-size: 10px !important; }
                    .fc-daygrid-more-link:hover { color: #07D896 !important; }

                    .fc-popover {
                        background: #0f1115 !important;
                        border: 1px solid rgba(255,255,255,0.1) !important;
                        border-radius: 10px !important; max-width: 90vw;
                    }
                    .fc-popover-header {
                        background: #0B0F27 !important; color: #f9fafb !important;
                        border-radius: 10px 10px 0 0 !important; padding: 8px 12px !important;
                    }
                    .fc-popover-close { color: #9ca3af !important; }

                    .fc-timegrid-axis-cushion { font-size: 10px !important; }

                    @media (max-width: 640px) {
                        .fc-col-header-cell-cushion     { font-size: 9px !important; letter-spacing: 0 !important; }
                        .fc-daygrid-day-number          { font-size: 10px !important; padding: 2px 3px; }
                        .fc-event                       { font-size: 8px !important; padding: 1px 3px !important; }
                        .fc-timegrid-slot-label-cushion { font-size: 8px !important; }
                        .fc-timegrid-slot               { height: 56px !important; }
                        .fc-timegrid-event              { max-height: 50px !important; }
                        .fc-timegrid-axis               { width: 42px !important; }
                        .fc-daygrid-more-link           { font-size: 9px !important; }
                    }
                    @media (max-width: 400px) {
                        .fc-col-header-cell-cushion     { font-size: 8px !important; }
                        .fc-timegrid-axis               { width: 34px !important; }
                        .fc-timegrid-slot-label-cushion { font-size: 7px !important; }
                    }
                `}</style>

                <FullCalendar
                    ref={calendarRef}
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    initialView="dayGridMonth"
                    locale={esLocale}
                    headerToolbar={false}
                    events={fcEvents}
                    dateClick={handleDateClick}
                    eventClick={handleEventClick}
                    datesSet={handleDatesSet}
                    height="auto"
                    dayMaxEvents={3}
                    eventDisplay="block"
                    nowIndicator={true}
                    slotMinTime="00:00:00"
                    slotMaxTime="24:00:00"
                    slotDuration="01:00:00"
                    slotLabelInterval="01:00:00"
                    scrollTime="08:00:00"
                    allDayText="Todo el día"
                    slotEventOverlap={false}
                    defaultTimedEventDuration="00:55:00"
                    slotLabelContent={(arg) => arg.date ? hourRange(arg.date.getHours()) : arg.text}
                    eventTimeFormat={{ hour: "numeric", minute: "2-digit", hour12: true }}
                />
            </div>

            <DayModal
                dateStr={modalDate}
                dayData={dayData}
                isLoading={dayLoading}
                open={modalOpen}
                onClose={closeModal}
                focusItem={focusItem}
                focusType={focusType}
            />
        </div>
    );
}