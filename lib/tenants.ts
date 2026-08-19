import type { Brain } from "./types";

/**
 * Tenant zero. The brain that already exists and is proven in market — the
 * control case. Every claim here traces to first-party analytics, a competitor
 * teardown, or the audience's own words.
 */
export const agrostech: Brain = {
  tenantId: "agrostech",
  businessName: "AgrosTech Brasil",
  oneLiner: "Inteligência territorial por drone para o agronegócio brasileiro.",
  website: "agrostech.xyz",
  handles: ["@AgrosTechBr"],
  voice: {
    language: "Português (BR)",
    register:
      "Um especialista agro de 60 anos que transformou uma operação familiar em uma grande empresa, depois migrou para o agro-financeiro. Autoridade pela contenção, não por adjetivos.",
    rules: [
      "Uma ideia por frase. Linhas curtas.",
      "Trate o leitor por você.",
      "Sem palavras de hype, sem números não confirmados, sem nomes de marcas de terceiros.",
      "Sem escassez falsa, sem preços riscados.",
      "Se uma linha constrangeria quem está postando, corte.",
    ],
    brand: {
      background: "#1C2A20",
      text: "#F2EFE6",
      accent: "#E5A72C",
      headlineFont: "Bricolage Grotesque Bold",
      bodyFont: "IBM Plex Sans",
      accentRule: "Um elemento de destaque por peça, nunca mais.",
    },
  },
  audienceLayers: [
    {
      id: "layer-1",
      name: "Varejo / proprietário de terra",
      summary:
        "Produtores de médio porte reagindo ao prazo do georreferenciamento. Politicamente carregado, sensível a preço, muitas vezes genuinamente confuso sobre as exigências.",
      confidence: "high",
      register: "Aliado / guerreiro — do lado do produtor contra a burocracia.",
      neverBlendWith: ["layer-2", "layer-3"],
      evidence: [
        {
          id: "ev-car-repeat",
          claim: "A confusão sobre conformidade se repete quase palavra por palavra entre criadores.",
          confidence: "high",
          source: "Threads de comentários de concorrentes, múltiplos criadores",
          verbatim: "Fiz o CAR, tenho que repetir?",
        },
        {
          id: "ev-pricing-public",
          claim:
            "Comentaristas perguntam o preço diretamente em público, e outros respondem com números reais.",
          confidence: "high",
          source: "Seções de comentários de concorrentes",
          verbatim: "quanto custa",
        },
        {
          id: "ev-family-tag",
          claim:
            "Enquadrar a terra como legado familiar dispara marcação em massa de parentes — a maior contagem de compartilhamentos encontrada em qualquer levantamento (15,2 mil).",
          confidence: "high",
          source: "Análise de post sobre sucessão/ITCMD",
          verbatim: "Família",
        },
      ],
    },
    {
      id: "layer-2",
      name: "Técnico / operador",
      summary:
        "Operadores de máquina e técnicos de controle de qualidade. Registro de troubleshooting entre pares, temas totalmente diferentes. Não é quem decide o orçamento.",
      confidence: "high",
      register: "De igual para igual, técnico, sem venda.",
      neverBlendWith: ["layer-1"],
      evidence: [
        {
          id: "ev-search-queries",
          claim:
            "Dados próprios de busca mostram intenção de resolução de problemas de equipamento, não intenção de corretagem de terras.",
          confidence: "high",
          source: "Análises do TikTok, conta própria",
          verbatim: "problema na trava aranha da redução",
        },
      ],
    },
    {
      id: "layer-3",
      name: "Corporativo / institucional",
      summary:
        "Grandes compradores agroindustriais contratando monitoramento porque seus compradores a jusante exigem conformidade ESG.",
      confidence: "low",
      register: "Formal, voltado a compras corporativas.",
      neverBlendWith: ["layer-1", "layer-2"],
      evidence: [
        {
          id: "ev-enterprise",
          claim:
            "Inferido de um único case de concorrente. Tratar como hipótese até ser testado.",
          confidence: "low",
          source: "Case publicado por concorrente",
        },
      ],
    },
  ],
  offers: [
    {
      id: "verificacao-car",
      name: "Verificação CAR",
      tier: "free-entry",
      whatItIs:
        "Uma consulta pública ao SICAR: a propriedade está registrada, atualizada, e tem polígono no arquivo? Entregue como resposta direta.",
      figures: [
        {
          label: "Custo marginal",
          value: "Zero",
          confirmed: true,
          source: "Consulta a registros públicos",
        },
      ],
      requiredBelief: "Não tenho certeza se meu CAR está em ordem.",
      supportingEvidence: ["ev-car-repeat"],
      verdict: "passed",
    },
    {
      id: "due-diligence",
      name: "Due Diligence Fundiária",
      tier: "paid-conversion",
      whatItIs:
        "Cruzamento completo assim que uma lacuna é encontrada: delimitação de APP, saldo de Reserva Legal, camadas de apoio do CAR, diagnóstico de passivo ambiental.",
      figures: [
        { label: "≤200ha", value: "R$40/ha", confirmed: true, source: "Preço aprovado pela diretoria" },
        { label: "200–500ha", value: "R$24/ha", confirmed: true, source: "Preço aprovado pela diretoria" },
        {
          label: "2.500–5.000ha",
          value: "R$9/ha",
          confirmed: true,
          source: "Preço aprovado pela diretoria",
        },
      ],
      requiredBelief: "Uma lacuna nos meus registros de terra vale a pena pagar para resolver.",
      supportingEvidence: ["ev-car-repeat", "ev-pricing-public"],
      verdict: "passed",
    },
    {
      id: "succession",
      name: "Produto de sucessão / ITCMD",
      tier: "not-a-product",
      whatItIs:
        "Consultoria de imposto sobre herança e estrutura societária. Testado e descartado — o público discute base tributária e estruturação jurídica, não dados de terra.",
      figures: [],
      requiredBelief: "Dados de terra são o que resolve meu problema de sucessão.",
      supportingEvidence: [],
      verdict: "failed",
      ladderPlacement:
        "Apenas teste futuro. Se testado, conectar de volta à oferta existente de Due Diligence usando o mecanismo de marcação de família.",
    },
  ],
  salesEngine: {
    angles: [
      {
        name: "Você já faz essa pergunta. A gente responde de graça.",
        rootedIn: "ev-car-repeat",
        whyBuyNow: "A pergunta que eles continuam fazendo tem uma resposta real, e não custa nada.",
      },
      {
        name: "Sem letra miúda.",
        rootedIn: "ev-pricing-public",
        whyBuyNow:
          "A gente diz o que é grátis e o que custa, enquanto concorrentes não informam um número.",
      },
      {
        name: "Terra regularizada não é detalhe. É a base de tudo.",
        rootedIn: "ev-family-tag",
        whyBuyNow: "Todo outro plano para essa terra depende disso estar resolvido primeiro.",
      },
    ],
    funnel: [
      {
        stage: "reach",
        title: "Fiz o CAR. Preciso fazer de novo?",
        note: "Resposta direta. Sem CTA além de compartilhar.",
      },
      {
        stage: "trust",
        title: "CAR, CCIR, SIGEF: a diferença",
        note: "Voz de especialista, levemente técnica.",
      },
      {
        stage: "direct-sell",
        title: "Verificação CAR — de graça",
        note: "Nomeia o produto de forma direta.",
      },
    ],
    rhythm: {
      valueToSell: "5:1",
      directSellPerMonth: 2,
      conversionLivesIn: "Stories — fluxos de DM e gatilhos de palavra em comentário, nunca o feed.",
    },
  },
  openItems: [
    "A fonte de referência de preço e o método de atualização para a seção de Potencial de ROI não estão documentados. Não citar uma fonte publicamente até confirmar.",
    "A camada 3 (corporativo) é uma hipótese, não um padrão comprovado.",
  ],
  sections: {
    instructions: { provenance: "confirmed", confirmedAt: "2026-08-04" },
    audience: { provenance: "analytics", confirmedAt: "2026-08-04" },
    offer: { provenance: "confirmed", confirmedAt: "2026-08-04" },
    engine: { provenance: "confirmed", confirmedAt: "2026-08-04" },
  },
};

