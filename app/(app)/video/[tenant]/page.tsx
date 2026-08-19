"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { tenants } from "@/lib/tenants";
import type { Brain } from "@/lib/types";
import { useInternalView } from "@/lib/internal";
import {
  INCLUDED_UNITS,
  MARGIN_FLOOR,
  TAKES_PER_KEEPER,
  UNITS,
  buildTakes,
  clearsFloor,
  topUpMargin,
  type Take,
  type UnitKind,
} from "@/lib/video";

/** Allowance units already spent this month. */
const UNITS_SPENT = 1;

type Phase = "setup" | "generating" | "choosing" | "done";

export default function VideoPage() {
  const params = useParams<{ tenant: string }>();
  const [brain, setBrain] = useState<Brain | null>(null);
  const [kind, setKind] = useState<UnitKind>("standard");
  const [phase, setPhase] = useState<Phase>("setup");
  const [takes, setTakes] = useState<Take[]>([]);
  const [ready, setReady] = useState(0);
  const [internal, toggleInternal] = useInternalView();
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(`brain:${params.tenant}`);
      if (saved) return setBrain(JSON.parse(saved) as Brain);
    } catch {
      /* fall through to the seed */
    }
    setBrain(tenants[params.tenant] ?? null);
  }, [params.tenant]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  if (!brain) return <p className="text-[14px] text-[var(--muted)]">Carregando…</p>;

  const spec = UNITS[kind];
  const unitsLeft = Math.max(0, INCLUDED_UNITS - UNITS_SPENT);
  const covered = spec.units <= unitsLeft;
  const angle = brain.salesEngine?.angles[0];

  function generate() {
    const list = buildTakes(spec);
    setTakes(list);
    setReady(0);
    setPhase("generating");
    list.forEach((_, i) => {
      timers.current.push(
        setTimeout(
          () => {
            setReady(i + 1);
            if (i === list.length - 1) {
              timers.current.push(setTimeout(() => setPhase("choosing"), 400));
            }
          },
          520 * (i + 1),
        ),
      );
    });
  }

  function keep(shot: number, id: string) {
    setTakes((prev) =>
      prev.map((t) => (t.shot === shot ? { ...t, kept: t.id === id } : t)),
    );
  }

  const shots = Array.from({ length: spec.shots }, (_, i) => i);
  const allChosen = shots.every((s) => takes.some((t) => t.shot === s && t.kept));

  return (
    <div className="rise">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Vídeo</h1>
          <p className="mt-1.5 text-[14px] text-[var(--muted)]">
            {brain.businessName} · incluído no plano pago
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            className={`badge ${internal ? "badge-medium" : ""}`}
            style={{ cursor: "pointer" }}
            onClick={toggleInternal}
            title="Custo de produção e margem são internos — nunca mostrados a um cliente."
          >
            {internal && <span className="dot" />}
            Visão interna
          </button>
          <Link
            href={`/brain/${brain.tenantId}`}
            className="text-[13px] text-[var(--muted)] hover:text-[var(--text)]"
          >
            Cérebro →
          </Link>
        </div>
      </div>

      {/* Allowance ------------------------------------------------------ */}
      <div className="panel mt-6 flex flex-wrap items-center justify-between gap-4 p-4">
        <div className="flex flex-wrap items-center gap-6">
          <Readout label="Unidades restantes este mês" value={`${unitsLeft} de ${INCLUDED_UNITS}`} />
          <Readout
            label="Esta peça custa"
            value={`${spec.units} unidade${spec.units === 1 ? "" : "s"}`}
            tone={covered ? "ok" : "warn"}
          />
          {!covered && <Readout label="Recarga" value={`$${spec.topUp}`} tone="warn" />}
        </div>
        {internal && (
          <div className="flex flex-wrap items-center gap-6">
            <Readout
              label="Custo de produção"
              value={`$${spec.cogs[0].toFixed(2)}–${spec.cogs[1].toFixed(2)}`}
            />
            <Readout
              label="Margem da recarga"
              value={
                topUpMargin(spec)
                  .map((m) => `${Math.round(m * 100)}%`)
                  .join("–")
              }
              tone={clearsFloor(spec) ? "ok" : "bad"}
            />
          </div>
        )}
      </div>

      {internal && (
        <p className="mt-2.5 text-[12px] text-[var(--faint)]">
          Somente interno. Nunca mostrado a um cliente — o plano fala de unidades recebidas,
          nunca do que custam para produzir. Piso é {Math.round(MARGIN_FLOOR * 100)}%.
        </p>
      )}

      {/* Setup ---------------------------------------------------------- */}
      {phase === "setup" && (
        <>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {(Object.keys(UNITS) as UnitKind[]).map((k) => {
              const u = UNITS[k];
              const active = k === kind;
              return (
                <button
                  key={k}
                  onClick={() => setKind(k)}
                  className="panel p-5 text-left transition-colors"
                  style={{ borderColor: active ? "var(--accent)" : undefined }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-semibold">{u.label}</span>
                    <span className={`badge ${active ? "badge-high" : ""}`}>
                      {active && <span className="dot" />}
                      {u.units} unidade{u.units === 1 ? "" : "s"}
                    </span>
                  </div>
                  <p className="mt-2 text-[13px] text-[var(--muted)]">{u.duration}</p>
                  <p className="mt-2.5 text-[12px] text-[var(--faint)]">
                    {u.shots * TAKES_PER_KEEPER} takes gerados, {u.shots} mantido
                    {u.shots === 1 ? "" : "s"}
                  </p>
                </button>
              );
            })}
          </div>

          {angle && (
            <div className="panel mt-4 p-5">
              <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--faint)]">
                Briefing, do seu motor de vendas
              </div>
              <p className="mt-2 text-[14px] font-medium">{angle.name}</p>
              <p className="mt-1.5 text-[13px] text-[var(--muted)]">{angle.whyBuyNow}</p>
            </div>
          )}

          {!angle && (
            <div className="panel mt-4 border-[color-mix(in_srgb,var(--bad)_35%,transparent)] p-5">
              <div className="text-[13px] font-semibold text-[var(--bad)]">
                Nenhum briefing para trabalhar
              </div>
              <p className="mt-2 text-[13.5px] leading-relaxed text-[var(--muted)]">
                Vídeo é caro de produzir e não há motor de vendas aqui para apontar. Construir um
                vem primeiro — senão a peça seria inventada, não derivada.
              </p>
            </div>
          )}

          {angle && (
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button className="btn btn-primary" onClick={generate}>
                {covered ? "Gerar" : `Comprar uma recarga · $${spec.topUp}`}
              </button>
              <span className="text-[12px] text-[var(--faint)]">
                {covered
                  ? `Usa ${spec.units} das suas ${unitsLeft} unidade${unitsLeft === 1 ? "" : "s"} restante${unitsLeft === 1 ? "" : "s"}.`
                  : "Sua cota mensal não cobre esta peça."}
              </span>
            </div>
          )}
        </>
      )}

      {/* Generating / choosing ------------------------------------------ */}
      {(phase === "generating" || phase === "choosing") && (
        <>
          <p className="mt-6 text-[13.5px] text-[var(--muted)]">
            {phase === "generating"
              ? `Gerando ${takes.length} takes…`
              : `Escolha o take para manter em cada plano. O resto é descartado — é assim que uma proporção de ${TAKES_PER_KEEPER} para 1 se parece, e é por isso que um clipe finalizado custa o que custa.`}
          </p>

          {shots.map((shot) => (
            <div key={shot} className="mt-5">
              <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--faint)]">
                Plano {shot + 1} de {spec.shots}
              </div>
              <div className="mt-2.5 grid gap-3 sm:grid-cols-3">
                {takes
                  .filter((t) => t.shot === shot)
                  .map((t) => {
                    const idx = takes.indexOf(t);
                    const done = idx < ready;
                    return (
                      <button
                        key={t.id}
                        disabled={!done || phase === "generating"}
                        onClick={() => keep(shot, t.id)}
                        className="panel overflow-hidden p-0 text-left"
                        style={{ borderColor: t.kept ? "var(--accent)" : undefined }}
                      >
                        <div
                          className="flex items-center justify-center"
                          style={{
                            aspectRatio: "16 / 9",
                            background: done
                              ? "linear-gradient(135deg,#3d4a5c,#232b36)"
                              : "var(--panel-2)",
                          }}
                        >
                          {!done && (
                            <span className="pulse-soft text-[11px] text-[var(--faint)]">
                              renderizando
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between gap-2 px-3 py-2">
                          <span className="text-[12px] text-[var(--muted)]">
                            Take {t.index + 1}
                          </span>
                          {t.kept && <span className="badge badge-high">mantido</span>}
                        </div>
                      </button>
                    );
                  })}
              </div>
            </div>
          ))}

          {phase === "choosing" && (
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                className="btn btn-primary"
                disabled={!allChosen}
                onClick={() => setPhase("done")}
              >
                Usar estes takes
              </button>
              {!allChosen && (
                <span className="text-[12px] text-[var(--faint)]">
                  Escolha um take por plano.
                </span>
              )}
            </div>
          )}
        </>
      )}

      {/* Done ----------------------------------------------------------- */}
      {phase === "done" && (
        <>
          <div className="panel mt-6 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="font-semibold">Peça {spec.label} pronta</div>
                <p className="mt-1.5 text-[13px] text-[var(--muted)]">
                  {spec.duration} · {takes.length} takes gerados, {spec.shots} mantido
                  {spec.shots === 1 ? "" : "s"}
                </p>
              </div>
              <span className="badge badge-high">
                <span className="dot" />
                {spec.units} unidade{spec.units === 1 ? "" : "s"} usada
                {spec.units === 1 ? "" : "s"}
              </span>
            </div>
            <div
              className="mt-4 rounded-md border border-[var(--line)]"
              style={{
                aspectRatio: "16 / 9",
                background: "linear-gradient(135deg,#3d4a5c,#232b36)",
              }}
            />
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              className="btn"
              onClick={() => {
                setPhase("setup");
                setTakes([]);
              }}
            >
              Fazer outra
            </button>
            <span className="text-[12px] text-[var(--faint)]">
              {unitsLeft - spec.units > 0
                ? `${unitsLeft - spec.units} unidade restante este mês.`
                : `Sem unidades restantes. Novas peças custam $${UNITS.standard.topUp} padrão, $${UNITS.cinematic.topUp} cinemático.`}
            </span>
          </div>
        </>
      )}
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
