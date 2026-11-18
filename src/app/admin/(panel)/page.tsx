import Link from "next/link";
import { ActionForm } from "@/components/ActionForm";
import { Encabezado, Seccion, Vacio } from "@/components/Encabezado";
import { Estado } from "@/components/Estado";
import { indicadores, indice } from "@/lib/datos";
import { dinero, fechaCorta, fechaLarga, nombrePeriodo } from "@/lib/fechas";
import { sembrarDatos } from "../acciones";

export const metadata = { title: "Tablero" };

/** Metas del modelo de negocio (lienzo Canvas) */
const PUNTO_EQUILIBRIO_MES = 2400;
const META_ANUAL = 32800;

function Kpi({ titulo, valor, nota, tono = "normal", href }: {
  titulo: string; valor: string; nota?: React.ReactNode; tono?: "normal" | "alerta" | "bien"; href?: string;
}) {
  const color = tono === "alerta" ? "text-red-700" : tono === "bien" ? "text-emerald-700" : "text-navy";
  const contenido = (
    <>
      <p className="text-xs font-semibold tracking-wide text-muted uppercase">{titulo}</p>
      <p className={`mt-2 text-2xl font-extrabold ${color}`}>{valor}</p>
      {nota && <p className="mt-1 text-xs text-muted">{nota}</p>}
    </>
  );
  return href ? (
    <Link href={href} className="card block p-4 transition-colors hover:border-teal">{contenido}</Link>
  ) : (
    <div className="card p-4">{contenido}</div>
  );
}

