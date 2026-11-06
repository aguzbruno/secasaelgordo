import { isKnownPerson, jsonError, mergeExpenses, parseExpenseInput, readJson, withStore } from "@/lib/api";
import type { Expense } from "@/lib/types";

async function findCurrent(store: { load(): Promise<Expense[]> }, id: string) {
  return mergeExpenses(await store.load()).find((e) => e.id === id);
}

/** Cualquiera del grupo puede editar un gasto (también los fijos). */
export async function PUT(req: Request, ctx: RouteContext<"/api/expenses/[id]">) {
  const { id } = await ctx.params;
  const input = parseExpenseInput(await readJson(req), "updatedById");
  if (input instanceof Response) return input;
  const { actorId, ...fields } = input;

  return withStore(async (store) => {
    const current = await findCurrent(store, id);
    if (!current) return jsonError("Ese gasto ya no existe", 404);

    const expense: Expense = {
      ...current,
      ...fields,
      // Un pago sigue siendo pago y un gasto sigue siendo gasto.
      kind: current.kind,
      updatedById: actorId,
      updatedAt: Date.now(),
    };
    await store.putExpense(expense);
    return Response.json({ expense });
  });
}

/** Cualquiera del grupo puede borrar un gasto (`?by=<personId>`). */
export async function DELETE(req: Request, ctx: RouteContext<"/api/expenses/[id]">) {
  const { id } = await ctx.params;
  const by = new URL(req.url).searchParams.get("by");
  if (!isKnownPerson(by)) return jsonError("Falta quién borra", 400);

  return withStore(async (store) => {
    const current = await findCurrent(store, id);
    if (!current) return Response.json({ ok: true });

    if (id.startsWith("seed-")) {
      // Los fijos viven en el código: se tapan con una marca de borrado.
      await store.putExpense({ ...current, deleted: true, updatedById: by, updatedAt: Date.now() });
    } else {
      await store.deleteExpense(id);
    }
    return Response.json({ ok: true });
  });
}
