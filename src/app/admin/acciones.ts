"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import {
  cerrarSesion,
  credencialesValidas,
  iniciarSesion,
  loginConfigurado,
  requerirAdmin,
} from "@/lib/auth";
import { cargarDatosDeEjemplo, getStore } from "@/lib/store";
import { ahoraISO, hoy, nombrePeriodo, periodo, sumarDias } from "@/lib/fechas";
import { LINEAS, SEGMENTOS, type Contrato, type Pago, type Ticket } from "@/lib/types";

type Resultado = { error?: string; ok?: string } | void;

const primerError = (e: z.ZodError) => e.issues[0]?.message ?? "Revisa los datos del formulario.";
const datos = (fd: FormData) => Object.fromEntries(fd);
const nuevoId = () => crypto.randomUUID();
const fecha = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha no válida.");
const opcional = z.string().trim().max(500).optional().default("");

function refrescar() {
  revalidatePath("/admin", "layout");
  revalidatePath("/");
}

// ---------------------------------------------------------------------------
// Sesión
// ---------------------------------------------------------------------------
export async function entrar(fd: FormData): Promise<Resultado> {
  if (!loginConfigurado())
    return { error: "El acceso no está configurado: faltan ADMIN_EMAIL, ADMIN_PASSWORD o SESSION_SECRET." };
  const email = String(fd.get("email") ?? "");
  const password = String(fd.get("password") ?? "");
  if (!credencialesValidas(email, password)) {
    await new Promise((r) => setTimeout(r, 600));
    return { error: "Correo o contraseña incorrectos." };
  }
  await iniciarSesion(email);
  const next = String(fd.get("next") ?? "");
  redirect(next.startsWith("/admin") && !next.startsWith("//") ? next : "/admin");
}

export async function salir() {
  await cerrarSesion();
  redirect("/admin/login");
}

export async function sembrarDatos(): Promise<Resultado> {
  await requerirAdmin();
  const store = getStore();
  const [s, c] = await Promise.all([store.list("servicio"), store.list("cliente")]);
  if (s.length || c.length) return { error: "La base ya tiene datos; no se cargaron los de ejemplo." };
  await cargarDatosDeEjemplo();
  refrescar();
  return { ok: "Datos de ejemplo cargados." };
}

// ---------------------------------------------------------------------------
// Clientes
// ---------------------------------------------------------------------------
const esquemaCliente = z.object({
  nombre: z.string().trim().min(2, "Escribe el nombre del cliente.").max(120),
  segmento: z.enum(SEGMENTOS, { message: "Elige un segmento." }),
  contacto: opcional,
  email: z.union([z.literal(""), z.string().trim().toLowerCase().email("El correo no es válido.")]).default(""),
  telefono: z.string().trim().max(30).optional().default(""),
  municipio: z.string().trim().max(80).optional().default(""),
  estado: z.enum(["activo", "prospecto", "inactivo"]),
  notas: z.string().trim().max(2000).optional().default(""),
});

export async function guardarCliente(fd: FormData): Promise<Resultado> {
  await requerirAdmin();
  const r = esquemaCliente.safeParse(datos(fd));
  if (!r.success) return { error: primerError(r.error) };
  const store = getStore();
  const id = String(fd.get("id") || "");
  const previo = id ? await store.get("cliente", id) : null;
  if (id && !previo) return { error: "El cliente ya no existe." };
  const cliente = { id: id || nuevoId(), creado: previo?.creado ?? ahoraISO(), ...r.data };
  await store.put("cliente", cliente);
  refrescar();
  if (!id) redirect(`/admin/clientes/${cliente.id}`);
  return { ok: "Cliente actualizado." };
}

export async function eliminarCliente(fd: FormData): Promise<Resultado> {
  await requerirAdmin();
  const id = String(fd.get("id"));
  const store = getStore();
  const [contratos, tickets] = await Promise.all([store.list("contrato"), store.list("ticket")]);
  if (contratos.some((c) => c.clienteId === id) || tickets.some((t) => t.clienteId === id))
    return { error: "No se puede eliminar: el cliente tiene contratos o tickets. Márcalo como inactivo." };
  await store.remove("cliente", id);
  refrescar();
  redirect("/admin/clientes");
}

