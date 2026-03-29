import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Recipe } from "@/models/Recipe";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await getSession(request);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  await connectToDatabase();
  const recipes = await Recipe.find().sort({ name: 1 }).lean();
  return NextResponse.json({ recipes });
}

export async function POST(request: NextRequest) {
  const session = await getSession(request);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  await connectToDatabase();
  const body = await request.json();
  const { name, description, ingredients, yield: yieldAmt, salePrice } = body;

  if (!name) return NextResponse.json({ error: "El nombre es requerido" }, { status: 400 });

  const recipe = await Recipe.create({
    name:        name.trim(),
    description: description ?? "",
    ingredients: ingredients ?? [],
    yield:       Number(yieldAmt  ?? 1),
    salePrice:   Number(salePrice ?? 0),
  });

  return NextResponse.json({ recipe }, { status: 201 });
}
