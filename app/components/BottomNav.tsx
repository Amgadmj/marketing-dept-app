"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "./nav-items";

/** Mobile equivalent of SideNav — a fixed tab bar, hidden from md up. */
export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-[var(--panel-border)] bg-[rgba(15,21,36,0.75)] px-2 py-2 backdrop-blur-xl shadow-[var(--glow-ambient)]">
      {NAV_ITEMS.map((item) => {
        const active = item.match(pathname);
        return (
          <Link
            key={item.label}
            href={item.href}
            className={`flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 transition-colors ${
              active ? "text-[var(--accent)]" : "text-[var(--faint)]"
            }`}
          >
            <span className={`material-symbols-outlined text-[20px] ${active ? "fill" : ""}`}>
              {item.icon}
            </span>
            <span className={`text-[10px] ${active ? "font-semibold" : "font-medium"}`}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
