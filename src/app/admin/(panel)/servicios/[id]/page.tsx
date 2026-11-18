import { notFound } from "next/navigation";
import { ActionForm } from "@/components/ActionForm";
import { Encabezado } from "@/components/Encabezado";
import { FormServicio } from "@/components/Formularios";
import { getStore } from "@/lib/store";
import { eliminarServicio } from "@/app/admin/acciones";

export default async function EditarServicio({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const servicio = await getStore().get("servicio", id);
  if (!servicio) notFound();
  return (
    <>
      <Encabezado titulo={servicio.nombre} descripcion={servicio.linea} volver={{ href: "/admin/servicios", texto: "Servicios" }} />
      <div className="card max-w-3xl p-6">
        <FormServicio s={servicio} />
      </div>
      <ActionForm
        action={eliminarServicio}
        confirmar={`¿Eliminar el servicio "${servicio.nombre}"?`}
        submitLabel="Eliminar servicio"
        submitClassName="btn-danger"
        className="mt-6 grid max-w-3xl gap-2"
      >
        <input type="hidden" name="id" value={servicio.id} />
      </ActionForm>
    </>
  );
}
