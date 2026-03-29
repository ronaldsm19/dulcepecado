"use client";

import { useEffect, useState, useCallback } from "react";
import { IRawMaterial } from "@/models/RawMaterial";
import { IRecipe, IRecipeIngredient } from "@/models/Recipe";
import {
  ChefHat, Plus, Pencil, Trash2, CheckCircle2,
  XCircle, FlaskConical, ArrowLeft, ShoppingCart,
} from "lucide-react";

type RecipeRow = IRecipe & { _id: string };
type RawRow    = IRawMaterial & { _id: string };

interface ValidationResult {
  canProduce: boolean;
  missing: { name: string; required: number; available: number; missing: number; unit: string }[];
}

const UNITS = ["unidad", "kg", "g", "L", "ml"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function calcTotalCost(ingredients: IRecipeIngredient[]) {
  return ingredients.reduce((s, i) => s + i.quantity * i.unitCost, 0);
}

// ─── Validation Modal ─────────────────────────────────────────────────────────

function ValidationModal({
  recipe, result, onClose,
}: {
  recipe: RecipeRow;
  result: ValidationResult;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(26,26,46,0.6)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl card-shadow w-full max-w-lg p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          {result.canProduce
            ? <CheckCircle2 className="w-7 h-7 text-emerald-500 shrink-0" />
            : <XCircle     className="w-7 h-7 text-red-500 shrink-0" />}
          <div>
            <p className="font-brand text-lg font-bold text-brand-dark">{recipe.name}</p>
            <p className={`text-sm font-medium ${result.canProduce ? "text-emerald-600" : "text-red-500"}`}>
              {result.canProduce
                ? "¡Tenés todo para producir esta receta!"
                : `Faltan ${result.missing.length} ingrediente${result.missing.length > 1 ? "s" : ""}`}
            </p>
          </div>
        </div>

        {result.missing.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-brand-dark/50 uppercase tracking-wide">Qué falta</p>
            {result.missing.map((m) => (
              <div
                key={m.name}
                className="flex items-start justify-between gap-3 p-3 rounded-xl bg-red-50 border border-red-100"
              >
                <p className="font-medium text-brand-dark text-sm">{m.name}</p>
                <div className="text-right text-xs text-brand-dark/60 shrink-0">
                  <p>Necesitás: <span className="font-semibold text-brand-dark">{m.required} {m.unit}</span></p>
                  <p>Tenés: <span className="font-semibold text-brand-dark">{m.available} {m.unit}</span></p>
                  <p className="text-red-600 font-semibold">Faltán: {m.missing} {m.unit}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-brand-muted text-brand-dark/60 text-sm font-medium hover:bg-brand-muted/80 transition-colors cursor-pointer"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}

// ─── Recipe Editor ────────────────────────────────────────────────────────────

function RecipeEditor({
  initial, materials, onSave, onCancel, saving,
}: {
  initial: Partial<RecipeRow>;
  materials: RawRow[];
  onSave: (data: Partial<RecipeRow>) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [name, setName]             = useState(initial.name ?? "");
  const [description, setDesc]      = useState(initial.description ?? "");
  const [ingredients, setIngr]      = useState<IRecipeIngredient[]>(initial.ingredients ?? []);
  const [yieldAmt, setYield]        = useState(initial.yield ?? 1);
  const [salePrice, setSalePrice]   = useState(initial.salePrice ?? 0);
  const [search, setSearch]         = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const totalCost     = calcTotalCost(ingredients);
  const costPerUnit   = yieldAmt > 0 ? totalCost / yieldAmt : 0;
  const totalRevenue  = salePrice * yieldAmt;
  const profit        = totalRevenue - totalCost;

  const filteredMats = materials.filter(
    (m) =>
      !ingredients.some((i) => i.rawMaterialId === m._id) &&
      m.name.toLowerCase().includes(search.toLowerCase())
  );

  function addIngredient(mat: RawRow) {
    setIngr((prev) => [
      ...prev,
      { rawMaterialId: mat._id, name: mat.name, quantity: 1, unit: mat.unit, unitCost: mat.unitCost },
    ]);
    setSearch("");
    setShowSearch(false);
  }

  function updateIngredient(idx: number, qty: number) {
    setIngr((prev) => prev.map((item, i) => i === idx ? { ...item, quantity: qty } : item));
  }

  function removeIngredient(idx: number) {
    setIngr((prev) => prev.filter((_, i) => i !== idx));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave({ name, description, ingredients, yield: yieldAmt, salePrice });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Back + title */}
      <div className="flex items-center gap-3">
        <button type="button" onClick={onCancel} className="p-2 rounded-xl text-brand-dark/40 hover:text-brand-dark hover:bg-brand-muted transition-colors cursor-pointer">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h2 className="font-brand text-xl font-bold text-brand-dark">
          {initial._id ? "Editar receta" : "Nueva receta"}
        </h2>
      </div>

      <div className="bg-white rounded-2xl card-shadow p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2 space-y-1">
            <label className="text-xs font-semibold text-brand-dark/50 uppercase tracking-wide">Nombre de la receta *</label>
            <input
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Apretado de fresas con crema"
              className="w-full border border-brand-muted rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-brand-pink"
            />
          </div>
          <div className="sm:col-span-2 space-y-1">
            <label className="text-xs font-semibold text-brand-dark/50 uppercase tracking-wide">Descripción (opcional)</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Notas sobre la receta..."
              className="w-full border border-brand-muted rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-brand-pink resize-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-brand-dark/50 uppercase tracking-wide">Unidades producidas</label>
            <input
              type="number" min={1}
              value={yieldAmt}
              onChange={(e) => setYield(Number(e.target.value))}
              className="w-full border border-brand-muted rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-brand-pink"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-brand-dark/50 uppercase tracking-wide">Precio de venta por unidad (₡)</label>
            <input
              type="number" min={0} step="any"
              value={salePrice}
              onChange={(e) => setSalePrice(Number(e.target.value))}
              className="w-full border border-brand-muted rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-brand-pink"
            />
          </div>
        </div>
      </div>

      {/* Ingredients */}
      <div className="bg-white rounded-2xl card-shadow overflow-hidden">
        <div className="px-5 py-3 border-b border-brand-muted flex items-center justify-between">
          <h3 className="font-semibold text-brand-dark text-sm">Ingredientes y empaques</h3>
          <button
            type="button"
            onClick={() => setShowSearch(!showSearch)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg gradient-bg text-white text-xs font-semibold cursor-pointer hover:opacity-90"
          >
            <Plus className="w-3.5 h-3.5" />
            Agregar
          </button>
        </div>

        {/* Material search */}
        {showSearch && (
          <div className="px-5 py-3 border-b border-brand-muted space-y-2">
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar materia prima..."
              className="w-full border border-brand-muted rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-brand-pink"
            />
            <div className="max-h-40 overflow-y-auto space-y-1">
              {filteredMats.length === 0 ? (
                <p className="text-brand-dark/40 text-xs py-2">
                  {materials.length === 0
                    ? "No tenés materia prima registrada. Andá a Materia Prima y agregá primero."
                    : "No se encontraron coincidencias."}
                </p>
              ) : filteredMats.map((m) => (
                <button
                  key={m._id}
                  type="button"
                  onClick={() => addIngredient(m)}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-brand-muted text-sm text-brand-dark transition-colors cursor-pointer"
                >
                  <span className="font-medium">{m.name}</span>
                  <span className="text-brand-dark/40 ml-2">— ₡{m.unitCost.toLocaleString("es-CR")}/{m.unit}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {ingredients.length === 0 ? (
          <div className="px-5 py-8 text-center text-brand-dark/40 text-sm">
            Agrega ingredientes y empaques con el botón "Agregar"
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-brand-dark/50 text-xs uppercase tracking-wider">
                <th className="text-left px-5 py-3">Ingrediente</th>
                <th className="text-left px-5 py-3">Cantidad</th>
                <th className="text-left px-5 py-3">Unidad</th>
                <th className="text-left px-5 py-3">Costo unit.</th>
                <th className="text-left px-5 py-3">Subtotal</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {ingredients.map((ing, idx) => (
                <tr key={idx} className="border-t border-brand-muted/50">
                  <td className="px-5 py-3 font-medium text-brand-dark">{ing.name}</td>
                  <td className="px-5 py-3">
                    <input
                      type="number" min={0} step="any"
                      value={ing.quantity}
                      onChange={(e) => updateIngredient(idx, Number(e.target.value))}
                      className="w-20 border border-brand-muted rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-brand-pink"
                    />
                  </td>
                  <td className="px-5 py-3 text-brand-dark/60">{ing.unit}</td>
                  <td className="px-5 py-3 text-brand-dark/60">₡{ing.unitCost.toLocaleString("es-CR")}</td>
                  <td className="px-5 py-3 font-medium text-brand-dark">
                    ₡{(ing.quantity * ing.unitCost).toLocaleString("es-CR")}
                  </td>
                  <td className="px-5 py-3">
                    <button type="button" onClick={() => removeIngredient(idx)} className="p-1 text-brand-dark/30 hover:text-red-500 cursor-pointer">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Summary */}
      <div className="bg-white rounded-2xl card-shadow p-5">
        <h3 className="font-semibold text-brand-dark text-sm mb-4">Resumen de la receta</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Costo total",       value: `₡${totalCost.toLocaleString("es-CR")}`,     color: "text-brand-dark" },
            { label: "Costo por unidad",  value: `₡${costPerUnit.toLocaleString("es-CR", { maximumFractionDigits: 2 })}`, color: "text-brand-dark" },
            { label: "Venta total",       value: `₡${totalRevenue.toLocaleString("es-CR")}`,   color: "text-brand-dark" },
            { label: "Ganancia",          value: `₡${profit.toLocaleString("es-CR")}`,          color: profit >= 0 ? "text-emerald-600" : "text-red-500" },
          ].map(({ label, value, color }) => (
            <div key={label} className="space-y-1 p-3 rounded-xl bg-brand-muted/40">
              <p className="text-xs text-brand-dark/50 font-medium">{label}</p>
              <p className={`font-brand text-lg font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 rounded-xl gradient-bg text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50 cursor-pointer"
        >
          {saving ? "Guardando..." : "Guardar receta"}
        </button>
        <button type="button" onClick={onCancel} className="px-6 py-2.5 rounded-xl bg-brand-muted text-brand-dark/60 text-sm font-medium cursor-pointer hover:bg-brand-muted/80">
          Cancelar
        </button>
      </div>
    </form>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function RecetasPage() {
  const [recipes, setRecipes]     = useState<RecipeRow[]>([]);
  const [materials, setMaterials] = useState<RawRow[]>([]);
  const [loading, setLoading]     = useState(true);
  const [editing, setEditing]     = useState<Partial<RecipeRow> | null>(null);
  const [saving, setSaving]       = useState(false);
  const [confirmDel, setConfirmDel] = useState<string | null>(null);
  const [validation, setValidation] = useState<{ recipe: RecipeRow; result: ValidationResult } | null>(null);
  const [validating, setValidating] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [rRes, mRes] = await Promise.all([
      fetch("/api/admin/recipes"),
      fetch("/api/admin/raw-materials"),
    ]);
    const [rData, mData] = await Promise.all([rRes.json(), mRes.json()]);
    setRecipes(rData.recipes ?? []);
    setMaterials(mData.materials ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleSave(data: Partial<RecipeRow>) {
    setSaving(true);
    if (editing?._id) {
      await fetch(`/api/admin/recipes/${editing._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    } else {
      await fetch("/api/admin/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    }
    setSaving(false);
    setEditing(null);
    load();
  }

  async function handleDelete(id: string) {
    await fetch(`/api/admin/recipes/${id}`, { method: "DELETE" });
    setConfirmDel(null);
    load();
  }

  async function handleValidate(recipe: RecipeRow) {
    setValidating(recipe._id);
    const res = await fetch(`/api/admin/recipes/${recipe._id}/validate`);
    const result = await res.json();
    setValidating(null);
    setValidation({ recipe, result });
  }

  if (editing !== null) {
    return (
      <div className="p-4 md:p-8">
        <RecipeEditor
          initial={editing}
          materials={materials}
          onSave={handleSave}
          onCancel={() => setEditing(null)}
          saving={saving}
        />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      {validation && (
        <ValidationModal
          recipe={validation.recipe}
          result={validation.result}
          onClose={() => setValidation(null)}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-brand text-2xl md:text-3xl font-bold text-brand-dark">Recetas</h1>
          <p className="text-brand-dark/50 text-sm mt-1">{recipes.length} recetas guardadas</p>
        </div>
        <button
          onClick={() => setEditing({})}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl gradient-bg text-white text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Nueva receta
        </button>
      </div>

      {loading ? (
        <p className="text-brand-dark/40 text-sm">Cargando...</p>
      ) : recipes.length === 0 ? (
        <div className="bg-white rounded-2xl card-shadow p-12 flex flex-col items-center gap-3 text-center">
          <ChefHat className="w-10 h-10 text-brand-pink/40" />
          <p className="font-semibold text-brand-dark/50">No tenés recetas aún</p>
          <p className="text-sm text-brand-dark/30">Creá tu primera receta con el botón de arriba</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {recipes.map((r) => {
            const totalCost   = calcTotalCost(r.ingredients);
            const costPerUnit = r.yield > 0 ? totalCost / r.yield : 0;
            const profit      = r.salePrice * r.yield - totalCost;

            return (
              <div key={r._id} className="bg-white rounded-2xl card-shadow p-5 flex flex-col gap-4">
                {/* Recipe header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-brand text-lg font-bold text-brand-dark leading-tight">{r.name}</h3>
                    {r.description && <p className="text-brand-dark/50 text-sm mt-0.5 line-clamp-1">{r.description}</p>}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => setEditing(r)}
                      className="p-2 rounded-lg text-brand-dark/30 hover:text-brand-pink hover:bg-brand-muted transition-colors cursor-pointer"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    {confirmDel === r._id ? (
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleDelete(r._id)} className="px-2 py-1 rounded-lg bg-red-500 text-white text-xs cursor-pointer">Sí</button>
                        <button onClick={() => setConfirmDel(null)} className="px-2 py-1 rounded-lg bg-brand-muted text-brand-dark/60 text-xs cursor-pointer">No</button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDel(r._id)}
                        className="p-2 rounded-lg text-brand-dark/30 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-xl bg-brand-muted/40 p-2.5">
                    <p className="text-xs text-brand-dark/40 font-medium">Unidades</p>
                    <p className="font-brand font-bold text-brand-dark">{r.yield}</p>
                  </div>
                  <div className="rounded-xl bg-brand-muted/40 p-2.5">
                    <p className="text-xs text-brand-dark/40 font-medium">Costo/unidad</p>
                    <p className="font-brand font-bold text-brand-dark text-sm">₡{costPerUnit.toLocaleString("es-CR", { maximumFractionDigits: 0 })}</p>
                  </div>
                  <div className="rounded-xl bg-brand-muted/40 p-2.5">
                    <p className="text-xs text-brand-dark/40 font-medium">Ganancia</p>
                    <p className={`font-brand font-bold text-sm ${profit >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                      ₡{profit.toLocaleString("es-CR", { maximumFractionDigits: 0 })}
                    </p>
                  </div>
                </div>

                {/* Ingredients preview */}
                <div className="space-y-1">
                  <p className="text-xs text-brand-dark/40 font-semibold uppercase tracking-wide flex items-center gap-1.5">
                    <FlaskConical className="w-3 h-3" /> {r.ingredients.length} ingrediente{r.ingredients.length !== 1 ? "s" : ""}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {r.ingredients.slice(0, 5).map((ing, i) => (
                      <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-brand-muted text-brand-dark/60">
                        {ing.name} ({ing.quantity} {ing.unit})
                      </span>
                    ))}
                    {r.ingredients.length > 5 && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-brand-muted text-brand-pink/70">
                        +{r.ingredients.length - 5} más
                      </span>
                    )}
                  </div>
                </div>

                {/* Validate button */}
                <button
                  onClick={() => handleValidate(r)}
                  disabled={validating === r._id}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-brand-pink/30 text-brand-pink font-semibold text-sm hover:bg-brand-pink/5 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <ShoppingCart className="w-4 h-4" />
                  {validating === r._id ? "Validando..." : "Validar stock"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
