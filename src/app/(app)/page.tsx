import Image from "next/image";
import { BodegaFact } from "@/components/BodegaModal";
import { QuintaFact } from "@/components/QuintaModal";
import { FlightsFact } from "@/components/FlightsModal";
import { Countdown } from "@/components/Countdown";
import { INFO, PENDING, TRIP } from "@/lib/trip";

export default function InfoPage() {
  return (
    <div className="space-y-8">
      <section className="relative -mx-4 overflow-hidden border-b-2 border-ink">
        <div className="halftone absolute inset-0 opacity-[0.06]" aria-hidden />
        <div className="relative flex items-end gap-2 px-4 pt-2">
          <Image
            src="/img/gordo-full.png"
            alt="El Gordo gritando"
            width={480}
            height={700}
            priority
            className="w-[62%] shrink-0"
          />
          <div className="pb-4">
            <p className="font-display text-6xl leading-[0.9]">MENDOZA</p>
            <p className="font-display text-8xl leading-[0.9] text-signal">26</p>
            <p className="mt-3 inline-block bg-ink px-2 py-1 font-display text-sm uppercase tracking-widest text-paper">
              <Countdown target={TRIP.start} />
            </p>
          </div>
        </div>
      </section>

      <p className="text-lg font-semibold leading-snug">{INFO.tagline}</p>

      <section aria-labelledby="datos">
        <h2 id="datos" className="label mb-3">
          Datos generales
        </h2>
        <dl className="card divide-y-2 divide-ink">
          {INFO.facts.map((f) =>
            f.opensFlights ? (
              <FlightsFact key={f.label} label={f.label} value={f.value} />
            ) : f.opensQuinta ? (
              <QuintaFact key={f.label} label={f.label} value={f.value} />
            ) : f.opensBodega ? (
              <BodegaFact key={f.label} label={f.label} value={f.value} />
            ) : (
              <div key={f.label} className="flex items-baseline justify-between gap-4 px-4 py-3">
                <dt className="label text-ink-soft">{f.label}</dt>
                <dd className="text-right font-semibold">{f.value}</dd>
              </div>
            ),
          )}
        </dl>
      </section>

      <section aria-labelledby="adefinir">
        <h2 id="adefinir" className="label mb-3">
          A definir
        </h2>
        <ul className="card divide-y-2 divide-ink border-signal shadow-[4px_4px_0_var(--signal)]">
          {PENDING.map((p) => (
            <li key={p.title} className="flex gap-3 px-4 py-3">
              <span
                aria-hidden
                className="mt-1 grid size-5 shrink-0 place-items-center border-2 border-ink font-display text-xs leading-none"
              >
                ?
              </span>
              <div>
                <h3 className="font-bold">{p.title}</h3>
                <p className="text-sm text-ink-soft">{p.detail}</p>
                {p.link && (
                  <a
                    href={p.link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 inline-flex min-h-11 items-center text-sm font-bold underline decoration-signal decoration-2 underline-offset-4"
                  >
                    {p.link.label} ↗
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="plan">
        <h2 id="plan" className="label mb-3">
          El plan
        </h2>
        <ul className="grid grid-cols-3 gap-3">
          {INFO.highlights.map((h) => (
            <li key={h.title} className="card flex flex-col p-3">
              <span className="font-stencil text-2xl font-black leading-none">{h.title.toUpperCase()}</span>
              <span className="mt-2 text-sm text-ink-soft">{h.text}</span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="llevar">
        <h2 id="llevar" className="label mb-3">
          Qué llevar
        </h2>
        <ul className="space-y-2">
          {INFO.bring.map((item) => (
            <li key={item} className="flex gap-3">
              <span aria-hidden className="mt-2 size-2 shrink-0 bg-signal" />
              {item}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
