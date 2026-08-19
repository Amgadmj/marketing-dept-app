"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { draftedStudio } from "@/lib/tenants";
import type { Brain } from "@/lib/types";

/**
 * The intake flow.
 *
 * Design principle: people edit far more readily than they author. So the
 * system reads what is public, drafts a brain, and asks the user to correct
 * it — rather than asking them to fill in a form from nothing.
 *
 * The optional third step (analytics) is what turns inferred claims into
 * graded evidence. It must never block reaching a usable v1 brain.
 */

const SCAN_STEPS = [
  "Buscando o site",
  "Lendo o conteúdo e os preços",
  "Lendo publicações recentes",
  "Elaborando os quatro documentos",
];

const CONFIDENCE_LABEL: Record<"high" | "medium" | "low", string> = {
  high: "alta",
  medium: "média",
  low: "baixa",
};

type Step = "identify" | "scanning" | "review" | "analytics" | "done";

export default function IntakePage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("identify");
  const [site, setSite] = useState("");
  const [handles, setHandles] = useState("");
  const [scanIndex, setScanIndex] = useState(0);
  const [draft, setDraft] = useState<Brain>(structuredClone(draftedStudio));
  const [confirmed, setConfirmed] = useState<Record<string, boolean>>({});
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    return () => timers.current.forEach(clearTimeout);
  }, []);

  function beginScan() {
    setStep("scanning");
    setScanIndex(0);
    SCAN_STEPS.forEach((_, i) => {
      timers.current.push(
        setTimeout(() => {
          setScanIndex(i + 1);
          if (i === SCAN_STEPS.length - 1) {
            timers.current.push(setTimeout(() => setStep("review"), 500));
          }
        }, 700 * (i + 1)),
      );
    });
  }

  function finish(withAnalytics: boolean) {
    const next = structuredClone(draft);
    next.sections.instructions = { provenance: "confirmed", confirmedAt: today() };
    next.sections.offer = { provenance: "confirmed", confirmedAt: today() };
    next.sections.audience = withAnalytics
      ? { provenance: "analytics", confirmedAt: today() }
      : { provenance: "scraped" };

    if (withAnalytics) {
      // Analytics is what upgrades an inferred claim into graded evidence.
      next.audienceLayers = next.audienceLayers.map((layer) => ({
        ...layer,
        confidence: "medium" as const,
        evidence: [
          ...layer.evidence,
          {
            id: "sc-ev-analytics",
            claim:
              "A atividade dos seguidores se concentra em noites de dia útil; salvamentos superam curtidas nos posts de técnica.",
            confidence: "medium" as const,
            source: "Exportação de análises do Instagram",
          },
        ],
      }));
      next.openItems = next.openItems.filter((o) => !o.startsWith("Sem evidência de público"));
    }

    try {
      localStorage.setItem(`brain:${next.tenantId}`, JSON.stringify(next));
    } catch {
      // Prototype only — a storage failure should not break the walkthrough.
    }
    setStep("done");
    timers.current.push(setTimeout(() => router.push(`/brain/${next.tenantId}`), 900));
  }

  const allConfirmed = ["voice", "audience", "offers"].every((k) => confirmed[k]);

  return (
    <div className="rise">
      <StepRail step={step} />

      {step === "identify" && (
        <section className="mt-8 max-w-xl">
          <h1 className="text-2xl font-semibold tracking-tight">
            Aponte o que já é público
          </h1>
          <p className="mt-2.5 text-[14px] leading-relaxed text-[var(--muted)]">
            A gente lê o seu site e publicações recentes, depois elabora um primeiro cérebro de
            marca. Você corrige — isso é bem mais rápido do que escrever um do zero.
          </p>

          <label className="mt-7 block text-[13px] font-medium text-[var(--muted)]">
            Site
          </label>
          <input
            className="input mt-2"
            placeholder="studiocorpo.com.br"
            value={site}
            onChange={(e) => setSite(e.target.value)}
          />

          <label className="mt-5 block text-[13px] font-medium text-[var(--muted)]">
            Perfis sociais <span className="text-[var(--faint)]">(opcional)</span>
          </label>
          <input
            className="input mt-2"
            placeholder="@studiocorpo"
            value={handles}
            onChange={(e) => setHandles(e.target.value)}
          />

          <button
            className="btn btn-primary mt-7"
            disabled={site.trim().length === 0}
            onClick={beginScan}
          >
            Ler meu negócio
          </button>
          <p className="mt-3 text-[12px] text-[var(--faint)]">
            Leva cerca de um minuto. Nada é publicado em lugar nenhum.
          </p>
        </section>
      )}

      {step === "scanning" && (
        <section className="mt-8 max-w-xl">
          <h1 className="text-2xl font-semibold tracking-tight">Lendo {site || "seu site"}</h1>
          <ul className="mt-7 space-y-3">
            {SCAN_STEPS.map((label, i) => {
              const state = i < scanIndex ? "done" : i === scanIndex ? "active" : "todo";
              return (
                <li key={label} className="flex items-center gap-3 text-[14px]">
                  <span
                    className={
                      state === "done"
                        ? "text-[var(--ok)]"
                        : state === "active"
                          ? "pulse-soft text-[var(--accent)]"
                          : "text-[var(--faint)]"
                    }
                  >
                    {state === "done" ? "✓" : "○"}
                  </span>
                  <span
                    className={state === "todo" ? "text-[var(--faint)]" : "text-[var(--text)]"}
                  >
                    {label}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {step === "review" && (
        <section className="mt-8">
          <h1 className="text-2xl font-semibold tracking-tight">Aqui está o que encontramos</h1>
          <p className="mt-2.5 max-w-2xl text-[14px] leading-relaxed text-[var(--muted)]">
            Tudo abaixo é um rascunho inferido de páginas públicas. Corrija o que estiver errado,
            depois confirme cada seção. Alegações de baixa confiança não serão usadas em conteúdo
            gerado até você confirmar.
          </p>

          <div className="mt-7 space-y-4">
            <ReviewCard
              id="voice"
              title="Voz"
              confidence="low"
              confirmed={!!confirmed.voice}
              onConfirm={() => setConfirmed((c) => ({ ...c, voice: true }))}
            >
              <Field
                label="Como esse negócio soa"
                value={draft.voice.register}
                onChange={(v) =>
                  setDraft((d) => ({ ...d, voice: { ...d.voice, register: v } }))
                }
              />
              <div className="mt-3 flex flex-wrap gap-1.5">
                {draft.voice.rules.map((r) => (
                  <span key={r} className="badge">
                    {r}
                  </span>
                ))}
              </div>
            </ReviewCard>

            <ReviewCard
              id="audience"
              title="Público"
              confidence="low"
              confirmed={!!confirmed.audience}
              onConfirm={() => setConfirmed((c) => ({ ...c, audience: true }))}
            >
              {draft.audienceLayers.map((layer, i) => (
                <div key={layer.id} className={i > 0 ? "mt-4" : ""}>
                  <div className="text-[13px] font-semibold">{layer.name}</div>
                  <Field
                    label="Quem eles são"
                    value={layer.summary}
                    onChange={(v) =>
                      setDraft((d) => {
                        const layers = [...d.audienceLayers];
                        layers[i] = { ...layers[i], summary: v };
                        return { ...d, audienceLayers: layers };
                      })
                    }
                  />
                  {layer.evidence.map((e) => (
                    <p key={e.id} className="mt-2 text-[12px] text-[var(--faint)]">
                      {e.claim} — <span className="italic">{e.source}</span>
                    </p>
                  ))}
                </div>
              ))}
            </ReviewCard>

            <ReviewCard
              id="offers"
              title="O que você vende"
              confidence="medium"
              confirmed={!!confirmed.offers}
              onConfirm={() => setConfirmed((c) => ({ ...c, offers: true }))}
            >
              {draft.offers.map((offer) => (
                <div key={offer.id} className="panel-inset mt-3 p-3.5 first:mt-0">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[13px] font-semibold">{offer.name}</span>
                    <span
                      className={`badge ${offer.verdict === "passed" ? "badge-high" : "badge-low"}`}
                    >
                      <span className="dot" />
                      {offer.verdict === "passed" ? "vendável" : "ainda não vendável"}
                    </span>
                  </div>
                  <p className="mt-2 text-[12.5px] leading-relaxed text-[var(--muted)]">
                    {offer.whatItIs}
                  </p>
                  {offer.figures.map((f) => (
                    <p key={f.label} className="mt-2 text-[12px]">
                      <span className="text-[var(--faint)]">{f.label}: </span>
                      <span className={f.confirmed ? "" : "text-[var(--bad)]"}>{f.value}</span>
                      {!f.confirmed && (
                        <span className="text-[var(--bad)]"> · não confirmado, não será usado</span>
                      )}
                    </p>
                  ))}
                  {offer.verdict === "failed" && offer.ladderPlacement && (
                    <p className="mt-2.5 border-l-2 border-[var(--line)] pl-2.5 text-[12px] text-[var(--faint)]">
                      {offer.ladderPlacement}
                    </p>
                  )}
                </div>
              ))}
            </ReviewCard>
          </div>

          <div className="mt-7 flex items-center gap-3">
            <button
              className="btn btn-primary"
              disabled={!allConfirmed}
              onClick={() => setStep("analytics")}
            >
              Continuar
            </button>
            {!allConfirmed && (
              <span className="text-[12px] text-[var(--faint)]">
                Confirme cada seção para continuar.
              </span>
            )}
          </div>
        </section>
      )}

      {step === "analytics" && (
        <section className="mt-8 max-w-xl">
          <h1 className="text-2xl font-semibold tracking-tight">
            Adicione suas análises — ou pule
          </h1>
          <p className="mt-2.5 text-[14px] leading-relaxed text-[var(--muted)]">
            Seu cérebro funciona sem isso. Adicionar uma exportação de análises é o que
            transforma nossos palpites sobre seu público em alegações baseadas nos seus próprios
            números, o que permite ao gerador confiar nelas.
          </p>

          <div className="panel mt-6 border-dashed p-8 text-center">
            <div className="text-[13px] text-[var(--muted)]">
              Solte uma exportação de análises do Instagram ou TikTok
            </div>
            <div className="mt-1 text-[12px] text-[var(--faint)]">CSV ou JSON</div>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <button className="btn btn-primary" onClick={() => finish(true)}>
              Usar exportação de exemplo
            </button>
            <button className="btn" onClick={() => finish(false)}>
              Pular por enquanto
            </button>
          </div>
        </section>
      )}

      {step === "done" && (
        <section className="mt-8 max-w-xl">
          <h1 className="text-2xl font-semibold tracking-tight">Seu cérebro está pronto</h1>
          <p className="mt-2.5 text-[14px] text-[var(--muted)]">Abrindo agora…</p>
        </section>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------- */

function today() {
  return new Date().toISOString().slice(0, 10);
}

function StepRail({ step }: { step: Step }) {
  const order: Step[] = ["identify", "scanning", "review", "analytics"];
  const labels: Record<string, string> = {
    identify: "Identificar",
    scanning: "Ler",
    review: "Corrigir",
    analytics: "Aprofundar",
  };
  const active = order.indexOf(step === "done" ? "analytics" : step);

  return (
    <div className="flex items-center gap-2 text-[12px]">
      {order.map((s, i) => (
        <div key={s} className="flex items-center gap-2">
          <span
            className={
              i <= active ? "font-medium text-[var(--text)]" : "text-[var(--faint)]"
            }
          >
            {labels[s]}
          </span>
          {i < order.length - 1 && (
            <span
              className={`block h-px w-8 ${
                i < active ? "bg-[var(--accent)]" : "bg-[var(--line)]"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function ReviewCard({
  title,
  confidence,
  confirmed,
  onConfirm,
  children,
}: {
  id: string;
  title: string;
  confidence: "high" | "medium" | "low";
  confirmed: boolean;
  onConfirm: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="panel p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <h2 className="text-[15px] font-semibold">{title}</h2>
          <span className={`badge badge-${confirmed ? "high" : confidence}`}>
            <span className="dot" />
            {confirmed ? "confirmado" : `confiança ${CONFIDENCE_LABEL[confidence]}`}
          </span>
        </div>
        <button className="btn text-[13px]" onClick={onConfirm} disabled={confirmed}>
          {confirmed ? "Confirmado" : "Está correto"}
        </button>
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="mt-3 block first:mt-0">
      <span className="text-[12px] text-[var(--faint)]">{label}</span>
      <textarea
        className="input mt-1.5 text-[13px]"
        rows={2}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}
