import Link from "next/link";
import { ActionForm } from "@/components/ActionForm";
import { Encabezado, Vacio } from "@/components/Encabezado";
import { Estado } from "@/components/Estado";
import { Filtros } from "@/components/Filtros";
import { listarSolicitudes } from "@/lib/datos";
import { fechaHora } from "@/lib/fechas";
import { cambiarEstadoSolicitud, convertirSolicitud, eliminarSolicitud } from "@/app/admin/acciones";

export const metadata = { title: "Solicitudes" };

export default async function Solicitudes({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const { estado = "" } = await searchParams;
  const todas = await listarSolicitudes();
  const lista = todas.filter((s) => !estado || s.estado === estado);

  return (
    <>
      <Encabezado
        titulo="Solicitudes de diagnóstico"
        descripcion="Llegan desde el formulario del sitio público. Conviértelas en cliente cuando avance la conversación."
      >
        <Link href="/#contacto" className="btn-ghost" target="_blank">Ver formulario público</Link>
      </Encabezado>
      <Filtros
        conBusqueda={false}
        selects={[{ name: "estado", label: "Todas", value: estado, options: [["nueva", "Nuevas"], ["contactada", "Contactadas"], ["convertida", "Convertidas"], ["descartada", "Descartadas"]] }]}
      />
      {lista.length === 0 ? (
        <Vacio>No hay solicitudes{estado ? " con ese estado" : ""}.</Vacio>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {lista.map((s) => (
            <article key={s.id} className="card flex flex-col p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-bold text-navy">{s.organizacion}</h2>
                  <p className="text-sm text-muted">{s.nombre} · {s.email}{s.telefono && ` · ${s.telefono}`}</p>
                </div>
                <Estado valor={s.estado} />
              </div>
              <p className="mt-2 flex flex-wrap gap-2 text-xs">
                <span className="badge bg-mist text-navy">{s.segmento}</span>
                <span className="badge bg-mist text-navy">{s.interes}</span>
                <span className="text-muted">{fechaHora(s.creado)}</span>
              </p>
              <p className="mt-3 flex-1 text-sm whitespace-pre-line">{s.mensaje}</p>
              <div className="mt-4 flex flex-wrap gap-2 border-t border-line pt-3">
                {s.estado === "convertida" && s.clienteId ? (
                  <Link href={`/admin/clientes/${s.clienteId}`} className="btn-ghost btn-sm">Ver cliente</Link>
                ) : (
                  <>
                    <ActionForm action={convertirSolicitud} sinBoton>
                      <input type="hidden" name="id" value={s.id} />
                      <button className="btn-primary btn-sm">Convertir en cliente</button>
                    </ActionForm>
                    {s.estado !== "contactada" && (
                      <ActionForm action={cambiarEstadoSolicitud} sinBoton>
                        <input type="hidden" name="id" value={s.id} />
                        <button name="estado" value="contactada" className="btn-ghost btn-sm">Marcar contactada</button>
                      </ActionForm>
                    )}
                    {s.estado !== "descartada" && (
                      <ActionForm action={cambiarEstadoSolicitud} sinBoton>
                        <input type="hidden" name="id" value={s.id} />
                        <button name="estado" value="descartada" className="btn-ghost btn-sm">Descartar</button>
                      </ActionForm>
                    )}
                  </>
                )}
                <ActionForm action={eliminarSolicitud} sinBoton confirmar="¿Eliminar esta solicitud?" className="ml-auto">
                  <input type="hidden" name="id" value={s.id} />
                  <button className="btn-danger btn-sm">Eliminar</button>
                </ActionForm>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
