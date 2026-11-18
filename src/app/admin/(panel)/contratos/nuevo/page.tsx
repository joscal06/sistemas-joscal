import Link from "next/link";
import { Encabezado, Vacio } from "@/components/Encabezado";
import { FormContrato } from "@/components/Formularios";
import { listarClientes, listarServicios } from "@/lib/datos";

export const metadata = { title: "Nuevo contrato" };

export default async function NuevoContrato({ searchParams }: { searchParams: Promise<{ cliente?: string }> }) {
  const { cliente } = await searchParams;
  const [clientes, servicios] = await Promise.all([listarClientes(), listarServicios()]);
  return (
    <>
      <Encabezado titulo="Nuevo contrato" volver={{ href: "/admin/contratos", texto: "Contratos" }} />
      {clientes.length === 0 || servicios.length === 0 ? (
        <Vacio>
          Primero registra al menos un <Link href="/admin/clientes/nuevo" className="text-teal underline">cliente</Link> y un{" "}
          <Link href="/admin/servicios/nuevo" className="text-teal underline">servicio</Link>.
        </Vacio>
      ) : (
        <div className="card max-w-3xl p-6">
          <FormContrato clientes={clientes} servicios={servicios} clienteInicial={cliente} />
        </div>
      )}
    </>
  );
}
