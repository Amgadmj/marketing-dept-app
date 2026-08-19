"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";

/**
 * The scroll story for Marketing Dept.
 *
 * Scroll style: B — scroll-scrub. The product's entire pitch is watching an
 * inferred, low-confidence draft sharpen into an evidence-backed, confirmed
 * brand brain — that transformation from guess to certainty IS the product,
 * so the hero performs it directly: one claim card, pinned, transforming
 * continuously as you scroll, rather than a sequence of separate scenes.
 *
 * Everything below the hero is a plain scrollytelling reveal (fade-up) —
 * one scroll style stays the star; the rest is just pacing.
 */
export default function WelcomePage() {
  const rootRef = useRef<HTMLDivElement>(null);
  const heroPinRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLSpanElement>(null);
  const badgeDotRef = useRef<HTMLSpanElement>(null);
  const badgeTextRef = useRef<HTMLSpanElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const evidenceRef = useRef<HTMLParagraphElement>(null);
  const checkRef = useRef<HTMLSpanElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ctx: { revert: () => void } | null = null;
    let cancelled = false;

    // gsap + ScrollTrigger + Lenis are all client-only — load after mount so
    // nothing touches `window` during the server render.
    Promise.all([
      import("gsap"),
      import("gsap/ScrollTrigger"),
      import("lenis"),
    ]).then(([{ default: gsap }, { ScrollTrigger }, { default: Lenis }]) => {
      if (cancelled || !rootRef.current) return;

      gsap.registerPlugin(ScrollTrigger);
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      ctx = gsap.context(() => {
        // ---- fade-up reveals, everywhere below the hero -------------------
        gsap.utils.toArray<HTMLElement>(".wf-reveal").forEach((el) => {
          gsap.to(el, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 85%", once: true },
          });
        });

        if (reduce) {
          // Show the confirmed end-state directly — no scrub, no inertia.
          if (cardRef.current) {
            gsap.set(cardRef.current, {
              borderColor: "rgba(34,197,94,0.55)",
              backgroundColor: "rgba(15,21,36,0.78)",
              backdropFilter: "blur(26px)",
              boxShadow: "0 0 40px rgba(125,211,252,0.12)",
            });
          }
          if (headlineRef.current) gsap.set(headlineRef.current, { opacity: 1, filter: "blur(0px)" });
          if (badgeRef.current)
            gsap.set(badgeRef.current, {
              color: "#22c55e",
              borderColor: "rgba(34,197,94,0.35)",
              backgroundColor: "rgba(34,197,94,0.1)",
            });
          if (badgeTextRef.current) badgeTextRef.current.textContent = "confirmado por evidência";
          if (subRef.current) subRef.current.textContent = "Respaldado pelas suas próprias análises.";
          if (evidenceRef.current) gsap.set(evidenceRef.current, { opacity: 1 });
          if (checkRef.current) gsap.set(checkRef.current, { opacity: 1, scale: 1 });
          if (hintRef.current) gsap.set(hintRef.current, { opacity: 0 });
          return;
        }

        // ---- inertia scrolling --------------------------------------------
        const lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
        lenis.on("scroll", ScrollTrigger.update);
        gsap.ticker.add((t: number) => lenis.raf(t * 1000));
        gsap.ticker.lagSmoothing(0);
        ScrollTrigger.addEventListener("refresh", () => lenis.resize());

        // ---- top progress bar -----------------------------------------------
        if (progressRef.current) {
          gsap.to(progressRef.current, {
            scaleX: 1,
            ease: "none",
            scrollTrigger: { trigger: document.body, start: "top top", end: "bottom bottom", scrub: 0.3 },
          });
        }

        // ---- hero: gap -> marked --------------------------------------------
        // Desktop gets the pinned scrub (scroll position === confidence level).
        // Scroll-jacking a pin on a phone reads as "the page froze" and fights
        // the OS's own momentum scroll, so mobile gets the same transformation
        // played once, unpinned, as the card enters view.
        const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

        ScrollTrigger.matchMedia({
          "(min-width: 768px)": () => {
            if (!heroPinRef.current || !cardRef.current) return;

            ScrollTrigger.create({
              trigger: heroPinRef.current,
              start: "top top",
              end: "+=100%",
              pin: true,
              scrub: 0.7,
              anticipatePin: 1,
              onUpdate(self: { progress: number }) {
                const p = self.progress;

                gsap.set(cardRef.current, {
                  borderColor: gsap.utils.interpolate("rgba(74,96,112,0.5)", "rgba(34,197,94,0.55)", p),
                  backgroundColor: gsap.utils.interpolate("rgba(15,21,36,0.55)", "rgba(15,21,36,0.78)", p),
                  backdropFilter: `blur(${gsap.utils.interpolate(14, 26, p)}px)`,
                  boxShadow: `0 0 ${gsap.utils.interpolate(0, 40, p)}px rgba(125,211,252,${gsap.utils.interpolate(0, 0.12, p)})`,
                });

                if (headlineRef.current) {
                  gsap.set(headlineRef.current, {
                    opacity: gsap.utils.interpolate(0.5, 1, p),
                    filter: `blur(${gsap.utils.interpolate(5, 0, clamp01(p * 1.4))}px)`,
                  });
                }

                if (badgeRef.current) {
                  gsap.set(badgeRef.current, {
                    color: gsap.utils.interpolate("#ff6b6b", "#22c55e", p),
                    borderColor: gsap.utils.interpolate("rgba(255,107,107,0.35)", "rgba(34,197,94,0.35)", p),
                    backgroundColor: gsap.utils.interpolate("rgba(255,107,107,0.1)", "rgba(34,197,94,0.1)", p),
                  });
                }
                if (badgeDotRef.current) {
                  gsap.set(badgeDotRef.current, {
                    backgroundColor: gsap.utils.interpolate("#ff6b6b", "#22c55e", p),
                  });
                }
                if (badgeTextRef.current) {
                  badgeTextRef.current.textContent = p < 0.5 ? "não confirmado" : "confirmado por evidência";
                }
                if (subRef.current) {
                  subRef.current.textContent =
                    p < 0.5 ? "Chutado a partir de uma raspagem da home." : "Respaldado pelas suas próprias análises.";
                }

                if (evidenceRef.current) {
                  gsap.set(evidenceRef.current, { opacity: gsap.utils.interpolate(0, 1, clamp01((p - 0.55) / 0.45)) });
                }
                if (checkRef.current) {
                  const cp = clamp01((p - 0.7) / 0.3);
                  gsap.set(checkRef.current, { opacity: cp, scale: gsap.utils.interpolate(0.6, 1, cp) });
                }
                if (hintRef.current) {
                  gsap.set(hintRef.current, { opacity: clamp01(1 - p * 4) });
                }
              },
            });
          },

          "(max-width: 767px)": () => {
            if (!cardRef.current) return;
            if (hintRef.current) gsap.set(hintRef.current, { opacity: 0 });

            ScrollTrigger.create({
              trigger: cardRef.current,
              start: "top 78%",
              once: true,
              onEnter() {
                gsap.to(cardRef.current, {
                  borderColor: "rgba(34,197,94,0.55)",
                  backgroundColor: "rgba(15,21,36,0.78)",
                  backdropFilter: "blur(24px)",
                  boxShadow: "0 0 34px rgba(125,211,252,0.12)",
                  duration: 1,
                  ease: "power2.out",
                });
                if (headlineRef.current) {
                  gsap.to(headlineRef.current, { opacity: 1, filter: "blur(0px)", duration: 1, ease: "power2.out" });
                }
                if (badgeRef.current) {
                  gsap.to(badgeRef.current, {
                    color: "#22c55e",
                    borderColor: "rgba(34,197,94,0.35)",
                    backgroundColor: "rgba(34,197,94,0.1)",
                    duration: 1,
                  });
                }
                if (badgeDotRef.current) {
                  gsap.to(badgeDotRef.current, { backgroundColor: "#22c55e", duration: 1 });
                }
                if (badgeTextRef.current) badgeTextRef.current.textContent = "confirmado por evidência";
                if (subRef.current) subRef.current.textContent = "Respaldado pelas suas próprias análises.";
                if (evidenceRef.current) gsap.to(evidenceRef.current, { opacity: 1, duration: 0.8, delay: 0.3 });
                if (checkRef.current) {
                  gsap.to(checkRef.current, { opacity: 1, scale: 1, duration: 0.6, delay: 0.5, ease: "back.out(1.7)" });
                }
              },
            });
          },
        });

        ScrollTrigger.refresh();
      }, rootRef);
    });

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, []);

  return (
    <div ref={rootRef} className="min-h-screen">
      <div
        ref={progressRef}
        className="fixed left-0 top-0 z-[60] h-[2px] w-full origin-left scale-x-0"
        style={{ background: "var(--accent)" }}
      />

      {/* ============ HERO — pinned scroll-scrub (mobile: unpinned once) ======== */}
      <section
        ref={heroPinRef}
        className="relative flex min-h-[100svh] items-center overflow-hidden px-5 py-14 sm:px-6 md:min-h-screen md:px-12 md:py-20"
      >
        <div className="mx-auto grid w-full max-w-6xl items-center gap-10 md:gap-12 md:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="wf-reveal text-xs font-semibold uppercase tracking-[0.14em] text-[var(--faint)]">
              Marketing Dept
            </p>
            <h1 className="wf-reveal mt-4 text-[clamp(30px,8vw,72px)] font-semibold leading-[1.08] tracking-tight">
              Toda outra IA preenche a lacuna.
              <span className="block text-[var(--muted)]">Esta marca a lacuna.</span>
            </h1>
            <p className="wf-reveal mt-5 max-w-xl text-[15px] leading-relaxed text-[var(--muted)] md:mt-6 md:text-[17px]">
              Uma integração guiada transforma o seu negócio em um cérebro de marca de quatro
              documentos, e todo post, carrossel e vídeo é escrito a partir desse cérebro em vez
              de um prompt em branco. Quando o cérebro não tem a evidência, ele diz isso na tela —
              em vez de inventar uma frase plausível.
            </p>
            <div className="wf-reveal mt-7 flex flex-col items-stretch gap-3 sm:mt-8 sm:flex-row sm:items-center sm:gap-4">
              <Link href="/intake" className="btn btn-primary w-full justify-center sm:w-auto">
                Construir um cérebro de marca
              </Link>
              <Link
                href="/"
                className="flex min-h-[44px] items-center justify-center text-[13px] text-[var(--muted)] hover:text-[var(--text)] sm:min-h-0 sm:justify-start"
              >
                Ver por dentro →
              </Link>
            </div>
          </div>

          {/* The card that transforms as you scroll */}
          <div className="flex justify-center">
            <div
              ref={cardRef}
              className="relative w-full max-w-sm rounded-2xl border p-5 md:p-6"
              style={{
                borderColor: "rgba(74,96,112,0.5)",
                backgroundColor: "rgba(15,21,36,0.55)",
                backdropFilter: "blur(14px)",
              }}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--faint)]">
                  Mensalidade
                </span>
                <span
                  ref={badgeRef}
                  className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider"
                  style={{
                    color: "#ff6b6b",
                    borderColor: "rgba(255,107,107,0.35)",
                    backgroundColor: "rgba(255,107,107,0.1)",
                  }}
                >
                  <span ref={badgeDotRef} className="h-1.5 w-1.5 rounded-full" style={{ background: "#ff6b6b" }} />
                  <span ref={badgeTextRef}>não confirmado</span>
                </span>
              </div>

              <div
                ref={headlineRef}
                className="mt-4 text-3xl font-semibold tracking-tight md:mt-5 md:text-4xl"
                style={{ opacity: 0.5 }}
              >
                R$189
                <span className="ml-2 align-middle text-[16px] font-normal text-[var(--muted)]">/mês</span>
              </div>

              <p ref={subRef} className="mt-2 text-[13px] text-[var(--muted)]">
                Chutado a partir de uma raspagem da home.
              </p>

              <p
                ref={evidenceRef}
                className="mt-4 border-t border-[var(--panel-border)] pt-4 text-[12.5px] leading-relaxed text-[var(--muted)]"
                style={{ opacity: 0 }}
              >
                “Fiz o CAR, tenho que repetir?” — <span className="italic">análises do Instagram, conta própria</span>
              </p>

              <span
                ref={checkRef}
                className="absolute -right-3 -top-3 flex h-8 w-8 items-center justify-center rounded-full border"
                style={{
                  opacity: 0,
                  color: "#22c55e",
                  borderColor: "rgba(34,197,94,0.4)",
                  backgroundColor: "rgba(15,21,36,0.9)",
                }}
              >
                <span className="material-symbols-outlined fill text-[18px]">check</span>
              </span>
            </div>
          </div>
        </div>

        <div
          ref={hintRef}
          className="pointer-events-none absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-1 text-[var(--faint)] md:flex"
        >
          <span className="text-[10px] uppercase tracking-[0.14em]">Role</span>
          <span className="material-symbols-outlined text-[18px]">expand_more</span>
        </div>
      </section>

      {/* ============ THREE MECHANICS ============ */}
      <section className="mx-auto max-w-5xl px-5 py-16 sm:px-6 md:px-12 md:py-32">
        <Mechanic
          eyebrow="01 · Classificação de evidência"
          title="Toda alegação carrega sua fonte."
          body="As percepções de público são classificadas em confiança alta, média ou baixa. A geração se recusa a se apoiar em uma alegação de baixa confiança até você confirmá-la ou conectar análises que a sustentem."
        >
          <div className="panel-inset flex flex-col gap-2 p-4">
            <span className="badge badge-low w-fit">
              <span className="dot" />
              baixa confiança
            </span>
            <p className="text-[12.5px] text-[var(--muted)]">Inferido de um único case de concorrente.</p>
            <div className="my-1 flex items-center gap-2 text-[var(--faint)]">
              <span className="material-symbols-outlined text-[16px]">arrow_downward</span>
              <span className="text-[11px] uppercase tracking-wider">você conecta análises</span>
            </div>
            <span className="badge badge-high w-fit">
              <span className="dot" />
              alta confiança
            </span>
            <p className="text-[12.5px] text-[var(--muted)]">
              Dados próprios de busca mostram intenção de resolução de problemas de equipamento.
            </p>
          </div>
        </Mechanic>

        <Mechanic
          eyebrow="02 · Filtro de crença zero"
          title="Sem evidência de que acreditam, sem vender."
          body="Toda oferta nomeia a crença que um comprador já precisa ter. Se nada prova que o público a tem, a oferta reprova no filtro — ela vai para a escada em vez de virar campanha."
          flip
        >
          <div className="flex flex-col gap-3">
            <div className="panel-inset p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[13px] font-semibold">Verificação CAR</span>
                <span className="badge badge-high">
                  <span className="dot" />
                  vendável
                </span>
              </div>
              <p className="mt-2 text-[12px] text-[var(--muted)]">Respaldado por 1 alegação de público.</p>
            </div>
            <div className="panel-inset p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[13px] font-semibold">Sucessão / ITCMD</span>
                <span className="badge badge-low">
                  <span className="dot" />
                  reprovado no filtro
                </span>
              </div>
              <p className="mt-2 text-[12px] text-[var(--muted)]">Sem evidência de público para essa crença.</p>
            </div>
          </div>
        </Mechanic>

        <Mechanic
          eyebrow="03 · Nunca inventar um número"
          title="Preços não confirmados nunca chegam a um cliente."
          body="Todo valor carrega uma marcação de confirmado e uma fonte. Um número raspado de uma página em cache fica marcado e inutilizável em conteúdo gerado até você mesmo verificá-lo."
        >
          <div className="flex flex-wrap gap-2">
            <span className="badge badge-low">R$189/mês: não confirmado</span>
            <span className="badge badge-high">R$40/ha: confirmado</span>
            <span className="badge badge-high">R$24/ha: confirmado</span>
            <span className="badge">R$9/ha: confirmado</span>
          </div>
        </Mechanic>
      </section>

      {/* ============ CTA ============ */}
      <section className="wf-reveal px-5 pb-20 pt-4 text-center sm:px-6 md:px-12 md:pb-28">
        <h2 className="mx-auto max-w-md text-[clamp(24px,7vw,42px)] font-semibold tracking-tight">
          Monte o departamento antes do seu próximo post.
        </h2>
        <div className="mt-8">
          <Link href="/intake" className="btn btn-primary w-full justify-center sm:w-auto">
            Construir um cérebro de marca
          </Link>
        </div>
        <p className="mt-10 text-[11px] uppercase tracking-[0.14em] text-[var(--faint)]">
          Marketing Dept · <Link href="/" className="hover:text-[var(--muted)]">voltar ao app</Link>
        </p>
      </section>
    </div>
  );
}

function Mechanic({
  eyebrow,
  title,
  body,
  flip,
  children,
}: {
  eyebrow: string;
  title: string;
  body: string;
  flip?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="grid items-center gap-6 py-10 md:grid-cols-2 md:gap-16 md:py-16">
      <div className={flip ? "md:order-2" : ""}>
        <p className="wf-reveal text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">
          {eyebrow}
        </p>
        <h3 className="wf-reveal mt-3 text-[clamp(22px,2.6vw,32px)] font-semibold tracking-tight">{title}</h3>
        <p className="wf-reveal mt-4 max-w-md text-[14.5px] leading-relaxed text-[var(--muted)]">{body}</p>
      </div>
      <div className={`wf-reveal ${flip ? "md:order-1" : ""}`}>{children}</div>
    </div>
  );
}
