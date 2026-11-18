import Link from "next/link";
import { ActionForm } from "./ActionForm";
import { Estado } from "./Estado";
import { anularPago, crearPago, registrarPago } from "@/app/admin/acciones";
import { dinero, fechaCorta, hoy, sumarDias } from "@/lib/fechas";
import type { Cliente, Contrato, Pago } from "@/lib/types";

function estadoVisible(p: Pago, h: string) {
  return p.estado === "pendiente" && p.vence < h ? "vencido" : p.estado;
}

/** Tabla de cobros con acciones para registrar el pago o anular. */
export function TablaPagos({
  pagos,
  clientes,
  contratos,
  mostrarCliente = true,
}: {
  pagos: Pago[];
  clientes?: Map<string, Cliente>;
  contratos?: Map<string, Contrato>;
  mostrarCliente?: boolean;
}) {
  const h = hoy();
  return (
    <div className="overflow-x-auto">
      <table className="tabla">
        <thead>
          <tr>
            {mostrarCliente && <th>Cliente / contrato</th>}
            <th>Concepto</th>
            <th>Vence</th>
            <th className="text-right">Monto</th>
            <th>Estado</th>
            <th>Registro</th>
          </tr>
        </thead>
        <tbody>
          {pagos.map((p) => {
            const c = contratos?.get(p.contratoId);
            return (
              <tr key={p.id}>
                {mostrarCliente && (
                  <td>
                    <p className="font-semibold">{clientes?.get(p.clienteId)?.nombre ?? "—"}</p>
                    {c && (
                      <Link href={`/admin/contratos/${c.id}`} className="text-xs text-teal hover:underline">
                        {c.codigo} · {c.titulo}
                      </Link>
                    )}
                  </td>
                )}
                <td>{p.concepto}</td>
                <td className="whitespace-nowrap">{fechaCorta(p.vence)}</td>
                <td className="text-right font-semibold whitespace-nowrap">{dinero(p.monto)}</td>
                <td><Estado valor={estadoVisible(p, h)} /></td>
                <td className="min-w-64">
                  {p.estado === "pendiente" ? (
                    <div className="flex flex-wrap items-start gap-2">
                      <ActionForm action={registrarPago} sinBoton className="flex flex-wrap items-center gap-1.5">
                        <input type="hidden" name="id" value={p.id} />
                        <input type="date" name="pagadoEl" defaultValue={h} max={h} required className="input w-36 py-1 text-xs" aria-label="Fecha de pago" />
                        <select name="metodo" defaultValue="Transferencia" className="input w-32 py-1 text-xs" aria-label="Método">
                          <option>Transferencia</option>
                          <option>Efectivo</option>
                          <option>Tarjeta</option>
                          <option>Cheque</option>
                        </select>
                        <button className="btn-primary btn-sm">Registrar pago</button>
                      </ActionForm>
                      <ActionForm action={anularPago} sinBoton confirmar="¿Anular este cobro pendiente?">
                        <input type="hidden" name="id" value={p.id} />
                        <button className="btn-ghost btn-sm">Anular</button>
                      </ActionForm>
                    </div>
                  ) : p.estado === "pagado" ? (
                    <p className="text-xs text-muted">
                      {fechaCorta(p.pagadoEl)} · {p.metodo} ·{" "}
                      <Link href={`/admin/pagos/${p.id}/recibo`} className="font-semibold text-teal hover:underline">
                        Recibo {p.recibo}
                      </Link>
                    </p>
                  ) : (
                    <span className="text-xs text-muted">—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/** Formulario para programar un cobro adicional */
export function FormNuevoCobro({ contratos, clientes, contratoFijo }: {
  contratos: Contrato[];
  clientes: Map<string, Cliente>;
  contratoFijo?: Contrato;
}) {
  return (
    <ActionForm action={crearPago} submitLabel="Programar cobro" resetOnSuccess className="grid gap-3 sm:grid-cols-2">
      {contratoFijo ? (
        <input type="hidden" name="contratoId" value={contratoFijo.id} />
      ) : (
        <label className="field sm:col-span-2">
          <span>Contrato</span>
          <select name="contratoId" required defaultValue="" className="input">
            <option value="" disabled>Elige un contrato</option>
            {contratos
              .filter((c) => c.estado !== "cancelado")
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.codigo} · {clientes.get(c.clienteId)?.nombre} · {c.titulo}
                </option>
              ))}
          </select>
        </label>
      )}
      <label className="field sm:col-span-2">
        <span>Concepto</span>
        <input name="concepto" required minLength={3} maxLength={160} placeholder="Ej.: Cuota de diciembre, módulo adicional…" className="input" />
      </label>
      <label className="field">
        <span>Monto (USD)</span>
        <input name="monto" type="number" min={0.01} step="0.01" required defaultValue={contratoFijo?.modalidad === "mensual" ? contratoFijo.monto : undefined} className="input" />
      </label>
      <label className="field">
        <span>Vence</span>
        <input name="vence" type="date" required defaultValue={sumarDias(hoy(), 15)} className="input" />
      </label>
    </ActionForm>
  );
}