// ---------------------------------------------------------------------------
// Servicios
// ---------------------------------------------------------------------------
const esquemaServicio = z
  .object({
    nombre: z.string().trim().min(3, "Escribe el nombre del servicio.").max(120),
    linea: z.enum(LINEAS, { message: "Elige una línea de servicio." }),
    tipo: z.enum(["proyecto", "paquete", "mensual"]),
    descripcion: z.string().trim().max(600).optional().default(""),
    precio: z.coerce.number({ message: "Precio no válido." }).min(0, "El precio no puede ser negativo.").max(1_000_000),
    precioMax: z.preprocess((v) => (v === "" || v == null ? undefined : v), z.coerce.number().min(0).max(1_000_000).optional()),
    orden: z.coerce.number().int().min(0).max(999).default(0),
    activo: z.preprocess((v) => v === "on", z.boolean()),
    publico: z.preprocess((v) => v === "on", z.boolean()),
  })
  .refine((s) => s.precioMax === undefined || s.precioMax >= s.precio, {
    message: "El precio máximo debe ser mayor o igual al precio base.",
  });

export async function guardarServicio(fd: FormData): Promise<Resultado> {
  await requerirAdmin();
  const r = esquemaServicio.safeParse({ ...datos(fd), activo: fd.get("activo"), publico: fd.get("publico") });
  if (!r.success) return { error: primerError(r.error) };
  const store = getStore();
  const id = String(fd.get("id") || "");
  const previo = id ? await store.get("servicio", id) : null;
  await store.put("servicio", {
    id: id || nuevoId(),
    creado: previo?.creado ?? ahoraISO(),
    ...r.data,
    precioMax: r.data.tipo === "proyecto" ? r.data.precioMax : undefined,
  });
  refrescar();
  if (!id) redirect("/admin/servicios");
  return { ok: "Servicio actualizado." };
}

export async function eliminarServicio(fd: FormData): Promise<Resultado> {
  await requerirAdmin();
  const id = String(fd.get("id"));
  const store = getStore();
  if ((await store.list("contrato")).some((c) => c.servicioId === id))
    return { error: "No se puede eliminar: hay contratos con este servicio. Desactívalo en su lugar." };
  await store.remove("servicio", id);
  refrescar();
  redirect("/admin/servicios");
}

// ---------------------------------------------------------------------------
// Contratos y proyectos
// ---------------------------------------------------------------------------
const esquemaContrato = z
  .object({
    clienteId: z.string().min(1, "Elige un cliente."),
    servicioId: z.string().min(1, "Elige un servicio."),
    titulo: z.string().trim().min(3, "Escribe un título para el contrato.").max(160),
    modalidad: z.enum(["unico", "mensual"]),
    monto: z.coerce.number({ message: "Monto no válido." }).positive("El monto debe ser mayor que cero.").max(1_000_000),
    anticipoPct: z.coerce.number().min(0).max(100).default(50),
    estado: z.enum(["propuesta", "en_curso", "entregado", "cancelado"]),
    avance: z.coerce.number().int().min(0).max(100).default(0),
    inicio: fecha,
    fin: z.union([z.literal(""), fecha]).default(""),
    notas: z.string().trim().max(2000).optional().default(""),
  })
  .refine((c) => !c.fin || c.fin >= c.inicio, { message: "La fecha de fin no puede ser anterior al inicio." });

export async function guardarContrato(fd: FormData): Promise<Resultado> {
  await requerirAdmin();
  const r = esquemaContrato.safeParse(datos(fd));
  if (!r.success) return { error: primerError(r.error) };
  const store = getStore();
  const id = String(fd.get("id") || "");
  const previo = id ? await store.get("contrato", id) : null;
  if (id && !previo) return { error: "El contrato ya no existe." };

  const [cliente, servicio] = await Promise.all([
    store.get("cliente", r.data.clienteId),
    store.get("servicio", r.data.servicioId),
  ]);
  if (!cliente || !servicio) return { error: "El cliente o el servicio no existen." };

  let codigo = previo?.codigo;
  if (!codigo) {
    const anio = r.data.inicio.slice(0, 4);
    codigo = `C-${anio}-${String(await store.next(`contrato-${anio}`)).padStart(3, "0")}`;
  }
  const contrato: Contrato = {
    id: id || nuevoId(),
    codigo,
    creado: previo?.creado ?? ahoraISO(),
    ...r.data,
    anticipoPct: r.data.modalidad === "unico" ? r.data.anticipoPct : 0,
    fin: r.data.modalidad === "unico" ? r.data.fin : "",
    avance: r.data.estado === "entregado" ? 100 : r.data.avance,
  };
  await store.put("contrato", contrato);

  // Plan de pagos automático al crear
  if (!id && fd.get("generarPagos") === "on") {
    const base = { contratoId: contrato.id, clienteId: contrato.clienteId, estado: "pendiente" as const, creado: ahoraISO() };
    if (contrato.modalidad === "unico") {
      const anticipo = Math.round(contrato.monto * contrato.anticipoPct) / 100;
      if (anticipo > 0)
        await store.put("pago", { ...base, id: nuevoId(), concepto: `Anticipo ${contrato.anticipoPct} %`, monto: anticipo, vence: contrato.inicio });
      if (contrato.monto - anticipo > 0)
        await store.put("pago", {
          ...base, id: nuevoId(), concepto: anticipo > 0 ? "Saldo contra entrega" : "Pago único",
          monto: Math.round((contrato.monto - anticipo) * 100) / 100,
          vence: contrato.fin || sumarDias(contrato.inicio, 30),
        });
    } else {
      const p = periodo(contrato.inicio);
      await store.put("pago", {
        ...base, id: nuevoId(), concepto: `Cuota ${nombrePeriodo(p, true)}`, periodo: p, monto: contrato.monto,
        vence: sumarDias(contrato.inicio, 10),
      });
    }
  }
  refrescar();
  if (!id) redirect(`/admin/contratos/${contrato.id}`);
  return { ok: "Contrato actualizado." };
}

