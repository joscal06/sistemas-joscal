export const SEGMENTOS = ["ONG", "Educación", "PYME", "Emprendimiento"] as const;
export type Segmento = (typeof SEGMENTOS)[number];

export const LINEAS = [
  "Desarrollo web",
  "MEAL y tableros",
  "Automatización",
  "IA y datos",
  "Soporte",
  "Plataforma",
] as const;
export type Linea = (typeof LINEAS)[number];

export interface Cliente {
  id: string;
  nombre: string;
  segmento: Segmento;
  contacto: string;
  email: string;
  telefono: string;
  municipio: string;
  estado: "activo" | "prospecto" | "inactivo";
  notas: string;
  creado: string;
}

export interface Servicio {
  id: string;
  nombre: string;
  linea: Linea;
  descripcion: string;
  /** proyecto = precio único; paquete = precio por paquete; mensual = cuota mensual */
  tipo: "proyecto" | "paquete" | "mensual";
  precio: number;
  /** Precio máximo opcional para mostrar un rango ("desde … hasta …") */
  precioMax?: number;
  activo: boolean;
  publico: boolean;
  orden: number;
  creado: string;
}

export interface Contrato {
  id: string;
  codigo: string;
  clienteId: string;
  servicioId: string;
  titulo: string;
  modalidad: "unico" | "mensual";
  /** Monto total (único) o cuota mensual (mensual) */
  monto: number;
  anticipoPct: number;
  estado: "propuesta" | "en_curso" | "entregado" | "cancelado";
  avance: number;
  inicio: string;
  fin: string;
  notas: string;
  creado: string;
}

export interface Pago {
  id: string;
  contratoId: string;
  clienteId: string;
  concepto: string;
  /** YYYY-MM para cuotas mensuales; evita generar dos veces la misma cuota */
  periodo?: string;
  monto: number;
  vence: string;
  estado: "pendiente" | "pagado" | "anulado";
  pagadoEl?: string;
  metodo?: string;
  recibo?: string;
  creado: string;
}

export interface Solicitud {
  id: string;
  nombre: string;
  organizacion: string;
  email: string;
  telefono: string;
  segmento: Segmento;
  interes: string;
  mensaje: string;
  estado: "nueva" | "contactada" | "convertida" | "descartada";
  clienteId?: string;
  creado: string;
}

export interface Respuesta {
  fecha: string;
  autor: string;
  texto: string;
}

export interface Ticket {
  id: string;
  numero: string;
  clienteId: string;
  contratoId?: string;
  asunto: string;
  descripcion: string;
  prioridad: "baja" | "media" | "alta";
  estado: "abierto" | "en_progreso" | "resuelto" | "cerrado";
  respuestas: Respuesta[];
  creado: string;
  actualizado: string;
}

export type EntityMap = {
  cliente: Cliente;
  servicio: Servicio;
  contrato: Contrato;
  pago: Pago;
  solicitud: Solicitud;
  ticket: Ticket;
};
export type EntityName = keyof EntityMap;
