import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Recipe } from "@/models/Recipe";
import { getSession } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession(request);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  await connectToDatabase();
  const recipe = await Recipe.findById(id).lean();
  if (!recipe) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  return NextResponse.json({ recipe });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession(request);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  await connectToDatabase();
  const body = await request.json();

  const recipe = await Recipe.findByIdAndUpdate(
    id,
    {
      name:        body.name?.trim(),
      description: body.description ?? "",
      ingredients: body.ingredients ?? [],
      yield:       Number(body.yield     ?? 1),
      salePrice:   Number(body.salePrice ?? 0),
    },
    { new: true }
  ).lean();

  if (!recipe) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  return NextResponse.json({ recipe });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession(request);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  await connectToDatabase();
  await Recipe.findByIdAndDelete(id);
  return NextResponse.json({ ok: true });
}