// ---------------------------------------------------------------------------
// Pagos y facturación
// ---------------------------------------------------------------------------
const esquemaPago = z.object({
  contratoId: z.string().min(1, "Elige un contrato."),
  concepto: z.string().trim().min(3, "Escribe el concepto del cobro.").max(160),
  monto: z.coerce.number({ message: "Monto no válido." }).positive("El monto debe ser mayor que cero.").max(1_000_000),
  vence: fecha,
});

export async function crearPago(fd: FormData): Promise<Resultado> {
  await requerirAdmin();
  const r = esquemaPago.safeParse(datos(fd));
  if (!r.success) return { error: primerError(r.error) };
  const store = getStore();
  const contrato = await store.get("contrato", r.data.contratoId);
  if (!contrato) return { error: "El contrato no existe." };
  await store.put("pago", {
    id: nuevoId(), ...r.data, clienteId: contrato.clienteId, estado: "pendiente", creado: ahoraISO(),
  });
  refrescar();
  return { ok: "Cobro programado." };
}

const esquemaRegistro = z.object({
  id: z.string().min(1),
  pagadoEl: fecha,
  metodo: z.enum(["Transferencia", "Efectivo", "Tarjeta", "Cheque"], { message: "Elige el método de pago." }),
});

export async function registrarPago(fd: FormData): Promise<Resultado> {
  await requerirAdmin();
  const r = esquemaRegistro.safeParse(datos(fd));
  if (!r.success) return { error: primerError(r.error) };
  if (r.data.pagadoEl > hoy()) return { error: "La fecha de pago no puede ser futura." };
  const store = getStore();
  const pago = await store.get("pago", r.data.id);
  if (!pago) return { error: "El cobro no existe." };
  if (pago.estado !== "pendiente") return { error: "Este cobro ya no está pendiente." };
  const recibo = `R-${String(await store.next("recibo")).padStart(6, "0")}`;
  await store.put("pago", { ...pago, estado: "pagado", pagadoEl: r.data.pagadoEl, metodo: r.data.metodo, recibo });
  refrescar();
  return { ok: `Pago registrado. Recibo ${recibo}.` };
}

export async function anularPago(fd: FormData): Promise<Resultado> {
  await requerirAdmin();
  const store = getStore();
  const pago = await store.get("pago", String(fd.get("id")));
  if (!pago) return { error: "El cobro no existe." };
  if (pago.estado !== "pendiente") return { error: "Solo se pueden anular cobros pendientes." };
  await store.put("pago", { ...pago, estado: "anulado" });
  refrescar();
  return { ok: "Cobro anulado." };
}

/** Genera las cuotas del mes de todos los contratos mensuales en curso (no duplica). */
export async function generarCuotasDelMes(): Promise<Resultado> {
  await requerirAdmin();
  const store = getStore();
  const h = hoy();
  const p = periodo(h);
  const [contratos, pagos] = await Promise.all([store.list("contrato"), store.list("pago")]);
  const yaGenerados = new Set(pagos.filter((x) => x.periodo === p).map((x) => x.contratoId));
  const nuevos: Pago[] = contratos
    .filter((c) => c.modalidad === "mensual" && c.estado === "en_curso" && !yaGenerados.has(c.id) && c.inicio.slice(0, 7) <= p)
    .map((c) => ({
      id: nuevoId(), contratoId: c.id, clienteId: c.clienteId, concepto: `Cuota ${nombrePeriodo(p, true)}`, periodo: p,
      monto: c.monto, vence: `${p}-10`, estado: "pendiente", creado: ahoraISO(),
    }));
  for (const n of nuevos) await store.put("pago", n);
  refrescar();
  return nuevos.length
    ? { ok: `Se generaron ${nuevos.length} cuota(s) de ${nombrePeriodo(p, true)}.` }
    : { ok: `Las cuotas de ${nombrePeriodo(p, true)} ya estaban generadas.` };
}

