import Link from "next/link";
import { notFound } from "next/navigation";
import { Encabezado, Seccion } from "@/components/Encabezado";
import { Estado } from "@/components/Estado";
import { FormContrato } from "@/components/Formularios";
import { FormNuevoCobro, TablaPagos } from "@/components/Pagos";
import { indice, listarClientes, listarPagos, listarServicios, listarTickets } from "@/lib/datos";
import { dinero, fechaCorta } from "@/lib/fechas";
import { getStore } from "@/lib/store";

export default async function DetalleContrato({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const contrato = await getStore().get("contrato", id);
  if (!contrato) notFound();
  const [clientes, servicios, pagos, tickets] = await Promise.all([
    listarClientes(), listarServicios(), listarPagos(), listarTickets(),
  ]);
  const cli = indice(clientes);
  const cliente = cli.get(contrato.clienteId);
  const servicio = servicios.find((s) => s.id === contrato.servicioId);
  const susPagos = pagos.filter((p) => p.contratoId === id);
  const vigentes = susPagos.filter((p) => p.estado !== "anulado");
  const cobrado = vigentes.filter((p) => p.estado === "pagado").reduce((s, p) => s + p.monto, 0);
  const programado = vigentes.reduce((s, p) => s + p.monto, 0);
  const susTickets = tickets.filter((t) => t.contratoId === id);

  return (
    <>
      <Encabezado
        titulo={contrato.titulo}
        descripcion={
          <span className="inline-flex flex-wrap items-center gap-2">
            <span className="font-mono">{contrato.codigo}</span> ·
            <Link href={`/admin/clientes/${contrato.clienteId}`} className="font-semibold text-teal hover:underline">{cliente?.nombre}</Link> ·
            {servicio?.nombre} <Estado valor={contrato.estado} />
          </span>
        }
        volver={{ href: "/admin/contratos", texto: "Contratos" }}
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="card p-4">
          <p className="text-xs font-semibold text-muted uppercase">{contrato.modalidad === "mensual" ? "Cuota mensual" : "Monto del contrato"}</p>
          <p className="mt-1 text-xl font-extrabold text-navy">{dinero(contrato.monto)}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs font-semibold text-muted uppercase">Cobrado</p>
          <p className="mt-1 text-xl font-extrabold text-emerald-700">{dinero(cobrado)}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs font-semibold text-muted uppercase">{contrato.modalidad === "mensual" ? "Programado (cuotas)" : "Saldo por cobrar"}</p>
          <p className="mt-1 text-xl font-extrabold text-navy">
            {dinero(contrato.modalidad === "mensual" ? programado - cobrado : Math.max(0, contrato.monto - cobrado))}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-xs font-semibold text-muted uppercase">{contrato.modalidad === "mensual" ? "Vigente desde" : "Avance"}</p>
          {contrato.modalidad === "mensual" ? (
            <p className="mt-1 text-xl font-extrabold text-navy">{fechaCorta(contrato.inicio)}</p>
          ) : (
            <>
              <p className="mt-1 text-xl font-extrabold text-navy">{contrato.avance} %</p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-mist">
                <div className="h-full rounded-full bg-teal" style={{ width: `${contrato.avance}%` }} />
              </div>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
        <div className="space-y-6">
          <Seccion titulo="Plan de pagos">
            {susPagos.length === 0 ? (
              <p className="p-4 text-sm text-muted">Sin cobros programados.</p>
            ) : (
              <TablaPagos pagos={susPagos} mostrarCliente={false} />
            )}
          </Seccion>
          <Seccion titulo="Programar un cobro">
            <div className="p-4">
              <FormNuevoCobro contratos={[contrato]} clientes={cli} contratoFijo={contrato} />
            </div>
          </Seccion>
          {susTickets.length > 0 && (
            <Seccion titulo="Tickets de este contrato">
              <ul className="divide-y divide-line">
                {susTickets.map((t) => (
                  <li key={t.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                    <Link href={`/admin/tickets/${t.id}`} className="font-semibold hover:text-teal">{t.numero} · {t.asunto}</Link>
                    <Estado valor={t.estado} />
                  </li>
                ))}
              </ul>
            </Seccion>
          )}
        </div>
        <Seccion titulo="Editar contrato">
          <div className="p-4">
            <FormContrato c={contrato} clientes={clientes} servicios={servicios} />
          </div>
        </Seccion>
      </div>
    </>
  );
}
