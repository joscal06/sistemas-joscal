"use client";

export function BotonImprimir() {
  return (
    <button type="button" className="btn-primary" onClick={() => window.print()}>
      Imprimir o guardar PDF
    </button>
  );
}
