"use client";

import { useState } from "react";
import { downloadIcs, googleCalendarUrl } from "@/lib/ics";
import { useApp } from "./AppProvider";
import { DAYS, EVENTS, TRIP, type TripEvent } from "@/lib/trip";

const KIND_LABEL: Record<TripEvent["kind"], string> = {
  viaje: "Viaje",
  comida: "Comida",
  aventura: "Aventura",
  fiesta: "Fiesta",
  base: "Quinta",
};

const WEEKDAYS = ["L", "M", "M", "J", "V", "S", "D"];

function MonthGrid({ selected, onSelect }: { selected: string; onSelect: (d: string) => void }) {
  const [y, m] = TRIP.start.split("-").map(Number);
  const firstDow = new Date(Date.UTC(y, m - 1, 1)).getUTCDay(); // 0 = domingo
  const offset = (firstDow + 6) % 7;
  const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const tripDates = new Set(DAYS.map((d) => d.date));
  const monthName = new Intl.DateTimeFormat("es-AR", { month: "long", year: "numeric", timeZone: "UTC" })
    .format(new Date(Date.UTC(y, m - 1, 1)));

  return (
    <div className="card p-3">
      <p className="label mb-2 capitalize">{monthName}</p>
      <div className="grid grid-cols-7 gap-1 text-center">
        {WEEKDAYS.map((w, i) => (
          <span key={i} className="pb-1 text-xs font-bold text-ink-soft">
            {w}
          </span>
        ))}
        {Array.from({ length: offset }, (_, i) => (
          <span key={`o${i}`} />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const n = i + 1;
          const date = `${y}-${String(m).padStart(2, "0")}-${String(n).padStart(2, "0")}`;
          if (!tripDates.has(date)) {
            return (
              <span key={n} className="grid h-10 place-items-center text-sm text-ink-soft/60">
                {n}
              </span>
            );
          }
          const active = date === selected;
          return (
            <button
              key={n}
              onClick={() => onSelect(date)}
              aria-pressed={active}
              aria-label={DAYS.find((d) => d.date === date)?.label}
              className={`grid h-10 place-items-center border-2 border-ink font-display text-lg ${
                active ? "bg-signal text-paper" : "bg-ink text-paper"
              }`}
            >
              {n}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function AddToCalendar({ event }: { event: TripEvent }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-3">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex min-h-11 items-center gap-2 text-sm font-bold underline decoration-signal decoration-2 underline-offset-4"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
          <path d="M12 5v14M5 12h14" />
        </svg>
        Agregar a mi calendario
      </button>
      {open && (
        <div className="mt-1 flex flex-wrap gap-2">
          <a
            href={googleCalendarUrl(event)}
            target="_blank"
            rel="noreferrer"
            className="btn btn-ghost min-h-11 text-sm"
          >
            Google
          </a>
          <button
            className="btn btn-ghost min-h-11 text-sm"
            onClick={() => downloadIcs(`${event.id}.ics`, [event])}
          >
            Apple / Outlook (.ics)
          </button>
        </div>
      )}
    </div>
  );
}

export function Itinerary() {
  const { me } = useApp();
  const [selected, setSelected] = useState(DAYS[0].date);
  // Cada uno ve lo suyo: los vuelos grupales no aplican a quien viaja aparte.
  const mine = EVENTS.filter((e) => !e.forIds || (me && e.forIds.includes(me.id)));
  const day = DAYS.find((d) => d.date === selected) ?? DAYS[0];
  const events = mine.filter((e) => e.date === selected).sort((a, b) => a.start.localeCompare(b.start));

  return (
    <div className="space-y-6">
      <h1 className="font-display text-4xl uppercase leading-none">Itinerario</h1>

      <MonthGrid selected={selected} onSelect={setSelected} />

      <button className="btn btn-ghost w-full border-dashed" onClick={() => downloadIcs("despedida-gordo.ics", mine)}>
        Agregar todo el viaje al calendario
      </button>

      <section aria-labelledby="dia">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 id="dia" className="font-display text-2xl uppercase">
            {day.label}
          </h2>
          <span className="label text-signal">{day.theme}</span>
        </div>

        <ol className="relative space-y-4 border-l-2 border-ink pl-5">
          {events.map((e) => (
            <li key={e.id} className="card relative p-4">
              <span aria-hidden className="absolute top-5 -left-[1.65rem] size-3 border-2 border-ink bg-signal" />
              <div className="flex items-center justify-between gap-2">
                <span className="font-display text-xl tabular-nums">
                  {e.start}–{e.end}{e.endDate && <span className="text-sm"> (+1)</span>}
                </span>
                <span className="border-2 border-ink px-2 text-xs font-bold uppercase">{KIND_LABEL[e.kind]}</span>
              </div>
              <h3 className="mt-1 font-stencil text-3xl font-black leading-none">{e.title.toUpperCase()}</h3>
              <p className="mt-2 text-ink-soft">{e.description}</p>
              {e.location && <p className="mt-2 text-sm font-semibold">{e.location}</p>}
              {e.tbc && <p className="mt-1 text-xs font-bold uppercase tracking-wider text-signal">Horario a confirmar</p>}
              <AddToCalendar event={e} />
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
