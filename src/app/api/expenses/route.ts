import { jsonError, readJson, withStore } from "@/lib/api";
import { ROSTER } from "@/lib/trip";
import type { Expense } from "@/lib/types";

const MAX_CENTS = 100_000_000_00; // 100 millones de pesos

export async function POST(req: Request) {
  const body = await readJson(req);
  const description =
    typeof body.description === "string" ? body.description.trim().slice(0, 80) : "";
  const { amountCents, payerId, createdById, participantIds } = body;
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
  if (typeof payerId !== "string" || typeof createdById !== "string") {
    return jsonError("Falta quién pagó");
  }
  if (
    !Array.isArray(participantIds) ||
    participantIds.length === 0 ||
    !participantIds.every((id) => typeof id === "string")
  ) {
    return jsonError("Elegí al menos una persona");
  }

  return withStore(async (store) => {
    const known = new Set(ROSTER.map((p) => p.id));
    const unique = [...new Set(participantIds as string[])];
    if (![payerId, createdById, ...unique].every((id) => known.has(id))) {
      return jsonError("Persona desconocida", 400);
    }

    const expense: Expense = {
      id: crypto.randomUUID().slice(0, 8),
      description,
      amountCents,
      currency,
      payerId,
      participantIds: unique,
      createdById,
      createdAt: Date.now(),
      kind,
    };
    await store.putExpense(expense);
    return Response.json({ expense }, { status: 201 });
  });
}
