import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import type { Expense } from "./types";

/**
 * Persistencia compartida. En producción usa Upstash Redis (REST); en
 * desarrollo cae a un JSON local en `.data/db.json`.
 */
interface Store {
  load(): Promise<Expense[]>;
  putExpense(e: Expense): Promise<void>;
  deleteExpense(id: string): Promise<void>;
}

export class StoreNotConfiguredError extends Error {}

const EXPENSES_KEY = "gordo:expenses";

function upstash(url: string, token: string): Store {
  async function cmd<T>(...args: string[]): Promise<T> {
    const res = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(args),
      cache: "no-store",
    });
    const json = (await res.json()) as { result?: T; error?: string };
    if (!res.ok || json.error) {
      throw new Error(`Upstash: ${json.error ?? res.statusText}`);
    }
    return json.result as T;
  }

  async function hashValues<T>(key: string): Promise<T[]> {
    const flat = await cmd<string[]>("HGETALL", key);
    const out: T[] = [];
    for (let i = 1; i < flat.length; i += 2) out.push(JSON.parse(flat[i]));
    return out;
  }

  return {
    load: () => hashValues<Expense>(EXPENSES_KEY),
    async putExpense(e) {
      await cmd("HSET", EXPENSES_KEY, e.id, JSON.stringify(e));
    },
    async deleteExpense(id) {
      await cmd("HDEL", EXPENSES_KEY, id);
    },
  };
}

function file(filePath: string): Store {
  // Serializa escrituras para que dos requests no se pisen.
  let queue: Promise<unknown> = Promise.resolve();

  type FileDb = { expenses: Expense[] };

  async function read(): Promise<FileDb> {
    try {
      return JSON.parse(await fs.readFile(filePath, "utf8")) as FileDb;
    } catch {
      return { expenses: [] };
    }
  }

  function mutate(fn: (db: FileDb) => void): Promise<void> {
    const run = queue.then(async () => {
      const db = await read();
      fn(db);
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, JSON.stringify(db, null, 2));
    });
    queue = run.catch(() => {});
    return run;
  }

  return {
    load: () => queue.then(read).then((db) => db.expenses),
    putExpense: (e) =>
      mutate((db) => {
        db.expenses = [...db.expenses.filter((x) => x.id !== e.id), e];
      }),
    deleteExpense: (id) =>
      mutate((db) => {
        db.expenses = db.expenses.filter((x) => x.id !== id);
      }),
  };
}

let cached: Store | undefined;

export function getStore(): Store {
  if (cached) return cached;

  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;

  if (url && token) {
    cached = upstash(url, token);
  } else if (process.env.NODE_ENV !== "production" || process.env.DATA_FILE) {
    cached = file(process.env.DATA_FILE ?? path.join(process.cwd(), ".data", "db.json"));
  } else {
    throw new StoreNotConfiguredError(
      "Falta configurar UPSTASH_REDIS_REST_URL y UPSTASH_REDIS_REST_TOKEN.",
    );
  }
  return cached;
}
