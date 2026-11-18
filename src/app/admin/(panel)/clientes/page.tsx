import Link from "next/link";
import { Encabezado, Vacio } from "@/components/Encabezado";
import { Estado } from "@/components/Estado";
import { Filtros } from "@/components/Filtros";
import { listarClientes, listarContratos, listarPagos } from "@/lib/datos";
import { dinero } from "@/lib/fechas";
import { SEGMENTOS } from "@/lib/types";

export const metadata = { title: "Clientes" };

export default async function Clientes({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const { q = "", segmento = "", estado = "" } = await searchParams;
  const [clientes, contratos, pagos] = await Promise.all([listarClientes(), listarContratos(), listarPagos()]);
  const texto = q.trim().toLowerCase();
  const filtrados = clientes.filter(
    (c) =>
      (!segmento || c.segmento === segmento) &&
      (!estado || c.estado === estado) &&
      (!texto || `${c.nombre} ${c.contacto} ${c.municipio} ${c.email}`.toLowerCase().includes(texto)),
  );

  return (
    <>
      <Encabezado titulo="Clientes" descripcion={`${clientes.length} cliente(s) registrados`}>
        <Link href="/admin/clientes/nuevo" className="btn-primary">Nuevo cliente</Link>
      </Encabezado>

      <Filtros
        q={q}
        selects={[
          { name: "segmento", label: "Todos los segmentos", value: segmento, options: SEGMENTOS.map((s) => [s, s]) },
          { name: "estado", label: "Todos los estados", value: estado, options: [["activo", "Activo"], ["prospecto", "Prospecto"], ["inactivo", "Inactivo"]] },
        ]}
      />

      {filtrados.length === 0 ? (
        <Vacio>No hay clientes que coincidan con el filtro.</Vacio>
      ) : (
        <div className="card overflow-x-auto">
          <table className="tabla">
            <thead>
              <tr><th>Cliente</th><th>Segmento</th><th>Contacto</th><th>Contratos</th><th className="text-right">Facturado</th><th>Estado</th></tr>
            </thead>
            <tbody>
              {filtrados.map((c) => {
                const suyos = contratos.filter((k) => k.clienteId === c.id);
                const cobrado = pagos.filter((p) => p.clienteId === c.id && p.estado === "pagado").reduce((s, p) => s + p.monto, 0);
                return (
                  <tr key={c.id}>
                    <td>
                      <Link href={`/admin/clientes/${c.id}`} className="font-semibold text-navy hover:text-teal">{c.nombre}</Link>
                      <p className="text-xs text-muted">{c.municipio}</p>
                    </td>
                    <td>{c.segmento}</td>
                    <td>
                      {c.contacto || "—"}
                      {c.email && <p className="text-xs text-muted">{c.email}</p>}
                    </td>
                    <td>{suyos.filter((k) => k.estado === "en_curso").length} en curso / {suyos.length}</td>
                    <td className="text-right font-semibold">{dinero(cobrado)}</td>
                    <td><Estado valor={c.estado} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
