import type { Currency, Expense, Person } from "./types";

const ars = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

const arsExact = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const usd = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const usdExact = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const CURRENCIES: Currency[] = ["ARS", "USD"];

export function formatCents(cents: number, currency: Currency = "ARS"): string {
  const whole = cents % 100 === 0;
  const fmt =
    currency === "USD" ? (whole ? usd : usdExact) : whole ? ars : arsExact;
  return fmt.format(cents / 100);
}

/** Acepta "12500", "12.500", "12.500,50", "12500.5". Devuelve centavos o null. */
export function parseAmountToCents(input: string): number | null {
  let s = input.replace(/[^\d.,]/g, "");
  if (!s) return null;
  if (s.includes(",")) {
    s = s.replace(/\./g, "").replace(",", ".");
  } else if (/^\d{1,3}(\.\d{3})+$/.test(s)) {
    s = s.replace(/\./g, "");
  }
  const n = Number(s);
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.round(n * 100);
}

/** Reparte en partes iguales sin perder centavos: los sobrantes van a los primeros. */
export function splitEvenly(cents: number, ids: string[]): Map<string, number> {
  const out = new Map<string, number>();
  if (ids.length === 0) return out;
  const base = Math.floor(cents / ids.length);
  let rest = cents - base * ids.length;
  for (const id of ids) {
    out.set(id, base + (rest > 0 ? 1 : 0));
    if (rest > 0) rest--;
  }
  return out;
}

/** Saldo neto por persona: positivo = le deben, negativo = debe. */
export function netBalances(
  people: Person[],
  expenses: Expense[],
): Map<string, number> {
  const net = new Map<string, number>(people.map((p) => [p.id, 0]));
  for (const e of expenses) {
    net.set(e.payerId, (net.get(e.payerId) ?? 0) + e.amountCents);
    // Ordenado para que el reparto de centavos sea determinístico entre clientes.
    const ids = [...e.participantIds].sort();
    for (const [id, share] of splitEvenly(e.amountCents, ids)) {
      net.set(id, (net.get(id) ?? 0) - share);
    }
  }
  return net;
}

export type Transfer = { fromId: string; toId: string; cents: number };

/** Mínima cantidad de transferencias (greedy) para dejar todo en cero. */
export function settle(net: Map<string, number>): Transfer[] {
  const debtors = [...net]
    .filter(([, v]) => v < 0)
    .map(([id, v]) => ({ id, v: -v }))
    .sort((a, b) => b.v - a.v);
  const creditors = [...net]
    .filter(([, v]) => v > 0)
    .map(([id, v]) => ({ id, v }))
    .sort((a, b) => b.v - a.v);

  const transfers: Transfer[] = [];
  let i = 0;
  let j = 0;
  while (i < debtors.length && j < creditors.length) {
    const cents = Math.min(debtors[i].v, creditors[j].v);
    if (cents > 0) {
      transfers.push({ fromId: debtors[i].id, toId: creditors[j].id, cents });
    }
    debtors[i].v -= cents;
    creditors[j].v -= cents;
    if (debtors[i].v === 0) i++;
    if (creditors[j].v === 0) j++;
  }
  return transfers;
}
