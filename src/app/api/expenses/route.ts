import { parseExpenseInput, readJson, withStore } from "@/lib/api";
import type { Expense } from "@/lib/types";

export async function POST(req: Request) {
  const input = parseExpenseInput(await readJson(req), "createdById");
  if (input instanceof Response) return input;
  const { actorId, ...fields } = input;

  return withStore(async (store) => {
    const expense: Expense = {
      id: crypto.randomUUID().slice(0, 8),
      ...fields,
      createdById: actorId,
      createdAt: Date.now(),
    };
    await store.putExpense(expense);
    return Response.json({ expense }, { status: 201 });
  });
}
