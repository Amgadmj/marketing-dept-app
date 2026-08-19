import Link from "next/link";

/** Persistent top bar, offset by SideNav's width on desktop. */
export function TopBar() {
  return (
    <header className="fixed left-0 right-0 top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-[var(--panel-border)] bg-[rgba(15,21,36,0.6)] px-4 backdrop-blur-xl shadow-[var(--glow-ambient)] md:left-64 md:px-6">
      <div className="flex max-w-sm flex-1 items-center gap-2 rounded-full border border-[var(--panel-border)] bg-[rgba(15,21,36,0.4)] px-3.5 py-2">
        <span className="material-symbols-outlined text-[18px] text-[var(--faint)]">search</span>
        <input
          type="text"
          placeholder="Buscar campanhas..."
          className="w-full bg-transparent text-[13px] text-[var(--text)] outline-none placeholder:text-[var(--faint)]"
        />
      </div>

      <div className="flex items-center gap-1.5 md:gap-3">
        <Link
          href="#"
          aria-label="Notificações"
          className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--muted)] transition-colors hover:bg-white/5 hover:text-[var(--text)]"
        >
          <span className="material-symbols-outlined text-[20px]">notifications</span>
        </Link>
        <Link
          href="#"
          aria-label="Ajuda"
          className="hidden h-9 w-9 items-center justify-center rounded-full text-[var(--muted)] transition-colors hover:bg-white/5 hover:text-[var(--text)] sm:flex"
        >
          <span className="material-symbols-outlined text-[20px]">help</span>
        </Link>
        <div className="mx-1 hidden h-6 w-px bg-[var(--panel-border)] sm:block" />
        <Link
          href="/settings"
          aria-label="Conta"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--panel-elevated-border)] bg-[var(--accent-soft)] text-[var(--accent)] transition-colors hover:bg-[rgba(125,211,252,0.25)]"
        >
          <span className="material-symbols-outlined text-[20px]">account_circle</span>
        </Link>
      </div>
    </header>
  );
}
