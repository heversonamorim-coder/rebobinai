/**
 * Config declarativa das landing pages de ocasião (F2-6, SEO programático).
 * Cada entrada mapeia rota → persona da galeria → copy otimizada. Para lançar
 * uma ocasião nova, basta adicionar um item aqui — a rota, o sitemap e o
 * internal linking passam a existir sem tocar em código de página.
 *
 * Copy: tom da marca (quente, brincalhão, um bip de tech), mas escaneável —
 * H1 com a keyword, resposta direta de ~40–60 palavras no topo (AEO) e FAQ
 * com perguntas reais de busca. Zero keyword stuffing.
 */

export interface OccasionFaq {
  q: string;
  a: string;
}

export interface OccasionConfig {
  /** Slug da rota: /presente-dia-dos-pais etc. */
  slug: string;
  /** Valor de Example.occasion usado para filtrar exemplos da persona. */
  galleryOccasion: string;
  /** Rótulo curto para cross-links ("procurando presente pra outra pessoa?"). */
  label: string;
  /** <title> — keyword no início, ≤60 caracteres. */
  title: string;
  /** Meta description — gancho emocional, ≤155 caracteres. */
  description: string;
  /** H1 com a keyword principal. */
  h1: string;
  /** Subtítulo da proposta de valor. */
  sub: string;
  /**
   * Resposta direta (AEO): parágrafo de ~40–60 palavras que responde a busca
   * literalmente — é o trecho que AI Overviews/ChatGPT tendem a citar.
   */
  directAnswer: string;
  /** FAQ da ocasião (vira schema.org FAQPage). */
  faq: OccasionFaq[];
}

