import { ActionForm } from "./ActionForm";
import { guardarCliente, guardarContrato, guardarServicio } from "@/app/admin/acciones";
import { hoy } from "@/lib/fechas";
import { LINEAS, SEGMENTOS, type Cliente, type Contrato, type Servicio } from "@/lib/types";
import { precioServicio } from "@/lib/formato";

export function FormCliente({ c }: { c?: Cliente }) {
  return (
    <ActionForm action={guardarCliente} submitLabel={c ? "Guardar cambios" : "Crear cliente"} className="grid gap-4 sm:grid-cols-2">
      {c && <input type="hidden" name="id" value={c.id} />}
      <label className="field sm:col-span-2">
        <span>Nombre de la organización</span>
        <input name="nombre" required minLength={2} maxLength={120} defaultValue={c?.nombre} className="input" />
      </label>
      <label className="field">
        <span>Segmento</span>
        <select name="segmento" required defaultValue={c?.segmento ?? "ONG"} className="input">
          {SEGMENTOS.map((s) => <option key={s}>{s}</option>)}
        </select>
      </label>
      <label className="field">
        <span>Estado</span>
        <select name="estado" defaultValue={c?.estado ?? "prospecto"} className="input">
          <option value="prospecto">Prospecto</option>
          <option value="activo">Activo</option>
          <option value="inactivo">Inactivo</option>
        </select>
      </label>
      <label className="field">
        <span>Persona de contacto</span>
        <input name="contacto" maxLength={120} defaultValue={c?.contacto} className="input" />
      </label>
      <label className="field">
        <span>Municipio</span>
        <input name="municipio" maxLength={80} defaultValue={c?.municipio} className="input" />
      </label>
      <label className="field">
        <span>Correo</span>
        <input name="email" type="email" maxLength={120} defaultValue={c?.email} className="input" />
      </label>
      <label className="field">
        <span>Teléfono</span>
        <input name="telefono" maxLength={30} defaultValue={c?.telefono} className="input" />
      </label>
      <label className="field sm:col-span-2">
        <span>Notas</span>
        <textarea name="notas" rows={3} maxLength={2000} defaultValue={c?.notas} className="input" />
      </label>
    </ActionForm>
  );
}

export function FormServicio({ s }: { s?: Servicio }) {
  return (
    <ActionForm action={guardarServicio} submitLabel={s ? "Guardar cambios" : "Crear servicio"} className="grid gap-4 sm:grid-cols-2">
      {s && <input type="hidden" name="id" value={s.id} />}
      <label className="field sm:col-span-2">
        <span>Nombre</span>
        <input name="nombre" required minLength={3} maxLength={120} defaultValue={s?.nombre} className="input" />
      </label>
      <label className="field">
        <span>Línea de servicio</span>
        <select name="linea" defaultValue={s?.linea ?? LINEAS[0]} className="input">
          {LINEAS.map((l) => <option key={l}>{l}</option>)}
        </select>
      </label>
      <label className="field">
        <span>Tipo de cobro</span>
        <select name="tipo" defaultValue={s?.tipo ?? "proyecto"} className="input">
          <option value="proyecto">Proyecto (precio único)</option>
          <option value="paquete">Paquete</option>
          <option value="mensual">Mensual (soporte o suscripción)</option>
        </select>
      </label>
      <label className="field">
        <span>Precio base (USD)</span>
        <input name="precio" type="number" min={0} step="0.01" required defaultValue={s?.precio} className="input" />
      </label>
      <label className="field">
        <span>Precio máximo <em className="font-normal text-muted">(opcional, solo proyectos)</em></span>
        <input name="precioMax" type="number" min={0} step="0.01" defaultValue={s?.precioMax} className="input" />
      </label>
      <label className="field sm:col-span-2">
        <span>Descripción</span>
        <textarea name="descripcion" rows={3} maxLength={600} defaultValue={s?.descripcion} className="input" />
      </label>
      <label className="field">
        <span>Orden en el catálogo</span>
        <input name="orden" type="number" min={0} max={999} defaultValue={s?.orden ?? 10} className="input" />
      </label>
      <div className="flex flex-col justify-end gap-2 text-sm">
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" name="activo" defaultChecked={s?.activo ?? true} className="h-4 w-4 accent-teal" /> Activo (se puede contratar)
        </label>
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" name="publico" defaultChecked={s?.publico ?? true} className="h-4 w-4 accent-teal" /> Mostrar en el sitio público
        </label>
      </div>
    </ActionForm>
  );
}

