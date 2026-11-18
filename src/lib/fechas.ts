/** Utilidades de fecha y formato en la zona horaria de El Salvador. */
export const TZ = "America/El_Salvador";

/** Fecha de hoy como YYYY-MM-DD en El Salvador */
export function hoy(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

/** Suma días a una fecha YYYY-MM-DD */
export function sumarDias(fecha: string, dias: number): string {
  const d = new Date(`${fecha}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + dias);
  return d.toISOString().slice(0, 10);
}

/** Periodo YYYY-MM desplazado n meses desde la fecha dada */
export function periodo(fecha: string, desplazamiento = 0): string {
  const [y, m] = fecha.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + desplazamiento, 1));
  return d.toISOString().slice(0, 7);
}

export function ahoraISO(): string {
  return new Date().toISOString();
}

const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const MESES_LARGOS = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

/** 2026-11-18 → 18 nov 2026 */
export function fechaCorta(fecha?: string): string {
  if (!fecha) return "—";
  const [y, m, d] = fecha.slice(0, 10).split("-").map(Number);
  return `${d} ${MESES[m - 1]} ${y}`;
}

/** 2026-11-18 → 18 de noviembre de 2026 */
export function fechaLarga(fecha?: string): string {
  if (!fecha) return "—";
  const [y, m, d] = fecha.slice(0, 10).split("-").map(Number);
  return `${d} de ${MESES_LARGOS[m - 1]} de ${y}`;
}

/** 2026-11 → nov 2026 */
export function nombrePeriodo(p: string, largo = false): string {
  const [y, m] = p.split("-").map(Number);
  return `${(largo ? MESES_LARGOS : MESES)[m - 1]} ${y}`;
}

/** Fecha y hora local de un ISO */
export function fechaHora(iso?: string): string {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("es-SV", {
    timeZone: TZ,
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const usd0 = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function dinero(n: number, sinCentavos = false): string {
  return (sinCentavos ? usd0 : usd).format(n);
}
