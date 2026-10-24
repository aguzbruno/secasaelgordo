"use client";

import { useSyncExternalStore } from "react";

const subscribe = (cb: () => void) => {
  const id = setInterval(cb, 60_000);
  return () => clearInterval(id);
};

/** Días que faltan hasta `target` (YYYY-MM-DD, hora de Mendoza). */
export function Countdown({ target }: { target: string }) {
  // Redondeado al minuto para que el snapshot sea estable entre renders.
  const now = useSyncExternalStore(
    subscribe,
    () => Math.floor(Date.now() / 60_000),
    () => null,
  );
  if (now === null) return <span aria-hidden>—</span>;

  const start = Date.parse(`${target}T00:00:00-03:00`);
  const days = Math.ceil((start - now * 60_000) / 86_400_000);

  if (days > 1) return <>Faltan {days} días</>;
  if (days === 1) return <>Es mañana</>;
  return <>Ya estamos en Mendoza</>;
}
