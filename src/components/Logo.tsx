export function Logo({ claro = false }: { claro?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2">
      <svg viewBox="0 0 64 64" className="h-8 w-8 shrink-0" aria-hidden>
        <rect width="64" height="64" rx="14" fill={claro ? "#ffffff" : "#0e3a4a"} />
        <path
          d="M40 16v22c0 7-5 11-12 11-5 0-9-2-11-6l6-4c1 2 3 3 5 3 3 0 5-2 5-5V16z"
          fill={claro ? "#0e3a4a" : "#ffffff"}
        />
        <circle cx="47" cy="47" r="5" fill="#f2a93b" />
      </svg>
      <span className={`text-base leading-none font-extrabold tracking-tight ${claro ? "text-white" : "text-navy"}`}>
        Sistemas <span className={claro ? "text-amber" : "text-teal"}>Joscal</span>
      </span>
    </span>
  );
}
