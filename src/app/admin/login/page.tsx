import Link from "next/link";
import type { Metadata } from "next";
import { ActionForm } from "@/components/ActionForm";
import { Logo } from "@/components/Logo";
import { loginConfigurado } from "@/lib/auth";
import { entrar } from "../acciones";

export const metadata: Metadata = { title: "Acceso al panel" };
export const dynamic = "force-dynamic";

export default async function Login({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next = "" } = await searchParams;
  const configurado = loginConfigurado();
  return (
    <main className="grid min-h-screen place-items-center bg-navy px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex justify-center">
          <Link href="/">
            <Logo claro />
          </Link>
        </div>
        <div className="card p-6 shadow-xl shadow-black/20">
          <h1 className="text-xl font-extrabold text-navy">Panel de administración</h1>
          <p className="mt-1 text-sm text-muted">Clientes, servicios, contratos, cobros y soporte.</p>
          {!configurado && (
            <p className="mt-4 rounded-lg border border-amber/50 bg-amber/10 px-3 py-2 text-sm text-amber-900">
              Falta configurar las variables <code>ADMIN_EMAIL</code>, <code>ADMIN_PASSWORD</code> y{" "}
              <code>SESSION_SECRET</code> en el entorno.
            </p>
          )}
          <ActionForm action={entrar} submitLabel="Entrar" submitClassName="btn-primary w-full" className="mt-5 grid gap-4">
            <input type="hidden" name="next" value={next} />
            <label className="field">
              <span>Correo</span>
              <input name="email" type="email" required autoComplete="username" className="input" />
            </label>
            <label className="field">
              <span>Contraseña</span>
              <input name="password" type="password" required autoComplete="current-password" className="input" />
            </label>
          </ActionForm>
        </div>
        <p className="mt-6 text-center text-sm text-white/60">
          <Link href="/" className="hover:text-white">
            ← Volver al sitio
          </Link>
        </p>
      </div>
    </main>
  );
}
