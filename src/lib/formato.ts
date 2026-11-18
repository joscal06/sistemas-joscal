import { dinero } from "./fechas";
import type { Servicio } from "./types";

export function precioServicio(s: Pick<Servicio, "tipo" | "precio" | "precioMax">): string {
  if (s.tipo === "mensual") return `${dinero(s.precio, true)} al mes`;
  if (s.tipo === "paquete") return `${dinero(s.precio, true)} por paquete`;
  if (s.precioMax && s.precioMax > s.precio)
    return `${dinero(s.precio, true)} a ${dinero(s.precioMax, true)}`;
  return `Desde ${dinero(s.precio, true)}`;
}

export const ETIQUETA_TIPO: Record<Servicio["tipo"], string> = {
  proyecto: "Proyecto",
  paquete: "Paquete",
  mensual: "Mensual",
};
