"use client";

import { useInternalView } from "@/lib/internal";

export default function SettingsPage() {
  const [internal, toggleInternal] = useInternalView();

  return (
    <div className="rise">
      <h1 className="text-3xl font-semibold tracking-tight">Configurações</h1>
      <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-[var(--muted)]">
        Configurações do protótipo. Conta, cobrança e gestão de equipe ainda não foram
        construídas.
      </p>

      <div className="panel mt-8 p-6">
        <div className="flex items-center justify-between gap-6">
          <div>
            <div className="text-[14px] font-semibold">Visão interna</div>
            <p className="mt-1 text-[13px] leading-relaxed text-[var(--muted)]">
              Mostra o custo de produção e a margem nas telas de Vídeo e Compor. Nunca visível a
              um cliente — isso existe apenas para revisão interna.
            </p>
          </div>
          <button
            className={`btn shrink-0 ${internal ? "btn-primary" : ""}`}
            onClick={toggleInternal}
          >
            {internal ? "Ativado" : "Desativado"}
          </button>
        </div>
      </div>
    </div>
  );
}
