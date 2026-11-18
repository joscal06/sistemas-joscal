const COLORES: Record<string, string> = {
  // clientes
  activo: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  prospecto: "bg-sky-50 text-sky-700 ring-1 ring-sky-200",
  inactivo: "bg-slate-100 text-slate-600 ring-1 ring-slate-200",
  // contratos
  propuesta: "bg-sky-50 text-sky-700 ring-1 ring-sky-200",
  en_curso: "bg-teal/10 text-teal-600 ring-1 ring-teal/30",
  entregado: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  cancelado: "bg-slate-100 text-slate-600 ring-1 ring-slate-200",
  // pagos
  pendiente: "bg-amber/15 text-amber-800 ring-1 ring-amber/40",
  vencido: "bg-red-50 text-red-700 ring-1 ring-red-200",
  pagado: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  anulado: "bg-slate-100 text-slate-500 ring-1 ring-slate-200 line-through",
  // solicitudes
  nueva: "bg-amber/15 text-amber-800 ring-1 ring-amber/40",
  contactada: "bg-sky-50 text-sky-700 ring-1 ring-sky-200",
  convertida: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  descartada: "bg-slate-100 text-slate-500 ring-1 ring-slate-200",
  // tickets
  abierto: "bg-amber/15 text-amber-800 ring-1 ring-amber/40",
  en_progreso: "bg-sky-50 text-sky-700 ring-1 ring-sky-200",
  resuelto: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  cerrado: "bg-slate-100 text-slate-600 ring-1 ring-slate-200",
  // prioridad
  alta: "bg-red-50 text-red-700 ring-1 ring-red-200",
  media: "bg-amber/15 text-amber-800 ring-1 ring-amber/40",
  baja: "bg-slate-100 text-slate-600 ring-1 ring-slate-200",
};

const TEXTOS: Record<string, string> = {
  en_curso: "En curso",
  en_progreso: "En progreso",
};

export function etiqueta(valor: string) {
  return TEXTOS[valor] ?? valor.charAt(0).toUpperCase() + valor.slice(1);
}

export function Estado({ valor }: { valor: string }) {
  return <span className={`badge ${COLORES[valor] ?? "bg-mist text-ink"}`}>{etiqueta(valor)}</span>;
}