export default async function Tablero() {
  const k = await indicadores();
  const cli = indice(k.clientes);
  const vacio = k.clientes.length === 0 && k.contratos.length === 0;
  const maxSerie = Math.max(PUNTO_EQUILIBRIO_MES * 1.15, ...k.serie.map((s) => s.monto));
  const avanceMeta = Math.min(100, Math.round((k.cobradoAnio / META_ANUAL) * 100));
  const totalLineas = k.porLinea.reduce((s, [, v]) => s + v, 0) || 1;

  return (
    <>
      <Encabezado titulo="Tablero" descripcion={`Resumen al ${fechaLarga(k.hoy)}`}>
        <Link href="/admin/contratos/nuevo" className="btn-primary">Nuevo contrato</Link>
        <Link href="/admin/pagos" className="btn-ghost">Registrar pago</Link>
      </Encabezado>

      {vacio && (
        <div className="card mb-6 flex flex-wrap items-center justify-between gap-4 border-amber/60 bg-amber/10 p-5">
          <div>
            <p className="font-bold text-navy">La base de datos está vacía</p>
            <p className="text-sm text-muted">Puedes cargar el catálogo de Sistemas Joscal y clientes de ejemplo para probar el panel.</p>
          </div>
          <ActionForm action={sembrarDatos} submitLabel="Cargar datos de ejemplo" submitClassName="btn-dark" className="flex flex-col gap-2" />
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi
          titulo={`Cobrado en ${nombrePeriodo(k.hoy.slice(0, 7), true)}`}
          valor={dinero(k.cobradoMes)}
          tono={k.cobradoMes >= PUNTO_EQUILIBRIO_MES ? "bien" : "normal"}
          nota={`Punto de equilibrio: ${dinero(PUNTO_EQUILIBRIO_MES, true)} al mes`}
        />
        <Kpi
          titulo="Por cobrar"
          valor={dinero(k.porCobrar)}
          tono={k.montoVencido > 0 ? "alerta" : "normal"}
          nota={k.montoVencido > 0 ? `${dinero(k.montoVencido)} vencido en ${k.vencidos.length} cobro(s)` : "Sin cobros vencidos"}
          href="/admin/pagos?estado=pendiente"
        />
        <Kpi
          titulo="Ingreso recurrente"
          valor={`${dinero(k.ingresoRecurrente)} / mes`}
          nota={`${k.contratosMensuales} contrato(s) de soporte o suscripción`}
          href="/admin/contratos?modalidad=mensual"
        />
        <Kpi
          titulo="Clientes activos"
          valor={String(k.clientesActivos)}
          nota={`${k.prospectos} prospecto(s) · meta del año: 15 clientes`}
          href="/admin/clientes"
        />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <Kpi titulo="Proyectos en curso" valor={String(k.proyectosEnCurso.length)} nota={`${k.propuestas.length} propuesta(s) por cerrar`} href="/admin/contratos?estado=en_curso" />
        <Kpi titulo="Tickets abiertos" valor={String(k.ticketsAbiertos.length)} tono={k.ticketsAbiertos.some((t) => t.prioridad === "alta") ? "alerta" : "normal"} nota={`${k.ticketsAbiertos.filter((t) => t.prioridad === "alta").length} de prioridad alta`} href="/admin/tickets" />
        <Kpi titulo="Solicitudes nuevas" valor={String(k.solicitudesNuevas.length)} nota="Diagnósticos pedidos desde el sitio" href="/admin/solicitudes" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Seccion titulo="Cobros de los últimos 6 meses">
          <div className="p-4">
            <div className="relative h-56">
              <div
                className="absolute inset-x-0 border-t-2 border-dashed border-amber"
                style={{ bottom: `${(PUNTO_EQUILIBRIO_MES / maxSerie) * 100}%` }}
              >
                <span className="absolute -top-5 right-0 rounded bg-white px-1 text-[11px] font-semibold text-amber-700">
                  Equilibrio {dinero(PUNTO_EQUILIBRIO_MES, true)}
                </span>
              </div>
              <div className="flex h-full items-end gap-3">
                {k.serie.map((s) => (
                  <div key={s.periodo} className="flex h-full flex-1 flex-col justify-end">
                    <p className="mb-1 text-center text-[11px] font-semibold text-ink">{s.monto ? dinero(s.monto, true) : ""}</p>
                    <div
                      className={`rounded-t-md ${s.monto >= PUNTO_EQUILIBRIO_MES ? "bg-teal" : "bg-teal/45"}`}
                      style={{ height: `${(s.monto / maxSerie) * 100}%`, minHeight: s.monto ? 4 : 0 }}
                      title={`${nombrePeriodo(s.periodo, true)}: ${dinero(s.monto)}`}
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-2 flex gap-3 border-t border-line pt-2">
              {k.serie.map((s) => (
                <p key={s.periodo} className="flex-1 text-center text-xs text-muted">{nombrePeriodo(s.periodo)}</p>
              ))}
            </div>
            <div className="mt-5">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-ink">Cobrado en {k.hoy.slice(0, 4)}: {dinero(k.cobradoAnio, true)}</span>
                <span className="text-muted">Meta del primer año {dinero(META_ANUAL, true)} · {avanceMeta} %</span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-mist">
                <div className="h-full rounded-full bg-amber" style={{ width: `${avanceMeta}%` }} />
              </div>
            </div>
          </div>
        </Seccion>

        <Seccion titulo={`Ingresos por línea (${k.hoy.slice(0, 4)})`}>
          {k.porLinea.length === 0 ? (
            <p className="p-4 text-sm text-muted">Aún no hay cobros este año.</p>
          ) : (
            <ul className="space-y-3 p-4">
              {k.porLinea.map(([linea, monto]) => (
                <li key={linea}>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{linea}</span>
                    <span className="font-semibold">{dinero(monto, true)}</span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-mist">
                    <div className="h-full rounded-full bg-navy" style={{ width: `${(monto / totalLineas) * 100}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Seccion>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Seccion titulo="Cobros vencidos y próximos" accion={<Link href="/admin/pagos" className="text-sm font-semibold text-teal">Ver todos</Link>}>
          {k.pendientes.length === 0 ? (
            <p className="p-4 text-sm text-muted">No hay cobros pendientes.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="tabla">
                <thead><tr><th>Cliente</th><th>Concepto</th><th>Vence</th><th className="text-right">Monto</th></tr></thead>
                <tbody>
                  {k.pendientes.slice(0, 6).map((p) => (
                    <tr key={p.id}>
                      <td className="font-medium">{cli.get(p.clienteId)?.nombre ?? "—"}</td>
                      <td>{p.concepto}</td>
                      <td>
                        <span className="mr-2">{fechaCorta(p.vence)}</span>
                        {p.vence < k.hoy && <Estado valor="vencido" />}
                      </td>
                      <td className="text-right font-semibold">{dinero(p.monto)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Seccion>

        <Seccion titulo="Proyectos en curso" accion={<Link href="/admin/contratos" className="text-sm font-semibold text-teal">Ver contratos</Link>}>
          {k.proyectosEnCurso.length === 0 ? (
            <p className="p-4 text-sm text-muted">No hay proyectos en curso.</p>
          ) : (
            <ul className="divide-y divide-line">
              {k.proyectosEnCurso.map((c) => (
                <li key={c.id} className="px-4 py-3">
                  <Link href={`/admin/contratos/${c.id}`} className="flex justify-between gap-3 text-sm hover:text-teal">
                    <span className="font-semibold">{c.titulo}</span>
                    <span className="shrink-0 text-muted">{c.avance} %</span>
                  </Link>
                  <p className="text-xs text-muted">{cli.get(c.clienteId)?.nombre} · entrega {fechaCorta(c.fin)}</p>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-mist">
                    <div className="h-full rounded-full bg-teal" style={{ width: `${c.avance}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Seccion>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Seccion titulo="Soporte pendiente" accion={<Link href="/admin/tickets" className="text-sm font-semibold text-teal">Ver tickets</Link>}>
          {k.ticketsAbiertos.length === 0 ? (
            <p className="p-4 text-sm text-muted">Sin tickets abiertos.</p>
          ) : (
            <ul className="divide-y divide-line">
              {k.ticketsAbiertos.map((t) => (
                <li key={t.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                  <Link href={`/admin/tickets/${t.id}`} className="min-w-0 hover:text-teal">
                    <p className="truncate font-semibold">{t.numero} · {t.asunto}</p>
                    <p className="text-xs text-muted">{cli.get(t.clienteId)?.nombre}</p>
                  </Link>
                  <div className="flex shrink-0 gap-1"><Estado valor={t.prioridad} /><Estado valor={t.estado} /></div>
                </li>
              ))}
            </ul>
          )}
        </Seccion>

        <Seccion titulo="Solicitudes de diagnóstico nuevas" accion={<Link href="/admin/solicitudes" className="text-sm font-semibold text-teal">Ver solicitudes</Link>}>
          {k.solicitudesNuevas.length === 0 ? (
            <div className="p-4"><Vacio>No hay solicitudes nuevas.</Vacio></div>
          ) : (
            <ul className="divide-y divide-line">
              {k.solicitudesNuevas.map((s) => (
                <li key={s.id} className="px-4 py-3 text-sm">
                  <p className="font-semibold">{s.organizacion} <span className="font-normal text-muted">· {s.segmento} · {s.interes}</span></p>
                  <p className="line-clamp-2 text-muted">{s.mensaje}</p>
                </li>
              ))}
            </ul>
          )}
        </Seccion>
      </div>
    </>
  );
}
