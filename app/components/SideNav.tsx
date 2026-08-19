"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "./nav-items";

/** Persistent desktop sidebar. Hidden below md — BottomNav takes over there. */
export function SideNav() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex fixed left-0 top-0 z-40 h-screen w-64 flex-col gap-1 border-r border-[var(--panel-border)] bg-[rgba(15,21,36,0.5)] p-4 pt-6 backdrop-blur-xl">
      <Link href="/" className="mb-4 flex items-center gap-3 px-2 py-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--panel-elevated-border)] bg-[var(--accent-soft)]">
          <span className="material-symbols-outlined fill text-[20px] text-[var(--accent)]">
            landscape
          </span>
        </span>
        <div>
          <div className="text-[15px] font-semibold tracking-tight text-[var(--accent)]">
            Marketing Dept
          </div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--faint)]">
            Marketing com IA
          </div>
        </div>
      </Link>

      <nav className="flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const active = item.match(pathname);
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] transition-colors ${
                active
                  ? "border border-[var(--panel-elevated-border)] bg-[var(--accent-soft)] font-semibold text-[var(--accent)]"
                  : "text-[var(--muted)] hover:bg-white/5 hover:text-[var(--text)]"
              }`}
            >
              <span className={`material-symbols-outlined text-[20px] ${active ? "fill" : ""}`}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-1 border-t border-[var(--panel-border)] pt-3">
        <Link
          href="#"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] text-[var(--muted)] transition-colors hover:bg-white/5 hover:text-[var(--text)]"
        >
          <span className="material-symbols-outlined text-[18px]">help</span>
          Ajuda
        </Link>
        <Link
          href="#"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] text-[var(--muted)] transition-colors hover:bg-white/5 hover:text-[var(--text)]"
        >
          <span className="material-symbols-outlined text-[18px]">logout</span>
          Sair
        </Link>
      </div>
    </aside>
  );
}
