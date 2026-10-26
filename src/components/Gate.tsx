"use client";

import Image from "next/image";
import { useState, type FormEvent } from "react";
import { ROSTER } from "@/lib/trip";
import { useApp } from "./AppProvider";

/** Primer paso: contraseña del grupo. No muestra nada de la despedida. */
function PasswordStep() {
  const { unlock } = useApp();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await unlock(password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo entrar");
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-5 py-10">
      <form onSubmit={onSubmit} className="space-y-4">
        <label htmlFor="password" className="font-display block text-3xl uppercase">
          Contraseña
        </label>
        <input
          id="password"
          className="field"
          type="password"
          autoFocus
          autoComplete="off"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && (
          <p role="alert" className="font-semibold text-signal">
            {error}
          </p>
        )}
        <button className="btn w-full" disabled={busy || password.trim().length === 0}>
          {busy ? "Entrando…" : "Entrar"}
        </button>
      </form>
    </main>
  );
}

/** Segundo paso: elegís quién sos de la lista cerrada. */
function PersonStep() {
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

export function Gate() {
  const { unlocked } = useApp();
  return unlocked ? <PersonStep /> : <PasswordStep />;
}
