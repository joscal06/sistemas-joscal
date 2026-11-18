import Link from "next/link";
import { Encabezado, Vacio } from "@/components/Encabezado";
import { listarContratos, listarServicios } from "@/lib/datos";
import { ETIQUETA_TIPO, precioServicio } from "@/lib/formato";

export const metadata = { title: "Servicios" };

export default async function Servicios() {
  const [servicios, contratos] = await Promise.all([listarServicios(), listarContratos()]);
  return (
    <>
      <Encabezado
        titulo="Catálogo de servicios"
        descripcion="Lo que se marca como público aparece en el sitio web con su precio."
      >
        <Link href="/admin/servicios/nuevo" className="btn-primary">Nuevo servicio</Link>
      </Encabezado>
      {servicios.length === 0 ? (
        <Vacio>No hay servicios en el catálogo.</Vacio>
      ) : (
        <div className="card overflow-x-auto">
          <table className="tabla">
            <thead>
              <tr><th>#</th><th>Servicio</th><th>Línea</th><th>Tipo</th><th>Precio</th><th>Contratos activos</th><th>Visibilidad</th></tr>
            </thead>
            <tbody>
              {servicios.map((s) => (
                <tr key={s.id} className={s.activo ? "" : "opacity-60"}>
                  <td className="text-muted">{s.orden}</td>
                  <td>
                    <Link href={`/admin/servicios/${s.id}`} className="font-semibold text-navy hover:text-teal">{s.nombre}</Link>
                    <p className="max-w-md text-xs text-muted">{s.descripcion}</p>
                  </td>
                  <td>{s.linea}</td>
                  <td>{ETIQUETA_TIPO[s.tipo]}</td>
                  <td className="font-semibold whitespace-nowrap">{precioServicio(s)}</td>
                  <td>{contratos.filter((c) => c.servicioId === s.id && c.estado === "en_curso").length}</td>
                  <td className="text-xs">
                    {s.activo ? "Activo" : "Inactivo"} · {s.publico ? "Público" : "Interno"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
