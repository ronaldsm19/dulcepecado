import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { RawMaterial } from "@/models/RawMaterial";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await getSession(request);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  await connectToDatabase();
  const materials = await RawMaterial.find().sort({ type: 1, name: 1 }).lean();
  return NextResponse.json({ materials });
}

export async function POST(request: NextRequest) {
  const session = await getSession(request);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  await connectToDatabase();
  const body = await request.json();
  const { name, type, unit, quantity, unitCost, notes } = body;

  if (!name) return NextResponse.json({ error: "El nombre es requerido" }, { status: 400 });

  const material = await RawMaterial.create({
    name: name.trim(),
    type:     type     ?? "ingrediente",
    unit:     unit     ?? "unidad",
    quantity: Number(quantity  ?? 0),
    unitCost: Number(unitCost  ?? 0),
    notes:    notes    ?? "",
  });

  return NextResponse.json({ material }, { status: 201 });
}