// ---------------------------------------------------------------------------
// Solicitudes
// ---------------------------------------------------------------------------
export async function cambiarEstadoSolicitud(fd: FormData): Promise<Resultado> {
  await requerirAdmin();
  const estado = z.enum(["nueva", "contactada", "descartada"]).safeParse(fd.get("estado"));
  if (!estado.success) return { error: "Estado no válido." };
  const store = getStore();
  const s = await store.get("solicitud", String(fd.get("id")));
  if (!s) return { error: "La solicitud no existe." };
  await store.put("solicitud", { ...s, estado: estado.data });
  refrescar();
}

export async function convertirSolicitud(fd: FormData): Promise<Resultado> {
  await requerirAdmin();
  const store = getStore();
  const s = await store.get("solicitud", String(fd.get("id")));
  if (!s) return { error: "La solicitud no existe." };
  if (s.clienteId) redirect(`/admin/clientes/${s.clienteId}`);
  const clienteId = nuevoId();
  await store.put("cliente", {
    id: clienteId, nombre: s.organizacion, segmento: s.segmento, contacto: s.nombre, email: s.email,
    telefono: s.telefono, municipio: "", estado: "prospecto",
    notas: `Llegó por el formulario de diagnóstico (interés: ${s.interes}).\n\n${s.mensaje}`, creado: ahoraISO(),
  });
  await store.put("solicitud", { ...s, estado: "convertida", clienteId });
  refrescar();
  redirect(`/admin/clientes/${clienteId}`);
}

export async function eliminarSolicitud(fd: FormData): Promise<Resultado> {
  await requerirAdmin();
  await getStore().remove("solicitud", String(fd.get("id")));
  refrescar();
}

// ---------------------------------------------------------------------------
// Tickets de soporte
// ---------------------------------------------------------------------------
const esquemaTicket = z.object({
  clienteId: z.string().min(1, "Elige un cliente."),
  contratoId: z.string().optional().default(""),
  asunto: z.string().trim().min(4, "Escribe el asunto.").max(160),
  descripcion: z.string().trim().min(5, "Describe el problema.").max(3000),
  prioridad: z.enum(["baja", "media", "alta"]),
});

export async function crearTicket(fd: FormData): Promise<Resultado> {
  await requerirAdmin();
  const r = esquemaTicket.safeParse(datos(fd));
  if (!r.success) return { error: primerError(r.error) };
  const store = getStore();
  if (!(await store.get("cliente", r.data.clienteId))) return { error: "El cliente no existe." };
  const numero = `T-${String(await store.next("ticket")).padStart(4, "0")}`;
  const ahora = ahoraISO();
  const ticket: Ticket = {
    id: nuevoId(), numero, ...r.data, contratoId: r.data.contratoId || undefined,
    estado: "abierto", respuestas: [], creado: ahora, actualizado: ahora,
  };
  await store.put("ticket", ticket);
  refrescar();
  redirect(`/admin/tickets/${ticket.id}`);
}

export async function actualizarTicket(fd: FormData): Promise<Resultado> {
  const sesion = await requerirAdmin();
  const r = z
    .object({
      id: z.string().min(1),
      estado: z.enum(["abierto", "en_progreso", "resuelto", "cerrado"]),
      prioridad: z.enum(["baja", "media", "alta"]),
      respuesta: z.string().trim().max(3000).optional().default(""),
    })
    .safeParse(datos(fd));
  if (!r.success) return { error: primerError(r.error) };
  const store = getStore();
  const t = await store.get("ticket", r.data.id);
  if (!t) return { error: "El ticket no existe." };
  const ahora = ahoraISO();
  const respuestas = r.data.respuesta
    ? [...t.respuestas, { fecha: ahora, autor: sesion.email, texto: r.data.respuesta }]
    : t.respuestas;
  await store.put("ticket", { ...t, estado: r.data.estado, prioridad: r.data.prioridad, respuestas, actualizado: ahora });
  refrescar();
  return { ok: r.data.respuesta ? "Respuesta agregada." : "Ticket actualizado." };
}

export async function eliminarTicket(fd: FormData): Promise<Resultado> {
  await requerirAdmin();
  await getStore().remove("ticket", String(fd.get("id")));
  refrescar();
  redirect("/admin/tickets");
}
