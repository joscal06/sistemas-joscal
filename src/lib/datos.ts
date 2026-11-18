import "server-only";
import { getStore } from "./store";
import { hoy, periodo } from "./fechas";
import type { Cliente, Contrato, Pago, Servicio, Solicitud, Ticket } from "./types";

/** Estado visible de un pago: "vencido" se calcula, no se guarda. */
export function estadoPago(p: Pago, fechaHoy = hoy()): "pendiente" | "vencido" | "pagado" | "anulado" {
  if (p.estado === "pendiente" && p.vence < fechaHoy) return "vencido";
  return p.estado;
}

const porNombre = <T extends { nombre: string }>(a: T, b: T) => a.nombre.localeCompare(b.nombre, "es");
const recientes = <T extends { creado: string }>(a: T, b: T) => b.creado.localeCompare(a.creado);

export async function listarServicios(): Promise<Servicio[]> {
  return (await getStore().list("servicio")).sort((a, b) => a.orden - b.orden || porNombre(a, b));
}
export async function listarClientes(): Promise<Cliente[]> {
  return (await getStore().list("cliente")).sort(porNombre);
}
export async function listarContratos(): Promise<Contrato[]> {
  return (await getStore().list("contrato")).sort((a, b) => b.codigo.localeCompare(a.codigo));
}
export async function listarPagos(): Promise<Pago[]> {
  return (await getStore().list("pago")).sort((a, b) => a.vence.localeCompare(b.vence));
}
export async function listarSolicitudes(): Promise<Solicitud[]> {
  return (await getStore().list("solicitud")).sort(recientes);
}
export async function listarTickets(): Promise<Ticket[]> {
  return (await getStore().list("ticket")).sort((a, b) => b.actualizado.localeCompare(a.actualizado));
}

export function indice<T extends { id: string }>(items: T[]): Map<string, T> {
  return new Map(items.map((i) => [i.id, i]));
}

/** Indicadores del tablero principal */
export async function indicadores() {
  const [clientes, contratos, pagos, solicitudes, tickets] = await Promise.all([
    listarClientes(),
    listarContratos(),
    listarPagos(),
    listarSolicitudes(),
    listarTickets(),
  ]);
  const h = hoy();
  const mes = periodo(h);
  const anio = h.slice(0, 4);

  const pagados = pagos.filter((p) => p.estado === "pagado" && p.pagadoEl);
  const cobradoMes = pagados.filter((p) => p.pagadoEl!.startsWith(mes)).reduce((s, p) => s + p.monto, 0);
  const cobradoAnio = pagados.filter((p) => p.pagadoEl!.startsWith(anio)).reduce((s, p) => s + p.monto, 0);
  const pendientes = pagos.filter((p) => p.estado === "pendiente");
  const porCobrar = pendientes.reduce((s, p) => s + p.monto, 0);
  const vencidos = pendientes.filter((p) => p.vence < h);
  const montoVencido = vencidos.reduce((s, p) => s + p.monto, 0);

  const activosMensuales = contratos.filter((c) => c.modalidad === "mensual" && c.estado === "en_curso");
  const ingresoRecurrente = activosMensuales.reduce((s, c) => s + c.monto, 0);
  const proyectosEnCurso = contratos.filter((c) => c.modalidad === "unico" && c.estado === "en_curso");
  const propuestas = contratos.filter((c) => c.estado === "propuesta");

  // Cobros de los últimos 6 meses (incluido el actual)
  const serie = Array.from({ length: 6 }, (_, i) => {
    const p = periodo(h, i - 5);
    const monto = pagados.filter((x) => x.pagadoEl!.startsWith(p)).reduce((s, x) => s + x.monto, 0);
    return { periodo: p, monto };
  });

  // Ingresos cobrados por línea de servicio en el año
  const servicios = await listarServicios();
  const srv = indice(servicios);
  const con = indice(contratos);
  const porLinea = new Map<string, number>();
  for (const p of pagados.filter((x) => x.pagadoEl!.startsWith(anio))) {
    const linea = srv.get(con.get(p.contratoId)?.servicioId ?? "")?.linea ?? "Otros";
    porLinea.set(linea, (porLinea.get(linea) ?? 0) + p.monto);
  }

  return {
    hoy: h,
    clientesActivos: clientes.filter((c) => c.estado === "activo").length,
    prospectos: clientes.filter((c) => c.estado === "prospecto").length,
    cobradoMes,
    cobradoAnio,
    porCobrar,
    montoVencido,
    vencidos,
    ingresoRecurrente,
    contratosMensuales: activosMensuales.length,
    proyectosEnCurso,
    propuestas,
    ticketsAbiertos: tickets.filter((t) => t.estado === "abierto" || t.estado === "en_progreso"),
    solicitudesNuevas: solicitudes.filter((s) => s.estado === "nueva"),
    serie,
    porLinea: [...porLinea.entries()].sort((a, b) => b[1] - a[1]),
    clientes,
    contratos,
    pendientes,
  };
}
