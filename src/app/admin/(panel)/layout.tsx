import Link from "next/link";
import type { Metadata } from "next";
import { Logo } from "@/components/Logo";
import { NavAdmin } from "@/components/NavAdmin";
import { sesionActual } from "@/lib/auth";
import { getStore } from "@/lib/store";
import { listarSolicitudes, listarTickets } from "@/lib/datos";
import { salir } from "../acciones";

export const metadata: Metadata = { title: { default: "Panel", template: "%s · Panel Sistemas Joscal" } };
export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const sesion = await sesionActual();
  const store = getStore();
  let contadores: Record<string, number> = {};
  let errorBD = "";
  try {
    const [sol, tic] = await Promise.all([listarSolicitudes(), listarTickets()]);
    contadores = {
      "/admin/solicitudes": sol.filter((s) => s.estado === "nueva").length,
      "/admin/tickets": tic.filter((t) => t.estado === "abierto").length,
    };
  } catch (e) {
    console.error(e);
    errorBD = e instanceof Error ? e.message : String(e);
  }

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="no-print bg-navy px-3 py-4 lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col">
        <div className="mb-4 flex items-center justify-between px-2 lg:mb-8">
          <Link href="/admin">
            <Logo claro />
          </Link>
          <form action={salir} className="lg:hidden">
            <button className="text-xs font-semibold text-white/70 hover:text-white">Salir</button>
          </form>
        </div>
        <NavAdmin contadores={contadores} />
        <div className="mt-auto hidden space-y-3 px-2 pt-6 text-xs text-white/60 lg:block">
          <p className="truncate" title={sesion?.email}>
            {sesion?.email}
          </p>
          <div className="flex items-center justify-between">
            <Link href="/" className="hover:text-white">
              Ver sitio público
            </Link>
            <form action={salir}>
              <button className="font-semibold hover:text-white">Cerrar sesión</button>
            </form>
          </div>
        </div>
      </aside>
      <div className="min-w-0">
        {store.kind === "memory" && (
          <p className="no-print border-b border-amber/40 bg-amber/15 px-4 py-2 text-center text-xs text-amber-900">
            Modo demostración: los datos están en memoria y se reinician. Conecta Upstash Redis (Vercel) o
            configura <code>DB_TABLE</code> para usar DynamoDB.
          </p>
        )}
        {errorBD && (
          <p className="no-print border-b border-red-200 bg-red-50 px-4 py-2 text-center text-xs text-red-800">
            No se pudo conectar con la base de datos: {errorBD}
          </p>
        )}
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
