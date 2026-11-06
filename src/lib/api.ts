import "server-only";
import { connection } from "next/server";
import { hasAccess } from "./access";
import { getStore, StoreNotConfiguredError } from "./store";
import { ROSTER, SEED_EXPENSES } from "./trip";
import type { Db, Expense } from "./types";

export function jsonError(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}

/** Ejecuta un handler traduciendo errores de storage a respuestas JSON. */
export async function withStore(
  fn: (store: ReturnType<typeof getStore>) => Promise<Response>,
): Promise<Response> {
  // Siempre se resuelve en el momento del pedido, nunca durante el build.
  await connection();
  if (!(await hasAccess())) return jsonError("Falta la contraseña", 401);
  try {
    return await fn(getStore());
  } catch (err) {
    if (err instanceof StoreNotConfiguredError) {
      return jsonError(err.message, 503);
    }
    console.error(err);
    return jsonError("Error del servidor", 500);
  }
}

export async function readJson(req: Request): Promise<Record<string, unknown>> {
  try {
    const body = await req.json();
    return body && typeof body === "object" ? body : {};
  } catch {
    return {};
  }
}

/** Gastos fijos + guardados. Un guardado con el mismo id que un fijo lo reemplaza (edición o borrado). */
export function mergeExpenses(stored: Expense[]): Expense[] {
  const byId = new Map<string, Expense>();
  for (const e of SEED_EXPENSES) byId.set(e.id, e);
  for (const e of stored) byId.set(e.id, e);
  return [...byId.values()].filter((e) => !e.deleted);
}

export function buildDb(expenses: Expense[]): Db {
  return {
    people: ROSTER.map(({ id, name }) => ({ id, name })),
    expenses: mergeExpenses(expenses)
      .map((e) => ({ ...e, currency: e.currency ?? "ARS" })) // gastos viejos sin moneda
      .sort((a, b) => b.createdAt - a.createdAt),
  };
}

const MAX_CENTS = 100_000_000_00; // 100 millones de pesos

export type ExpenseInput = Pick<
  Expense,
  "description" | "amountCents" | "currency" | "payerId" | "participantIds" | "kind"
> & { actorId: string; createdAt?: number };

const MIN_DATE = Date.parse("2025-01-01T00:00:00-03:00");
const MAX_AHEAD_MS = 366 * 24 * 60 * 60 * 1000;

/** Valida el cuerpo de alta/edición. `actorKey` es el campo con quién hace la acción. */
export function parseExpenseInput(
  body: Record<string, unknown>,
  actorKey: "createdById" | "updatedById",
): ExpenseInput | Response {
  const description =
    typeof body.description === "string" ? body.description.trim().slice(0, 80) : "";
  const { amountCents, payerId, participantIds } = body;
  const actorId = body[actorKey];
  const currency = body.currency === "USD" ? "USD" : "ARS";
  const kind = body.kind === "payment" ? "payment" : "expense";

  if (!description) return jsonError("Falta la descripción");
  if (
    typeof amountCents !== "number" ||
    !Number.isInteger(amountCents) ||
    amountCents <= 0 ||
    amountCents > MAX_CENTS
  ) {
    return jsonError("Monto inválido");
  }
  if (typeof payerId !== "string" || typeof actorId !== "string") {
    return jsonError("Falta quién pagó");
  }
  if (
    !Array.isArray(participantIds) ||
    participantIds.length === 0 ||
    !participantIds.every((id) => typeof id === "string")
  ) {
    return jsonError("Elegí al menos una persona");
  }

  const { createdAt } = body;
  if (
    createdAt !== undefined &&
    (typeof createdAt !== "number" ||
      !Number.isFinite(createdAt) ||
      createdAt < MIN_DATE ||
      createdAt > Date.now() + MAX_AHEAD_MS)
  ) {
    return jsonError("Fecha inválida");
  }

  const known = new Set(ROSTER.map((p) => p.id));
  const unique = [...new Set(participantIds as string[])];
  if (![payerId, actorId, ...unique].every((id) => known.has(id))) {
    return jsonError("Persona desconocida", 400);
  }

  return {
    description,
    amountCents,
    currency,
    payerId,
    participantIds: unique,
    kind,
    actorId,
    ...(createdAt !== undefined && { createdAt: Math.round(createdAt) }),
  };
}

export function isKnownPerson(id: unknown): id is string {
  return typeof id === "string" && ROSTER.some((p) => p.id === id);
}
