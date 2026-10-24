import "server-only";
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

export function buildDb(expenses: Expense[]): Db {
  return {
    people: ROSTER.map(({ id, name }) => ({ id, name })),
    expenses: [...SEED_EXPENSES, ...expenses]
      .map((e) => ({ ...e, currency: e.currency ?? "ARS" })) // gastos viejos sin moneda
      .sort((a, b) => b.createdAt - a.createdAt),
  };
}
