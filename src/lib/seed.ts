import type { Cliente, Contrato, Pago, Servicio, Solicitud, Ticket } from "./types";
import { hoy, nombrePeriodo, periodo, sumarDias } from "./fechas";

/**
 * Datos de ejemplo basados en el modelo de negocio de Sistemas Joscal
 * (precios, segmentos y servicios del lienzo Canvas). Los clientes son ficticios.
 * Las fechas se calculan a partir de hoy para que el tablero siempre tenga actividad reciente.
 */
export function datosDeEjemplo() {
  const h = hoy();
  const d = (n: number) => sumarDias(h, n);
  const iso = (n: number) => `${d(n)}T15:00:00.000Z`;
  const anio = h.slice(0, 4);

  const servicios: Servicio[] = [
    {
      id: "srv-web", nombre: "Sistema web a la medida", linea: "Desarrollo web", tipo: "proyecto",
      descripcion: "Registros, asistencia, evidencias e indicadores en un solo sistema, diseñado junto con tu equipo y a partir de módulos ya probados.",
      precio: 1500, precioMax: 8000, activo: true, publico: true, orden: 1, creado: iso(-200),
    },
    {
      id: "srv-meal", nombre: "Implementación MEAL y tableros", linea: "MEAL y tableros", tipo: "proyecto",
      descripcion: "Marco de indicadores, flujo de recolección (incluida KoboToolbox) y tableros al día para la dirección y los donantes.",
      precio: 1800, precioMax: 4500, activo: true, publico: true, orden: 2, creado: iso(-200),
    },
    {
      id: "srv-consultoria", nombre: "Consultoría MEAL y capacitación", linea: "MEAL y tableros", tipo: "paquete",
      descripcion: "Paquete de diagnóstico, taller práctico para el equipo técnico y acompañamiento en la construcción de indicadores.",
      precio: 600, activo: true, publico: true, orden: 3, creado: iso(-200),
    },
    {
      id: "srv-automatizacion", nombre: "Automatización de procesos y reportes", linea: "Automatización", tipo: "proyecto",
      descripcion: "Los cálculos, consolidados y reportes que hoy se hacen a mano se generan solos, sin copiar y pegar entre hojas de Excel.",
      precio: 1500, precioMax: 4000, activo: true, publico: true, orden: 4, creado: iso(-200),
    },
    {
      id: "srv-ia", nombre: "Análisis de datos e informes con IA", linea: "IA y datos", tipo: "proyecto",
      descripcion: "Resúmenes automáticos de datos y apoyo de inteligencia artificial para redactar informes a la dirección y a donantes.",
      precio: 1200, precioMax: 3500, activo: true, publico: true, orden: 5, creado: iso(-200),
    },
    {
      id: "srv-soporte", nombre: "Soporte y mantenimiento", linea: "Soporte", tipo: "mensual",
      descripcion: "Atención por WhatsApp, correo y tickets, respaldos, actualizaciones y pequeñas mejoras cada mes.",
      precio: 120, activo: true, publico: true, orden: 6, creado: iso(-200),
    },
    {
      id: "srv-plat-basico", nombre: "Plataforma Joscal Básico", linea: "Plataforma", tipo: "mensual",
      descripcion: "Plataforma propia por suscripción: registros, asistencia y un tablero de indicadores, lista para usar.",
      precio: 49, activo: true, publico: true, orden: 7, creado: iso(-200),
    },
    {
      id: "srv-plat-pro", nombre: "Plataforma Joscal Profesional", linea: "Plataforma", tipo: "mensual",
      descripcion: "Todo lo del plan Básico más evidencias, varios proyectos, exportaciones y resúmenes con IA.",
      precio: 99, activo: true, publico: true, orden: 8, creado: iso(-200),
    },
  ];

  const cli = (
    id: string, nombre: string, segmento: Cliente["segmento"], contacto: string, municipio: string,
    estado: Cliente["estado"], dias: number, notas = "",
  ): Cliente => ({
    id, nombre, segmento, contacto, municipio, estado, notas,
    email: `contacto@${id.replace("cli-", "")}.example`,
    telefono: "",
    creado: iso(dias),
  });

  const clientes: Cliente[] = [
    cli("cli-raices", "Fundación Raíces Verdes", "ONG", "Lic. Ana Martínez", "San Salvador", "activo", -130, "Cliente piloto de la línea MEAL."),
    cli("cli-horizonte", "Colegio Nuevo Horizonte", "Educación", "Prof. Carlos Méndez", "Santa Ana", "activo", -110),
    cli("cli-manos", "Asociación Manos Unidas por la Niñez", "ONG", "Licda. Sofía Ramírez", "Santa Ana", "activo", -80),
    cli("cli-progreso", "Ferretería El Progreso", "PYME", "Sr. Julio Hernández", "Soyapango", "activo", -20),
    cli("cli-puente", "Academia de Inglés Puente", "Educación", "Lic. Daniela Flores", "San Miguel", "prospecto", -6, "Llegó por el formulario de diagnóstico."),
    cli("cli-apaneca", "Café Altos de Apaneca", "Emprendimiento", "Sra. Marta López", "Ahuachapán", "prospecto", -3),
  ];

  const con = (
    n: number, clienteId: string, servicioId: string, titulo: string, modalidad: Contrato["modalidad"],
    monto: number, estado: Contrato["estado"], avance: number, inicio: number, fin: number, notas = "",
  ): Contrato => ({
    id: `con-${n}`, codigo: `C-${anio}-${String(n).padStart(3, "0")}`, clienteId, servicioId, titulo,
    modalidad, monto, anticipoPct: modalidad === "unico" ? 50 : 0, estado, avance,
    inicio: d(inicio), fin: modalidad === "unico" ? d(fin) : "", notas, creado: iso(inicio),
  });

  const contratos: Contrato[] = [
    con(1, "cli-raices", "srv-web", "Sistema de beneficiarios, asistencia y evidencias", "unico", 4200, "en_curso", 65, -60, 30),
    con(2, "cli-raices", "srv-soporte", "Soporte mensual del sistema MEAL", "mensual", 120, "en_curso", 0, -120, 0),
    con(3, "cli-horizonte", "srv-meal", "Tablero de seguimiento de estudiantes", "unico", 2800, "entregado", 100, -100, -20),
    con(4, "cli-horizonte", "srv-plat-basico", "Suscripción Plataforma Joscal Básico", "mensual", 49, "en_curso", 0, -40, 0),
    con(5, "cli-manos", "srv-consultoria", "Taller de indicadores MEAL para el equipo de campo", "unico", 600, "entregado", 100, -75, -45),
    con(6, "cli-progreso", "srv-automatizacion", "Automatización de inventario y reporte de ventas", "unico", 3200, "en_curso", 25, -15, 60),
    con(7, "cli-manos", "srv-plat-pro", "Suscripción Plataforma Joscal Profesional", "mensual", 99, "en_curso", 0, -50, 0),
    con(8, "cli-puente", "srv-web", "Portal de inscripciones en línea", "unico", 2400, "propuesta", 0, -2, 75, "Propuesta enviada; espera aprobación de la dirección."),
  ];

  let recibo = 0;
  const pagos: Pago[] = [];
  const pago = (
    c: Contrato, concepto: string, monto: number, vence: string, pagadoDias: number | null,
    per?: string, metodo = "Transferencia",
  ) => {
    const pagado = pagadoDias !== null;
    pagos.push({
      id: `pag-${pagos.length + 1}`, contratoId: c.id, clienteId: c.clienteId, concepto, monto, vence,
      periodo: per, estado: pagado ? "pagado" : "pendiente",
      pagadoEl: pagado ? d(pagadoDias) : undefined,
      metodo: pagado ? metodo : undefined,
      recibo: pagado ? `R-${String(++recibo).padStart(6, "0")}` : undefined,
      creado: c.creado,
    });
  };
  const [k1, k2, k3, k4, k5, k6, k7] = contratos;
  pago(k3, "Anticipo 50 %", 1400, d(-100), -98);
  pago(k5, "Anticipo 50 %", 300, d(-75), -74);
  pago(k2, `Cuota ${nombrePeriodo(periodo(h, -3), true)}`, 120, `${periodo(h, -3)}-10`, -95, periodo(h, -3));
  pago(k1, "Anticipo 50 %", 2100, d(-60), -58);
  pago(k2, `Cuota ${nombrePeriodo(periodo(h, -2), true)}`, 120, `${periodo(h, -2)}-10`, -66, periodo(h, -2));
  pago(k5, "Saldo contra entrega", 300, d(-45), -44);
  pago(k7, `Cuota ${nombrePeriodo(periodo(h, -1), true)}`, 99, `${periodo(h, -1)}-15`, -33, periodo(h, -1), "Tarjeta");
  pago(k4, `Cuota ${nombrePeriodo(periodo(h, -1), true)}`, 49, `${periodo(h, -1)}-10`, -36, periodo(h, -1), "Tarjeta");
  pago(k2, `Cuota ${nombrePeriodo(periodo(h, -1), true)}`, 120, `${periodo(h, -1)}-10`, -37, periodo(h, -1));
  pago(k3, "Saldo contra entrega", 1400, d(-20), -18);
  pago(k6, "Anticipo 50 %", 1600, d(-15), -14, undefined, "Cheque");
  pago(k4, `Cuota ${nombrePeriodo(periodo(h), true)}`, 49, `${periodo(h)}-10`, -9, periodo(h), "Tarjeta");
  pago(k2, `Cuota ${nombrePeriodo(periodo(h), true)}`, 120, `${periodo(h)}-10`, null, periodo(h));
  pago(k7, `Cuota ${nombrePeriodo(periodo(h), true)}`, 99, `${periodo(h)}-28`, null, periodo(h));
  pago(k1, "Saldo contra entrega", 2100, k1.fin, null);
  pago(k6, "Saldo contra entrega", 1600, k6.fin, null);

  const solicitudes: Solicitud[] = [
    {
      id: "sol-1", nombre: "Roberto Alvarado", organizacion: "Asociación Comunal Brisas del Lago", email: "roberto@brisas.example",
      telefono: "", segmento: "ONG", interes: "MEAL y tableros",
      mensaje: "Llevamos el registro de 300 familias en Excel y cada informe trimestral nos toma dos semanas. Queremos un tablero.",
      estado: "nueva", creado: iso(-1),
    },
    {
      id: "sol-2", nombre: "Karla Mejía", organizacion: "Clínica Dental Sonrisa", email: "karla@sonrisa.example",
      telefono: "", segmento: "PYME", interes: "Automatización",
      mensaje: "Necesitamos automatizar recordatorios de citas y el reporte mensual de ingresos.",
      estado: "contactada", creado: iso(-4),
    },
    {
      id: "sol-3", nombre: "Daniela Flores", organizacion: "Academia de Inglés Puente", email: "contacto@puente.example",
      telefono: "", segmento: "Educación", interes: "Desarrollo web",
      mensaje: "Queremos que las inscripciones y los pagos de mensualidad se hagan en línea.",
      estado: "convertida", clienteId: "cli-puente", creado: iso(-7),
    },
  ];

  const tickets: Ticket[] = [
    {
      id: "tic-1", numero: "T-0001", clienteId: "cli-raices", contratoId: "con-2",
      asunto: "El reporte de asistencia del mes no descarga",
      descripcion: "Al exportar a Excel la asistencia del mes pasado, el archivo sale vacío.",
      prioridad: "alta", estado: "en_progreso",
      respuestas: [{ fecha: iso(-1), autor: "Soporte", texto: "Reproducido: el filtro de fechas excluye el último día del mes. Corrección en pruebas." }],
      creado: iso(-2), actualizado: iso(-1),
    },
    {
      id: "tic-2", numero: "T-0002", clienteId: "cli-horizonte", contratoId: "con-4",
      asunto: "Agregar la sección al tablero de estudiantes",
      descripcion: "Nos gustaría filtrar los indicadores por sección (A, B, C) además del grado.",
      prioridad: "media", estado: "abierto", respuestas: [], creado: iso(-1), actualizado: iso(-1),
    },
    {
      id: "tic-3", numero: "T-0003", clienteId: "cli-manos", contratoId: "con-7",
      asunto: "Restablecer la contraseña de una técnica de campo",
      descripcion: "Una técnica olvidó su contraseña y no le llega el correo de recuperación.",
      prioridad: "baja", estado: "resuelto",
      respuestas: [{ fecha: iso(-9), autor: "Soporte", texto: "El correo estaba mal escrito en su perfil. Se corrigió y se envió un nuevo enlace." }],
      creado: iso(-10), actualizado: iso(-9),
    },
  ];

  return {
    entidades: { servicio: servicios, cliente: clientes, contrato: contratos, pago: pagos, solicitud: solicitudes, ticket: tickets },
    contadores: { [`contrato-${anio}`]: contratos.length, recibo, ticket: tickets.length } as Record<string, number>,
  };
}
