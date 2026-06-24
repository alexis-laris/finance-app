import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { logoutRequest } from "../../services/auth.service";
import { useNavigate, Outlet } from "react-router-dom";

import {
  Home,
  DollarSign,
  Folder,
  Target,
  Menu,
  X,
  LogOut,
  CheckCheck
} from "lucide-react";

export default function DashboardLayout() {
  const { data: user } = useAuth();
  const [open, setOpen] = useState(true);

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const logoutMutation = useMutation({
    mutationFn: logoutRequest,
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ["me"] });
      navigate("/");
    },
  });

  const menu = [
    { name: "Inicio", icon: Home, path: "/dashboard" },
    { name: "Mis Gastos", icon: DollarSign, path: "/dashboard/expenses" },
    { name: "Pagos Futuros", icon: CheckCheck, path: "/dashboard/payments" },
    { name: "Categorías", icon: Folder, path: "/dashboard/categories" },
    { name: "Mis Metas", icon: Target, path: "/dashboard/goals" },
  ];

  return (
    <div className="flex min-h-screen bg-[#0B0F27] text-white">

      <aside
        className={`bg-white/5 border-r border-white/10 flex flex-col h-screen sticky top-0 transition-all duration-300
        ${open ? "w-64" : "w-20"}`}
      >

        <div className="flex flex-col flex-1 overflow-y-auto p-4">
          <div className="flex items-center justify-between mb-8 h-10">
            {open && (
              <h2 className="text-[#07D896] font-bold text-lg">
                Finance App
              </h2>
            )}

            <button
              onClick={() => setOpen(!open)}
              className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/10 cursor-pointer"
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          <nav className="space-y-2">
            {menu.map((item, i) => {
              const Icon = item.icon;

              return (
                <div
                  key={i}
                  onClick={() => navigate(item.path)}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 cursor-pointer"
                >
                  <Icon size={18} />
                  {open && <span>{item.name}</span>}
                </div>
              );
            })}
          </nav>
        </div>


        <div className="p-4 border-t border-white/10">
          <button
            onClick={() => logoutMutation.mutate()}
            className={`w-full py-3 text-sm bg-[#07D896] text-gray-900 rounded-full cursor-pointer flex items-center justify-center gap-2 hover:bg-[#06c07e] transition-colors
            ${!open && "px-2"}`}
          >
            <LogOut size={16} />
            {open && "Cerrar sesión"}
          </button>
        </div>
      </aside>


      <div className="flex-1 flex flex-col min-h-screen">
        <header className="flex items-center justify-end px-6 py-4 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-gray-400">{user?.email}</p>
            </div>

            <div className="w-10 h-10 rounded-full bg-[#07D896] text-black flex items-center justify-center font-bold">
              {user?.name?.charAt(0)}
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 space-y-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}