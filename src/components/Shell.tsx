"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useApp } from "./AppProvider";
import { Gate } from "./Gate";

const TABS = [
  { href: "/", label: "Info", icon: "M12 3 3 10v10h6v-6h6v6h6V10z" },
  {
    href: "/itinerario",
    label: "Itinerario",
    icon: "M7 2v3M17 2v3M3 8h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z",
  },
  {
    href: "/gastos",
    label: "Gastos",
    icon: "M12 2v20M17 6.5C17 4.6 14.8 3.5 12 3.5S7 4.9 7 7s2 3 5 3.7 5 1.5 5 3.8-2.2 3.5-5 3.5-5-1.2-5-3",
  },
];

export function Shell({ children }: { children: ReactNode }) {
  const { me, leave, offline } = useApp();
  const pathname = usePathname();

  if (me === undefined) {
    return <div className="grid min-h-dvh place-items-center font-display text-2xl">…</div>;
  }
  if (me === null) return <Gate />;

  return (
    <>
      <header className="sticky top-0 z-20 border-b-2 border-ink bg-paper pt-[env(safe-area-inset-top)]">
        <div className="mx-auto flex h-12 max-w-2xl items-center justify-between px-4">
          <span className="font-stencil text-2xl font-black leading-none tracking-tight">
            SE CASA EL GORDO
          </span>
          <button
            onClick={leave}
            className="flex min-h-11 items-center gap-1 text-sm font-semibold"
            aria-label={`Sos ${me.name}. Cambiar de persona`}
          >
            <span className="max-w-24 truncate border-b-2 border-signal">{me.name}</span>
            <span aria-hidden className="text-ink-soft">⇄</span>
          </button>
        </div>
        {offline && (
          <p className="bg-ink px-4 py-1 text-center text-xs font-semibold text-paper" role="status">
            Sin conexión: mostrando lo último que se vio
          </p>
        )}
      </header>

      <div className="mx-auto max-w-2xl px-4 pt-5">{children}</div>

      <nav
        aria-label="Secciones"
        className="fixed inset-x-0 bottom-0 z-20 border-t-2 border-ink bg-paper pb-[env(safe-area-inset-bottom)]"
      >
        <ul className="mx-auto grid max-w-2xl grid-cols-3">
          {TABS.map((t) => {
            const active = t.href === "/" ? pathname === "/" : pathname.startsWith(t.href);
            return (
              <li key={t.href}>
                <Link
                  href={t.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex min-h-16 flex-col items-center justify-center gap-1 ${
                    active ? "bg-ink text-paper" : "text-ink"
                  }`}
                >
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="square"
                    aria-hidden
                  >
                    <path d={t.icon} />
                  </svg>
                  <span className="font-display text-xs uppercase tracking-widest">{t.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
