import { Encabezado } from "@/components/Encabezado";
import { FormCliente } from "@/components/Formularios";

export const metadata = { title: "Nuevo cliente" };

export default function NuevoCliente() {
  return (
    <>
      <Encabezado titulo="Nuevo cliente" volver={{ href: "/admin/clientes", texto: "Clientes" }} />
      <div className="card max-w-3xl p-6">
        <FormCliente />
      </div>
    </>
  );
}
