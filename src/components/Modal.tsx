"use client";

import { useEffect, useState, type ReactNode } from "react";

/** Hoja modal: cierra con ✕, tocando afuera o con Escape. */
export function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-ink/60 sm:items-center" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className="sheet max-h-[92dvh] w-full max-w-lg overflow-y-auto border-t-2 border-ink bg-paper-deep p-4 pb-[max(1rem,env(safe-area-inset-bottom))] text-left sm:border-2"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-3xl uppercase">{title}</h2>
          <button onClick={onClose} className="grid size-11 place-items-center text-2xl" aria-label="Cerrar" autoFocus>
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/** Fila de <dl> que abre un modal al tocarla. */
export function ModalFact({
  label,
  value,
  cta,
  modal,
}: {
  label: string;
  value: string;
  cta: string;
  modal: (close: () => void) => ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex items-center justify-between gap-4 px-4">
      <dt className="label text-ink-soft">{label}</dt>
      <dd>
        <button
          onClick={() => setOpen(true)}
          aria-haspopup="dialog"
          className="min-h-14 text-right font-semibold underline decoration-signal decoration-2 underline-offset-4"
        >
          {value} · {cta} →
        </button>
        {open && modal(() => setOpen(false))}
      </dd>
    </div>
  );
}
