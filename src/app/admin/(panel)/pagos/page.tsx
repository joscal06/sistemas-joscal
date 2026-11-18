import { ActionForm } from "@/components/ActionForm";
import { Encabezado, Seccion, Vacio } from "@/components/Encabezado";
import { Filtros } from "@/components/Filtros";
import { FormNuevoCobro, TablaPagos } from "@/components/Pagos";
import { estadoPago, indice, listarClientes, listarContratos, listarPagos } from "@/lib/datos";
import { dinero, hoy, nombrePeriodo, periodo } from "@/lib/fechas";
import { generarCuotasDelMes } from "@/app/admin/acciones";

export const metadata = { title: "Pagos y facturación" };

export default async function Pagos({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const { q = "", estado = "", mes = "" } = await searchParams;
  const [pagos, clientes, contratos] = await Promise.all([listarPagos(), listarClientes(), listarContratos()]);
  const cli = indice(clientes);
  const con = indice(contratos);
  const h = hoy();
  const texto = q.trim().toLowerCase();

  const filtrados = pagos
    .filter((p) => {
      const e = estadoPago(p, h);
      if (estado === "pendiente" && !(e === "pendiente" || e === "vencido")) return false;
      if (estado && estado !== "pendiente" && e !== estado) return false;
      if (mes && !(p.pagadoEl ?? p.vence).startsWith(mes)) return false;
      if (texto && !`${p.concepto} ${p.recibo ?? ""} ${cli.get(p.clienteId)?.nombre ?? ""} ${con.get(p.contratoId)?.codigo ?? ""}`.toLowerCase().includes(texto)) return false;
      return true;
    })
    // Pendientes primero (por vencimiento), luego pagados más recientes
    .sort((a, b) => {
      const pa = a.estado === "pendiente" ? 0 : 1;
      const pb = b.estado === "pendiente" ? 0 : 1;
      if (pa !== pb) return pa - pb;
      return pa === 0 ? a.vence.localeCompare(b.vence) : (b.pagadoEl ?? "").localeCompare(a.pagadoEl ?? "");
    });

  const sumar = (f: (p: (typeof pagos)[number]) => boolean) => filtrados.filter(f).reduce((s, p) => s + p.monto, 0);
  const totPagado = sumar((p) => p.estado === "pagado");
  const totPendiente = sumar((p) => p.estado === "pendiente" && p.vence >= h);
  const totVencido = sumar((p) => p.estado === "pendiente" && p.vence < h);
  const meses = Array.from({ length: 12 }, (_, i) => periodo(h, -i));

  return (
    <>
      <Encabezado
        titulo="Pagos y facturación"
        descripcion="Cobros programados, pagos recibidos y recibos. Las cuotas mensuales vencen el día 10."
      >
        <ActionForm action={generarCuotasDelMes} submitLabel={`Generar cuotas de ${nombrePeriodo(periodo(h), true)}`} submitClassName="btn-dark" className="flex flex-col items-end gap-2" />
      </Encabezado>

      <div className="mb-4 grid gap-4 sm:grid-cols-3">
        <div className="card p-4"><p className="text-xs font-semibold text-muted uppercase">Pagado</p><p className="mt-1 text-xl font-extrabold text-emerald-700">{dinero(totPagado)}</p></div>
        <div className="card p-4"><p className="text-xs font-semibold text-muted uppercase">Pendiente al día</p><p className="mt-1 text-xl font-extrabold text-navy">{dinero(totPendiente)}</p></div>
        <div className="card p-4"><p className="text-xs font-semibold text-muted uppercase">Vencido</p><p className={`mt-1 text-xl font-extrabold ${totVencido ? "text-red-700" : "text-navy"}`}>{dinero(totVencido)}</p></div>
      </div>

      <Filtros
        q={q}
        selects={[
          { name: "estado", label: "Todos los estados", value: estado, options: [["pendiente", "Por cobrar"], ["vencido", "Vencido"], ["pagado", "Pagado"], ["anulado", "Anulado"]] },
          { name: "mes", label: "Todos los meses", value: mes, options: meses.map((m) => [m, nombrePeriodo(m, true)] as const) },
        ]}
      />

      <div className="space-y-6">
        {filtrados.length === 0 ? (
          <Vacio>No hay cobros que coincidan con el filtro.</Vacio>
        ) : (
          <div className="card overflow-hidden">
            <TablaPagos pagos={filtrados} clientes={cli} contratos={con} />
          </div>
        )}
        <Seccion titulo="Programar un cobro">
          <div className="max-w-3xl p-4">
            <FormNuevoCobro contratos={contratos} clientes={cli} />
          </div>
        </Seccion>
      </div>
    </>
  );
}
