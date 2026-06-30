import { useAuth } from "../../hooks/useAuth";
import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { useNavigate } from "react-router-dom";
import NotificationBell from "../utils/NotificationBell";

export default function DashboardLayout() {

    const { data: user } = useAuth();

    const navigate = useNavigate();

    return (
        <SidebarProvider
            style={{
                "--sidebar-background": "#0d1230",
                "--sidebar-foreground": "#ffffff",
                "--sidebar-border": "rgba(255,255,255,0.1)",
                "--sidebar-accent": "rgba(7,216,150,0.15)",
                "--sidebar-accent-foreground": "#07D896",
                "--sidebar-primary": "#07D896",
                "--sidebar-primary-foreground": "#111827",
                "--sidebar-ring": "#07D896",
                "--sidebar-width": "16rem",
                "--sidebar-width-icon": "4rem",
            }}
        >
            <div className="flex min-h-screen bg-[#0B0F27] text-white w-full">


                <AppSidebar />


                <div className="flex-1 flex flex-col min-h-screen overflow-y-auto">


                    <header className="relative flex items-center justify-between px-6 py-3 bg-[#0B0F27] top-0 z-10">


                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            <div className="absolute -right-16 top-1/2 -translate-y-1/2 w-64 h-16 rounded-full bg-[#07D896]/10 blur-3xl" />
                            <div className="absolute bottom-0 left-0 h-px w-full bg-linear-to-r from-transparent via-[#07D896]/40 to-[#07D896]/60" />
                        </div>


                        <SidebarTrigger className="text-[#A9ACB7] hover:text-white hover:bg-white/10 rounded-lg transition-colors duration-200 cursor-pointer relative z-10" />


                        <div className="flex items-center gap-4 relative z-10">

                            <NotificationBell />

                            <div
                                className="flex items-center gap-3 cursor-pointer"
                                onClick={() => navigate("/dashboard/user")}
                            >
                                <div className="text-right hidden sm:block">
                                    <p className="text-sm font-medium text-white">{user?.name}</p>
                                    <p className="text-xs text-[#A9ACB7]">{user?.email}</p>
                                </div>
                                <div className="w-9 h-9 rounded-full bg-[#07D896] text-gray-900 flex items-center justify-center font-bold text-sm shrink-0 overflow-hidden">
                                    {user?.avatarUrl ? (
                                        <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                                    ) : (
                                        user?.name?.charAt(0)
                                    )}
                                </div>
                            </div>
                        </div>
                    </header>

                    <main className="flex-1 p-6 space-y-6">
                        <Outlet />
                    </main>
                </div>
            </div>
        </SidebarProvider>
    );
}