"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ENLACES = [
  { href: "/admin", texto: "Tablero", d: "M3 13h8V3H3zM13 21h8V11h-8zM3 21h8v-6H3zM13 3v6h8V3z" },
  {
    href: "/admin/clientes",
    texto: "Clientes",
    d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8",
  },
  {
    href: "/admin/servicios",
    texto: "Servicios",
    d: "M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zM16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2",
  },
  {
    href: "/admin/contratos",
    texto: "Contratos",
    d: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M8 13h8M8 17h5",
  },
  { href: "/admin/pagos", texto: "Pagos", d: "M2 6h20v12H2zM2 10h20M6 15h4" },
  { href: "/admin/solicitudes", texto: "Solicitudes", d: "M4 4h16v12H5.2L4 17.2zM8 9h8M8 12h5" },
  {
    href: "/admin/tickets",
    texto: "Soporte",
    d: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3M12 17h.01",
  },
];

export function NavAdmin({ contadores }: { contadores: Record<string, number> }) {
  const ruta = usePathname();
  return (
    <nav className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
      {ENLACES.map((e) => {
        const activo = e.href === "/admin" ? ruta === "/admin" : ruta.startsWith(e.href);
        const n = contadores[e.href];
        return (
          <Link
            key={e.href}
            href={e.href}
            className={`flex shrink-0 items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              activo ? "bg-white/15 text-white" : "text-white/70 hover:bg-white/10 hover:text-white"
            }`}
          >
            <svg
              viewBox="0 0 24 24"
              className="h-[18px] w-[18px]"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d={e.d} />
            </svg>
            <span className="flex-1">{e.texto}</span>
            {n ? <span className="rounded-full bg-amber px-1.5 text-xs font-bold text-navy">{n}</span> : null}
          </Link>
        );
      })}
    </nav>
  );
}
