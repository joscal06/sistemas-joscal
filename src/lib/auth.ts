import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHash, timingSafeEqual } from "node:crypto";
import { COOKIE_SESION, DURACION_SESION, firmarSesion, verificarSesion } from "./session";

export function loginConfigurado(): boolean {
  return Boolean(
    process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD && (process.env.SESSION_SECRET?.length ?? 0) >= 32,
  );
}

function igual(a: string, b: string) {
  // Compara resúmenes de igual longitud para no filtrar información por tiempo
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

export function credencialesValidas(email: string, password: string): boolean {
  if (!loginConfigurado()) return false;
  const okEmail = igual(email.trim().toLowerCase(), process.env.ADMIN_EMAIL!.trim().toLowerCase());
  const okPass = igual(password, process.env.ADMIN_PASSWORD!);
  return okEmail && okPass;
}

export async function iniciarSesion(email: string) {
  const token = await firmarSesion(email.trim().toLowerCase());
  (await cookies()).set(COOKIE_SESION, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: DURACION_SESION,
  });
}

export async function cerrarSesion() {
  (await cookies()).delete(COOKIE_SESION);
}

export async function sesionActual() {
  return verificarSesion((await cookies()).get(COOKIE_SESION)?.value);
}

/** Para usar al inicio de cada Server Action del panel (defensa en profundidad además del middleware). */
export async function requerirAdmin() {
  const s = await sesionActual();
  if (!s) redirect("/admin/login");
  return s;
}
