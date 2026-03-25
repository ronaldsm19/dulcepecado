"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { IProduct } from "@/models/Product";

interface OrderInitial {
  customerName?: string;
  phone?: string;
  productId?: string;
  productName?: string;
  quantity?: number;
  total?: number;
  paid?: boolean;
  orderedAt?: Date | string;
  notes?: string;
  options?: string[];
}

interface OrderFormProps {
  initial?: OrderInitial;
  onSave: (data: Record<string, unknown>) => Promise<void>;
  onCancel: () => void;
  saving?: boolean;
}

export default function OrderForm({ initial, onSave, onCancel, saving }: OrderFormProps) {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<IProduct | null>(null);
  const [form, setForm] = useState({
    customerName: initial?.customerName ?? "",
    phone:        initial?.phone        ?? "",
    productId:    initial?.productId    ?? "",
    quantity:     initial?.quantity?.toString() ?? "1",
    total:        initial?.total?.toString()    ?? "",
    paid:         initial?.paid         ?? false,
    orderedAt:    initial?.orderedAt
      ? new Date(initial.orderedAt).toISOString().slice(0, 16)
      : new Date().toISOString().slice(0, 16),
    notes:        initial?.notes ?? "",
  });
  const [options, setOptions] = useState<string[]>(initial?.options ?? []);

  useEffect(() => {
    fetch("/api/admin/products")
      .then((r) => r.json())
      .then((d) => {
        const prods: IProduct[] = d.products ?? [];
        setProducts(prods);
        // When editing, find and set the selected product to show its toppings
        if (initial?.productId) {
          const p = prods.find((p) => (p._id as unknown as string) === initial.productId) ?? null;
          setSelectedProduct(p);
        }
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function handleProductChange(id: string) {
    const p = products.find((p) => (p._id as unknown as string) === id) ?? null;
    setSelectedProduct(p);
    setOptions([]);
    setForm((prev) => ({
      ...prev,
      productId: id,
      total: p ? (p.price * Number(prev.quantity)).toString() : "",
    }));
  }

  function toggleOption(opt: string) {
    setOptions((prev) =>
      prev.includes(opt) ? prev.filter((o) => o !== opt) : [...prev, opt]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await onSave({
      ...form,
      productName: selectedProduct?.name ?? initial?.productName ?? "",
      options,
      quantity: Number(form.quantity),
      total: Number(form.total),
    });
  }

  const isEditing = !!initial;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Producto */}
      <div>
        <label className="block text-sm font-medium text-brand-dark mb-1">Producto *</label>
        <select
          required
          value={form.productId}
          onChange={(e) => handleProductChange(e.target.value)}
          className="w-full border border-brand-muted rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-brand-pink"
        >
          <option value="">Seleccionar producto...</option>
          {products.map((p) => (
            <option key={p._id as unknown as string} value={p._id as unknown as string}>
              {p.name} — ₡{p.price.toLocaleString("es-CR")}
            </option>
          ))}
        </select>
      </div>

      {/* Opciones del producto */}
      {selectedProduct && selectedProduct.toppings.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-brand-dark mb-1">Opciones / Toppings</label>
          <div className="flex flex-wrap gap-2">
            {selectedProduct.toppings.map((t) => (
              <button
                key={t} type="button"
                onClick={() => toggleOption(t)}
                className={`px-3 py-1 rounded-full text-xs border transition-all ${
                  options.includes(t)
                    ? "gradient-bg text-white border-transparent"
                    : "bg-brand-muted border-brand-muted text-brand-dark/70 hover:border-brand-pink/30"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Cliente */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-brand-dark mb-1">Nombre cliente *</label>
          <input
            type="text" required
            value={form.customerName}
            onChange={(e) => setForm({ ...form, customerName: e.target.value })}
            className="w-full border border-brand-muted rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-brand-pink"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-brand-dark mb-1">Teléfono *</label>
          <input
            type="text" required
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full border border-brand-muted rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-brand-pink"
          />
        </div>
      </div>

      {/* Cantidad + Total + Fecha */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-sm font-medium text-brand-dark mb-1">Cantidad</label>
          <input
            type="number" min={1}
            value={form.quantity}
            onChange={(e) => {
              const q = e.target.value;
              setForm({
                ...form,
                quantity: q,
                total: selectedProduct
                  ? (selectedProduct.price * Number(q)).toString()
                  : form.total,
              });
            }}
            className="w-full border border-brand-muted rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-brand-pink"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-brand-dark mb-1">Total (₡) *</label>
          <input
            type="number" required min={0}
            value={form.total}
            onChange={(e) => setForm({ ...form, total: e.target.value })}
            className="w-full border border-brand-muted rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-brand-pink"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-brand-dark mb-1">Fecha y hora</label>
          <input
            type="datetime-local"
            value={form.orderedAt}
            onChange={(e) => setForm({ ...form, orderedAt: e.target.value })}
            className="w-full border border-brand-muted rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-brand-pink"
          />
        </div>
      </div>

      {/* Notas */}
      <div>
        <label className="block text-sm font-medium text-brand-dark mb-1">Notas</label>
        <textarea
          rows={2}
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          className="w-full border border-brand-muted rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-brand-pink resize-none"
        />
      </div>

      {/* Pagado */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox" id="paid"
          checked={form.paid}
          onChange={(e) => setForm({ ...form, paid: e.target.checked })}
        />
        <label htmlFor="paid" className="text-sm text-brand-dark">Marcar como pagado</label>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={saving} className="flex-1">
          {saving ? "Guardando..." : isEditing ? "Actualizar pedido" : "Registrar pedido"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
      </div>
    </form>
  );
}
