/**
 * The video upsell.
 *
 * Video is the only unbounded cost in the product, so it is the paid tier and
 * it is metered in units rather than minutes. Two facts drive every number:
 *
 *  - A finished clip takes about 2.5 generations. That ratio is measured, not
 *    assumed, and it is why a finished 15s clip costs $11–16 to produce.
 *  - The house margin floor is 40% on services. Top-up prices clear it even at
 *    the worst-case credit rate.
 */

export type UnitKind = "standard" | "cinematic";

export interface UnitSpec {
  kind: UnitKind;
  label: string;
  duration: string;
  shots: number;
  /** Allowance units consumed. Cinematic costs ~2x to produce, so it costs 2. */
  units: number;
  /** Production cost at the committed and marginal credit rates. */
  cogs: [number, number];
  /** Top-up price beyond the monthly allowance. */
  topUp: number;
}

export const UNITS: Record<UnitKind, UnitSpec> = {
  standard: {
    kind: "standard",
    label: "Padrão",
    duration: "15s, um plano",
    shots: 1,
    units: 1,
    cogs: [11.16, 16.05],
    topUp: 30,
  },
  cinematic: {
    kind: "cinematic",
    label: "Cinemático",
    duration: "30s, dois planos costurados",
    shots: 2,
    units: 2,
    cogs: [22.3, 32.08],
    topUp: 55,
  },
};

/** Units included with the paid tier each month. */
export const INCLUDED_UNITS = 2;

/** Takes generated per keeper. Measured across the validated workflow. */
export const TAKES_PER_KEEPER = 3;

/** The house floor, from AgrosTech's own services standard. */
export const MARGIN_FLOOR = 0.4;

/** Margin on a top-up, at best and worst production cost. */
export function topUpMargin(spec: UnitSpec): [number, number] {
  const best = (spec.topUp - spec.cogs[0]) / spec.topUp;
  const worst = (spec.topUp - spec.cogs[1]) / spec.topUp;
  return [worst, best];
}

export function clearsFloor(spec: UnitSpec): boolean {
  return topUpMargin(spec)[0] >= MARGIN_FLOOR;
}

export interface Take {
  id: string;
  shot: number;
  index: number;
  kept: boolean;
}

export function buildTakes(spec: UnitSpec): Take[] {
  const takes: Take[] = [];
  for (let shot = 0; shot < spec.shots; shot++) {
    for (let i = 0; i < TAKES_PER_KEEPER; i++) {
      takes.push({ id: `s${shot}t${i}`, shot, index: i, kept: false });
    }
  }
  return takes;
}
