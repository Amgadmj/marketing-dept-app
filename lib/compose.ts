import type { Brain, AudienceLayer } from "./types";

/**
 * The carousel composer.
 *
 * Two things make this different from a generic post generator:
 *
 *  1. Cost is demand-driven. Each slide is generate / upload / none, so a
 *     carousel costs what the user chose to spend on it — nothing is a fixed
 *     per-carousel charge. Rendering is deterministic, so only photography
 *     costs money.
 *  2. The brain can refuse. Platform fit, audience-layer blending, selling
 *     rhythm, and the zero-new-belief gate are all checked before a draft
 *     exists — not corrected afterwards.
 */

export type Stage = "reach" | "trust" | "direct-sell";
export type Platform = "instagram" | "tiktok";
export type ImageTier = "budget" | "premium";

export type SlideImage =
  | { kind: "none" }
  | { kind: "upload"; name: string }
  | { kind: "generate"; tier: ImageTier; state: "idle" | "working" | "ready" };

export interface Slide {
  id: string;
  kicker?: string;
  headline: string;
  body?: string;
  image: SlideImage;
}

/* ── Unit costs, from the measured COGS model ────────────────────────────
   Marginal (top-up) rates, so the number shown is the pessimistic one.   */
export const COST = {
  budgetImage: 0.024,
  premiumImage: 0.095,
  copyPerCarousel: 0.055,
} as const;

/** Free tier: carousels are unlimited, generated images are the metered input. */
export const FREE_IMAGE_QUOTA = 20;

/** Platform fit. Taken from the brain's own rules, not a global default. */
export const PLATFORM = {
  instagram: { label: "Instagram", min: 7, max: 9, cta: "CTA de resposta direta funciona bem aqui." },
  tiktok: { label: "TikTok", min: 4, max: 5, cta: "CTA voltado a seguir — esse tráfego é frio." },
} as const;

export function slideCost(image: SlideImage): number {
  if (image.kind !== "generate") return 0;
  return image.tier === "premium" ? COST.premiumImage : COST.budgetImage;
}

export function carouselCost(slides: Slide[]): number {
  // Explicit generic: COST is `as const`, so its literal type would otherwise
  // become the accumulator type.
  return slides.reduce<number>((sum, s) => sum + slideCost(s.image), COST.copyPerCarousel);
}

export function generatedCount(slides: Slide[]): number {
  return slides.filter((s) => s.image.kind === "generate").length;
}

/* ── Refusals ───────────────────────────────────────────────────────────
   The brain declining to produce something is the product working. Each
   refusal names what is missing and what would unblock it.              */

export interface Refusal {
  reason: string;
  unblock: string;
}

export function checkCanCompose(
  brain: Brain,
  layer: AudienceLayer,
  stage: Stage,
  directSellsThisMonth: number,
): Refusal | null {
  if (layer.confidence === "low") {
    return {
      reason: `A camada ${layer.name} tem baixa confiança — ela se apoia em inferência, não evidência.`,
      unblock: "Conecte análises, ou confirme a camada você mesmo, para escrever para ela.",
    };
  }

  if (stage === "direct-sell") {
    const sellable = brain.offers.filter((o) => o.verdict === "passed");
    if (sellable.length === 0) {
      return {
        reason: "Nada aqui passa pelo filtro de crença zero, então ainda não há nada para vender.",
        unblock: "Reúna evidência de que o público já tem a crença que uma oferta exige.",
      };
    }
    const rhythm = brain.salesEngine?.rhythm.directSellPerMonth ?? 2;
    if (directSellsThisMonth >= rhythm) {
      return {
        reason: `Você já publicou ${directSellsThisMonth} posts de venda direta este mês. Seu ritmo é ${rhythm}.`,
        unblock: "Publique um post de alcance ou confiança, ou espere o próximo mês.",
      };
    }
  }

  if (stage === "trust" && !brain.salesEngine) {
    return {
      reason: "Não há motor de vendas para encaixar um post de confiança.",
      unblock: "Construa o funil primeiro — ele precisa de uma alegação de público de alta confiança.",
    };
  }

  return null;
}

/* ── Drafting ───────────────────────────────────────────────────────────
   Mocked for the prototype, but sourced the way the real thing will be:
   the strongest verbatim evidence for the chosen layer becomes the hook. */

export function draftSlides(
  brain: Brain,
  layer: AudienceLayer,
  stage: Stage,
  platform: Platform,
): Slide[] {
  const count = PLATFORM[platform].min;
  const hook = layer.evidence.find((e) => e.verbatim);
  const offer = brain.offers.find((o) => o.verdict === "passed");

  const opening: Slide = {
    id: "s1",
    kicker: layer.name,
    headline: hook?.verbatim ? `"${hook.verbatim}"` : layer.name,
    body: hook
      ? "Você não é o único perguntando isso. Aqui está a resposta de verdade."
      : layer.summary,
    image: { kind: "generate", tier: "budget", state: "ready" },
  };

  const middles: Slide[] = Array.from({ length: count - 2 }, (_, i) => ({
    id: `s${i + 2}`,
    headline: MIDDLE_LINES[i % MIDDLE_LINES.length].headline,
    body: MIDDLE_LINES[i % MIDDLE_LINES.length].body,
    image: { kind: "none" },
  }));

  const closing: Slide = {
    id: `s${count}`,
    kicker: stage === "direct-sell" && offer ? offer.name : undefined,
    headline:
      stage === "direct-sell" && offer
        ? offer.name
        : platform === "tiktok"
          ? "Segue pra mais"
          : "Chame no direct",
    body:
      stage === "direct-sell" && offer
        ? offer.whatItIs
        : PLATFORM[platform].cta,
    image: { kind: "generate", tier: "budget", state: "ready" },
  };

  return [opening, ...middles, closing];
}

const MIDDLE_LINES = [
  {
    headline: "O que a lei realmente exige",
    body: "Uma coisa não substitui a outra. São registros diferentes, com finalidades diferentes.",
  },
  {
    headline: "Onde a maioria se perde",
    body: "O documento existe, mas o polígono não está lá. É aí que o problema aparece.",
  },
  {
    headline: "Como saber em que pé você está",
    body: "Dá pra conferir o status antes de gastar qualquer coisa com isso.",
  },
  {
    headline: "O que muda na prática",
    body: "Terra regularizada é o que sustenta venda, crédito e sucessão.",
  },
  {
    headline: "Quando vale agir",
    body: "Antes de precisar. Depois que vira pendência, o custo é outro.",
  },
  {
    headline: "O próximo passo",
    body: "Comece pelo que não custa nada e decida com a resposta na mão.",
  },
  {
    headline: "Sem letra miúda",
    body: "O que é gratuito continua gratuito. O que é pago tem preço publicado.",
  },
];
