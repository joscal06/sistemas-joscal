import Link from "next/link";
import { notFound } from "next/navigation";
import { ActionForm } from "@/components/ActionForm";
import { Encabezado, Seccion } from "@/components/Encabezado";
import { Estado } from "@/components/Estado";
import { FormCliente } from "@/components/Formularios";
import { estadoPago, indice, listarContratos, listarPagos, listarServicios, listarTickets } from "@/lib/datos";
import { dinero, fechaCorta, hoy } from "@/lib/fechas";
import { getStore } from "@/lib/store";
import { eliminarCliente } from "@/app/admin/acciones";

export default async function DetalleCliente({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cliente = await getStore().get("cliente", id);
  if (!cliente) notFound();
  const [contratos, pagos, tickets, servicios] = await Promise.all([
    listarContratos(), listarPagos(), listarTickets(), listarServicios(),
  ]);
  const srv = indice(servicios);
  const suyos = contratos.filter((c) => c.clienteId === id);
  const susPagos = pagos.filter((p) => p.clienteId === id);
  const susTickets = tickets.filter((t) => t.clienteId === id);
  const h = hoy();
  const cobrado = susPagos.filter((p) => p.estado === "pagado").reduce((s, p) => s + p.monto, 0);
  const pendiente = susPagos.filter((p) => p.estado === "pendiente").reduce((s, p) => s + p.monto, 0);

  return (
    <>
      <Encabezado
        titulo={cliente.nombre}
        descripcion={<span className="inline-flex items-center gap-2">{cliente.segmento} · {cliente.municipio || "Sin municipio"} <Estado valor={cliente.estado} /></span>}
        volver={{ href: "/admin/clientes", texto: "Clientes" }}
      >
        <Link href={`/admin/contratos/nuevo?cliente=${id}`} className="btn-primary">Nuevo contrato</Link>
        <Link href={`/admin/tickets?nuevo=1&cliente=${id}`} className="btn-ghost">Abrir ticket</Link>
      </Encabezado>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="card p-4"><p className="text-xs font-semibold text-muted uppercase">Cobrado</p><p className="mt-1 text-xl font-extrabold text-emerald-700">{dinero(cobrado)}</p></div>
        <div className="card p-4"><p className="text-xs font-semibold text-muted uppercase">Pendiente</p><p className="mt-1 text-xl font-extrabold text-navy">{dinero(pendiente)}</p></div>
        <div className="card p-4"><p className="text-xs font-semibold text-muted uppercase">Contratos</p><p className="mt-1 text-xl font-extrabold text-navy">{suyos.length}</p></div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
        <div className="space-y-6">
          <Seccion titulo="Contratos">
            {suyos.length === 0 ? <p className="p-4 text-sm text-muted">Sin contratos todavía.</p> : (
              <div className="overflow-x-auto">
                <table className="tabla">
                  <thead><tr><th>Código</th><th>Contrato</th><th className="text-right">Monto</th><th>Estado</th></tr></thead>
                  <tbody>
                    {suyos.map((c) => (
                      <tr key={c.id}>
                        <td className="font-mono text-xs">{c.codigo}</td>
                        <td>
                          <Link href={`/admin/contratos/${c.id}`} className="font-semibold text-navy hover:text-teal">{c.titulo}</Link>
                          <p className="text-xs text-muted">{srv.get(c.servicioId)?.nombre}</p>
                        </td>
                        <td className="text-right">{dinero(c.monto)}{c.modalidad === "mensual" && <span className="text-xs text-muted"> /mes</span>}</td>
                        <td><Estado valor={c.estado} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Seccion>

          <Seccion titulo="Cobros">
            {susPagos.length === 0 ? <p className="p-4 text-sm text-muted">Sin cobros.</p> : (
              <div className="overflow-x-auto">
                <table className="tabla">
                  <thead><tr><th>Concepto</th><th>Vence</th><th className="text-right">Monto</th><th>Estado</th></tr></thead>
                  <tbody>
                    {susPagos.map((p) => (
                      <tr key={p.id}>
                        <td>{p.concepto}{p.recibo && <Link href={`/admin/pagos/${p.id}/recibo`} className="ml-2 text-xs font-semibold text-teal">{p.recibo}</Link>}</td>
                        <td>{fechaCorta(p.vence)}</td>
                        <td className="text-right">{dinero(p.monto)}</td>
                        <td><Estado valor={estadoPago(p, h)} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Seccion>

          <Seccion titulo="Tickets de soporte">
            {susTickets.length === 0 ? <p className="p-4 text-sm text-muted">Sin tickets.</p> : (
              <ul className="divide-y divide-line">
                {susTickets.map((t) => (
                  <li key={t.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                    <Link href={`/admin/tickets/${t.id}`} className="font-semibold hover:text-teal">{t.numero} · {t.asunto}</Link>
                    <Estado valor={t.estado} />
                  </li>
                ))}
              </ul>
            )}
          </Seccion>
        </div>

        <div className="space-y-6">
          <Seccion titulo="Datos del cliente">
            <div className="p-4"><FormCliente c={cliente} /></div>
          </Seccion>
          <ActionForm
            action={eliminarCliente}
            confirmar={`¿Eliminar a ${cliente.nombre}? Esta acción no se puede deshacer.`}
            submitLabel="Eliminar cliente"
            submitClassName="btn-danger"
            className="grid gap-2"
          >
            <input type="hidden" name="id" value={cliente.id} />
          </ActionForm>
        </div>
      </div>
    </>
  );
}
