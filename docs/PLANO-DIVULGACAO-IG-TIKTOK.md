# Rebobinaí — Plano de Divulgação Instagram + TikTok

**Janela:** 06/jul → 09/ago/2026 (Dia dos Pais) · **Budget:** R$1.000/mês · **Produção:** mix (você + IA/telas + creators)

---

## 1. Posicionamento de conteúdo

Não vendemos "site de presente". Vendemos a **reação de quem recebe**. Todo conteúdo persegue um único momento: a pessoa abrindo a rebobinada e se emocionando. A estética VHS/Y2K (◄◄, scanlines, timecode) é o diferencial visual — nenhum concorrente parece com a gente no feed.

**Big idea da campanha:** *"Rebobina a história de vocês"* — para o Dia dos Pais: *"Rebobina a história com seu pai"*.

## 2. Estratégia orgânica (motor principal com esse budget)

### Pilares de conteúdo (proporção semanal)

| Pilar | % | Formato | Quem produz |
|---|---|---|---|
| **Reação/emoção** — alguém recebendo a rebobinada, POV de quem abre | 40% | Reels/TikTok 15–30s | Você + UGC |
| **Making of** — screen recording criando um presente em 60s ("olha o que dá pra fazer em 5 min") | 30% | Screen capture + motion VHS | IA/telas, sem rosto |
| **Storytelling** — "coisas que seu pai fez e você nunca agradeceu", trends adaptadas | 20% | Reels com texto na tela | Você |
| **Prova social** — prints de stats ("ela abriu 7 vezes 🥹"), depoimentos | 10% | Carrossel/Stories | IA/telas |

### Cadência
- **TikTok:** 1 vídeo/dia (volume é o algoritmo lá; repostar variações conta)
- **Instagram:** 4 Reels/semana + Stories diários + 1 carrossel/semana
- Mesmo vídeo nos dois canais, com hooks diferentes nos 2 primeiros segundos

### Hooks testados para o nicho (girar entre eles)
1. "Eu fiz meu pai chorar com um link" 
2. "POV: você abre um presente que rebobina 30 anos"
3. "Presente de Dia dos Pais pra quem não sabe o que dar"
4. "Isso custou menos que uma camisa e ele guardou pra sempre"
5. Tela: "1994 ◄◄ REWIND" + foto antiga do pai animada

## 3. Calendário — 5 semanas até 09/ago

| Semana | Fase | Foco |
|---|---|---|
| 06–12/jul | **Fundação** | Criar perfis (@rebobinai), bio, highlights, 9 primeiros posts (grid com identidade), 5 vídeos making-of |
| 13–19/jul | **Tração orgânica** | Cadência plena, testar 5 hooks, identificar 2 melhores formatos |
| 20–26/jul | **Warm-up pago** | Ativar ads com os 2 vídeos orgânicos que melhor performaram; abrir conversa com creators |
| 27/jul–02/ago | **Aceleração** | UGC de creators no ar, campanha "Dia dos Pais" com cupom, escalar melhor ad |
| 03–09/ago | **Pico** | 70% do budget de ads da campanha aqui; urgência ("chega a tempo, é digital"), countdown nos Stories |

## 4. Paid media — R$1.000/mês

Com esse budget, ads servem para **amplificar o que já provou funcionar no orgânico**, não para descobrir criativos.

| Item | Valor | Detalhe |
|---|---|---|
| Meta Ads (IG) — conversão | R$600 | Advantage+, objetivo compra, público BR 22–45, criativo = melhor Reel orgânico |
| Meta Ads — remarketing | R$150 | Visitantes do site/engajou com perfil, 7 dias |
| TikTok Ads (teste) | R$250 | Só se orgânico do TikTok validar; senão, realocar pro Meta |

Distribuição temporal em julho/agosto: ~R$30/dia nas semanas 3–4, subindo para ~R$70/dia na semana do Dia dos Pais (03–09/ago).

**Meta de CPA:** com ticket ~R$50–80, CPA alvo ≤ R$25 no pico. Acima de R$40 por 3 dias → pausar e trocar criativo.

## 5. Influenciadores / UGC (custo variável, não sai do budget fixo)

- Modelo **100% comissão via cupom** (motor já existe: coupon-engine + redemption-tracking, ex. código JANA)
- Alvo: 5–10 **nano influenciadores** (5k–50k) de nichos: relacionamento, maternidade/paternidade, nostalgia anos 90/2000, "presentes criativos"
- Oferta: cupom de 15% + comissão de 20% por venda + a rebobinada deles de graça (eles postam a própria reação = UGC autêntico)
- Pedir sempre **direito de uso do vídeo como ad** (whitelisting)

## 6. Ferramentas e plugins

**Conectar agora (Cowork):**
- **Canva MCP** — produção de carrosséis, capas e templates com a identidade da marca (apareceu na busca do registry; conecte em Settings → Connectors)

**Plugins Rebobinaí já instalados que essa campanha usa:**
- `rebobinai-promotions:campaign-manager` — criar a campanha "Dia dos Pais 09/ago" com cupons e vigência
- `rebobinai-promotions:coupon-engine` + `redemption-tracking` — cupons de influenciador com atribuição
- `rebobinai-gallery:occasion-landing` — landing SEO `/presente-dia-dos-pais` como destino dos links de bio e ads
- `rebobinai-gallery:seed-examples` — exemplo "pai" impecável na galeria (é o que o tráfego vai ver)
- `rebobinai-analytics:ab-experiments` — medir conversão por origem (UTM ig/tiktok) no funil

**Ferramentas externas (fora do Cowork):**
- Meta Business Suite (agendamento IG grátis) · CapCut (edição com templates VHS) · Linktree ou link direto pra occasion-landing · UTMs padronizadas: `utm_source=instagram|tiktok`, `utm_campaign=diadospais26`

**Sugestão de plugin novo:** um `rebobinai-growth` com skills de *roteiro-reels* (gera roteiros no tom da marca), *calendario-conteudo* e *brief-ugc*. Posso criar com o skill-creator quando quiser.

## 7. Pré-requisitos técnicos antes de rodar tráfego

1. Pixel do Meta + eventos (ViewContent, InitiateCheckout, Purchase) no site
2. `occasion-landing` de Dia dos Pais no ar e indexável
3. Campanha + cupom `PAI15` criados no campaign-manager
4. OG tags testadas no WhatsApp (compartilhamento é o loop viral do produto)
5. Exemplo de persona "pai" na galeria com o botão "usar como base"

## 8. KPIs (revisar toda segunda)

| Métrica | Meta semana 5 |
|---|---|
| Seguidores (IG+TT) | 1.000+ |
| Views/vídeo médio TikTok | 2.000+ |
| Visitas ao site via social | 1.500/semana |
| Conversão visita→compra | ≥ 2% |
| Vendas Dia dos Pais | 30–50 |
| CPA pago | ≤ R$25 |

**Loop de decisão semanal:** o que teve mais retenção nos 3s iniciais → vira ad. O que não engajou → morre sem dó. Dobrar aposta em 1 formato vencedor > diversificar.
