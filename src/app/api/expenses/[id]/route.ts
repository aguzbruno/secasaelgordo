import { jsonError, withStore } from "@/lib/api";

/** Solo quien cargó el gasto puede borrarlo (`?by=<personId>`). */
export async function DELETE(req: Request, ctx: RouteContext<"/api/expenses/[id]">) {
  const { id } = await ctx.params;
  const by = new URL(req.url).searchParams.get("by");

  if (id.startsWith("seed-")) return jsonError("Este gasto es fijo y no se puede borrar", 403);

  return withStore(async (store) => {
    const expenses = await store.load();
    const expense = expenses.find((e) => e.id === id);
    if (!expense) return Response.json({ ok: true });
    if (expense.createdById !== by) {
      return jsonError("Solo quien lo cargó puede borrarlo", 403);
    }
    await store.deleteExpense(id);
    return Response.json({ ok: true });
  });
}
