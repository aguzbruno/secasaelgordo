"use client";

import { FLIGHTS, OTHER_TRAVEL, ROSTER, type Flight } from "@/lib/trip";
import { useApp } from "./AppProvider";
import { Modal, ModalFact } from "./Modal";

const dateFmt = new Intl.DateTimeFormat("es-AR", {
  weekday: "long",
  day: "numeric",
  month: "long",
  timeZone: "UTC",
});

function Plane({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z" />
    </svg>
  );
}

function Ticket({ f }: { f: Flight }) {
  const date = dateFmt.format(new Date(`${f.date}T00:00:00Z`));
  return (
    <article className="card relative bg-paper" aria-label={`Vuelo de ${f.direction.toLowerCase()} ${f.number}`}>
      <header className="flex items-center justify-between bg-ink px-4 py-2 text-paper">
        <span className="font-display text-lg uppercase tracking-widest">{f.airline} · {f.direction}</span>
        <span className="font-display text-lg tracking-widest text-signal">{f.number}</span>
      </header>

      <div className="px-4 pt-4 pb-5">
        <p className="label mb-3 capitalize text-ink-soft">{date}</p>

        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          <div>
            <p className="font-display text-5xl leading-none">{f.from.code}</p>
            <p className="mt-1 text-sm font-semibold">{f.from.city}</p>
            <p className="text-xs text-ink-soft">{f.from.airport}</p>
          </div>
          <div className="flex flex-col items-center text-ink-soft" aria-hidden>
            <Plane className="size-7 rotate-90 text-ink" />
            <span className="mt-1 block h-0 w-14 border-t-2 border-dashed border-ink" />
          </div>
          <div className="text-right">
            <p className="font-display text-5xl leading-none">{f.to.code}</p>
            <p className="mt-1 text-sm font-semibold">{f.to.city}</p>
            <p className="text-xs text-ink-soft">{f.to.airport}</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-end gap-2">
          <div>
            <p className="label text-ink-soft">Sale</p>
            <p className="font-display text-4xl tabular-nums">{f.from.time}</p>
          </div>
          <p className="pb-1 text-center text-xs font-bold uppercase leading-tight">
            Directo
            <br />
            {f.duration}
          </p>
          <div className="text-right">
            <p className="label text-ink-soft">Llega</p>
            <p className="font-display text-4xl tabular-nums">{f.to.time}</p>
          </div>
        </div>
      </div>

      {/* perforado de boleto */}
      <div className="relative border-t-2 border-dashed border-ink">
        <span aria-hidden className="absolute -top-3 -left-3 size-5 rounded-full border-2 border-ink bg-ink/60" />
        <span aria-hidden className="absolute -top-3 -right-3 size-5 rounded-full border-2 border-ink bg-ink/60" />
        <p className="px-4 py-3 text-sm font-semibold">{f.checkIn}</p>
      </div>
    </article>
  );
}

export function FlightsModal({ onClose }: { onClose: () => void }) {
  const { me } = useApp();
  const own = me ? OTHER_TRAVEL[me.id] : undefined;
  const groupNames = ROSTER.filter((p) => !(p.id in OTHER_TRAVEL)).map((p) => p.name);

  return (
    <Modal title="Cómo llegamos" onClose={onClose}>
      {own && (
        <p className="mb-4 border-2 border-ink bg-signal p-3 font-semibold text-paper">
          Tu viaje: {own} Los vuelos de abajo son los del resto del grupo.
        </p>
      )}

      <div className="space-y-5">
        {FLIGHTS.map((f) => (
          <Ticket key={f.number} f={f} />
        ))}
      </div>

      <section className="mt-5 space-y-2 text-sm">
        <p>
          <b>En estos vuelos:</b> {groupNames.join(", ")}.
        </p>
        {ROSTER.filter((p) => p.id in OTHER_TRAVEL).map((p) => (
          <p key={p.id}>
            <b>{p.name}:</b> {OTHER_TRAVEL[p.id]}
          </p>
        ))}
      </section>
    </Modal>
  );
}

export function FlightsFact({ label, value }: { label: string; value: string }) {
  return (
    <ModalFact
      label={label}
      value={value}
      cta="ver vuelos"
      modal={(close) => <FlightsModal onClose={close} />}
    />
  );
}
