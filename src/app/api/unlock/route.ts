import { connection } from "next/server";
import { grantAccess, hasAccess, passwordMatches } from "@/lib/access";
import { jsonError, readJson } from "@/lib/api";

/** ¿Ya tiene acceso este navegador? */
export async function GET() {
  await connection();
  return Response.json({ ok: await hasAccess() });
}

export async function POST(req: Request) {
  await connection();
  const body = await readJson(req);
  const password = typeof body.password === "string" ? body.password : "";
  if (!passwordMatches(password)) return jsonError("Contraseña incorrecta", 401);
  await grantAccess();
  return Response.json({ ok: true });
}
