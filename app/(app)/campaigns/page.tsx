import Link from "next/link";

export default function CampaignsPage() {
  return (
    <div className="rise">
      <h1 className="text-3xl font-semibold tracking-tight">Campanhas</h1>
      <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-[var(--muted)]">
        Uma campanha reúne um carrossel ou vídeo direcionado a uma camada de público e etapa do
        funil específicas. Nenhuma foi publicada ainda — componha uma a partir de um cérebro de
        marca para começar a construir histórico aqui.
      </p>

      <div className="panel mt-8 flex flex-col items-center gap-3 p-12 text-center">
        <span className="material-symbols-outlined text-[32px] text-[var(--faint)]">
          campaign
        </span>
        <p className="text-[14px] text-[var(--muted)]">Nenhuma campanha ainda.</p>
        <Link href="/" className="btn btn-primary mt-2">
          Ir para um cérebro de marca
        </Link>
      </div>
    </div>
  );
}
