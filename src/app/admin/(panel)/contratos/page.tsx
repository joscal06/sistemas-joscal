import Link from "next/link";
import { Encabezado, Vacio } from "@/components/Encabezado";
import { Estado } from "@/components/Estado";
import { Filtros } from "@/components/Filtros";
import { indice, listarClientes, listarContratos, listarPagos, listarServicios } from "@/lib/datos";
import { dinero, fechaCorta } from "@/lib/fechas";

export const metadata = { title: "Contratos y proyectos" };

export default async function Contratos({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const { q = "", estado = "", modalidad = "" } = await searchParams;
  const [contratos, clientes, servicios, pagos] = await Promise.all([
    listarContratos(), listarClientes(), listarServicios(), listarPagos(),
  ]);
  const cli = indice(clientes);
  const srv = indice(servicios);
  const texto = q.trim().toLowerCase();
  const filtrados = contratos.filter(
    (c) =>
      (!estado || c.estado === estado) &&
      (!modalidad || c.modalidad === modalidad) &&
      (!texto || `${c.codigo} ${c.titulo} ${cli.get(c.clienteId)?.nombre ?? ""}`.toLowerCase().includes(texto)),
  );
  const valorUnico = filtrados.filter((c) => c.modalidad === "unico" && c.estado !== "cancelado").reduce((s, c) => s + c.monto, 0);
  const valorMensual = filtrados.filter((c) => c.modalidad === "mensual" && c.estado === "en_curso").reduce((s, c) => s + c.monto, 0);

  return (
    <>
      <Encabezado
        titulo="Contratos y proyectos"
        descripcion={`${filtrados.length} contrato(s) · proyectos por ${dinero(valorUnico, true)} · recurrente ${dinero(valorMensual, true)} al mes`}
      >
        <Link href="/admin/contratos/nuevo" className="btn-primary">Nuevo contrato</Link>
      </Encabezado>

      <Filtros
        q={q}
        selects={[
          { name: "estado", label: "Todos los estados", value: estado, options: [["propuesta", "Propuesta"], ["en_curso", "En curso"], ["entregado", "Entregado"], ["cancelado", "Cancelado"]] },
          { name: "modalidad", label: "Toda modalidad", value: modalidad, options: [["unico", "Pago único"], ["mensual", "Mensual"]] },
        ]}
      />

      {filtrados.length === 0 ? (
        <Vacio>No hay contratos que coincidan con el filtro.</Vacio>
      ) : (
        <div className="card overflow-x-auto">
          <table className="tabla">
            <thead>
              <tr><th>Código</th><th>Contrato</th><th>Cliente</th><th className="text-right">Monto</th><th>Cobrado</th><th>Avance</th><th>Estado</th></tr>
            </thead>
            <tbody>
              {filtrados.map((c) => {
                const susPagos = pagos.filter((p) => p.contratoId === c.id && p.estado !== "anulado");
                const cobrado = susPagos.filter((p) => p.estado === "pagado").reduce((s, p) => s + p.monto, 0);
                return (
                  <tr key={c.id}>
                    <td className="font-mono text-xs whitespace-nowrap">{c.codigo}</td>
                    <td>
                      <Link href={`/admin/contratos/${c.id}`} className="font-semibold text-navy hover:text-teal">{c.titulo}</Link>
                      <p className="text-xs text-muted">{srv.get(c.servicioId)?.nombre} · desde {fechaCorta(c.inicio)}</p>
                    </td>
                    <td>{cli.get(c.clienteId)?.nombre ?? "—"}</td>
                    <td className="text-right font-semibold whitespace-nowrap">
                      {dinero(c.monto)}{c.modalidad === "mensual" && <span className="text-xs font-normal text-muted"> /mes</span>}
                    </td>
                    <td className="whitespace-nowrap">{dinero(cobrado)}</td>
                    <td className="w-32">
                      {c.modalidad === "unico" ? (
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-mist">
                            <div className="h-full rounded-full bg-teal" style={{ width: `${c.avance}%` }} />
                          </div>
                          <span className="text-xs text-muted">{c.avance}%</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted">Recurrente</span>
                      )}
                    </td>
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
