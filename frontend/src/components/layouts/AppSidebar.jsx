import { useEffect } from "react";
import { useLocation, NavLink, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../hooks/useAuth";
import { logoutRequest } from "../../services/auth.service";
import {
    Home, DollarSign, Blocks, Target, LogOut, CheckCheck, Calendar,
} from "lucide-react";
import {
    Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent,
    SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar,
} from "@/components/ui/sidebar";

const menu = [
    { name: "Inicio", icon: Home, path: "/dashboard", end: true },
    { name: "Mi Calendario", icon: Calendar, path: "/dashboard/calendar" },
    { name: "Categorías", icon: Blocks, path: "/dashboard/categories" },
    { name: "Mis Gastos", icon: DollarSign, path: "/dashboard/expenses" },
    { name: "Pagos Futuros", icon: CheckCheck, path: "/dashboard/payments" },
    { name: "Metas de Ahorro", icon: Target, path: "/dashboard/savings" },
];

export function AppSidebar() {
    const { data: user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { state, isMobile, setOpenMobile } = useSidebar();
    const isCollapsed = !isMobile && state === "collapsed";

    useEffect(() => {
        if (isMobile) setOpenMobile(false);
    }, [location.pathname, isMobile, setOpenMobile]);

    const logoutMutation = useMutation({
        mutationFn: logoutRequest,
        onSuccess: () => {
            queryClient.setQueryData(["me"], null);
            navigate("/");
        },
    });

    return (
        <Sidebar
            collapsible="icon"
            className="border-r-0 bg-[#0B0F27] relative overflow-hidden"
        >

            <div className="absolute -left-16 top-24 w-64 h-20 rounded-full bg-[#07D896]/15 blur-3xl pointer-events-none z-0" />


            <SidebarHeader className="h-16 flex flex-row items-center justify-start px-4 relative z-10 [&>div]:flex [&>div]:items-center">
                {isCollapsed ? (

                    <div className="w-9 h-9 rounded-xl bg-[#07D896]/15 flex items-center justify-center">
                        <DollarSign size={20} className="text-[#07D896]" />
                    </div>
                ) : (
                    <span className="text-[#07D896] font-bold text-xl tracking-tight">
                        Finance App
                    </span>
                )}

                <div className="absolute bottom-0 left-0 h-px w-full bg-linear-to-r from-[#07D896]/60 via-[#07D896]/20 to-transparent" />
            </SidebarHeader>


            <SidebarContent className="py-6 relative z-10">
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu className={`gap-2 ${isCollapsed ? "px-0 items-center" : "px-2"}`}>
                            {menu.map((item) => {
                                const Icon = item.icon;
                                const isActive = item.end
                                    ? location.pathname === item.path
                                    : location.pathname.startsWith(item.path);

                                return (
                                    <SidebarMenuItem key={item.path}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={isActive}
                                            tooltip={item.name}
                                            className={`
                                                w-full
                                                justify-start
                                                rounded-full
                                                transition-all
                                                duration-300
                                                cursor-pointer
                                                h-10
                                                ${isActive
                                                    ? "bg-[#07D896]/15 text-[#07D896] hover:bg-[#07D896]/20"
                                                    : "text-[#A9ACB7] hover:bg-white/10 hover:text-white"
                                                }
                                            `}
                                        >

                                            <NavLink
                                                to={item.path}
                                                end={item.end}
                                                className={`flex items-center gap-3 w-full h-full cursor-pointer ${isCollapsed ? "justify-center px-0" : "px-3"}`}
                                            >
                                                <Icon size={18} className="shrink-0" />
                                                {!isCollapsed && <span>{item.name}</span>}
                                            </NavLink>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                );
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>


            <SidebarFooter className="relative z-10 p-3 space-y-3">

                <div className="absolute top-0 left-0 h-px w-full bg-linear-to-r from-[#07D896]/60 via-[#07D896]/20 to-transparent" />

                {!isCollapsed && (
                    <div className="flex items-center gap-3 px-2 py-1">
                        <div className="w-8 h-8 rounded-full bg-[#07D896] text-gray-900 flex items-center justify-center font-bold text-sm shrink-0 overflow-hidden">
                            {user?.avatarUrl ? (
                                <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                                user?.name?.charAt(0)
                            )}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                            <p className="text-xs text-[#A9ACB7] truncate">{user?.email}</p>
                        </div>
                    </div>
                )}

                <SidebarMenuButton
                    onClick={() => logoutMutation.mutate()}
                    disabled={logoutMutation.isPending}
                    tooltip="Cerrar sesión"
                    className="
                        w-full rounded-full justify-center cursor-pointer
                        bg-[#07D896] text-gray-900 font-medium text-sm
                        hover:opacity-90 active:opacity-80
                        disabled:opacity-60 disabled:cursor-not-allowed
                        transition-all duration-300
                    "
                >
                    <LogOut size={16} className="shrink-0" />
                    {!isCollapsed && (
                        <span>{logoutMutation.isPending ? "Saliendo…" : "Cerrar sesión"}</span>
                    )}
                </SidebarMenuButton>
            </SidebarFooter>
        </Sidebar>
    );
}