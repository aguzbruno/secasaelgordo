"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { CURRENCIES, formatCents, parseAmountToCents, splitEvenly } from "@/lib/money";
import type { Currency, Person } from "@/lib/types";
import type { NewExpense } from "./AppProvider";

type Props = {
  people: Person[];
  meId: string;
  /** Precarga para registrar un pago (saldar deuda). */
  preset?: Partial<NewExpense> & { lockParticipants?: boolean };
  onClose: () => void;
  onSubmit: (e: NewExpense) => Promise<void>;
};

export function ExpenseSheet({ people, meId, preset, onClose, onSubmit }: Props) {
  const isPayment = preset?.kind === "payment";
  const [description, setDescription] = useState(preset?.description ?? "");
  const [amount, setAmount] = useState(
    preset?.amountCents ? String(preset.amountCents / 100).replace(".", ",") : "",
  );
  const [currency, setCurrency] = useState<Currency>(preset?.currency ?? "ARS");
  const [payerId, setPayerId] = useState(preset?.payerId ?? meId);
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(preset?.participantIds ?? people.map((p) => p.id)),
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const firstField = useRef<HTMLInputElement>(null);

  useEffect(() => {
    firstField.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const cents = parseAmountToCents(amount);
  const shares = useMemo(
    () => (cents ? splitEvenly(cents, [...selected].sort()) : new Map<string, number>()),
    [cents, selected],
  );

  const valid = description.trim().length > 0 && cents !== null && selected.size > 0;

  function toggle(id: string) {
    setSelected((cur) => {
      const next = new Set(cur);
      if (!next.delete(id)) next.add(id);
      return next;
    });
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!valid || cents === null) return;
    setBusy(true);
    setError(null);
    try {
      await onSubmit({
        description: description.trim(),
        amountCents: cents,
        currency,
        payerId,
        participantIds: [...selected],
        kind: isPayment ? "payment" : "expense",
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar");
      setBusy(false);
    }
  }

  const allSelected = selected.size === people.length;

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-ink/60" onClick={onClose}>
      <form
        role="dialog"
        aria-modal="true"
        aria-label={isPayment ? "Registrar pago" : "Nuevo gasto"}
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
        className="sheet flex max-h-[92dvh] w-full max-w-2xl flex-col border-t-2 border-ink bg-paper"
      >
        <div className="flex shrink-0 items-center justify-between border-b-2 border-ink py-1 pr-2 pl-5">
          <h2 className="font-display text-3xl uppercase">{isPayment ? "Registrar pago" : "Nuevo gasto"}</h2>
          <button type="button" onClick={onClose} className="grid size-11 place-items-center text-2xl" aria-label="Cerrar">
            ✕
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto overscroll-contain p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          <div>
            <label htmlFor="desc" className="label mb-1 block">
              Qué fue
            </label>
            <input
              id="desc"
              ref={firstField}
              className="field"
              placeholder="Carne, nafta, bodega…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={80}
            />
          </div>

          <div role="group" aria-label="Moneda" className="grid grid-cols-2 border-2 border-ink">
            {CURRENCIES.map((c) => (
              <button
                key={c}
                type="button"
                aria-pressed={currency === c}
                disabled={isPayment && preset?.currency !== c}
                onClick={() => setCurrency(c)}
                className={`min-h-11 font-display tracking-widest ${currency === c ? "bg-ink text-paper" : ""}`}
              >
                {c === "ARS" ? "Pesos (ARS)" : "Dólares (USD)"}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="amount" className="label mb-1 block">
                Monto
              </label>
              <input
                id="amount"
                className="field tabular-nums"
                inputMode="decimal"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="payer" className="label mb-1 block">
                {isPayment ? "Pagó" : "Pagó"}
              </label>
              <select id="payer" className="field" value={payerId} onChange={(e) => setPayerId(e.target.value)}>
                {people.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                    {p.id === meId ? " (yo)" : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {!preset?.lockParticipants && (
            <fieldset>
              <div className="mb-1 flex items-center justify-between">
                <legend className="label">{isPayment ? "Se lo pagó a" : "Entre quiénes"}</legend>
                {!isPayment && (
                  <button
                    type="button"
                    className="min-h-11 text-sm font-bold underline decoration-signal decoration-2 underline-offset-4"
                    onClick={() => setSelected(new Set(allSelected ? [] : people.map((p) => p.id)))}
                  >
                    {allSelected ? "Ninguno" : "Todos"}
                  </button>
                )}
              </div>
              <ul className="grid grid-cols-2 gap-2">
                {people.map((p) => {
                  const on = selected.has(p.id);
                  const share = shares.get(p.id);
                  return (
                    <li key={p.id}>
                      <label
                        className={`flex min-h-12 cursor-pointer items-center justify-between gap-2 border-2 border-ink px-3 ${
                          on ? "bg-ink text-paper" : "bg-paper"
                        }`}
                      >
                        <span className="flex min-w-0 items-center gap-2">
                          <input
                            type={isPayment ? "radio" : "checkbox"}
                            name="who"
                            className="sr-only"
                            checked={on}
                            onChange={() => (isPayment ? setSelected(new Set([p.id])) : toggle(p.id))}
                          />
                          <span aria-hidden className={`size-4 shrink-0 border-2 ${on ? "border-paper bg-signal" : "border-ink"}`} />
                          <span className="truncate font-semibold">{p.name}</span>
                        </span>
                        {on && share !== undefined && (
                          <span className="text-xs tabular-nums opacity-80">{formatCents(share, currency)}</span>
                        )}
                      </label>
                    </li>
                  );
                })}
              </ul>
            </fieldset>
          )}

          {error && (
            <p role="alert" className="font-semibold text-signal">
              {error}
            </p>
          )}
          <button className="btn w-full" disabled={!valid || busy}>
            {busy ? "Guardando…" : "Guardar"}
          </button>
        </div>
      </form>
    </div>
  );
}
