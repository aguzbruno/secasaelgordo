"use client";

import Image from "next/image";
import { ROSTER } from "@/lib/trip";
import { useApp } from "./AppProvider";

/** Pantalla de entrada: elegís quién sos de la lista cerrada. */
export function Gate() {
  const { join } = useApp();

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-8">
      <div className="relative -mx-5 overflow-hidden">
        <div className="halftone absolute inset-0 opacity-[0.07]" aria-hidden />
        <Image
          src="/img/gordo-full.png"
          alt="El Gordo gritando"
          width={480}
          height={700}
          priority
          className="relative mx-auto w-[70%] max-w-[20rem]"
        />
      </div>

      <div className="mt-2 flex items-baseline justify-between border-y-2 border-ink py-2">
        <span className="font-display text-3xl tracking-wide">MENDOZA</span>
        <span className="font-display text-3xl tracking-wide text-signal">26</span>
      </div>

      <h1 className="label mt-6 mb-3">¿Quién sos?</h1>
      <ul className="grid grid-cols-2 gap-3">
        {ROSTER.map((p) => (
          <li key={p.id} className={p.loginLabel ? "col-span-2" : undefined}>
            <button
              onClick={() => join({ id: p.id, name: p.name })}
              className="card min-h-14 w-full px-3 font-display text-xl uppercase tracking-wide active:translate-x-1 active:translate-y-1 active:shadow-none"
            >
              {p.loginLabel ?? p.name}
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}
