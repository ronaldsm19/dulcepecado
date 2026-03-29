import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Recipe } from "@/models/Recipe";
import { RawMaterial } from "@/models/RawMaterial";
import { getSession } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession(request);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  await connectToDatabase();

  const recipe = await Recipe.findById(id).lean() as {
    ingredients: { rawMaterialId: string; name: string; quantity: number; unit: string }[];
  } | null;

  if (!recipe) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  // Load all raw materials referenced by this recipe
  const ids = recipe.ingredients.map((i) => i.rawMaterialId);
  const materials = await RawMaterial.find({ _id: { $in: ids } }).lean() as {
    _id: { toString(): string };
    quantity: number;
  }[];

  const stockMap = new Map(materials.map((m) => [m._id.toString(), m.quantity]));

  const missing: { name: string; required: number; available: number; missing: number; unit: string }[] = [];

  for (const ing of recipe.ingredients) {
    const available = stockMap.get(ing.rawMaterialId.toString()) ?? 0;
    const needed    = ing.quantity;
    if (available < needed) {
      missing.push({
        name:      ing.name,
        required:  needed,
        available,
        missing:   needed - available,
        unit:      ing.unit,
      });
    }
  }

  return NextResponse.json({ canProduce: missing.length === 0, missing });
}