export function FormContrato({
  c,
  clientes,
  servicios,
  clienteInicial,
}: {
  c?: Contrato;
  clientes: Cliente[];
  servicios: Servicio[];
  clienteInicial?: string;
}) {
  const nuevo = !c;
  return (
    <ActionForm action={guardarContrato} submitLabel={nuevo ? "Crear contrato" : "Guardar cambios"} className="grid gap-4 sm:grid-cols-2">
      {c && <input type="hidden" name="id" value={c.id} />}
      <label className="field">
        <span>Cliente</span>
        <select name="clienteId" required defaultValue={c?.clienteId ?? clienteInicial ?? ""} className="input">
          <option value="" disabled>Elige un cliente</option>
          {clientes.map((x) => <option key={x.id} value={x.id}>{x.nombre}</option>)}
        </select>
      </label>
      <label className="field">
        <span>Servicio</span>
        <select name="servicioId" required defaultValue={c?.servicioId ?? ""} className="input">
          <option value="" disabled>Elige un servicio</option>
          {servicios
            .filter((s) => s.activo || s.id === c?.servicioId)
            .map((s) => <option key={s.id} value={s.id}>{s.nombre} · {precioServicio(s)}</option>)}
        </select>
      </label>
      <label className="field sm:col-span-2">
        <span>Título del contrato o proyecto</span>
        <input name="titulo" required minLength={3} maxLength={160} defaultValue={c?.titulo} className="input" />
      </label>
      <label className="field">
        <span>Modalidad</span>
        <select name="modalidad" defaultValue={c?.modalidad ?? "unico"} className="input">
          <option value="unico">Pago único (proyecto o paquete)</option>
          <option value="mensual">Mensual (soporte o suscripción)</option>
        </select>
      </label>
      <label className="field">
        <span>Monto total o cuota mensual (USD)</span>
        <input name="monto" type="number" min={0.01} step="0.01" required defaultValue={c?.monto} className="input" />
      </label>
      <label className="field">
        <span>Anticipo (%) <em className="font-normal text-muted">(pago único)</em></span>
        <input name="anticipoPct" type="number" min={0} max={100} defaultValue={c?.anticipoPct ?? 50} className="input" />
      </label>
      <label className="field">
        <span>Estado</span>
        <select name="estado" defaultValue={c?.estado ?? "propuesta"} className="input">
          <option value="propuesta">Propuesta</option>
          <option value="en_curso">En curso</option>
          <option value="entregado">Entregado</option>
          <option value="cancelado">Cancelado</option>
        </select>
      </label>
      <label className="field">
        <span>Fecha de inicio</span>
        <input name="inicio" type="date" required defaultValue={c?.inicio ?? hoy()} className="input" />
      </label>
      <label className="field">
        <span>Fecha de entrega <em className="font-normal text-muted">(pago único)</em></span>
        <input name="fin" type="date" defaultValue={c?.fin} className="input" />
      </label>
      <label className="field">
        <span>Avance (%)</span>
        <input name="avance" type="number" min={0} max={100} defaultValue={c?.avance ?? 0} className="input" />
      </label>
      <label className="field sm:col-span-2">
        <span>Notas</span>
        <textarea name="notas" rows={3} maxLength={2000} defaultValue={c?.notas} className="input" />
      </label>
      {nuevo && (
        <label className="inline-flex items-center gap-2 text-sm sm:col-span-2">
          <input type="checkbox" name="generarPagos" defaultChecked className="h-4 w-4 accent-teal" />
          Generar el plan de pagos (anticipo y saldo, o la primera cuota mensual)
        </label>
      )}
    </ActionForm>
  );
}
