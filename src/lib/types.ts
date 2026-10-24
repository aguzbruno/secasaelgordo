export type Currency = "ARS" | "USD";

export type Person = {
  id: string;
  name: string;
};

export type Expense = {
  id: string;
  description: string;
  amountCents: number;
  /** Cada moneda lleva sus propios saldos; no se convierten entre sí. */
  currency: Currency;
  payerId: string;
  /** Quiénes entran en el gasto; se divide en partes iguales. */
  participantIds: string[];
  createdById: string;
  createdAt: number;
  /** "payment" = pago entre dos personas para saldar deudas. */
  kind: "expense" | "payment";
};

export type Db = {
  people: Person[];
  expenses: Expense[];
};
