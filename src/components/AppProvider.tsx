"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { ROSTER } from "@/lib/trip";
import type { Currency, Db, Expense, Person } from "@/lib/types";

const ME_KEY = "gordo.me";
const CACHE_KEY = "gordo.cache";
const POLL_MS = 20_000;

/* ---------- "yo" persistido en localStorage ---------- */

const meListeners = new Set<() => void>();

function readMeRaw(): string | null {
  try {
    return localStorage.getItem(ME_KEY);
  } catch {
    return null;
  }
}

function subscribeMe(cb: () => void) {
  meListeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    meListeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

function writeMe(person: Person | null) {
  try {
    if (person) localStorage.setItem(ME_KEY, JSON.stringify(person));
    else localStorage.removeItem(ME_KEY);
  } catch {
    /* modo privado: la sesión dura lo que dure la pestaña */
  }
  meListeners.forEach((l) => l());
}

/* ---------- contexto ---------- */

export type NewExpense = {
  description: string;
  amountCents: number;
  currency: Currency;
  payerId: string;
  participantIds: string[];
  kind?: Expense["kind"];
};

type Ctx = {
  /** Pasó la contraseña del grupo. `undefined` mientras se consulta. */
  unlocked: boolean | undefined;
  unlock(password: string): Promise<void>;
  /** `undefined` mientras hidrata, `null` si todavía no dijo quién es. */
  me: Person | null | undefined;
  db: Db;
  /** Se cargó al menos una vez (de red o de caché). */
  ready: boolean;
  offline: boolean;
  /** Mensaje del servidor si /api/state falló estando con internet. */
  serverError: string | null;
  join(person: Person): void;
  leave(): void;
  addExpense(e: NewExpense): Promise<void>;
  deleteExpense(id: string): Promise<void>;
  refresh(): Promise<void>;
};

const AppCtx = createContext<Ctx | null>(null);

export function useApp(): Ctx {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error("useApp fuera de <AppProvider>");
  return ctx;
}

class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(json.error ?? "No se pudo completar la acción", res.status);
  return json as T;
}

const EMPTY: Db = { people: [], expenses: [] };

export function AppProvider({ children }: { children: ReactNode }) {
  const meRaw = useSyncExternalStore(subscribeMe, readMeRaw, () => undefined);
  const me = useMemo<Person | null | undefined>(() => {
    if (meRaw === undefined) return undefined;
    if (!meRaw) return null;
    try {
      // Solo vale si sigue en la lista cerrada (descarta nombres viejos).
      const saved = JSON.parse(meRaw) as Person;
      const found = ROSTER.find((p) => p.id === saved.id);
      return found ? { id: found.id, name: found.name } : null;
    } catch {
      return null;
    }
  }, [meRaw]);

  const [db, setDb] = useState<Db>(EMPTY);
  const [ready, setReady] = useState(false);
  const [offline, setOffline] = useState(false);
  const [unlocked, setUnlocked] = useState<boolean | undefined>(undefined);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    api<{ ok: boolean }>("/api/unlock")
      .then((r) => alive && setUnlocked(r.ok))
      .catch(() => alive && setUnlocked(false));
    return () => {
      alive = false;
    };
  }, []);

  const unlock = useCallback(async (password: string) => {
    await api("/api/unlock", { method: "POST", body: JSON.stringify({ password }) });
    setUnlocked(true);
  }, []);

  const refresh = useCallback(async () => {
    try {
      const next = await api<Db>("/api/state");
      setDb(next);
      setReady(true);
      setOffline(false);
      setServerError(null);
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(next));
      } catch {}
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setUnlocked(false);
        return;
      }
      const online = typeof navigator === "undefined" || navigator.onLine;
      setOffline(!online);
      setServerError(online && err instanceof Error ? err.message : null);
      setDb((cur) => {
        if (cur !== EMPTY) return cur;
        try {
          const cached = localStorage.getItem(CACHE_KEY);
          if (cached) return JSON.parse(cached) as Db;
        } catch {}
        return cur;
      });
      setReady(true);
    }
  }, []);

  useEffect(() => {
    if (!me || !unlocked) return;
    const first = setTimeout(() => void refresh(), 0);
    const tick = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    const id = setInterval(tick, POLL_MS);
    document.addEventListener("visibilitychange", tick);
    window.addEventListener("online", tick);
    return () => {
      clearTimeout(first);
      clearInterval(id);
      document.removeEventListener("visibilitychange", tick);
      window.removeEventListener("online", tick);
    };
  }, [me, unlocked, refresh]);

  const join = useCallback((person: Person) => writeMe(person), []);

  const leave = useCallback(() => writeMe(null), []);

  const addExpense = useCallback(
    async (e: NewExpense) => {
      if (!me) return;
      await api("/api/expenses", {
        method: "POST",
        body: JSON.stringify({ ...e, createdById: me.id }),
      });
      await refresh();
    },
    [me, refresh],
  );

  const deleteExpense = useCallback(
    async (id: string) => {
      if (!me) return;
      await api(`/api/expenses/${id}?by=${encodeURIComponent(me.id)}`, {
        method: "DELETE",
      });
      await refresh();
    },
    [me, refresh],
  );

  const value = useMemo<Ctx>(
    () => ({ unlocked, unlock, me, db, ready, offline, serverError, join, leave, addExpense, deleteExpense, refresh }),
    [unlocked, unlock, me, db, ready, offline, serverError, join, leave, addExpense, deleteExpense, refresh],
  );

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}
