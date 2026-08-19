import Link from "next/link";
import { tenants } from "@/lib/tenants";
import { completeness } from "@/lib/types";

export default function Home() {
  const list = Object.values(tenants);

  return (
    <div className="rise">
      <h1 className="text-3xl font-semibold tracking-tight">Seu departamento de marketing</h1>
      <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-[var(--muted)]">
        Todo conteúdo é escrito a partir de um cérebro de marca construído para o seu negócio —
        não de um prompt em branco. Comece deixando a gente ler o que já é público, depois
        corrija o que erramos.
      </p>

      <Link href="/intake" className="btn btn-primary mt-7">
        Construir um cérebro de marca
      </Link>

      <h2
        id="brains"
        className="mt-14 scroll-mt-24 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--faint)]"
      >
        Cérebros existentes
      </h2>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {list.map((brain) => {
          const score = completeness(brain);
          const confirmed = Object.values(brain.sections).every(
            (s) => s.provenance !== "scraped",
          );
          return (
            <Link
              key={brain.tenantId}
              href={`/brain/${brain.tenantId}`}
              className="panel block p-5 transition-colors hover:border-[#343a42]"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold">{brain.businessName}</div>
                  <div className="mt-1 text-[13px] text-[var(--muted)]">{brain.oneLiner}</div>
                </div>
                <span className={`badge ${confirmed ? "badge-high" : "badge-low"}`}>
                  <span className="dot" />
                  {confirmed ? "confirmado" : "rascunho"}
                </span>
              </div>

              <div className="mt-5">
                <div className="flex items-center justify-between text-[11px] text-[var(--faint)]">
                  <span>Completude</span>
                  <span>{score}%</span>
                </div>
                <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-[var(--panel-2)]">
                  <div
                    className="h-full rounded-full bg-[var(--accent)]"
                    style={{ width: `${score}%` }}
                  />
                </div>
              </div>

              {brain.openItems.length > 0 && (
                <div className="mt-4 text-[12px] text-[var(--faint)]">
                  {brain.openItems.length} pendência
                  {brain.openItems.length === 1 ? "" : "s"} em aberto
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
