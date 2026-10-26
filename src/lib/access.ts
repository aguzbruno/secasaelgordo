import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE = "gordo_access";
const PASSWORD = process.env.ACCESS_PASSWORD ?? "mendoza2026";
const SALT = process.env.ACCESS_SALT ?? "gordo26";

const normalize = (s: string) =>
  s
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();

const token = () => createHash("sha256").update(`${normalize(PASSWORD)}|${SALT}`).digest("hex");

export function passwordMatches(input: string): boolean {
  const a = Buffer.from(normalize(input));
  const b = Buffer.from(normalize(PASSWORD));
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function grantAccess(): Promise<void> {
  (await cookies()).set(COOKIE, token(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 90,
    path: "/",
  });
}

export async function hasAccess(): Promise<boolean> {
  const value = (await cookies()).get(COOKIE)?.value;
  if (!value) return false;
  const a = Buffer.from(value);
  const b = Buffer.from(token());
  return a.length === b.length && timingSafeEqual(a, b);
}
