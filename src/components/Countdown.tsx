"use client";

import { useSyncExternalStore } from "react";

const subscribe = (cb: () => void) => {
  const id = setInterval(cb, 60_000);
  return () => clearInterval(id);
};

/** Días que faltan hasta `target` (YYYY-MM-DD, hora de Mendoza); `null` antes de hidratar. */
function useDaysLeft(target: string): number | null {
  // Redondeado al minuto para que el snapshot sea estable entre renders.
  const now = useSyncExternalStore(
    subscribe,
    () => Math.floor(Date.now() / 60_000),
    () => null,
  );
  if (now === null) return null;
  const start = Date.parse(`${target}T00:00:00-03:00`);
  return Math.ceil((start - now * 60_000) / 86_400_000);
}

/** Bloque grande con la cuenta regresiva. */
export function Countdown({ target }: { target: string }) {
  const days = useDaysLeft(target);

  return (
    <div className="card flex items-center gap-4 bg-ink p-4 text-paper shadow-[4px_4px_0_var(--signal)]" role="timer">
      {days === null ? (
        <span className="font-display text-6xl leading-none" aria-hidden>
          —
        </span>
      ) : days > 1 ? (
        <>
          <span className="font-display text-7xl leading-none tabular-nums text-signal">{days}</span>
          <span className="font-display text-2xl leading-tight uppercase">
            días para
            <br />
            Mendoza
          </span>
        </>
      ) : days === 1 ? (
        <span className="font-display text-4xl leading-tight uppercase">
          Es <span className="text-signal">mañana</span>
        </span>
      ) : (
        <span className="font-display text-4xl leading-tight uppercase">
          Ya estamos en <span className="text-signal">Mendoza</span>
        </span>
      )}
    </div>
  );
}
