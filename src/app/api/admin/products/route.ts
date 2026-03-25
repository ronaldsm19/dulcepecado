import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Product } from "@/models/Product";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await getSession(request);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  await connectToDatabase();
  const products = await Product.find().sort({ createdAt: -1 }).lean();
  return NextResponse.json({ products });
}

export async function POST(request: NextRequest) {
  const session = await getSession(request);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  await connectToDatabase();
  const body = await request.json();

  const { name, description, price, toppings, image, category, available } = body;
  if (!name || !description || !price || !image || !category) {
    return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
  }

  const product = await Product.create({
    name, description,
    price: Number(price),
    toppings: toppings ?? [],
    image, category,
    available: available ?? true,
  });

  return NextResponse.json({ product }, { status: 201 });
}
