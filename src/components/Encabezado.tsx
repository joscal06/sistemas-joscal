import Link from "next/link";

export function Encabezado({
  titulo,
  descripcion,
  volver,
  children,
}: {
  titulo: React.ReactNode;
  descripcion?: React.ReactNode;
  volver?: { href: string; texto: string };
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-6">
      {volver && (
        <Link href={volver.href} className="no-print mb-2 inline-block text-sm font-medium text-teal hover:underline">
          ← {volver.texto}
        </Link>
      )}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-navy">{titulo}</h1>
          {descripcion && <div className="mt-1 text-sm text-muted">{descripcion}</div>}
        </div>
        {children && <div className="no-print flex flex-wrap gap-2">{children}</div>}
      </div>
    </div>
  );
}

export function Vacio({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-xl border border-dashed border-line bg-white p-8 text-center text-sm text-muted">{children}</p>
  );
}

export function Seccion({ titulo, children, accion }: { titulo: string; children: React.ReactNode; accion?: React.ReactNode }) {
  return (
    <section className="card overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
        <h2 className="font-bold text-navy">{titulo}</h2>
        {accion}
      </div>
      {children}
    </section>
  );
}
