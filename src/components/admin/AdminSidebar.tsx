"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Receipt,
  TrendingUp,
  LogOut,
} from "lucide-react";

const navItems = [
  { href: "/admin",          label: "Dashboard",  icon: LayoutDashboard },
  { href: "/admin/productos", label: "Productos",  icon: Package },
  { href: "/admin/pedidos",   label: "Pedidos",    icon: ShoppingBag },
  { href: "/admin/gastos",    label: "Gastos",     icon: Receipt },
  { href: "/admin/finanzas",  label: "Finanzas",   icon: TrendingUp },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <aside className="w-60 min-h-screen bg-brand-dark flex flex-col">
      {/* Brand */}
      <div className="px-6 py-6 border-b border-white/10">
        <p className="font-brand text-xl font-bold gradient-text">Dulce Pecado</p>
        <p className="text-white/40 text-xs mt-0.5">Panel de administración</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive
                  ? "gradient-bg text-white shadow-md"
                  : "text-white/50 hover:text-white hover:bg-white/8"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/40 hover:text-white hover:bg-white/8 transition-all cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
