import Link from "next/link";
import { ActionForm } from "@/components/ActionForm";
import { Logo } from "@/components/Logo";
import { enviarSolicitud } from "./acciones-publicas";
import { listarServicios } from "@/lib/datos";
import { precioServicio } from "@/lib/formato";
import { LINEAS, SEGMENTOS, type Servicio } from "@/lib/types";

export const dynamic = "force-dynamic";

const LINEAS_TRABAJO = [
  {
    titulo: "Desarrollo web a la medida",
    texto: "Sistemas para registrar participantes, asistencia, evidencias y ventas, diseñados con tu equipo y no al revés.",
    icono: "M4 5h16v11H4zM8 20h8M12 16v4",
  },
  {
    titulo: "MEAL y tableros",
    texto: "Monitoreo, evaluación, rendición de cuentas y aprendizaje con indicadores al día para la dirección y los donantes.",
    icono: "M4 20V10M10 20V4M16 20v-7M22 20H2",
  },
  {
    titulo: "Automatización de procesos",
    texto: "Los consolidados y reportes que hoy se arman a mano se generan solos y sin errores de copiado.",
    icono: "M4 12a8 8 0 0 1 14-5l2-2v6h-6l2-2a5 5 0 1 0 1 6",
  },
  {
    titulo: "IA y análisis de datos",
    texto: "Inteligencia artificial que resume los datos y ayuda a redactar informes en horas, no en semanas.",
    icono: "M12 3l2.5 5.5L20 11l-5.5 2.5L12 19l-2.5-5.5L4 11l5.5-2.5z",
  },
];

const PASOS = [
  ["Entender", "Conocemos cómo trabaja tu equipo y dónde se pierde el tiempo."],
  ["Diseñar", "Diseñamos la solución contigo, en talleres y con ejemplos reales."],
  ["Digitalizar y automatizar", "Construimos sobre módulos probados para entregar más rápido."],
  ["Medir y analizar", "Indicadores y tableros al día, con apoyo de IA para los informes."],
  ["Decidir mejor", "La información llega a tiempo a quien toma las decisiones."],
];

const SEGMENTOS_INFO: Record<string, string> = {
  ONG: "Proyectos, beneficiarios e indicadores MEAL para tus donantes.",
  "Educación": "Seguimiento de estudiantes, asistencia, programas e indicadores.",
  PYME: "Procesos y reportes digitalizados y automatizados.",
  Emprendimiento: "Herramientas digitales sencillas para crecer.",
};

function Icono({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={d} />
    </svg>
  );
}

