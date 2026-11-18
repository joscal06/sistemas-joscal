import { Encabezado } from "@/components/Encabezado";
import { FormServicio } from "@/components/Formularios";

export const metadata = { title: "Nuevo servicio" };

export default function NuevoServicio() {
  return (
    <>
      <Encabezado titulo="Nuevo servicio" volver={{ href: "/admin/servicios", texto: "Servicios" }} />
      <div className="card max-w-3xl p-6">
        <FormServicio />
      </div>
    </>
  );
}
