"use server";

import { z } from "zod";
import { getStore } from "@/lib/store";
import { ahoraISO } from "@/lib/fechas";
import { LINEAS, SEGMENTOS } from "@/lib/types";

const esquema = z.object({
  nombre: z.string().trim().min(3, "Escribe tu nombre completo.").max(100),
  organizacion: z.string().trim().min(2, "Escribe el nombre de tu organización.").max(120),
  email: z.string().trim().toLowerCase().email("El correo no es válido.").max(120),
  telefono: z.string().trim().max(30).optional().default(""),
  segmento: z.enum(SEGMENTOS, { message: "Elige el tipo de organización." }),
  interes: z.enum(LINEAS, { message: "Elige el servicio que te interesa." }),
  mensaje: z.string().trim().min(10, "Cuéntanos un poco más (mínimo 10 caracteres).").max(1500),
});

export async function enviarSolicitud(fd: FormData) {
  // Campo trampa para bots: las personas no lo ven
  if (String(fd.get("sitio_web") ?? "").length > 0) return { ok: "¡Gracias! Te escribiremos pronto." };

  const r = esquema.safeParse(Object.fromEntries(fd));
  if (!r.success) return { error: r.error.issues[0]?.message ?? "Revisa los datos del formulario." };

  try {
    await getStore().put("solicitud", {
      id: crypto.randomUUID(),
      ...r.data,
      estado: "nueva",
      creado: ahoraISO(),
    });
  } catch (e) {
    console.error("No se pudo guardar la solicitud", e);
    return { error: "No pudimos registrar tu solicitud en este momento. Intenta de nuevo en unos minutos." };
  }
  return {
    ok: `¡Gracias, ${r.data.nombre.split(" ")[0]}! Recibimos tu solicitud y te contactaremos para agendar el diagnóstico gratuito de 30 minutos.`,
  };
}
