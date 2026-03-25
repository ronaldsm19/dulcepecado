"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import ProductForm from "@/components/admin/ProductForm";
import { IProduct } from "@/models/Product";
import { Plus, Pencil, Trash2 } from "lucide-react";

type ProductRow = IProduct & { _id: string };

const catLabel: Record<string, string> = {
  gelatina: "Gelatina",
  apretado: "Apretado",
  especial: "Especial",
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ProductRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  async function load() {
    const r = await fetch("/api/admin/products");
    const d = await r.json();
    setProducts(d.products ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleSave(data: Partial<IProduct>) {
    setSaving(true);
    try {
      if (editing) {
        await fetch(`/api/admin/products/${editing._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
      } else {
        await fetch("/api/admin/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
      }
      setShowForm(false);
      setEditing(null);
      await load();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    setConfirmDelete(null);
    await load();
  }

  function openCreate() { setEditing(null); setShowForm(true); }
  function openEdit(p: ProductRow) { setEditing(p); setShowForm(true); }

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="font-brand text-2xl md:text-3xl font-bold text-brand-dark">Productos</h1>
          <p className="text-brand-dark/50 text-sm mt-1">{products.length} productos en catálogo</p>
        </div>
        <Button onClick={openCreate} className="shrink-0">
          <Plus className="w-4 h-4 mr-1" /> Nuevo producto
        </Button>
      </div>

      {loading ? (
        <div className="text-brand-dark/40 text-sm">Cargando...</div>
      ) : (
        <div className="bg-white rounded-2xl card-shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-brand-muted text-brand-dark/50 text-xs uppercase tracking-wider">
                <th className="text-left px-4 py-3">Producto</th>
                <th className="text-left px-4 py-3 hidden md:table-cell">Categoría</th>
                <th className="text-left px-4 py-3">Precio</th>
                <th className="text-left px-4 py-3 hidden sm:table-cell">Estado</th>
                <th className="text-right px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id} className="border-b border-brand-muted/50 hover:bg-brand-muted/20 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-brand-muted">
                        <Image
                          src={p.image}
                          alt={p.name}
                          width={40} height={40}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-brand-dark">{p.name}</p>
                          {p.featured && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-brand-orange/10 text-brand-orange font-semibold shrink-0">
                              🔥 Destacado
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-brand-dark/40 line-clamp-1">{p.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="px-2 py-0.5 rounded-full bg-brand-muted text-brand-dark/60 text-xs">
                      {catLabel[p.category] ?? p.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-brand-dark">
                    ₡{p.price.toLocaleString("es-CR")}
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      p.available ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"
                    }`}>
                      {p.available ? "Disponible" : "No disponible"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(p)}
                        className="p-1.5 rounded-lg hover:bg-brand-muted text-brand-dark/50 hover:text-brand-pink transition-colors cursor-pointer"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setConfirmDelete(p._id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-brand-dark/50 hover:text-red-500 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-brand-dark/40">
                    No hay productos. Crea el primero.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={(v) => { if (!v) { setShowForm(false); setEditing(null); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader className="pb-4">
            <DialogTitle>{editing ? "Editar producto" : "Nuevo producto"}</DialogTitle>
          </DialogHeader>
          <div className="px-6 pb-6">
            <ProductForm
              initial={editing ?? undefined}
              onSave={handleSave}
              onCancel={() => { setShowForm(false); setEditing(null); }}
              saving={saving}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirm Delete */}
      <Dialog open={!!confirmDelete} onOpenChange={() => setConfirmDelete(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader className="pb-2">
            <DialogTitle>¿Eliminar producto?</DialogTitle>
          </DialogHeader>
          <div className="px-6 pb-6 space-y-4">
            <p className="text-sm text-brand-dark/60">Esta acción no se puede deshacer.</p>
            <div className="flex gap-3">
              <Button
                variant="ghost"
                className="flex-1 bg-red-50 text-red-600 hover:bg-red-100"
                onClick={() => confirmDelete && handleDelete(confirmDelete)}
              >
                Eliminar
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => setConfirmDelete(null)}>
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
