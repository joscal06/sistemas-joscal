/** Barra de filtros con GET: funciona sin JavaScript y deja la URL compartible. */
export function Filtros({
  q,
  selects,
  conBusqueda = true,
}: {
  q?: string;
  selects: { name: string; label: string; value: string; options: (readonly [string, string])[] }[];
  conBusqueda?: boolean;
}) {
  return (
    <form className="no-print mb-4 flex flex-wrap gap-2" method="get">
      {conBusqueda && (
        <input name="q" defaultValue={q} placeholder="Buscar…" className="input max-w-xs flex-1" aria-label="Buscar" />
      )}
      {selects.map((s) => (
        <select key={s.name} name={s.name} defaultValue={s.value} className="input w-auto" aria-label={s.label}>
          <option value="">{s.label}</option>
          {s.options.map(([v, t]) => (
            <option key={v} value={v}>{t}</option>
          ))}
        </select>
      ))}
      <button className="btn-ghost">Filtrar</button>
    </form>
  );
}
