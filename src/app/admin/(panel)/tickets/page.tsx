import Link from "next/link";
import { ActionForm } from "@/components/ActionForm";
import { Encabezado, Seccion, Vacio } from "@/components/Encabezado";
import { Estado } from "@/components/Estado";
import { Filtros } from "@/components/Filtros";
import { indice, listarClientes, listarContratos, listarTickets } from "@/lib/datos";
import { fechaHora } from "@/lib/fechas";
import { crearTicket } from "@/app/admin/acciones";

export const metadata = { title: "Soporte" };

const ORDEN_PRIORIDAD = { alta: 0, media: 1, baja: 2 } as const;

export default async function Tickets({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const { q = "", estado = "", prioridad = "", nuevo, cliente = "" } = await searchParams;
  const [tickets, clientes, contratos] = await Promise.all([listarTickets(), listarClientes(), listarContratos()]);
  const cli = indice(clientes);
  const texto = q.trim().toLowerCase();
  const abiertos = (t: { estado: string }) => t.estado === "abierto" || t.estado === "en_progreso";

  const lista = tickets
    .filter(
      (t) =>
        (estado ? t.estado === estado : true) &&
        (!prioridad || t.prioridad === prioridad) &&
        (!texto || `${t.numero} ${t.asunto} ${cli.get(t.clienteId)?.nombre ?? ""}`.toLowerCase().includes(texto)),
    )
    .sort((a, b) => Number(!abiertos(a)) - Number(!abiertos(b)) || ORDEN_PRIORIDAD[a.prioridad] - ORDEN_PRIORIDAD[b.prioridad]);

  return (
    <>
      <Encabezado titulo="Soporte" descripcion={`${tickets.filter(abiertos).length} ticket(s) abiertos de ${tickets.length}`}>
        <Link href="/admin/tickets?nuevo=1" className="btn-primary">Nuevo ticket</Link>
      </Encabezado>

      {nuevo && (
        <div className="mb-6">
          <Seccion titulo="Nuevo ticket" accion={<Link href="/admin/tickets" className="text-sm text-muted hover:text-ink">Cancelar</Link>}>
            {clientes.length === 0 ? (
              <p className="p-4 text-sm text-muted">Registra primero un cliente.</p>
            ) : (
              <ActionForm action={crearTicket} submitLabel="Crear ticket" className="grid max-w-3xl gap-4 p-4 sm:grid-cols-2">
                <label className="field">
                  <span>Cliente</span>
                  <select name="clienteId" required defaultValue={cliente} className="input">
                    <option value="" disabled>Elige un cliente</option>
                    {clientes.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                  </select>
                </label>
                <label className="field">
                  <span>Contrato <em className="font-normal text-muted">(opcional)</em></span>
                  <select name="contratoId" defaultValue="" className="input">
                    <option value="">Sin contrato</option>
                    {contratos
                      .filter((c) => c.estado === "en_curso" || c.estado === "entregado")
                      .map((c) => <option key={c.id} value={c.id}>{c.codigo} · {cli.get(c.clienteId)?.nombre} · {c.titulo}</option>)}
                  </select>
                </label>
                <label className="field sm:col-span-2">
                  <span>Asunto</span>
                  <input name="asunto" required minLength={4} maxLength={160} className="input" />
                </label>
                <label className="field sm:col-span-2">
                  <span>Descripción</span>
                  <textarea name="descripcion" required minLength={5} maxLength={3000} rows={4} className="input" />
                </label>
                <label className="field">
                  <span>Prioridad</span>
                  <select name="prioridad" defaultValue="media" className="input">
                    <option value="baja">Baja</option>
                    <option value="media">Media</option>
                    <option value="alta">Alta</option>
                  </select>
                </label>
              </ActionForm>
            )}
          </Seccion>
        </div>
      )}

      <Filtros
        q={q}
        selects={[
          { name: "estado", label: "Todos los estados", value: estado, options: [["abierto", "Abierto"], ["en_progreso", "En progreso"], ["resuelto", "Resuelto"], ["cerrado", "Cerrado"]] },
          { name: "prioridad", label: "Toda prioridad", value: prioridad, options: [["alta", "Alta"], ["media", "Media"], ["baja", "Baja"]] },
        ]}
      />

      {lista.length === 0 ? (
        <Vacio>No hay tickets que coincidan con el filtro.</Vacio>
      ) : (
        <div className="card overflow-x-auto">
          <table className="tabla">
            <thead>
              <tr><th>Ticket</th><th>Cliente</th><th>Prioridad</th><th>Estado</th><th>Respuestas</th><th>Actualizado</th></tr>
            </thead>
            <tbody>
              {lista.map((t) => (
                <tr key={t.id}>
                  <td>
                    <Link href={`/admin/tickets/${t.id}`} className="font-semibold text-navy hover:text-teal">
                      <span className="font-mono text-xs text-muted">{t.numero}</span> {t.asunto}
                    </Link>
                  </td>
                  <td>{cli.get(t.clienteId)?.nombre ?? "—"}</td>
                  <td><Estado valor={t.prioridad} /></td>
                  <td><Estado valor={t.estado} /></td>
                  <td>{t.respuestas.length}</td>
                  <td className="text-xs whitespace-nowrap text-muted">{fechaHora(t.actualizado)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
