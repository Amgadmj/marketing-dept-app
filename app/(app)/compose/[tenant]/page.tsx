"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { tenants } from "@/lib/tenants";
import type { Brain } from "@/lib/types";
import { useInternalView } from "@/lib/internal";
import {
  COST,
  FREE_IMAGE_QUOTA,
  PLATFORM,
  carouselCost,
  checkCanCompose,
  draftSlides,
  generatedCount,
  type ImageTier,
  type Platform,
  type Slide,
  type Stage,
} from "@/lib/compose";

/** Images already generated this billing month, before this carousel.
 *  Seeded high enough that generating every slide crosses the free cap —
 *  the limit has to be reachable to be worth testing. */
const IMAGES_USED_THIS_MONTH = 16;
/** Direct-sell posts already run this month, against the brain's rhythm. */
const DIRECT_SELLS_THIS_MONTH = 2;

export default function ComposePage() {
  const params = useParams<{ tenant: string }>();
  const [brain, setBrain] = useState<Brain | null>(null);
  const [platform, setPlatform] = useState<Platform>("instagram");
  const [layerId, setLayerId] = useState<string>("");
  const [stage, setStage] = useState<Stage>("reach");
  const [slides, setSlides] = useState<Slide[] | null>(null);
  const [internal, toggleInternal] = useInternalView();

  useEffect(() => {
    try {
      const saved = localStorage.getItem(`brain:${params.tenant}`);
      if (saved) {
        const b = JSON.parse(saved) as Brain;
        setBrain(b);
        setLayerId(b.audienceLayers[0]?.id ?? "");
        return;
      }
    } catch {
      /* fall through to the seed */
    }
    const b = tenants[params.tenant] ?? null;
    setBrain(b);
    setLayerId(b?.audienceLayers[0]?.id ?? "");
  }, [params.tenant]);

  const layer = brain?.audienceLayers.find((l) => l.id === layerId) ?? null;

  const refusal = useMemo(
    () =>
      brain && layer ? checkCanCompose(brain, layer, stage, DIRECT_SELLS_THIS_MONTH) : null,
    [brain, layer, stage],
  );

  // A changed setup invalidates the draft — the brain, not the user, decides
  // what a valid draft looks like.
  useEffect(() => {
    setSlides(null);
  }, [platform, layerId, stage]);

  if (!brain) return <p className="text-[14px] text-[var(--muted)]">Carregando…</p>;

  const spec = PLATFORM[platform];
  const generated = slides ? generatedCount(slides) : 0;
  const cost = slides ? carouselCost(slides) : 0;
  const quotaLeft = Math.max(0, FREE_IMAGE_QUOTA - IMAGES_USED_THIS_MONTH - generated);
  const overQuota = IMAGES_USED_THIS_MONTH + generated > FREE_IMAGE_QUOTA;

  function setSlideImage(id: string, kind: "none" | "upload" | ImageTier) {
    setSlides((prev) =>
      prev
        ? prev.map((s) =>
            s.id !== id
              ? s
              : {
                  ...s,
                  image:
                    kind === "none"
                      ? { kind: "none" }
                      : kind === "upload"
                        ? { kind: "upload", name: "foto.jpg" }
                        : { kind: "generate", tier: kind, state: "ready" },
                },
          )
        : prev,
    );
  }

  return (
    <div className="rise">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Compor um carrossel</h1>
          <p className="mt-1.5 text-[14px] text-[var(--muted)]">
            {brain.businessName} · renderizar é grátis, só a fotografia custa algo
          </p>
        </div>
        <Link
          href={`/brain/${brain.tenantId}`}
          className="text-[13px] text-[var(--muted)] hover:text-[var(--text)]"
        >
          Cérebro →
        </Link>
      </div>

      {/* Setup ---------------------------------------------------------- */}
      <div className="panel mt-6 p-5">
        <div className="grid gap-5 sm:grid-cols-3">
          <Choice
            label="Plataforma"
            value={platform}
            options={[
              ["instagram", "Instagram"],
              ["tiktok", "TikTok"],
            ]}
            onChange={(v) => setPlatform(v as Platform)}
          />
          <Choice
            label="Camada de público"
            value={layerId}
            options={brain.audienceLayers.map((l) => [l.id, l.name] as [string, string])}
            onChange={setLayerId}
          />
          <Choice
            label="Etapa do funil"
            value={stage}
            options={[
              ["reach", "Alcance"],
              ["trust", "Confiança"],
              ["direct-sell", "Venda direta"],
            ]}
            onChange={(v) => setStage(v as Stage)}
          />
        </div>

        <p className="mt-4 text-[12px] text-[var(--faint)]">
          {spec.label}: {spec.min}–{spec.max} slides. {spec.cta}
          {layer && layer.neverBlendWith.length > 0 && (
            <> Essa camada nunca é misturada com {layer.neverBlendWith.length} outra(s).</>
          )}
        </p>
      </div>

      {/* Refusal -------------------------------------------------------- */}
      {refusal && (
        <div className="panel mt-4 border-[color-mix(in_srgb,var(--bad)_35%,transparent)] p-5">
          <div className="text-[13px] font-semibold text-[var(--bad)]">
            O cérebro não vai elaborar isso
          </div>
          <p className="mt-2 text-[13.5px] leading-relaxed text-[var(--muted)]">
            {refusal.reason}
          </p>
          <p className="mt-2 text-[13px] text-[var(--faint)]">{refusal.unblock}</p>
        </div>
      )}

      {!refusal && !slides && (
        <button
          className="btn btn-primary mt-5"
          onClick={() => layer && setSlides(draftSlides(brain, layer, stage, platform))}
        >
          Elaborar {spec.min} slides
        </button>
      )}

      {/* Editor --------------------------------------------------------- */}
      {slides && !refusal && (
        <>
          <div className="panel mt-5 flex flex-wrap items-center justify-between gap-4 p-4">
            <div className="flex flex-wrap items-center gap-5">
              <Readout label="Imagens geradas" value={`${generated} de ${slides.length}`} />
              <Readout
                label="Cota grátis restante"
                value={overQuota ? "excedida" : `${quotaLeft} este mês`}
                tone={overQuota ? "bad" : quotaLeft <= 4 ? "warn" : "ok"}
              />
              {internal && <Readout label="Custo de produção" value={`$${cost.toFixed(3)}`} />}
            </div>
            <div className="flex items-center gap-2.5">
              <button
                className={`badge ${internal ? "badge-medium" : ""}`}
                style={{ cursor: "pointer" }}
                onClick={toggleInternal}
                title="Custo de produção é interno — nunca mostrado a um cliente."
              >
                {internal && <span className="dot" />}
                Visão interna
              </button>
              <button className="btn text-[13px]" onClick={() => setSlides(null)}>
                Recomeçar
              </button>
            </div>
          </div>

          {overQuota && (
            <p className="mt-3 text-[12.5px] text-[var(--bad)]">
              Isso excede o limite mensal grátis de imagens. Slides marcados como enviar ou sem
              imagem continuam grátis — só a geração é medida.
            </p>
          )}

          <div className="mt-5 space-y-4">
            {slides.map((slide, i) => (
              <div key={slide.id} className="panel p-4">
                <div className="flex flex-col gap-4 sm:flex-row">
                  <SlidePreview brain={brain} slide={slide} index={i} total={slides.length} />

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--faint)]">
                        Slide {i + 1}
                      </span>
                      <span className="text-[11px] text-[var(--faint)]">
                        {slide.image.kind !== "generate"
                          ? "grátis"
                          : internal
                            ? `$${(slide.image.tier === "premium" ? COST.premiumImage : COST.budgetImage).toFixed(3)}`
                            : slide.image.tier === "premium"
                              ? "premium"
                              : "1 imagem"}
                      </span>
                    </div>

                    <input
                      className="input mt-2.5 text-[13.5px] font-medium"
                      value={slide.headline}
                      onChange={(e) =>
                        setSlides((prev) =>
                          prev
                            ? prev.map((s) =>
                                s.id === slide.id ? { ...s, headline: e.target.value } : s,
                              )
                            : prev,
                        )
                      }
                    />
                    {slide.body !== undefined && (
                      <textarea
                        className="input mt-2 text-[13px]"
                        rows={2}
                        value={slide.body}
                        onChange={(e) =>
                          setSlides((prev) =>
                            prev
                              ? prev.map((s) =>
                                  s.id === slide.id ? { ...s, body: e.target.value } : s,
                                )
                              : prev,
                          )
                        }
                      />
                    )}

                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {(
                        [
                          ["none", "Sem imagem"],
                          ["upload", "Enviar"],
                          ["budget", "Gerar"],
                          ["premium", "Gerar 2K"],
                        ] as const
                      ).map(([kind, label]) => {
                        const active =
                          (kind === "none" && slide.image.kind === "none") ||
                          (kind === "upload" && slide.image.kind === "upload") ||
                          (slide.image.kind === "generate" && slide.image.tier === kind);
                        const locked = kind === "premium";
                        return (
                          <button
                            key={kind}
                            className={`badge ${active ? "badge-high" : ""}`}
                            style={{ cursor: "pointer" }}
                            onClick={() => setSlideImage(slide.id, kind)}
                            title={locked ? "Qualidade premium — plano pago" : undefined}
                          >
                            {active && <span className="dot" />}
                            {label}
                            {locked && " ·pago"}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ── Deterministic slide render ─────────────────────────────────────────
   The browser equivalent of the Pillow pipeline: layout, type, scrim and
   the one-accent-element rule are computed from brand tokens, so they are
   pixel-exact and cost nothing. Only the photograph is ever generated.  */
function SlidePreview({
  brain,
  slide,
  index,
  total,
}: {
  brain: Brain;
  slide: Slide;
  index: number;
  total: number;
}) {
  const { background, text, accent } = brain.voice.brand;
  const hasPhoto = slide.image.kind !== "none";
  // One accent element per slide, never more: the kicker takes it when there
  // is one, otherwise the rule bar does.
  const accentOnKicker = Boolean(slide.kicker);

  return (
    <div
      className="relative w-full flex-none overflow-hidden rounded-md border border-[var(--line)] sm:w-[168px]"
      style={{ aspectRatio: "1080 / 1350", background }}
    >
      {hasPhoto && (
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              slide.image.kind === "upload"
                ? "linear-gradient(135deg,#4a5568,#2d3748)"
                : "linear-gradient(135deg,#6b5b45,#3d3428)",
          }}
        />
      )}
      {hasPhoto && (
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to top, ${background} 26%, transparent 78%)`,
          }}
        />
      )}

      <div className="absolute inset-0 flex flex-col justify-end p-3">
        {slide.kicker && (
          <div
            className="text-[7px] font-bold uppercase tracking-[0.12em]"
            style={{ color: accentOnKicker ? accent : text }}
          >
            {slide.kicker}
          </div>
        )}
        {!slide.kicker && (
          <div className="mb-1.5 h-[2px] w-6" style={{ background: accent }} />
        )}
        <div
          className="mt-1 text-[10px] font-bold leading-[1.15]"
          style={{ color: text, textWrap: "balance" }}
        >
          {slide.headline}
        </div>
        {slide.body && (
          <div className="mt-1 text-[7px] leading-[1.35]" style={{ color: text, opacity: 0.75 }}>
            {slide.body}
          </div>
        )}
      </div>

      <div
        className="absolute right-2 top-2 text-[7px] tabular-nums"
        style={{ color: text, opacity: 0.5 }}
      >
        {index + 1}/{total}
      </div>
    </div>
  );
}

/* ── Small pieces ───────────────────────────────────────────────────── */

function Choice({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: [string, string][];
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--faint)]">
        {label}
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {options.map(([v, l]) => (
          <button
            key={v}
            className={`badge ${v === value ? "badge-high" : ""}`}
            style={{ cursor: "pointer" }}
            onClick={() => onChange(v)}
          >
            {v === value && <span className="dot" />}
            {l}
          </button>
        ))}
      </div>
    </div>
  );
}

function Readout({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "ok" | "warn" | "bad";
}) {
  const color =
    tone === "bad"
      ? "var(--bad)"
      : tone === "warn"
        ? "var(--warn)"
        : tone === "ok"
          ? "var(--ok)"
          : "var(--text)";
  return (
    <div>
      <div className="text-[11px] uppercase tracking-[0.08em] text-[var(--faint)]">{label}</div>
      <div className="mt-0.5 text-[14px] font-semibold tabular-nums" style={{ color }}>
        {value}
      </div>
    </div>
  );
}