export const OCCASIONS_CONFIG: OccasionConfig[] = [
  {
    slug: 'presente-dia-dos-pais',
    galleryOccasion: 'pais',
    label: 'Dia dos Pais',
    title: 'Presente de Dia dos Pais criativo | Rebobinaí ◄◄',
    description:
      'Presente de Dia dos Pais criativo e emocionante: uma página com a história de vocês, fotos e música. Pronto em 5 minutos, a partir de R$ 19,90.',
    h1: 'Presente de Dia dos Pais que ele vai guardar pra sempre',
    sub: 'Rebobine a história de vocês numa página-presente com fotos, carta e música — pronta em minutos, até de última hora.',
    directAnswer:
      'Um presente de Dia dos Pais criativo (e que salva até quem deixou pra última hora) é uma rebobinada: uma página-presente personalizada com a história de vocês — fotos, carta e música — montada com IA em cerca de 5 minutos. O preview é grátis, custa a partir de R$ 19,90 e seu pai recebe por link no WhatsApp ou QR code.',
    faq: [
      {
        q: 'É um bom presente de Dia dos Pais de última hora?',
        a: 'Sim — a rebobinada fica pronta em minutos: você conta a história, a IA monta a página, você paga por Pix e o link já pode ser enviado no WhatsApp no mesmo dia.',
      },
      {
        q: 'Meu pai precisa instalar algum app para abrir?',
        a: 'Não. O presente é um link que abre direto no navegador do celular — dá até pra apontar a câmera para o QR code impresso num cartão.',
      },
      {
        q: 'Quanto custa o presente de Dia dos Pais?',
        a: 'Criar e ver a prévia é grátis. Para liberar o link e compartilhar, os planos começam em R$ 19,90 (pagamento único, Pix ou cartão).',
      },
      {
        q: 'Tem versão física para entregar no almoço de Dia dos Pais?',
        a: 'Tem: o plano com lembrança física inclui caneca ou camiseta com o QR code da rebobinada, a partir de R$ 69,90 + frete.',
      },
    ],
  },
  {
    slug: 'presente-namorada',
    galleryOccasion: 'namorados',
    label: 'Namorada',
    title: 'Presente criativo para namorada | Rebobinaí ◄◄',
    description:
      'Presente criativo para namorada: uma página com a história de vocês, fotos, música e contador de dias juntos. Feito com IA em 5 minutos, desde R$ 19,90.',
    h1: 'Presente criativo para namorada: rebobine a história de vocês',
    sub: 'Uma página-presente com as fotos, a carta e a música de vocês — com contador de dias juntos e estética retrô de VHS.',
    directAnswer:
      'Um presente criativo para namorada é uma rebobinada: uma página personalizada que conta a história do casal com fotos, carta, música e contador de dias juntos. Você escreve um parágrafo, a IA monta tudo em 5 minutos, e ela recebe por link surpresa no WhatsApp. A partir de R$ 19,90, com preview grátis.',
    faq: [
      {
        q: 'Serve como presente de aniversário de namoro?',
        a: 'É o caso de uso favorito: a rebobinada tem linha do tempo dos momentos, contador de "juntos há X dias" e carta — feita sob medida pra datas do casal.',
      },
      {
        q: 'Ela vai ver que foi feito com IA?',
        a: 'A IA só organiza o que você conta — as memórias, as fotos e os apelidos são de vocês. Você revisa e edita tudo antes de enviar.',
      },
      {
        q: 'Quanto custa e como pago?',
        a: 'Preview grátis. Para liberar o link, pagamento único a partir de R$ 19,90, por Pix ou cartão — sem assinatura.',
      },
      {
        q: 'Como ela recebe o presente?',
        a: 'Por um link secreto que abre no navegador (perfeito pro WhatsApp) ou por QR code — e você acompanha cada vez que ela abrir.',
      },
    ],
  },
  {
    slug: 'presente-namorado',
    galleryOccasion: 'namorados',
    label: 'Namorado',
    title: 'Presente criativo para namorado | Rebobinaí ◄◄',
    description:
      'Presente criativo para namorado: página-presente com a história de vocês, fotos, música e contador de dias juntos. Pronta em 5 minutos, desde R$ 19,90.',
    h1: 'Presente criativo para namorado: aperte o play na história de vocês',
    sub: 'Fotos, carta, música e os números do casal numa página-presente com cara de fita rebobinada — pronta em minutos.',
    directAnswer:
      'Um presente criativo para namorado é uma rebobinada: uma página que conta a história de vocês em formato de stories, com fotos, carta, música e contador de dias juntos. Você conta a história em um parágrafo, a IA monta em 5 minutos e ele recebe por link no WhatsApp. A partir de R$ 19,90.',
    faq: [
      {
        q: 'Funciona como surpresa de aniversário de namoro?',
        a: 'Sim — dá pra programar a linha do tempo com os momentos de vocês e o contador de dias juntos, e mandar o link na hora exata da data.',
      },
      {
        q: 'Ele precisa de app ou cadastro para abrir?',
        a: 'Não. O link abre direto no navegador do celular, como um stories — só apertar o play.',
      },
      {
        q: 'Posso colocar a música de vocês?',
        a: 'Pode: a rebobinada toca a música do casal via Spotify enquanto ele navega pelas memórias.',
      },
      {
        q: 'Quanto custa?',
        a: 'Criar e ver a prévia é grátis; para compartilhar, planos a partir de R$ 19,90 em pagamento único (Pix ou cartão).',
      },
    ],
  },
  {
    slug: 'presente-dia-das-maes',
    galleryOccasion: 'maes',
    label: 'Dia das Mães',
    title: 'Presente de Dia das Mães emocionante | Rebobinaí ◄◄',
    description:
      'Presente de Dia das Mães emocionante: uma página com a história de vocês, fotos de família e carta. Feito com IA em 5 minutos, a partir de R$ 19,90.',
    h1: 'Presente de Dia das Mães que vai fazer ela chorar (do jeito bom)',
    sub: 'Uma página-presente que rebobina a história de vocês — das fotos antigas de família à carta que você nunca soube escrever.',
    directAnswer:
      'Um presente de Dia das Mães emocionante é uma rebobinada: uma página personalizada com a história de vocês — fotos de família, linha do tempo e uma carta de amor de filho — montada com IA em 5 minutos. O preview é grátis, custa a partir de R$ 19,90 e ela recebe por link ou QR code.',
    faq: [
      {
        q: 'Não sei escrever carta — a IA ajuda?',
        a: 'Ajuda: você conta a história de vocês num parágrafo simples e a IA transforma em carta e legendas com emoção — você edita e dá o tom final.',
      },
      {
        q: 'Minha mãe não é boa com tecnologia. Vai conseguir abrir?',
        a: 'Vai: é um link que abre no navegador, sem app nem cadastro. Também dá pra imprimir o QR code num cartão e ela só aponta a câmera.',
      },
      {
        q: 'Posso juntar fotos antigas da família?',
        a: 'Sim — você envia as fotos do celular (ou importa do Google Fotos) e elas entram na linha do tempo da história.',
      },
      {
        q: 'Quanto custa o presente?',
        a: 'Preview grátis. Para liberar o link e compartilhar, pagamento único a partir de R$ 19,90 — Pix ou cartão.',
      },
    ],
  },
  {
    slug: 'presente-casamento',
    galleryOccasion: 'casamento',
    label: 'Casamento',
    title: 'Presente de casamento criativo | Rebobinaí ◄◄',
    description:
      'Presente de casamento criativo: a história do casal numa página com fotos, música e linha do tempo — do primeiro encontro ao sim. Desde R$ 19,90.',
    h1: 'Presente de casamento criativo: a história do casal em replay',
    sub: 'Do primeiro encontro ao "sim" — uma página-presente que rebobina a jornada do casal, perfeita pra bodas e aniversário de casamento.',
    directAnswer:
      'Um presente de casamento criativo é uma rebobinada: uma página que conta a história do casal — do primeiro encontro ao altar — com fotos, música e linha do tempo. Funciona para noivos, bodas e aniversário de casamento. Feita com IA em 5 minutos, a partir de R$ 19,90, com preview grátis.',
    faq: [
      {
        q: 'Serve para bodas e aniversário de casamento?',
        a: 'Perfeitamente: a linha do tempo conta os anos de casados e o contador mostra "juntos há X dias" — quanto mais história, melhor a rebobinada.',
      },
      {
        q: 'Posso dar de presente para outro casal?',
        a: 'Pode! Você monta a rebobinada com a história deles (as fotos e os momentos que você conhece) e entrega o link ou QR code na festa.',
      },
      {
        q: 'Dá pra mostrar no telão da festa?',
        a: 'Dá — a rebobinada abre em qualquer navegador, inclusive em notebook ligado no telão, em formato de stories com música.',
      },
      {
        q: 'Quanto custa?',
        a: 'Criar e ver a prévia é grátis. Planos a partir de R$ 19,90 (pagamento único), com opção vitalícia e lembrança física com QR code.',
      },
    ],
  },
  {
    slug: 'presente-melhor-amiga',
    galleryOccasion: 'amizade',
    label: 'Melhor amiga',
    title: 'Presente para melhor amiga criativo | Rebobinaí ◄◄',
    description:
      'Presente para melhor amiga: uma página com a história da amizade — fotos, perrengues superados e piadas internas. Pronto em 5 minutos, desde R$ 19,90.',
    h1: 'Presente para melhor amiga: rebobine essa amizade',
    sub: 'Os áudios de 5 minutos, os perrengues, as fotos ridículas — tudo numa página-presente que celebra a história de vocês.',
    directAnswer:
      'Um presente criativo para melhor amiga é uma rebobinada: uma página personalizada que conta a história da amizade com fotos, linha do tempo, piadas internas e uma carta. Você escreve um parágrafo, a IA monta em 5 minutos e ela recebe por link no WhatsApp. A partir de R$ 19,90, com preview grátis.',
    faq: [
      {
        q: 'Serve para aniversário da minha melhor amiga?',
        a: 'É o presente de aniversário que nenhuma caneca personalizada supera: a história de vocês, contada com as fotos e os perrengues que só vocês entendem.',
      },
      {
        q: 'Dá pra fazer em grupo, com mais amigas?',
        a: 'Dá: uma pessoa monta a rebobinada com fotos e memórias de todo mundo e assina no final em nome do grupo.',
      },
      {
        q: 'Ela precisa de app para abrir?',
        a: 'Não — é um link que abre no navegador como um stories. Só apertar o play (e segurar o choro).',
      },
      {
        q: 'Quanto custa?',
        a: 'Preview grátis; para liberar o link, pagamento único a partir de R$ 19,90, por Pix ou cartão.',
      },
    ],
  },
  {
    slug: 'presente-avo',
    galleryOccasion: 'avos',
    label: 'Avó / Avô',
    title: 'Presente para avó emocionante | Rebobinaí ◄◄',
    description:
      'Presente para avó ou avô: uma página com a história da família, fotos antigas e carta — que abre pelo QR code, sem app. Desde R$ 19,90.',
    h1: 'Presente para avó (e avô) que atravessa gerações',
    sub: 'As fotos antigas, as receitas, as histórias de domingo — rebobinadas numa página-presente que abre com um QR code.',
    directAnswer:
      'Um presente emocionante para avó ou avô é uma rebobinada: uma página com a história da família — fotos antigas, linha do tempo e carta — que abre pelo navegador, sem instalar nada. O QR code impresso num cartão resolve a parte da tecnologia. Feita com IA em 5 minutos, a partir de R$ 19,90.',
    faq: [
      {
        q: 'Minha avó não usa smartphone direito. Como ela abre?',
        a: 'Pelo QR code: imprima num cartão ou peça pra alguém da família apontar a câmera — a rebobinada abre no navegador, sem app nem senha.',
      },
      {
        q: 'Posso usar fotos antigas digitalizadas?',
        a: 'Sim — fotos de álbum digitalizadas pelo celular funcionam lindamente na linha do tempo (a estética retrô da página combina com elas).',
      },
      {
        q: 'Serve para aniversário de 70, 80, 90 anos?',
        a: 'É o momento perfeito: décadas de história viram uma linha do tempo emocionante, com os netos, filhos e a família toda.',
      },
      {
        q: 'Quanto custa?',
        a: 'Criar e ver a prévia é grátis. Para compartilhar, planos a partir de R$ 19,90 — com opção de caneca ou camiseta com o QR code.',
      },
    ],
  },
  {
    slug: 'presente-aniversario',
    galleryOccasion: 'aniversario',
    label: 'Aniversário',
    title: 'Presente de aniversário criativo | Rebobinaí ◄◄',
    description:
      'Presente de aniversário criativo e personalizado: uma página com a história de vocês, fotos e música — pronta em 5 minutos, a partir de R$ 19,90.',
    h1: 'Presente de aniversário criativo: a história de quem você ama, em replay',
    sub: 'Mais que um parabéns: uma página-presente que rebobina os melhores momentos de quem tá fazendo aniversário.',
    directAnswer:
      'Um presente de aniversário criativo é uma rebobinada: uma página personalizada que celebra a história do aniversariante com fotos, carta, música e contador de dias de vida. Você conta a história em um parágrafo, a IA monta em 5 minutos e a pessoa recebe por link ou QR code. A partir de R$ 19,90.',
    faq: [
      {
        q: 'Fica pronto a tempo se o aniversário é hoje?',
        a: 'Fica: contando a história e escolhendo as fotos, a rebobinada sai em minutos — pagou por Pix, o link já pode ser enviado.',
      },
      {
        q: 'Serve para qualquer pessoa — mãe, amigo, namorada?',
        a: 'Sim: a rebobinada se adapta à relação. Temos exemplos por ocasião pra você começar de uma base pronta e só ajustar.',
      },
      {
        q: 'O que vai na página do presente?',
        a: 'Título, carta, linha do tempo com fotos, os "números de vocês", música do Spotify e um recado final — tudo editável antes de enviar.',
      },
      {
        q: 'Quanto custa?',
        a: 'Preview grátis. Para liberar o link e compartilhar, pagamento único a partir de R$ 19,90, por Pix ou cartão.',
      },
    ],
  },
];

export function getOccasionBySlug(slug: string): OccasionConfig | undefined {
  return OCCASIONS_CONFIG.find((o) => o.slug === slug);
}
