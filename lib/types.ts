/**
 * The brand brain schema.
 *
 * This is the product. Three mechanics are encoded as data rather than prose,
 * because they are what a generic AI content tool cannot copy:
 *
 *  1. Evidence grading  — every audience claim carries a confidence level and
 *                         its source. Generation refuses to lean on `low`.
 *  2. Zero-new-belief   — every offer names the belief a buyer must already
 *                         hold, and links to the evidence that they do. No
 *                         evidence, no offer.
 *  3. Never invent      — every number carries `confirmed` and a source.
 *                         Unconfirmed numbers are flagged, never generated.
 */

export type Confidence = "high" | "medium" | "low";

/** Where a claim came from, and how much weight it can carry. */
export interface Evidence {
  id: string;
  claim: string;
  confidence: Confidence;
  source: string;
  /** The audience's own words, when we have them. Strongest form of evidence. */
  verbatim?: string;
}

/** One audience layer. Layers are never blended in a single piece of content. */
export interface AudienceLayer {
  id: string;
  name: string;
  summary: string;
  confidence: Confidence;
  evidence: Evidence[];
  /** The emotional register to write in for this layer. */
  register: string;
  neverBlendWith: string[];
}

/** A number. Either confirmed with a source, or flagged and unusable. */
export interface Figure {
  label: string;
  value: string;
  confirmed: boolean;
  source: string;
}

export type OfferVerdict = "passed" | "failed" | "untested";

/** An offer, and its zero-new-belief test result. */
export interface Offer {
  id: string;
  name: string;
  tier: "free-entry" | "paid-conversion" | "flagship" | "not-a-product";
  whatItIs: string;
  figures: Figure[];
  /** The belief a buyer must already hold for this to be purchasable. */
  requiredBelief: string;
  /** Evidence ids proving the audience holds it. Empty = the gate fails. */
  supportingEvidence: string[];
  verdict: OfferVerdict;
  /** Where a failed idea goes instead of being discarded. */
  ladderPlacement?: string;
}

export interface Voice {
  language: string;
  register: string;
  rules: string[];
  brand: {
    background: string;
    text: string;
    accent: string;
    headlineFont: string;
    bodyFont: string;
    /** e.g. one accent element per piece, never more. */
    accentRule: string;
  };
}

export interface FunnelPost {
  stage: "reach" | "trust" | "direct-sell";
  title: string;
  note: string;
}

export interface SalesEngine {
  angles: { name: string; rootedIn: string; whyBuyNow: string }[];
  funnel: FunnelPost[];
  rhythm: {
    valueToSell: string;
    directSellPerMonth: number;
    conversionLivesIn: string;
  };
}

/** How a section of the brain came to exist. Drives the trust badge in the UI. */
export type Provenance = "scraped" | "confirmed" | "analytics";

export interface BrainSection {
  provenance: Provenance;
  /** Set when a human has reviewed and accepted this section. */
  confirmedAt?: string;
}

export interface Brain {
  tenantId: string;
  businessName: string;
  oneLiner: string;
  website: string;
  handles: string[];
  voice: Voice;
  audienceLayers: AudienceLayer[];
  offers: Offer[];
  salesEngine: SalesEngine | null;
  /** Things we know we don't know. Surfaced, never silently guessed. */
  openItems: string[];
  sections: Record<"instructions" | "audience" | "offer" | "engine", BrainSection>;
}

/** 0–100. Weighted by evidence quality, not by field count. */
export function completeness(brain: Brain): number {
  let score = 0;
  if (brain.voice.rules.length > 0) score += 15;
  if (brain.audienceLayers.length > 0) score += 15;
  // Partial credit for medium, so the score moves when a user does real work
  // (connecting analytics) rather than only at the very top of the scale.
  score += Math.min(
    20,
    brain.audienceLayers.reduce(
      (sum, l) => sum + (l.confidence === "high" ? 10 : l.confidence === "medium" ? 5 : 0),
      0,
    ),
  );
  if (brain.offers.length > 0) score += 15;
  score += Math.min(20, brain.offers.filter((o) => o.verdict === "passed").length * 10);
  if (brain.salesEngine) score += 15;
  return Math.min(100, score);
}

/** The zero-new-belief gate, as a function rather than a guideline. */
export function evaluateOffer(offer: Offer, layers: AudienceLayer[]): OfferVerdict {
  if (offer.supportingEvidence.length === 0) return "failed";
  const known = new Set(layers.flatMap((l) => l.evidence.map((e) => e.id)));
  const backed = offer.supportingEvidence.filter((id) => known.has(id));
  return backed.length > 0 ? "passed" : "failed";
}

/** Numbers that may not be used in customer-facing output. */
export function unconfirmedFigures(brain: Brain): Figure[] {
  return brain.offers.flatMap((o) => o.figures.filter((f) => !f.confirmed));
}
