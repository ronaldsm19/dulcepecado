"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { IProduct } from "@/models/Product";
import { X, Plus, Upload, ImageIcon, Loader2 } from "lucide-react";

interface ProductFormProps {
  initial?: Partial<IProduct>;
  onSave: (data: Partial<IProduct>) => Promise<void>;
  onCancel: () => void;
  saving?: boolean;
}

export default function ProductForm({ initial, onSave, onCancel, saving }: ProductFormProps) {
  const [form, setForm] = useState({
    name:        initial?.name        ?? "",
    description: initial?.description ?? "",
    price:       initial?.price?.toString() ?? "",
    image:       initial?.image       ?? "",
    category:    initial?.category    ?? "gelatina",
    available:   initial?.available   ?? true,
  });
  const [toppings, setToppings]       = useState<string[]>(initial?.toppings ?? []);
  const [toppingInput, setToppingInput] = useState("");
  const [uploading, setUploading]     = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  function addTopping() {
    const t = toppingInput.trim();
    if (t && !toppings.includes(t)) {
      setToppings((prev) => [...prev, t]);
      setToppingInput("");
    }
  }

  function removeTopping(t: string) {
    setToppings((prev) => prev.filter((x) => x !== t));
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError("");
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      // Enviar URL anterior para que el servidor la elimine de Supabase
      if (form.image) formData.append("oldImageUrl", form.image);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setUploadError(data.error ?? "Error al subir la imagen");
        return;
      }

      setForm((prev) => ({ ...prev, image: data.url }));
    } catch {
      setUploadError("Error de conexión al subir la imagen");
    } finally {
      setUploading(false);
      // Limpiar el input para permitir subir el mismo archivo de nuevo
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function clearImage() {
    setForm((prev) => ({ ...prev, image: "" }));
    setUploadError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.image) {
      setUploadError("Debes subir una imagen para el producto");
      return;
    }
    await onSave({ ...form, price: Number(form.price), toppings });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Nombre */}
      <div>
        <label className="block text-sm font-medium text-brand-dark mb-1">Nombre *</label>
        <input
          type="text" required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full border border-brand-muted rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-brand-pink"
        />
      </div>

      {/* Descripción */}
      <div>
        <label className="block text-sm font-medium text-brand-dark mb-1">Descripción *</label>
        <textarea
          required rows={3}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full border border-brand-muted rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-brand-pink resize-none"
        />
      </div>

      {/* Precio + Categoría */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-brand-dark mb-1">Precio (₡) *</label>
          <input
            type="number" required min={0}
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            className="w-full border border-brand-muted rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-brand-pink"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-brand-dark mb-1">Categoría *</label>
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value as IProduct["category"] })}
            className="w-full border border-brand-muted rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-brand-pink"
          >
            <option value="gelatina">Gelatina Mosaico</option>
            <option value="apretado">Apretado Gourmet</option>
            <option value="especial">Edición Especial</option>
          </select>
        </div>
      </div>

      {/* ── Imagen ── */}
      <div>
        <label className="block text-sm font-medium text-brand-dark mb-2">
          Imagen del producto *
        </label>

        {form.image ? (
          /* Preview de imagen cargada */
          <div className="relative rounded-xl overflow-hidden border border-brand-muted bg-brand-muted/30">
            <div className="relative w-full h-40">
              <Image
                src={form.image}
                alt="Vista previa"
                fill
                className="object-cover"
                sizes="400px"
              />
            </div>
            <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/40">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 bg-white rounded-lg text-xs font-medium text-brand-dark hover:bg-brand-muted transition-colors flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" /> Cambiar
                </button>
                <button
                  type="button"
                  onClick={clearImage}
                  className="px-3 py-1.5 bg-white rounded-lg text-xs font-medium text-red-500 hover:bg-red-50 transition-colors flex items-center gap-1.5"
                >
                  <X className="w-3.5 h-3.5" /> Quitar
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Zona de carga */
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full border-2 border-dashed border-brand-muted hover:border-brand-pink/50 rounded-xl py-8 flex flex-col items-center gap-2 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed bg-brand-muted/20 hover:bg-brand-pink/5"
          >
            {uploading ? (
              <>
                <Loader2 className="w-7 h-7 text-brand-pink animate-spin" />
                <span className="text-sm text-brand-dark/50">Subiendo imagen...</span>
              </>
            ) : (
              <>
                <ImageIcon className="w-7 h-7 text-brand-dark/30" />
                <span className="text-sm font-medium text-brand-dark/60">
                  Haz click para seleccionar una imagen
                </span>
                <span className="text-xs text-brand-dark/40">
                  JPG, PNG, WEBP · Máx. 5 MB
                </span>
              </>
            )}
          </button>
        )}

        {/* Input file oculto */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={handleFileChange}
        />

        {uploadError && (
          <p className="mt-1.5 text-xs text-red-500">{uploadError}</p>
        )}
      </div>

      {/* Toppings */}
      <div>
        <label className="block text-sm font-medium text-brand-dark mb-1">Toppings / Ingredientes</label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={toppingInput}
            onChange={(e) => setToppingInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTopping(); } }}
            placeholder="Ej: Maní caramelizado"
            className="flex-1 border border-brand-muted rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-brand-pink"
          />
          <Button type="button" size="sm" variant="outline" onClick={addTopping}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {toppings.map((t) => (
            <span key={t} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand-muted text-sm border border-brand-pink/20">
              {t}
              <button type="button" onClick={() => removeTopping(t)}>
                <X className="w-3 h-3 text-brand-dark/40 hover:text-brand-pink" />
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Disponible */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox" id="available"
          checked={form.available}
          onChange={(e) => setForm({ ...form, available: e.target.checked })}
          className="rounded"
        />
        <label htmlFor="available" className="text-sm text-brand-dark">Disponible para la venta</label>
      </div>

      {/* Acciones */}
      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={saving || uploading} className="flex-1">
          {saving ? "Guardando..." : initial?._id ? "Actualizar producto" : "Crear producto"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
      </div>
    </form>
  );
}
