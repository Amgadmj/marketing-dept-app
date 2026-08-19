"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { tenants } from "@/lib/tenants";
import { completeness, unconfirmedFigures, type Brain } from "@/lib/types";

const CONFIDENCE_LABEL: Record<"high" | "medium" | "low", string> = {
  high: "alta",
  medium: "média",
  low: "baixa",
};

export default function BrainPage() {
  const params = useParams<{ tenant: string }>();
  const tenantId = params.tenant;
  const [brain, setBrain] = useState<Brain | null>(null);

  useEffect(() => {
    // A brain edited during intake overrides the seed for this walkthrough.
    try {
      const saved = localStorage.getItem(`brain:${tenantId}`);
      if (saved) {
        setBrain(JSON.parse(saved) as Brain);
        return;
      }
    } catch {
      /* fall through to the seed */
    }
    setBrain(tenants[tenantId] ?? null);
  }, [tenantId]);

  if (!brain) {
    return <p className="text-[14px] text-[var(--muted)]">Carregando…</p>;
  }

  const score = completeness(brain);
  const unconfirmed = unconfirmedFigures(brain);

  return (
    <div className="rise">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{brain.businessName}</h1>
          <p className="mt-1.5 text-[14px] text-[var(--muted)]">{brain.oneLiner}</p>
        </div>
        <div className="flex items-center gap-5">
          <div className="text-right">
            <div className="text-[11px] uppercase tracking-[0.08em] text-[var(--faint)]">
              Completude
            </div>
            <div className="mt-0.5 text-2xl font-semibold tabular-nums">{score}%</div>
          </div>
          <Link href={`/video/${brain.tenantId}`} className="btn">
            Vídeo
          </Link>
          <Link href={`/compose/${brain.tenantId}`} className="btn btn-primary">
            Compor
          </Link>
        </div>
      </div>

      {unconfirmed.length > 0 && (
        <div className="panel mt-6 border-[color-mix(in_srgb,var(--bad)_35%,transparent)] p-4">
          <div className="text-[13px] font-semibold text-[var(--bad)]">
            {unconfirmed.length} valor{unconfirmed.length === 1 ? "" : "es"} não confirmado
            {unconfirmed.length === 1 ? "" : "s"}
          </div>
          <p className="mt-1.5 text-[12.5px] leading-relaxed text-[var(--muted)]">
            Eles não vão aparecer em nada gerado. Um número só é usado quando tem uma fonte que
            você confirmou.
          </p>
          <ul className="mt-2.5 space-y-1">
            {unconfirmed.map((f) => (
              <li key={f.label} className="text-[12px] text-[var(--faint)]">
                {f.label}: {f.value} — {f.source}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Voice ---------------------------------------------------------- */}
      <Section title="Voz" provenance={brain.sections.instructions.provenance}>
        <p className="text-[13.5px] leading-relaxed text-[var(--muted)]">
          {brain.voice.register}
        </p>
        <ul className="mt-3 space-y-1.5">
          {brain.voice.rules.map((r) => (
            <li key={r} className="text-[13px] text-[var(--muted)]">
              — {r}
            </li>
          ))}
        </ul>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {[
            ["Fundo", brain.voice.brand.background],
            ["Texto", brain.voice.brand.text],
            ["Destaque", brain.voice.brand.accent],
          ].map(([label, hex]) => (
            <span key={label} className="badge">
              <span
                className="block h-3 w-3 rounded-sm border border-[var(--line)]"
                style={{ background: hex }}
              />
              {label} {hex}
            </span>
          ))}
        </div>
        <p className="mt-3 text-[12px] text-[var(--faint)]">{brain.voice.brand.accentRule}</p>
      </Section>

      {/* Audience ------------------------------------------------------- */}
      <Section title="Público" provenance={brain.sections.audience.provenance}>
        <div className="space-y-3">
          {brain.audienceLayers.map((layer) => (
            <div key={layer.id} className="panel-inset p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[13.5px] font-semibold">{layer.name}</span>
                <span className={`badge badge-${layer.confidence}`}>
                  <span className="dot" />
                  confiança {CONFIDENCE_LABEL[layer.confidence]}
                </span>
              </div>
              <p className="mt-2 text-[13px] leading-relaxed text-[var(--muted)]">
                {layer.summary}
              </p>
              <p className="mt-2.5 text-[12px] text-[var(--faint)]">
                Registro: {layer.register}
              </p>

              {layer.evidence.map((e) => (
                <div key={e.id} className="mt-3 border-l-2 border-[var(--line)] pl-3">
                  <p className="text-[12.5px] text-[var(--muted)]">{e.claim}</p>
                  {e.verbatim && (
                    <p className="mt-1 text-[12.5px] italic text-[var(--accent)]">
                      “{e.verbatim}”
                    </p>
                  )}
                  <p className="mt-1 text-[11.5px] text-[var(--faint)]">
                    {e.source} · {CONFIDENCE_LABEL[e.confidence]}
                  </p>
                </div>
              ))}

              {layer.neverBlendWith.length > 0 && (
                <p className="mt-3 text-[11.5px] text-[var(--faint)]">
                  Nunca misturado com: {layer.neverBlendWith.join(", ")}
                </p>
              )}
            </div>
          ))}
        </div>
      </Section>

      {/* Offers --------------------------------------------------------- */}
      <Section title="O que você vende" provenance={brain.sections.offer.provenance}>
        <p className="mb-3 text-[12.5px] leading-relaxed text-[var(--faint)]">
          Cada oferta nomeia a crença que um comprador já precisa ter. Sem evidência de que ele a
          tem, não se vende — a ideia vai para a escada em vez de ser descartada.
        </p>
        <div className="space-y-3">
          {brain.offers.map((offer) => (
            <div key={offer.id} className="panel-inset p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[13.5px] font-semibold">{offer.name}</span>
                <span
                  className={`badge ${offer.verdict === "passed" ? "badge-high" : "badge-low"}`}
                >
                  <span className="dot" />
                  {offer.verdict === "passed" ? "vendável" : "reprovado no filtro"}
                </span>
              </div>
              <p className="mt-2 text-[13px] leading-relaxed text-[var(--muted)]">
                {offer.whatItIs}
              </p>

              <p className="mt-3 text-[12px] text-[var(--faint)]">
                Exige que o comprador já acredite que:
              </p>
              <p className="text-[12.5px] text-[var(--muted)]">{offer.requiredBelief}</p>

              {offer.supportingEvidence.length > 0 ? (
                <p className="mt-2 text-[12px] text-[var(--ok)]">
                  Respaldado por {offer.supportingEvidence.length} alegaç
                  {offer.supportingEvidence.length === 1 ? "ão" : "ões"} de público
                </p>
              ) : (
                <p className="mt-2 text-[12px] text-[var(--bad)]">
                  Sem evidência de público para essa crença
                </p>
              )}

              {offer.figures.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {offer.figures.map((f) => (
                    <span
                      key={f.label}
                      className={`badge ${f.confirmed ? "" : "badge-low"}`}
                      title={f.source}
                    >
                      {f.label}: {f.value}
                    </span>
                  ))}
                </div>
              )}

              {offer.ladderPlacement && (
                <p className="mt-3 border-l-2 border-[var(--line)] pl-3 text-[12px] text-[var(--faint)]">
                  {offer.ladderPlacement}
                </p>
              )}
            </div>
          ))}
        </div>
      </Section>

      {/* Sales engine --------------------------------------------------- */}
      <Section title="Motor de vendas" provenance={brain.sections.engine.provenance}>
        {brain.salesEngine ? (
          <>
            <div className="space-y-2.5">
              {brain.salesEngine.angles.map((a) => (
                <div key={a.name} className="panel-inset p-3.5">
                  <div className="text-[13px] font-semibold">{a.name}</div>
                  <p className="mt-1.5 text-[12.5px] text-[var(--muted)]">{a.whyBuyNow}</p>
                  <p className="mt-1.5 text-[11.5px] text-[var(--faint)]">
                    Baseado em {a.rootedIn}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-1.5">
              <span className="badge">Valor-para-venda {brain.salesEngine.rhythm.valueToSell}</span>
              <span className="badge">
                Máx. {brain.salesEngine.rhythm.directSellPerMonth} posts de venda direta/mês
              </span>
            </div>
            <p className="mt-3 text-[12px] text-[var(--faint)]">
              {brain.salesEngine.rhythm.conversionLivesIn}
            </p>
          </>
        ) : (
          <div className="panel-inset p-4">
            <p className="text-[13px] text-[var(--muted)]">
              Ainda não construído. Um motor de vendas precisa de pelo menos uma alegação de
              público de alta confiança para se apoiar — senão seria inventado, não derivado.
            </p>
            <Link href="/intake" className="btn mt-3.5 text-[13px]">
              Adicionar análises para aumentar a confiança
            </Link>
          </div>
        )}
      </Section>

      {/* Open items ----------------------------------------------------- */}
      {brain.openItems.length > 0 && (
        <Section title="Lacunas conhecidas">
          <ul className="space-y-2">
            {brain.openItems.map((item) => (
              <li key={item} className="text-[13px] leading-relaxed text-[var(--muted)]">
                — {item}
              </li>
            ))}
          </ul>
        </Section>
      )}

      <div className="mt-10">
        <Link href="/" className="text-[13px] text-[var(--muted)] hover:text-[var(--text)]">
          ← Todos os cérebros
        </Link>
      </div>
    </div>
  );
}

function Section({
  title,
  provenance,
  children,
}: {
  title: string;
  provenance?: "scraped" | "confirmed" | "analytics";
  children: React.ReactNode;
}) {
  const label: Record<string, string> = {
    scraped: "inferido",
    confirmed: "confirmado por você",
    analytics: "respaldado por análises",
  };
  const tone: Record<string, string> = {
    scraped: "badge-low",
    confirmed: "badge-medium",
    analytics: "badge-high",
  };

  return (
    <section className="mt-8">
      <div className="mb-3 flex items-center gap-2.5">
        <h2 className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--faint)]">
          {title}
        </h2>
        {provenance && (
          <span className={`badge ${tone[provenance]}`}>
            <span className="dot" />
            {label[provenance]}
          </span>
        )}
      </div>
      <div className="panel p-5">{children}</div>
    </section>
  );
}
