import { SignJWT, jwtVerify } from "jose";
import { NextRequest } from "next/server";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "fallback-secret-change-in-production"
);

export interface AdminPayload {
  email: string;
  role: "admin";
}

export async function signJwt(payload: AdminPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(JWT_SECRET);
}

export async function verifyJwt(token: string): Promise<AdminPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as AdminPayload;
  } catch {
    return null;
  }
}

export async function getSession(
  request: NextRequest
): Promise<AdminPayload | null> {
  const token = request.cookies.get("dulce_admin_session")?.value;
  if (!token) return null;
  return verifyJwt(token);
}

export const COOKIE_NAME = "dulce_admin_session";
