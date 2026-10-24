import { buildDb, withStore } from "@/lib/api";

export async function GET() {
  return withStore(async (store) => {
    return Response.json(buildDb(await store.load()), {
      headers: { "Cache-Control": "no-store" },
    });
  });
}
