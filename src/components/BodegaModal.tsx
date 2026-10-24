"use client";

import { BODEGA } from "@/lib/trip";
import { Modal, ModalFact } from "./Modal";
import { PhotoStrip, Section } from "./QuintaModal";

export function BodegaModal({ onClose }: { onClose: () => void }) {
  const b = BODEGA;
  return (
    <Modal title="La bodega" onClose={onClose}>
      <PhotoStrip photos={b.photos} />

      <div className="card p-4">
        <p className="font-stencil text-4xl font-black leading-none">{b.name.toUpperCase()}</p>
        <p className="mt-2 font-semibold">{b.address}</p>
        <a href={b.mapsUrl} target="_blank" rel="noreferrer" className="btn mt-3 w-full">
          Abrir en Google Maps
        </a>
      </div>

      <Section title={b.day}>
        <ol className="card divide-y-2 divide-ink">
          {b.plan.map((p) => (
            <li key={p.time} className="flex items-baseline gap-4 px-4 py-3">
              <span className="font-display w-16 shrink-0 text-2xl tabular-nums">{p.time}</span>
              <span className="font-semibold">{p.text}</span>
            </li>
          ))}
        </ol>
      </Section>

      <Section title="Para tener en cuenta">
        <ul className="space-y-2">
          {b.notes.map((t) => (
            <li key={t} className="flex gap-3">
              <span aria-hidden className="mt-2 size-2 shrink-0 bg-signal" />
              {t}
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Links">
        <ul className="space-y-2">
          {b.links.map((l) => (
            <li key={l.url}>
              <a
                href={l.url}
                target="_blank"
                rel="noreferrer"
                className="flex min-h-12 items-center justify-between gap-3 border-2 border-ink bg-paper px-3 font-semibold"
              >
                {l.label}
                <span aria-hidden>↗</span>
              </a>
            </li>
          ))}
        </ul>
      </Section>
    </Modal>
  );
}

export function BodegaFact({ label, value }: { label: string; value: string }) {
  return (
    <ModalFact
      label={label}
      value={value}
      cta="ver info"
      modal={(close) => <BodegaModal onClose={close} />}
    />
  );
}