/**
 * Tenant one. What the system actually produces from a cold scrape of a plain
 * local business — thin, low-confidence, and honest about it. This is the
 * generalization test: does the brain have anything worth saying when the
 * business is ordinary?
 */
export const draftedStudio: Brain = {
  tenantId: "studio-corpo",
  businessName: "Studio Corpo",
  oneLiner: "Estúdio de força e condicionamento do bairro.",
  website: "studiocorpo.com.br",
  handles: ["@studiocorpo"],
  voice: {
    language: "Português (BR)",
    register: "Direto, encorajador, informal. Fala com iniciantes sem ser condescendente.",
    rules: ["Segunda pessoa.", "Frases curtas.", "Sem alegações médicas."],
    brand: {
      background: "#141414",
      text: "#FFFFFF",
      accent: "#D6FF4B",
      headlineFont: "Não detectada",
      bodyFont: "Não detectada",
      accentRule: "Um elemento de destaque por peça, nunca mais.",
    },
  },
  audienceLayers: [
    {
      id: "sc-layer-1",
      name: "Potencial cliente local",
      summary:
        "Mora ou trabalha a poucos quilômetros. Extraído do texto do site e das quatro publicações mais recentes — ainda sem evidência comportamental.",
      confidence: "low",
      register: "Encorajador, não intimidante.",
      neverBlendWith: [],
      evidence: [
        {
          id: "sc-ev-1",
          claim: "O texto do site enfatiza iniciantes e um ambiente sem julgamento.",
          confidence: "low",
          source: "Raspagem da página inicial",
        },
      ],
    },
  ],
  offers: [
    {
      id: "sc-trial",
      name: "Aula experimental",
      tier: "free-entry",
      whatItIs: "Uma aula experimental grátis, listada na página de preços.",
      figures: [
        { label: "Preço", value: "Grátis", confirmed: true, source: "Raspagem da página de preços" },
      ],
      requiredBelief: "Experimentar uma aula é de baixo risco.",
      supportingEvidence: ["sc-ev-1"],
      verdict: "passed",
    },
    {
      id: "sc-monthly",
      name: "Plano mensal",
      tier: "paid-conversion",
      whatItIs: "Mensalidade.",
      figures: [
        {
          label: "Mensal",
          value: "R$189",
          confirmed: false,
          source: "Raspado — precisa de confirmação",
        },
      ],
      requiredBelief: "Este estúdio vale um compromisso recorrente.",
      supportingEvidence: [],
      verdict: "failed",
      ladderPlacement:
        "Ainda não vendável em conteúdo — sem evidência de que o público tem essa crença. Reúna isso antes de promover.",
    },
  ],
  salesEngine: null,
  openItems: [
    "Sem evidência de público além do texto do site. Conecte análises do Instagram para classificar essas alegações.",
    "O preço mensal foi raspado mas não está confirmado — não vai aparecer em conteúdo gerado até você confirmar.",
    "Ainda sem funil. Um motor de vendas precisa de pelo menos uma alegação de público de alta confiança para se apoiar.",
  ],
  sections: {
    instructions: { provenance: "scraped" },
    audience: { provenance: "scraped" },
    offer: { provenance: "scraped" },
    engine: { provenance: "scraped" },
  },
};

export const tenants: Record<string, Brain> = {
  agrostech,
  "studio-corpo": draftedStudio,
};
