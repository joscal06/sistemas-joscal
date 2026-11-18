import { SignJWT, jwtVerify } from "jose";

/** Lógica de sesión compartida entre el middleware (Edge) y el servidor (Node). */
export const COOKIE_SESION = "sj_session";
export const DURACION_SESION = 60 * 60 * 8; // 8 horas

function clave(): Uint8Array | null {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) return null;
  return new TextEncoder().encode(secret);
}

export async function firmarSesion(email: string): Promise<string> {
  const k = clave();
  if (!k) throw new Error("SESSION_SECRET no está configurada (mínimo 32 caracteres).");
  return new SignJWT({ rol: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(email)
    .setIssuedAt()
    .setExpirationTime(`${DURACION_SESION}s`)
    .sign(k);
}

export async function verificarSesion(token?: string): Promise<{ email: string } | null> {
  const k = clave();
  if (!k || !token) return null;
  try {
    const { payload } = await jwtVerify(token, k, { algorithms: ["HS256"] });
    if (payload.rol !== "admin" || !payload.sub) return null;
    return { email: payload.sub };
  } catch {
    return null;
  }
}
