import { notFound } from "next/navigation";
import { Encabezado } from "@/components/Encabezado";
import { Logo } from "@/components/Logo";
import { BotonImprimir } from "@/components/BotonImprimir";
import { dinero, fechaLarga } from "@/lib/fechas";
import { getStore } from "@/lib/store";

export const metadata = { title: "Recibo de pago" };

export default async function Recibo({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const store = getStore();
  const pago = await store.get("pago", id);
  if (!pago || pago.estado !== "pagado") notFound();
  const [cliente, contrato] = await Promise.all([
    store.get("cliente", pago.clienteId),
    store.get("contrato", pago.contratoId),
  ]);
  const servicio = contrato ? await store.get("servicio", contrato.servicioId) : null;

  return (
    <>
      <div className="no-print">
        <Encabezado titulo={`Recibo ${pago.recibo}`} volver={{ href: "/admin/pagos", texto: "Pagos" }}>
          <BotonImprimir />
        </Encabezado>
      </div>

      <article className="card mx-auto max-w-3xl p-8 print:border-0 print:p-0">
        <header className="flex flex-wrap items-start justify-between gap-4 border-b-2 border-navy pb-5">
          <div>
            <Logo />
            <p className="mt-2 text-xs text-muted">Tecnología para gestionar, monitorear y decidir mejor · El Salvador</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold tracking-wide text-muted uppercase">Recibo de pago</p>
            <p className="font-mono text-xl font-bold text-navy">{pago.recibo}</p>
            <p className="text-sm text-muted">{fechaLarga(pago.pagadoEl)}</p>
          </div>
        </header>

        <section className="grid gap-6 py-6 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold tracking-wide text-muted uppercase">Recibimos de</p>
            <p className="mt-1 font-bold text-ink">{cliente?.nombre ?? "—"}</p>
            {cliente?.contacto && <p className="text-sm text-muted">{cliente.contacto}</p>}
            {cliente?.email && <p className="text-sm text-muted">{cliente.email}</p>}
          </div>
          <div className="sm:text-right">
            <p className="text-xs font-semibold tracking-wide text-muted uppercase">Contrato</p>
            <p className="mt-1 font-mono font-bold text-ink">{contrato?.codigo ?? "—"}</p>
            <p className="text-sm text-muted">{contrato?.titulo}</p>
          </div>
        </section>

        <table className="tabla">
          <thead>
            <tr><th>Descripción</th><th>Método</th><th className="text-right">Importe</th></tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <p className="font-semibold">{pago.concepto}</p>
                <p className="text-xs text-muted">{servicio?.nombre}</p>
              </td>
              <td>{pago.metodo}</td>
              <td className="text-right font-semibold">{dinero(pago.monto)}</td>
            </tr>
          </tbody>
        </table>
        <div className="mt-4 flex justify-end">
          <div className="w-64 rounded-lg bg-mist p-4 text-right">
            <p className="text-xs font-semibold tracking-wide text-muted uppercase">Total recibido</p>
            <p className="text-2xl font-extrabold text-navy">{dinero(pago.monto)}</p>
          </div>
        </div>

        <footer className="mt-10 border-t border-line pt-4 text-xs text-muted">
          Comprobante interno de pago emitido por el panel de Sistemas Joscal. No sustituye el documento tributario
          electrónico correspondiente.
        </footer>
      </article>
    </>
  );
}
