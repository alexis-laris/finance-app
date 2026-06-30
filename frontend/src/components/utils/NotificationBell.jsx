import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { Bell, AlertCircle, Clock, Target } from "lucide-react";
import { getNotificationsRequest, markNotificationsSeenRequest } from "../../services/resume.service";

const ICONS = {
    PAYMENT_OVERDUE: { Icon: AlertCircle, bg: "bg-red-500/10", color: "text-red-400" },
    PAYMENT_DUE_SOON: { Icon: Clock, bg: "bg-amber-500/10", color: "text-amber-400" },
    GOAL_DEADLINE_SOON: { Icon: Target, bg: "bg-sky-500/10", color: "text-sky-400" },
};

export default function NotificationBell() {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    const queryClient = useQueryClient();

    const { data } = useQuery({
        queryKey: ["notifications"],
        queryFn: getNotificationsRequest,
        refetchInterval: 60_000,
    });

    const markSeen = useMutation({
        mutationFn: markNotificationsSeenRequest,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
        },
    });

    const notifications = data?.notifications ?? [];
    const unseenCount = data?.unseenCount ?? 0;

    useEffect(() => {
        const onClickOutside = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener("mousedown", onClickOutside);
        return () => document.removeEventListener("mousedown", onClickOutside);
    }, []);

    const handleToggle = () => {
        setOpen((o) => {
            const next = !o;
            if (next && unseenCount > 0) {
                markSeen.mutate();
            }
            return next;
        });
    };

    return (
        <div className="relative" ref={ref}>
            <button
                type="button"
                onClick={handleToggle}
                className="relative w-9 h-9 rounded-full flex items-center justify-center text-[#A9ACB7] hover:bg-white/10 hover:text-white transition-colors duration-200 cursor-pointer"
            >
                <Bell size={18} className="text-[#07D896]" />
                {unseenCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-[#0B0F27]" />
                )}
            </button>

            {open && (
                <div className="absolute right-0 mt-2 w-80 bg-[#0d1230] border border-white/10 rounded-xl shadow-xl overflow-hidden z-20">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                        <span className="text-sm font-medium text-white">Notificaciones</span>
                        <span className="text-xs text-[#A9ACB7]">{notifications.length} en total</span>
                    </div>

                    <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <p className="text-sm text-[#A9ACB7] text-center py-6">Sin notificaciones</p>
                        ) : (
                            notifications.map((n) => {
                                const { Icon, bg, color } = ICONS[n.type] ?? ICONS.PAYMENT_DUE_SOON;
                                return (
                                    <div
                                        key={n.id}
                                        className={`flex gap-3 px-4 py-3 border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors ${n.isNew ? "bg-white/3" : ""
                                            }`}
                                    >
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${bg} ${color}`}>
                                            <Icon size={16} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-white">{n.title}</p>

                                            <p className="text-xs text-[#A9ACB7] leading-snug">
                                                {n.message}
                                            </p>

                                            <p className="text-[11px] text-[#6B7280] mt-1">
                                                {n.dateLabel}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}