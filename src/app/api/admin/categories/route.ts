import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Category } from "@/models/Category";
import { getSession } from "@/lib/auth";

const DEFAULTS = ["Gelatina Mosaico", "Apretado Gourmet", "Edición Especial"];

export async function GET() {
  await connectToDatabase();
  let cats = await Category.find({}).sort({ label: 1 }).lean();
  if (cats.length === 0) {
    await Category.insertMany(DEFAULTS.map((label) => ({ label })));
    cats = await Category.find({}).sort({ label: 1 }).lean();
  }
  return NextResponse.json({ categories: JSON.parse(JSON.stringify(cats)) });
}

export async function POST(request: NextRequest) {
  const session = await getSession(request);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  await connectToDatabase();
  const { label } = await request.json();
  if (!label?.trim()) {
    return NextResponse.json({ error: "Label requerido" }, { status: 400 });
  }

  const existing = await Category.findOne({
    label: { $regex: `^${label.trim()}$`, $options: "i" },
  }).lean();
  if (existing) {
    return NextResponse.json({ category: JSON.parse(JSON.stringify(existing)) });
  }

  const cat = await Category.create({ label: label.trim() });
  return NextResponse.json({ category: JSON.parse(JSON.stringify(cat)) }, { status: 201 });
}
