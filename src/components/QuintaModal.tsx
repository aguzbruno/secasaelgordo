"use client";

import Image from "next/image";
import { useState } from "react";
import { QUINTA } from "@/lib/trip";
import { Modal, ModalFact } from "./Modal";

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-5">
      <h3 className="label mb-2">{title}</h3>
      {children}
    </section>
  );
}

function CopyButton({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setDone(true);
      setTimeout(() => setDone(false), 1500);
    } catch {
      /* sin permiso de portapapeles: el texto igual está a la vista */
    }
  }
  return (
    <button onClick={copy} className="min-h-11 px-2 text-sm font-bold underline decoration-signal decoration-2 underline-offset-4">
      {done ? "Copiado" : "Copiar"}
    </button>
  );
}

export function PhotoStrip({ photos }: { photos: { src: string; alt: string }[] }) {
  if (photos.length === 0) return null;
  if (photos.length === 1) {
    return (
      <Image
        src={photos[0].src}
        alt={photos[0].alt}
        width={1200}
        height={800}
        className="mb-4 h-52 w-full border-2 border-ink object-cover"
      />
    );
  }
  return (
    <div className="-mx-4 mb-4 flex snap-x snap-mandatory gap-2 overflow-x-auto px-4" aria-label="Fotos">
      {photos.map((p) => (
        <Image
          key={p.src}
          src={p.src}
          alt={p.alt}
          width={640}
          height={440}
          className="h-44 w-auto shrink-0 snap-center border-2 border-ink object-cover"
        />
      ))}
    </div>
  );
}

export function QuintaModal({ onClose }: { onClose: () => void }) {
  const q = QUINTA;
  return (
    <Modal title="La quinta" onClose={onClose}>
      <PhotoStrip photos={q.photos} />

      <div className="card p-4">
        <p className="font-stencil text-4xl font-black leading-none">{q.name.toUpperCase()}</p>
        <p className="mt-2 font-semibold">{q.address}</p>
        <a
          href={q.mapsUrl}
          target="_blank"
          rel="noreferrer"
          className="btn mt-3 w-full"
        >
          Abrir en Google Maps
        </a>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-center">
        <div className="card p-3">
          <p className="label text-ink-soft">Check-in</p>
          <p className="font-display text-4xl tabular-nums">{q.checkIn}</p>
        </div>
        <div className="card p-3">
          <p className="label text-ink-soft">Check-out</p>
          <p className="font-display text-4xl tabular-nums">{q.checkOut}</p>
        </div>
      </div>
      <p className="mt-2 text-sm text-ink-soft">{q.stay}</p>

      <Section title="Llegada">
        <ul className="space-y-2">
          {q.arrival.map((t) => (
            <li key={t} className="flex gap-3">
              <span aria-hidden className="mt-2 size-2 shrink-0 bg-signal" />
              {t}
            </li>
          ))}
        </ul>
      </Section>

      <Section title="WiFi">
        <dl className="card divide-y-2 divide-ink">
          <div className="flex items-center justify-between gap-3 px-4 py-2">
            <dt className="text-sm text-ink-soft">Red</dt>
            <dd className="font-semibold">{q.wifi.network}</dd>
          </div>
          <div className="flex items-center justify-between gap-3 px-4 py-1">
            <dt className="text-sm text-ink-soft">Clave</dt>
            <dd className="flex items-center gap-1 font-semibold">
              {q.wifi.password}
              <CopyButton text={q.wifi.password} />
            </dd>
          </div>
        </dl>
      </Section>

      <Section title="Residuos">
        <p>{q.trash}</p>
      </Section>

      <Section title="Pago de la quinta">
        <dl className="card divide-y-2 divide-ink">
          {(
            [
              ["Total", q.payment.total],
              ["Seña", q.payment.deposit],
              ["Saldo", q.payment.balance],
            ] as const
          ).map(([k, v]) => (
            <div key={k} className="flex items-baseline justify-between gap-3 px-4 py-2">
              <dt className="text-sm text-ink-soft">{k}</dt>
              <dd className="text-right font-semibold">{v}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-2 text-sm text-ink-soft">{q.payment.how}</p>
      </Section>

      <Section title="Links">
        <ul className="space-y-2">
          {q.links.map((l) => (
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

export function QuintaFact({ label, value }: { label: string; value: string }) {
  return (
    <ModalFact
      label={label}
      value={value}
      cta="ver info"
      modal={(close) => <QuintaModal onClose={close} />}
    />
  );
}
