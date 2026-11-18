import Link from "next/link";
import { notFound } from "next/navigation";
import { ActionForm } from "@/components/ActionForm";
import { Encabezado, Seccion } from "@/components/Encabezado";
import { Estado } from "@/components/Estado";
import { fechaHora } from "@/lib/fechas";
import { getStore } from "@/lib/store";
import { actualizarTicket, eliminarTicket } from "@/app/admin/acciones";

export default async function DetalleTicket({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const store = getStore();
  const t = await store.get("ticket", id);
  if (!t) notFound();
  const [cliente, contrato] = await Promise.all([
    store.get("cliente", t.clienteId),
    t.contratoId ? store.get("contrato", t.contratoId) : null,
  ]);

  return (
    <>
      <Encabezado
        titulo={`${t.numero} · ${t.asunto}`}
        descripcion={
          <span className="inline-flex flex-wrap items-center gap-2">
            <Link href={`/admin/clientes/${t.clienteId}`} className="font-semibold text-teal hover:underline">{cliente?.nombre}</Link>
            {contrato && <Link href={`/admin/contratos/${contrato.id}`} className="hover:underline">· {contrato.codigo}</Link>}
            · abierto el {fechaHora(t.creado)} <Estado valor={t.prioridad} /> <Estado valor={t.estado} />
          </span>
        }
        volver={{ href: "/admin/tickets", texto: "Soporte" }}
      />

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Seccion titulo="Conversación">
          <ol className="space-y-4 p-4">
            <li className="rounded-lg border border-line bg-mist/50 p-4">
              <p className="text-xs font-semibold text-muted">{cliente?.nombre ?? "Cliente"} · {fechaHora(t.creado)}</p>
              <p className="mt-1 text-sm whitespace-pre-line">{t.descripcion}</p>
            </li>
            {t.respuestas.map((r, i) => (
              <li key={i} className="ml-6 rounded-lg border border-teal/30 bg-white p-4">
                <p className="text-xs font-semibold text-teal">{r.autor} · {fechaHora(r.fecha)}</p>
                <p className="mt-1 text-sm whitespace-pre-line">{r.texto}</p>
              </li>
            ))}
          </ol>
        </Seccion>

        <div className="space-y-6">
          <Seccion titulo="Responder y actualizar">
            <ActionForm key={t.actualizado} action={actualizarTicket} submitLabel="Guardar" className="grid gap-4 p-4 sm:grid-cols-2">
              <input type="hidden" name="id" value={t.id} />
              <label className="field">
                <span>Estado</span>
                <select name="estado" defaultValue={t.estado} className="input">
                  <option value="abierto">Abierto</option>
                  <option value="en_progreso">En progreso</option>
                  <option value="resuelto">Resuelto</option>
                  <option value="cerrado">Cerrado</option>
                </select>
              </label>
              <label className="field">
                <span>Prioridad</span>
                <select name="prioridad" defaultValue={t.prioridad} className="input">
                  <option value="baja">Baja</option>
                  <option value="media">Media</option>
                  <option value="alta">Alta</option>
                </select>
              </label>
              <label className="field sm:col-span-2">
                <span>Respuesta <em className="font-normal text-muted">(opcional)</em></span>
                <textarea name="respuesta" rows={4} maxLength={3000} className="input" />
              </label>
            </ActionForm>
          </Seccion>
          <ActionForm
            action={eliminarTicket}
            confirmar={`¿Eliminar el ticket ${t.numero}?`}
            submitLabel="Eliminar ticket"
            submitClassName="btn-danger"
            className="grid gap-2"
          >
            <input type="hidden" name="id" value={t.id} />
          </ActionForm>
        </div>
      </div>
    </>
  );
}