export default async function Inicio() {
  let servicios: Servicio[] = [];
  try {
    servicios = (await listarServicios()).filter((s) => s.activo && s.publico);
  } catch (e) {
    console.error("No se pudo leer el catálogo", e);
  }
  const proyectos = servicios.filter((s) => s.tipo !== "mensual");
  const mensuales = servicios.filter((s) => s.tipo === "mensual");

  return (
    <div className="bg-white">
      {/* Encabezado */}
      <header className="sticky top-0 z-20 border-b border-line/70 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link href="/" aria-label="Sistemas Joscal, inicio">
            <Logo />
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-medium text-muted md:flex">
            <a href="#servicios" className="hover:text-navy">Servicios</a>
            <a href="#metodo" className="hover:text-navy">Cómo trabajamos</a>
            <a href="#planes" className="hover:text-navy">Planes</a>
            <a href="#contacto" className="hover:text-navy">Contacto</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/admin" className="btn-ghost btn-sm">Panel</Link>
            <a href="#contacto" className="btn-primary btn-sm hidden sm:inline-flex">Diagnóstico gratis</a>
          </div>
        </div>
      </header>

      {/* Portada */}
      <section className="relative overflow-hidden bg-navy text-white">
        <div className="absolute inset-0 opacity-[0.07] [background-image:radial-gradient(#fff_1px,transparent_1px)] [background-size:22px_22px]" />
        <div className="relative mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="mb-4 inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide text-amber uppercase">
              Tecnología para gestionar, monitorear y decidir mejor
            </p>
            <h1 className="text-4xl leading-tight font-extrabold tracking-tight text-balance sm:text-5xl">
              La tecnología se adapta a tus procesos, <span className="text-amber">no al revés.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-white/80">
              Ayudamos a ONG, centros educativos, PYMES y emprendimientos a juntar su información en un solo sistema,
              automatizar sus reportes y tener indicadores al día para tomar decisiones.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#contacto" className="btn bg-amber px-5 py-3 text-navy hover:bg-amber/90">
                Solicitar diagnóstico gratuito
              </a>
              <a href="#servicios" className="btn border border-white/30 px-5 py-3 text-white hover:bg-white/10">
                Ver servicios
              </a>
            </div>
            <p className="mt-6 text-sm text-white/60">Servicios hoy, productos escalables mañana.</p>
          </div>

          {/* Ilustración: tablero */}
          <div className="rounded-2xl bg-white p-5 text-ink shadow-2xl shadow-black/30" aria-hidden>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-bold text-navy">Tablero del proyecto</p>
              <span className="badge bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">Al día</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                ["Participantes", "1,248"],
                ["Asistencia", "87 %"],
                ["Metas logradas", "9 / 12"],
              ].map(([k, v]) => (
                <div key={k} className="rounded-lg bg-mist p-3">
                  <p className="text-[11px] text-muted">{k}</p>
                  <p className="text-lg font-extrabold text-navy">{v}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 flex h-28 items-end gap-2 rounded-lg border border-line p-3">
              {[38, 52, 47, 63, 71, 66, 82, 90].map((h, i) => (
                <div key={i} className="flex-1 rounded-t bg-teal" style={{ height: `${h}%`, opacity: 0.45 + i * 0.07 }} />
              ))}
            </div>
            <div className="mt-3 space-y-2">
              {["Informe trimestral para el donante", "Consolidado de asistencia"].map((t) => (
                <div key={t} className="flex items-center justify-between rounded-lg border border-line px-3 py-2 text-xs">
                  <span>{t}</span>
                  <span className="font-semibold text-teal">Generado automáticamente</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Problema */}
      <section className="border-b border-line bg-paper">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <div className="grid gap-8 md:grid-cols-[0.8fr_1.2fr] md:items-center">
            <h2 className="text-2xl font-extrabold text-navy sm:text-3xl">
              Mucha información, pero nunca a mano cuando hay que decidir.
            </h2>
            <p className="text-muted">
              Listas en Excel, formularios, correos, grupos de WhatsApp y papel. Cada persona guarda su propia versión y
              juntar todo se hace a mano. El equipo técnico pasa horas copiando datos en lugar de atender a la gente, y un
              informe para la dirección o un donante puede tardar semanas. Eso es lo que resolvemos.
            </p>
          </div>
        </div>
      </section>

      {/* Líneas de trabajo y catálogo */}
      <section id="servicios" className="scroll-mt-20">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <p className="text-sm font-bold tracking-wide text-teal uppercase">Qué hacemos</p>
          <h2 className="mt-1 text-3xl font-extrabold text-navy">Cuatro líneas de trabajo</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {LINEAS_TRABAJO.map((l) => (
              <div key={l.titulo} className="card p-5">
                <div className="mb-3 inline-flex rounded-lg bg-mist p-2 text-teal">
                  <Icono d={l.icono} />
                </div>
                <h3 className="font-bold text-navy">{l.titulo}</h3>
                <p className="mt-2 text-sm text-muted">{l.texto}</p>
              </div>
            ))}
          </div>

          <h3 className="mt-14 text-xl font-extrabold text-navy">Catálogo de servicios</h3>
          <p className="mt-1 text-sm text-muted">
            Se empieza con un módulo y se va creciendo. Cobramos por etapas: 50 % de anticipo y el saldo contra entrega.
          </p>
          {proyectos.length === 0 ? (
            <p className="mt-6 rounded-lg border border-dashed border-line p-6 text-sm text-muted">
              El catálogo se está actualizando. Escríbenos y te enviamos la información.
            </p>
          ) : (
            <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {proyectos.map((s) => (
                <article key={s.id} className="card flex flex-col p-5">
                  <p className="text-xs font-semibold tracking-wide text-teal uppercase">{s.linea}</p>
                  <h4 className="mt-1 font-bold text-navy">{s.nombre}</h4>
                  <p className="mt-2 flex-1 text-sm text-muted">{s.descripcion}</p>
                  <p className="mt-4 text-lg font-extrabold text-ink">{precioServicio(s)}</p>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Método */}
      <section id="metodo" className="scroll-mt-20 bg-mist">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <p className="text-sm font-bold tracking-wide text-teal uppercase">Cómo trabajamos</p>
          <h2 className="mt-1 text-3xl font-extrabold text-navy">Cinco pasos, del problema a la decisión</h2>
          <ol className="mt-8 grid gap-4 md:grid-cols-5">
            {PASOS.map(([t, d], i) => (
              <li key={t} className="card relative p-5">
                <span className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-navy text-sm font-bold text-white">
                  {i + 1}
                </span>
                <h3 className="font-bold text-navy">{t}</h3>
                <p className="mt-1 text-sm text-muted">{d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Planes mensuales */}
      <section id="planes" className="scroll-mt-20">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <p className="text-sm font-bold tracking-wide text-teal uppercase">Acompañamiento continuo</p>
          <h2 className="mt-1 text-3xl font-extrabold text-navy">Soporte y plataforma por suscripción</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {mensuales.map((s, i) => (
              <article
                key={s.id}
                className={`flex flex-col rounded-xl border p-6 ${i === mensuales.length - 1 ? "border-teal bg-navy text-white" : "border-line bg-white"}`}
              >
                <p className={`text-xs font-semibold tracking-wide uppercase ${i === mensuales.length - 1 ? "text-amber" : "text-teal"}`}>
                  {s.linea}
                </p>
                <h3 className="mt-1 text-lg font-bold">{s.nombre}</h3>
                <p className="mt-3 text-3xl font-extrabold">
                  {precioServicio(s).replace(" al mes", "")}
                  <span className={`text-sm font-medium ${i === mensuales.length - 1 ? "text-white/70" : "text-muted"}`}> / mes</span>
                </p>
                <p className={`mt-3 flex-1 text-sm ${i === mensuales.length - 1 ? "text-white/80" : "text-muted"}`}>{s.descripcion}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Segmentos y contacto */}
      <section id="contacto" className="scroll-mt-20 border-t border-line bg-paper">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-sm font-bold tracking-wide text-teal uppercase">Para quién</p>
            <h2 className="mt-1 text-3xl font-extrabold text-navy">Organizaciones que quieren decidir con datos</h2>
            <ul className="mt-6 space-y-3">
              {SEGMENTOS.map((s) => (
                <li key={s} className="card flex gap-3 p-4">
                  <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-amber" />
                  <div>
                    <p className="font-bold text-navy">{s === "Educación" ? "Centros educativos" : s === "PYME" ? "PYMES" : s === "ONG" ? "ONG y fundaciones" : "Emprendimientos"}</p>
                    <p className="text-sm text-muted">{SEGMENTOS_INFO[s]}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="card p-6 shadow-sm">
            <h2 className="text-xl font-extrabold text-navy">Solicita tu diagnóstico gratuito de 30 minutos</h2>
            <p className="mt-1 text-sm text-muted">Cuéntanos qué te quita tiempo hoy y te proponemos por dónde empezar.</p>
            <ActionForm
              action={enviarSolicitud}
              resetOnSuccess
              submitLabel="Enviar solicitud"
              className="mt-5 grid gap-4 sm:grid-cols-2"
            >
              <label className="field">
                <span>Nombre</span>
                <input name="nombre" required minLength={3} maxLength={100} className="input" autoComplete="name" />
              </label>
              <label className="field">
                <span>Organización</span>
                <input name="organizacion" required minLength={2} maxLength={120} className="input" autoComplete="organization" />
              </label>
              <label className="field">
                <span>Correo</span>
                <input name="email" type="email" required maxLength={120} className="input" autoComplete="email" />
              </label>
              <label className="field">
                <span>Teléfono <em className="font-normal text-muted">(opcional)</em></span>
                <input name="telefono" maxLength={30} className="input" autoComplete="tel" />
              </label>
              <label className="field">
                <span>Tipo de organización</span>
                <select name="segmento" required className="input" defaultValue="">
                  <option value="" disabled>Elige una opción</option>
                  {SEGMENTOS.map((s) => <option key={s}>{s}</option>)}
                </select>
              </label>
              <label className="field">
                <span>Servicio de interés</span>
                <select name="interes" required className="input" defaultValue="">
                  <option value="" disabled>Elige una opción</option>
                  {LINEAS.map((s) => <option key={s}>{s}</option>)}
                </select>
              </label>
              <label className="field sm:col-span-2">
                <span>¿Qué necesitas resolver?</span>
                <textarea name="mensaje" required minLength={10} maxLength={1500} rows={4} className="input" />
              </label>
              <label className="hidden" aria-hidden>
                Sitio web <input name="sitio_web" tabIndex={-1} autoComplete="off" />
              </label>
            </ActionForm>
          </div>
        </div>
      </section>

      <footer className="bg-navy text-white/70">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <Logo claro />
          <p>© {new Date().getFullYear()} Sistemas Joscal · El Salvador · Servicios hoy, productos escalables mañana.</p>
        </div>
      </footer>
    </div>
  );
}
