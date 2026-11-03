"use client";

import { useMemo, useState } from "react";
import { CURRENCIES, formatCents, netBalances, settle, splitEvenly, type Transfer } from "@/lib/money";
import type { Currency } from "@/lib/types";
import { useApp, type NewExpense } from "./AppProvider";
import { ExpenseSheet } from "./ExpenseSheet";

type SheetState = { preset?: Parameters<typeof ExpenseSheet>[0]["preset"] } | null;

const dayFmt = new Intl.DateTimeFormat("es-AR", { weekday: "short", day: "numeric", month: "short" });

function Chip({ name, strong, mine, muted }: { name: string; strong?: boolean; mine?: boolean; muted?: boolean }) {
  const tone = mine
    ? "border-signal bg-signal text-paper"
    : strong
      ? "border-ink bg-ink text-paper"
      : muted
        ? "border-ink/40 text-ink-soft line-through"
        : "border-ink bg-paper";
  return <span className={`inline-block border-2 px-2 py-0.5 font-bold ${tone}`}>{name}</span>;
}

export function Expenses() {
  const { me, db, ready, addExpense, deleteExpense } = useApp();
  const [view, setView] = useState<"saldos" | "gastos">("saldos");
  const [sheet, setSheet] = useState<SheetState>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const meId = me?.id;
  const names = useMemo(() => new Map(db.people.map((p) => [p.id, p.name])), [db.people]);
  const nameOf = (id: string) => names.get(id) ?? "¿?";

  // Cada moneda tiene sus propios saldos: no se convierten entre sí.
  const ledgers = useMemo(() => {
    const used = CURRENCIES.filter((c) => db.expenses.some((e) => e.currency === c));
    return (used.length ? used : (["ARS"] as Currency[])).map((currency) => {
      const expenses = db.expenses.filter((e) => e.currency === currency);
      const net = netBalances(db.people, expenses);
      const total = expenses.filter((e) => e.kind === "expense").reduce((s, e) => s + e.amountCents, 0);
      return { currency, net, transfers: settle(net), total };
    });
  }, [db.people, db.expenses]);

  // Deudas agrupadas por quien debe; pesos y dólares juntos, uno debajo del otro.
  const debtors = useMemo(() => {
    const byDebtor = new Map<string, { t: Transfer; currency: Currency }[]>();
    for (const l of ledgers) {
      for (const t of l.transfers) {
        byDebtor.set(t.fromId, [...(byDebtor.get(t.fromId) ?? []), { t, currency: l.currency }]);
      }
    }
    return db.people
      .filter((p) => byDebtor.has(p.id))
      .map((p) => ({ id: p.id, debts: byDebtor.get(p.id)! }))
      .sort((a, b) => Number(b.id === meId) - Number(a.id === meId));
  }, [ledgers, db.people, meId]);

  const sortedExpenses = useMemo(
    () => [...db.expenses].sort((a, b) => b.createdAt - a.createdAt),
    [db.expenses],
  );

  if (!me) return null;
  const allSettled = ledgers.every((l) => (l.net.get(me.id) ?? 0) === 0);

  async function run(fn: () => Promise<void>) {
    setActionError(null);
    try {
      await fn();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Algo salió mal");
    }
  }

  function payPreset(t: Transfer, currency: Currency): SheetState {
    return {
      preset: {
        kind: "payment",
        description: `Pago a ${nameOf(t.toId)}`,
        amountCents: t.cents,
        currency,
        payerId: t.fromId,
        participantIds: [t.toId],
      },
    };
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-display text-4xl uppercase leading-none">Gastos</h1>
        <div role="tablist" aria-label="Vista" className="grid grid-cols-2 border-2 border-ink shadow-[3px_3px_0_var(--ink)]">
          {(["saldos", "gastos"] as const).map((v) => (
            <button
              key={v}
              role="tab"
              aria-selected={view === v}
              onClick={() => setView(v)}
              className={`min-h-11 px-3 font-display text-sm tracking-wider whitespace-nowrap uppercase ${
                view === v ? "bg-signal text-paper" : "bg-paper"
              }`}
            >
              {v === "saldos" ? "Deudas" : `Ver gastos (${db.expenses.length})`}
            </button>
          ))}
        </div>
      </div>

      {!ready ? (
        <p className="font-semibold">Cargando…</p>
      ) : (
        <>
          <section aria-label="Tu saldo" className="card p-4">
            <p className="label text-ink-soft">Tu saldo</p>
            {allSettled && <p className="font-display text-5xl">Estás a mano</p>}
            {ledgers.map(({ currency, net, transfers }) => {
              const myNet = net.get(me.id) ?? 0;
              if (myNet === 0) return null;
              const iOwe = transfers.filter((t) => t.fromId === me.id);
              const owedToMe = transfers.filter((t) => t.toId === me.id);
              return (
                <div key={currency} className="mt-2 first:mt-0">
                  <p
                    className={`font-display text-5xl tabular-nums ${myNet < 0 ? "text-signal" : "text-ok"}`}
                  >
                    {myNet > 0 ? "+" : "−"}
                    {formatCents(Math.abs(myNet), currency)}
                    {currency === "USD" && <span className="ml-2 text-xl text-ink">USD</span>}
                  </p>
                  <p className="text-sm text-ink-soft">
                    {myNet < 0 ? "Es lo que tenés que pagar." : "Es lo que te deben."}
                  </p>
                  {(iOwe.length > 0 || owedToMe.length > 0) && (
                    <ul className="mt-3 divide-y-2 divide-ink border-y-2 border-ink">
                      {iOwe.map((t) => (
                        <li key={t.toId} className="flex items-center justify-between gap-3 py-3">
                          <span>
                            Le debés <b className="tabular-nums">{formatCents(t.cents, currency)}</b> a{" "}
                            <b>{nameOf(t.toId)}</b>
                          </span>
                          <button
                            className="btn btn-ghost min-h-11 shrink-0 text-sm"
                            onClick={() => setSheet(payPreset(t, currency))}
                          >
                            Ya pagué
                          </button>
                        </li>
                      ))}
                      {owedToMe.map((t) => (
                        <li key={t.fromId} className="py-3">
                          <b>{nameOf(t.fromId)}</b> te debe{" "}
                          <b className="tabular-nums">{formatCents(t.cents, currency)}</b>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </section>

          {actionError && (
            <p role="alert" className="font-semibold text-signal">
              {actionError}
            </p>
          )}

          {view === "saldos" ? (
            <section className="space-y-4">
              {debtors.length === 0 ? (
                <p className="text-ink-soft">Todavía no hay deudas.</p>
              ) : (
                <ul className="space-y-3">
                  {debtors.map(({ id, debts }) => (
                    <li key={id} className={id === me.id ? "card border-signal shadow-[4px_4px_0_var(--signal)]" : "card"}>
                      <h2
                        className={`border-b-2 border-ink px-4 py-2 font-display text-lg uppercase tracking-wide ${
                          id === me.id ? "border-signal bg-signal text-paper" : ""
                        }`}
                      >
                        {nameOf(id)}
                        {id === me.id && " (vos)"} debe
                      </h2>
                      <ul className="divide-y divide-ink/30">
                        {debts.map(({ t, currency }) => (
                          <li
                            key={`${currency}-${t.toId}`}
                            className="flex items-baseline justify-between gap-3 px-4 py-2.5"
                          >
                            <span>
                              <span aria-hidden>→ </span>
                              <span className="sr-only">a </span>
                              <b>{nameOf(t.toId)}</b>
                            </span>
                            <span className="font-display text-lg whitespace-nowrap tabular-nums">
                              {formatCents(t.cents, currency)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ul>
              )}
              <p className="text-sm text-ink-soft">
                Total gastado: {ledgers.map((l) => formatCents(l.total, l.currency)).join(" + ")}
              </p>
            </section>
          ) : (
            <section>
              {db.expenses.length === 0 ? (
                <p className="text-ink-soft">No hay gastos todavía.</p>
              ) : (
                <ul className="space-y-3">
                  {sortedExpenses.map((e) => {
                    const shares = splitEvenly(e.amountCents, [...e.participantIds].sort());
                    const myShare = shares.get(me.id);
                    const perHead = [...shares.values()];
                    const even = perHead.every((v) => v === perHead[0]);
                    const missing = db.people.filter((p) => !e.participantIds.includes(p.id));
                    const everyone = missing.length === 0;
                    const almostEveryone = !everyone && missing.length <= 2 && e.participantIds.length >= 5;
                    return (
                      <li key={e.id} className="card overflow-hidden">
                        <div className="flex items-start justify-between gap-3 p-4 pb-3">
                          <div className="min-w-0">
                            <p className="label text-ink-soft">{dayFmt.format(e.createdAt)}</p>
                            <h3 className="font-bold leading-tight">
                              {e.kind === "payment" && (
                                <span className="mr-2 bg-ok px-1.5 text-xs font-bold uppercase text-paper">Pago</span>
                              )}
                              {e.description}
                            </h3>
                          </div>
                          <span className="font-display text-2xl whitespace-nowrap tabular-nums">
                            {formatCents(e.amountCents, e.currency)}
                            {e.currency === "USD" && <span className="ml-1 text-sm">USD</span>}
                          </span>
                        </div>

                        <dl className="space-y-2 border-t-2 border-ink px-4 py-3 text-sm">
                          <div className="flex items-center gap-3">
                            <dt className="label w-14 shrink-0 text-ink-soft">{e.kind === "payment" ? "De" : "Pagó"}</dt>
                            <dd>
                              <Chip name={nameOf(e.payerId)} strong mine={e.payerId === me.id} />
                            </dd>
                          </div>
                          <div className="flex items-start gap-3">
                            <dt className="label w-14 shrink-0 pt-1 text-ink-soft">{e.kind === "payment" ? "Para" : "Entre"}</dt>
                            <dd className="flex flex-wrap gap-1.5">
                              {everyone ? (
                                <Chip name="Todos" />
                              ) : almostEveryone ? (
                                <>
                                  <Chip name="Todos" />
                                  <span className="py-1 text-ink-soft">menos</span>
                                  {missing.map((p) => (
                                    <Chip key={p.id} name={p.name} muted />
                                  ))}
                                </>
                              ) : (
                                e.participantIds.map((id) => <Chip key={id} name={nameOf(id)} mine={id === me.id} />)
                              )}
                            </dd>
                          </div>
                          {e.kind === "expense" && (
                            <div className="flex items-center gap-3">
                              <dt className="label w-14 shrink-0 text-ink-soft">Cada uno</dt>
                              <dd className="font-semibold tabular-nums">
                                {even ? "" : "≈ "}
                                {formatCents(perHead[0] ?? 0, e.currency)}
                                <span className="font-normal text-ink-soft"> · {e.participantIds.length} personas</span>
                              </dd>
                            </div>
                          )}
                        </dl>

                        <div className="flex items-center justify-between gap-3 border-t-2 border-ink bg-ink/5 px-4 py-1">
                          <span className="text-sm font-bold">
                            {myShare !== undefined && e.kind === "expense"
                              ? `Tu parte: ${formatCents(myShare, e.currency)}`
                              : e.kind === "expense"
                                ? "No participás"
                                : ""}
                          </span>
                          {e.createdById === me.id && !e.id.startsWith("seed-") && (
                            <button
                              className="min-h-11 px-1 text-sm font-bold text-signal underline underline-offset-4"
                              onClick={() => {
                                if (confirm(`¿Borrar "${e.description}"?`)) void run(() => deleteExpense(e.id));
                              }}
                            >
                              Borrar
                            </button>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          )}
        </>
      )}

      <button
        className="btn fixed right-4 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-30 h-14 md:right-8 md:bottom-8"
        onClick={() => setSheet({})}
        disabled={db.people.length === 0}
      >
        + Nuevo gasto
      </button>

      {sheet && (
        <ExpenseSheet
          people={db.people}
          meId={me.id}
          preset={sheet.preset}
          onClose={() => setSheet(null)}
          onSubmit={(e: NewExpense) => addExpense(e)}
        />
      )}
    </div>
  );
}
