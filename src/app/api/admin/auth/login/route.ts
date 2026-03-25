import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import { signJwt, COOKIE_NAME } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Correo y contraseña son requeridos" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Buscar usuario en MongoDB
    const user = await User.findOne({ email: email.toLowerCase().trim() }).lean() as IUserLean | null;

    // Delay para mitigar fuerza bruta
    if (!user) {
      await new Promise((r) => setTimeout(r, 500));
      return NextResponse.json({ error: "Credenciales incorrectas" }, { status: 401 });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      await new Promise((r) => setTimeout(r, 500));
      return NextResponse.json({ error: "Credenciales incorrectas" }, { status: 401 });
    }

    // Crear JWT y setear cookie
    const token = await signJwt({ email: user.email, role: "admin" });

    const response = NextResponse.json({ ok: true, email: user.email });
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 24 horas
    });

    return response;
  } catch (error) {
    console.error("[POST /api/admin/auth/login]", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

interface IUserLean {
  email: string;
  password: string;
  role: string;
}
