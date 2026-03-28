import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Order } from "@/models/Order";
import { Product } from "@/models/Product";
import { getSession } from "@/lib/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession(request);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  await connectToDatabase();
  const body = await request.json();

  const order = await Order.findByIdAndUpdate(id, body, { new: true }).lean();
  if (!order) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  return NextResponse.json({ order });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession(request);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  await connectToDatabase();

  // Restore stock before deleting
  const order = await Order.findById(id).lean() as { items?: { productId: string; quantity: number }[] } | null;
  if (order?.items?.length) {
    await Product.bulkWrite(
      order.items.map((item) => ({
        updateOne: {
          filter: { _id: item.productId },
          update: { $inc: { stock: item.quantity } },
        },
      }))
    );
  }

  await Order.findByIdAndDelete(id);
  return NextResponse.json({ ok: true });
}
