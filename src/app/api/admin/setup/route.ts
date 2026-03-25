import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";

// POST /api/admin/setup
// Crea el usuario admin si no existe. Ejecutar UNA sola vez.
export async function POST() {
  try {
    await connectToDatabase();

    const email = "dulcepecado@gmail.com";
    const password = "DulcePecado2025!";

    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json({
        message: "El usuario admin ya existe",
        email,
      });
    }

    const hash = await bcrypt.hash(password, 12);
    await User.create({ email, password: hash, role: "admin" });

    return NextResponse.json({
      ok: true,
      message: "✅ Usuario admin creado exitosamente en MongoDB",
      email,
    });
  } catch (error) {
    console.error("[POST /api/admin/setup]", error);
    return NextResponse.json({ error: "Error al crear el usuario" }, { status: 500 });
  }
}
