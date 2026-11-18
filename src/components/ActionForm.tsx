"use client";

import { useRef, useState, useTransition } from "react";

export type ResultadoAccion = { error?: string; ok?: string } | void;

type Props = {
  action: (fd: FormData) => Promise<ResultadoAccion>;
  children?: React.ReactNode;
  submitLabel?: string;
  submitClassName?: string;
  className?: string;
  /** Limpia el formulario cuando la acción responde con éxito */
  resetOnSuccess?: boolean;
  /** Pide confirmación antes de enviar */
  confirmar?: string;
  /** Oculta el botón por defecto (cuando el formulario trae sus propios botones) */
  sinBoton?: boolean;
};

/**
 * Formulario que llama a una Server Action sin reiniciar los campos si hay un error
 * de validación. Si la acción redirige, Next.js navega automáticamente.
 */
export function ActionForm({
  action,
  children,
  submitLabel = "Guardar",
  submitClassName = "btn-primary",
  className,
  resetOnSuccess,
  confirmar,
  sinBoton,
}: Props) {
  const [estado, setEstado] = useState<{ error?: string; ok?: string }>({});
  const [pendiente, startTransition] = useTransition();
  const ref = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={ref}
      className={className}
      onSubmit={(e) => {
        e.preventDefault();
        if (confirmar && !window.confirm(confirmar)) return;
        const fd = new FormData(e.currentTarget);
        const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
        if (submitter?.name) fd.set(submitter.name, submitter.value);
        startTransition(async () => {
          const r = await action(fd);
          setEstado(r ?? {});
          if (r?.ok && resetOnSuccess) ref.current?.reset();
        });
      }}
    >
      <fieldset disabled={pendiente} className="contents">
        {children}
        {estado.error && (
          <p role="alert" className="col-span-full rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            {estado.error}
          </p>
        )}
        {estado.ok && (
          <p role="status" className="col-span-full rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            {estado.ok}
          </p>
        )}
        {!sinBoton && (
          <div className="col-span-full">
            <button type="submit" className={submitClassName}>
              {pendiente ? "Guardando…" : submitLabel}
            </button>
          </div>
        )}
      </fieldset>
    </form>
  );
}
