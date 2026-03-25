"use client";

import { useEffect, useState } from "react";
import StatsCard from "@/components/admin/StatsCard";
import { TrendingUp, ShoppingBag, Receipt, Clock } from "lucide-react";

interface Analytics {
  topClicksThisWeek: { _id: string; productName: string; clicks: number }[];
  recentOrders: {
    _id: string;
    customerName: string;
    productName: string;
    total: number;
    paid: boolean;
    orderedAt: string;
  }[];
  monthStats: {
    totalRevenue: number;
    totalOrders: number;
    pendingOrders: number;
  };
}

export default function AdminDashboard() {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then((r) => r.json())
      .then((d) => setData(d))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <div className="text-brand-dark/40">Cargando dashboard...</div>
      </div>
    );
  }

  const { monthStats, topClicksThisWeek, recentOrders } = data ?? {
    monthStats: { totalRevenue: 0, totalOrders: 0, pendingOrders: 0 },
    topClicksThisWeek: [],
    recentOrders: [],
  };

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="font-brand text-3xl font-bold text-brand-dark">Dashboard</h1>
        <p className="text-brand-dark/50 text-sm mt-1">Resumen del mes actual</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatsCard
          label="Ingresos del mes"
          value={`₡${monthStats.totalRevenue.toLocaleString("es-CR")}`}
          icon={TrendingUp}
          color="green"
          sub="Pedidos pagados"
        />
        <StatsCard
          label="Pedidos del mes"
          value={monthStats.totalOrders}
          icon={ShoppingBag}
          color="pink"
          sub="Total registrados"
        />
        <StatsCard
          label="Pedidos pendientes"
          value={monthStats.pendingOrders}
          icon={Clock}
          color="orange"
          sub="Sin confirmar pago"
        />
        <StatsCard
          label="Productos clickeados"
          value={topClicksThisWeek.reduce((s, p) => s + p.clicks, 0)}
          icon={Receipt}
          color="yellow"
          sub="Esta semana"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top productos */}
        <div className="bg-white rounded-2xl card-shadow p-6">
          <h2 className="font-semibold text-brand-dark mb-4">
            🔥 Top productos clickeados (esta semana)
          </h2>
          {topClicksThisWeek.length === 0 ? (
            <p className="text-brand-dark/40 text-sm">Sin datos aún. Espera a que los clientes visiten la tienda.</p>
          ) : (
            <div className="space-y-3">
              {topClicksThisWeek.map((p, i) => (
                <div key={p._id} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full gradient-bg text-white text-xs flex items-center justify-center font-bold shrink-0">
                    {i + 1}
                  </span>
                  <span className="flex-1 text-sm text-brand-dark truncate">{p.productName}</span>
                  <span className="text-sm font-semibold text-brand-pink">{p.clicks} clicks</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Últimos pedidos */}
        <div className="bg-white rounded-2xl card-shadow p-6">
          <h2 className="font-semibold text-brand-dark mb-4">📦 Últimos pedidos</h2>
          {recentOrders.length === 0 ? (
            <p className="text-brand-dark/40 text-sm">No hay pedidos registrados aún.</p>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((o) => (
                <div key={o._id} className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-brand-dark truncate">{o.customerName}</p>
                    <p className="text-xs text-brand-dark/50 truncate">{o.productName}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-brand-dark">
                      ₡{o.total.toLocaleString("es-CR")}
                    </p>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        o.paid
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-orange-50 text-orange-500"
                      }`}
                    >
                      {o.paid ? "Pagado" : "Pendiente"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
