"use client";

import { useEffect, useState, useRef } from "react";
import StatsCard from "@/components/admin/StatsCard";
import { IRawMaterial } from "@/models/RawMaterial";
import {
  FlaskConical, DollarSign, AlertTriangle,
  Plus, Check, X, Pencil, Trash2,
} from "lucide-react";

type Row = IRawMaterial & { _id: string };

const TYPE_LABELS: Record<string, string> = {
  ingrediente: "Ingrediente",
  empaque:     "Empaque",
  otro:        "Otro",
};
const TYPE_COLORS: Record<string, string> = {
  ingrediente: "bg-blue-50 text-blue-600",
  empaque:     "bg-purple-50 text-purple-600",
  otro:        "bg-gray-50 text-gray-500",
};
const UNITS = ["unidad", "kg", "g", "L", "ml"];
const TYPES = ["ingrediente", "empaque", "otro"] as const;

const EMPTY_FORM = { name: "", type: "ingrediente" as Row["type"], unit: "unidad" as Row["unit"], quantity: 0, unitCost: 0, notes: "" };

export default function MateriaPrimaPage() {
  const [rows, setRows]           = useState<Row[]>([]);
  const [loading, setLoading]     = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [showForm, setShowForm]   = useState(false);
  const [form, setForm]           = useState({ ...EMPTY_FORM });
  const [saving, setSaving]       = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStock, setEditStock] = useState("");
  const [confirmDel, setConfirmDel] = useState<string | null>(null);
  const [editFull, setEditFull]   = useState<Row | null>(null);
  const stockInputRef = useRef<HTMLInputElement>(null);

  async function load() {
    const r = await fetch("/api/admin/raw-materials");
    const d = await r.json();
    setRows(d.materials ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (editingId && stockInputRef.current) stockInputRef.current.focus();
  }, [editingId]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/admin/raw-materials", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    setShowForm(false);
    setForm({ ...EMPTY_FORM });
    load();
  }

  async function handleSaveStock(id: string) {
    const qty = parseFloat(editStock);
    if (isNaN(qty) || qty < 0) return;
    await fetch(`/api/admin/raw-materials/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity: qty }),
    });
    setEditingId(null);
    load();
  }

  async function handleDelete(id: string) {
    await fetch(`/api/admin/raw-materials/${id}`, { method: "DELETE" });
    setConfirmDel(null);
    load();
  }

  async function handleEditFull(e: React.FormEvent) {
    e.preventDefault();
    if (!editFull) return;
    setSaving(true);
    await fetch(`/api/admin/raw-materials/${editFull._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editFull),
    });
    setSaving(false);
    setEditFull(null);
    load();
  }

  const filtered = typeFilter === "all" ? rows : rows.filter((r) => r.type === typeFilter);
  const totalItems    = rows.length;
  const totalValue    = rows.reduce((s, r) => s + r.quantity * r.unitCost, 0);
  const lowStockCount = rows.filter((r) => r.quantity <= 2 && r.quantity > 0).length;

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-brand text-2xl md:text-3xl font-bold text-brand-dark">Materia Prima</h1>
          <p className="text-brand-dark/50 text-sm mt-1">{totalItems} ítems registrados</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setForm({ ...EMPTY_FORM }); }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl gradient-bg text-white text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Nuevo ítem
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard label="Total ítems"     value={totalItems}                                       icon={FlaskConical} color="pink"   sub="en inventario" />
        <StatsCard label="Valor total"     value={`₡${totalValue.toLocaleString("es-CR")}`}        icon={DollarSign}   color="green"  sub="a precio de costo" />
        <StatsCard label="Stock bajo"      value={lowStockCount}                                    icon={AlertTriangle} color="orange" sub="ítems con 1–2 unidades" />
      </div>

      {/* Type filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {[["all", "Todos"], ["ingrediente", "Ingredientes"], ["empaque", "Empaques"], ["otro", "Otros"]].map(([val, label]) => (
          <button
            key={val}
            onClick={() => setTypeFilter(val)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all cursor-pointer ${
              typeFilter === val
                ? "gradient-bg text-white shadow-sm"
                : "bg-brand-muted text-brand-dark/60 hover:text-brand-dark"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Inline form to add new item */}
      {showForm && (
        <form
          onSubmit={handleCreate}
          className="bg-white rounded-2xl card-shadow p-5 space-y-4"
        >
          <h2 className="font-semibold text-brand-dark text-sm uppercase tracking-wide">Nuevo ítem de materia prima</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-brand-dark/50 uppercase tracking-wide">Nombre *</label>
              <input
                autoFocus
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ej: Leche condensada"
                className="w-full border border-brand-muted rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-brand-pink"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-brand-dark/50 uppercase tracking-wide">Tipo</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as Row["type"] })}
                className="w-full border border-brand-muted rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-brand-pink cursor-pointer"
              >
                {TYPES.map((t) => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-brand-dark/50 uppercase tracking-wide">Unidad de medida</label>
              <select
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value as Row["unit"] })}
                className="w-full border border-brand-muted rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-brand-pink cursor-pointer"
              >
                {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-brand-dark/50 uppercase tracking-wide">Cantidad inicial</label>
              <input
                type="number"
                min={0}
                step="any"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
                className="w-full border border-brand-muted rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-brand-pink"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-brand-dark/50 uppercase tracking-wide">Costo unitario (₡)</label>
              <input
                type="number"
                min={0}
                step="any"
                value={form.unitCost}
                onChange={(e) => setForm({ ...form, unitCost: Number(e.target.value) })}
                className="w-full border border-brand-muted rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-brand-pink"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-brand-dark/50 uppercase tracking-wide">Notas (opcional)</label>
              <input
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Ej: Caja de 2 Pinos 420g"
                className="w-full border border-brand-muted rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-brand-pink"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-xl gradient-bg text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
            >
              {saving ? "Guardando..." : "Guardar"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-5 py-2 rounded-xl bg-brand-muted text-brand-dark/60 text-sm font-medium hover:bg-brand-muted/80 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Edit full form */}
      {editFull && (
        <form
          onSubmit={handleEditFull}
          className="bg-white rounded-2xl card-shadow p-5 space-y-4 border-2 border-brand-pink/30"
        >
          <h2 className="font-semibold text-brand-dark text-sm uppercase tracking-wide">Editar: {editFull.name}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-brand-dark/50 uppercase tracking-wide">Nombre</label>
              <input
                required
                value={editFull.name}
                onChange={(e) => setEditFull({ ...editFull, name: e.target.value })}
                className="w-full border border-brand-muted rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-brand-pink"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-brand-dark/50 uppercase tracking-wide">Tipo</label>
              <select
                value={editFull.type}
                onChange={(e) => setEditFull({ ...editFull, type: e.target.value as Row["type"] })}
                className="w-full border border-brand-muted rounded-xl px-3 py-2 text-sm focus:outline-none cursor-pointer"
              >
                {TYPES.map((t) => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-brand-dark/50 uppercase tracking-wide">Unidad</label>
              <select
                value={editFull.unit}
                onChange={(e) => setEditFull({ ...editFull, unit: e.target.value as Row["unit"] })}
                className="w-full border border-brand-muted rounded-xl px-3 py-2 text-sm focus:outline-none cursor-pointer"
              >
                {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-brand-dark/50 uppercase tracking-wide">Costo unitario (₡)</label>
              <input
                type="number" min={0} step="any"
                value={editFull.unitCost}
                onChange={(e) => setEditFull({ ...editFull, unitCost: Number(e.target.value) })}
                className="w-full border border-brand-muted rounded-xl px-3 py-2 text-sm focus:outline-none"
              />
            </div>
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-semibold text-brand-dark/50 uppercase tracking-wide">Notas</label>
              <input
                value={editFull.notes}
                onChange={(e) => setEditFull({ ...editFull, notes: e.target.value })}
                className="w-full border border-brand-muted rounded-xl px-3 py-2 text-sm focus:outline-none"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="px-5 py-2 rounded-xl gradient-bg text-white text-sm font-semibold cursor-pointer disabled:opacity-50">
              {saving ? "Guardando..." : "Guardar cambios"}
            </button>
            <button type="button" onClick={() => setEditFull(null)} className="px-5 py-2 rounded-xl bg-brand-muted text-brand-dark/60 text-sm cursor-pointer">
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* List */}
      {loading ? (
        <p className="text-brand-dark/40 text-sm">Cargando...</p>
      ) : filtered.length === 0 ? (
        <p className="text-brand-dark/40 text-sm text-center py-8">No hay ítems registrados. Hacé clic en "+ Nuevo ítem" para agregar.</p>
      ) : (
        <>
          {/* ── Mobile cards (< lg) ─────────────────────────────── */}
          <div className="lg:hidden space-y-3">
            {filtered.map((row) => (
              <div key={row._id} className="bg-white rounded-2xl card-shadow px-4 py-3 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-medium text-brand-dark truncate">{row.name}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_COLORS[row.type] ?? "bg-gray-50 text-gray-500"}`}>
                        {TYPE_LABELS[row.type] ?? row.type}
                      </span>
                      <span className="text-xs text-brand-dark/40">{row.unit} · ₡{row.unitCost.toLocaleString("es-CR")}/u</span>
                    </div>
                    {row.notes && <p className="text-xs text-brand-dark/30 mt-0.5 truncate">{row.notes}</p>}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => setEditFull(row)} className="p-1.5 rounded-lg text-brand-dark/30 hover:text-brand-pink hover:bg-brand-muted cursor-pointer">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    {confirmDel === row._id ? (
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleDelete(row._id)} className="px-2 py-1 rounded-lg bg-red-500 text-white text-xs cursor-pointer">Sí</button>
                        <button onClick={() => setConfirmDel(null)} className="px-2 py-1 rounded-lg bg-brand-muted text-brand-dark/60 text-xs cursor-pointer">No</button>
                      </div>
                    ) : (
                      <button onClick={() => setConfirmDel(row._id)} className="p-1.5 rounded-lg text-brand-dark/30 hover:text-red-500 hover:bg-red-50 cursor-pointer">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-brand-muted/50">
                  <span className="text-xs text-brand-dark/40">Stock actual</span>
                  {editingId === row._id ? (
                    <div className="flex items-center gap-1.5">
                      <input ref={stockInputRef} type="number" min={0} step="any"
                        value={editStock} onChange={(e) => setEditStock(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") handleSaveStock(row._id); if (e.key === "Escape") setEditingId(null); }}
                        className="w-16 border border-brand-pink rounded-lg px-2 py-1 text-sm focus:outline-none" />
                      <button onClick={() => handleSaveStock(row._id)} className="p-1 rounded-lg text-emerald-600 hover:bg-emerald-50 cursor-pointer"><Check className="w-4 h-4" /></button>
                      <button onClick={() => setEditingId(null)} className="p-1 rounded-lg text-brand-dark/40 hover:bg-brand-muted cursor-pointer"><X className="w-4 h-4" /></button>
                    </div>
                  ) : (
                    <button onClick={() => { setEditingId(row._id); setEditStock(String(row.quantity)); }}
                      className={`px-3 py-1 rounded-full text-sm font-bold cursor-pointer hover:opacity-70 transition-opacity ${
                        row.quantity === 0 ? "bg-red-50 text-red-500" : row.quantity <= 2 ? "bg-yellow-50 text-amber-600" : "bg-emerald-50 text-emerald-600"
                      }`}>
                      {row.quantity} {row.unit}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* ── Desktop table (lg+) ─────────────────────────────── */}
          <div className="hidden lg:block bg-white rounded-2xl card-shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-brand-muted text-brand-dark/50 text-xs uppercase tracking-wider">
                  <th className="text-left px-5 py-3">Nombre</th>
                  <th className="text-left px-5 py-3">Tipo</th>
                  <th className="text-left px-5 py-3">Unidad</th>
                  <th className="text-left px-5 py-3">Stock</th>
                  <th className="text-left px-5 py-3">Costo unit.</th>
                  <th className="text-left px-5 py-3">Valor total</th>
                  <th className="text-left px-5 py-3">Notas</th>
                  <th className="text-left px-5 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr key={row._id} className="border-b border-brand-muted/50 hover:bg-brand-muted/20 transition-colors">
                    <td className="px-5 py-3 font-medium text-brand-dark">{row.name}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${TYPE_COLORS[row.type] ?? "bg-gray-50 text-gray-500"}`}>
                        {TYPE_LABELS[row.type] ?? row.type}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-brand-dark/60">{row.unit}</td>
                    <td className="px-5 py-3">
                      {editingId === row._id ? (
                        <div className="flex items-center gap-1.5">
                          <input ref={stockInputRef} type="number" min={0} step="any"
                            value={editStock} onChange={(e) => setEditStock(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter") handleSaveStock(row._id); if (e.key === "Escape") setEditingId(null); }}
                            className="w-20 border border-brand-pink rounded-lg px-2 py-1 text-sm focus:outline-none" />
                          <button onClick={() => handleSaveStock(row._id)} className="p-1 rounded-lg text-emerald-600 hover:bg-emerald-50 cursor-pointer"><Check className="w-4 h-4" /></button>
                          <button onClick={() => setEditingId(null)} className="p-1 rounded-lg text-brand-dark/40 hover:bg-brand-muted cursor-pointer"><X className="w-4 h-4" /></button>
                        </div>
                      ) : (
                        <button onClick={() => { setEditingId(row._id); setEditStock(String(row.quantity)); }}
                          className={`px-2.5 py-0.5 rounded-full text-xs font-semibold cursor-pointer hover:opacity-70 transition-opacity ${
                            row.quantity === 0 ? "bg-red-50 text-red-500" : row.quantity <= 2 ? "bg-yellow-50 text-amber-600" : "bg-emerald-50 text-emerald-600"
                          }`}>
                          {row.quantity}
                        </button>
                      )}
                    </td>
                    <td className="px-5 py-3 text-brand-dark/70">₡{row.unitCost.toLocaleString("es-CR")}</td>
                    <td className="px-5 py-3 text-brand-dark/60">{row.quantity > 0 ? `₡${(row.quantity * row.unitCost).toLocaleString("es-CR")}` : "—"}</td>
                    <td className="px-5 py-3 text-brand-dark/40 text-xs max-w-[160px] truncate">{row.notes || "—"}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setEditFull(row)} className="p-1.5 rounded-lg text-brand-dark/40 hover:text-brand-pink hover:bg-brand-muted cursor-pointer" title="Editar">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        {confirmDel === row._id ? (
                          <div className="flex items-center gap-1">
                            <button onClick={() => handleDelete(row._id)} className="px-2 py-1 rounded-lg bg-red-500 text-white text-xs cursor-pointer">Sí</button>
                            <button onClick={() => setConfirmDel(null)} className="px-2 py-1 rounded-lg bg-brand-muted text-brand-dark/60 text-xs cursor-pointer">No</button>
                          </div>
                        ) : (
                          <button onClick={() => setConfirmDel(row._id)} className="p-1.5 rounded-lg text-brand-dark/40 hover:text-red-500 hover:bg-red-50 cursor-pointer" title="Eliminar">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
