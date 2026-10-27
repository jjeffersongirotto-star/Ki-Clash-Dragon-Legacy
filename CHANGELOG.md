# Histórico de atualizações

Toda PR deve adicionar uma entrada aqui e atualizar o [REGRAS.md](REGRAS.md). Horários em Brasília (UTC−3).

## [0.31.0] — 27/10/2026 · PR #66 — Carta sem raios, detalhes sem rolar e banner com garantias
- **Carta:** saem os raios de luz girando por cima da arte (Épico+); ficam o reflexo e a borda.
- **Detalhes da carta:** ✕ no canto para fechar; "Colocar no baralho" e "Treinar" viram cards ao lado da carta; no celular em pé tudo cabe sem barra de rolagem (conferido em 412×915 e 360×740).
- **Banner:** chances Comum 25 · Incomum 30 · Raro 25 · Épico 15 · Lendário 4 · Mítico 1%; pacote de 10 garante **1 Épica**; **Lendária garantida a cada 80 cartas** (contador N/80 no card do banner, zera quando sai Lendária/Mítica).
- **Resultado da compra:** botões Comprar 1 / Comprar 10 e ✕ embaixo para sair.

## [0.30.2] — 27/10/2026 · PR #65 — Arte nova da Cria Sombria
- **🟢 Cria Sombria** (a invocação do Vorax) ganha a arte ilustrada enviada pelo jogador: na carta, nas unidades da batalha e no recorte (sem fundo). Agora nenhum personagem usa mais o desenho SVG antigo.
- `scripts/art/build_cards.py` aceita ilustrações já limpas (tabela `PLAIN`: só recorta no formato da carta); `build_cutouts.py` também gera o recorte da Cria.

## [0.30.1] — 27/10/2026 · PR #64 — Comandante adversário recortado e respirando
- **Comandante adversário na batalha** agora aparece como o nosso: **só o personagem recortado** (sem carta e sem fundo), de pé no mesmo piso, dentro da coluna, com **respiração** (animação leve em CSS) e virado para a arena.
- **Altura proporcional ao nosso bárbaro** (tabela por personagem em REGRAS seção 32): quem está agachado, sentado ou aparece só até a cintura fica mais baixo; mulheres um pouco menores; monstros grandes maiores. A fase 10 continua com o minotauro animado.
- Recortes gerados por `scripts/art/build_cutouts.py` (rembg, modelo BiRefNet) a partir das artes originais: 21 imagens, ~0,9 MB no total.

## [0.30.0] — 27/10/2026 · PR #63 — 120 cartas no jogo
- **99 personagens novos** (projeto do CARTAS.md), com a arte ilustrada: agora são **120 personagens, 20 de cada tipo**. Os novos saem **só no 🎴 Banner** da Loja (não mudam as fases, os pacotes de fase nem o começo do jogo).
- **34 habilidades novas no motor de batalha:** Golpe Crítico, Provocar, Sangramento, Lentidão, Golpe pelas Costas, Veneno, Maldição, Purificar, Fúria, Regeneração, Explosão, Congelamento, Grito de Guerra, Protetor, Perfurar, Escudo de Entrada, Queimadura, Vampirismo, Investida, Atordoamento, Teleporte, Selo do Vazio, Vontade Inquebrável, Evasão, Domínio Enfraquecedor, Copiador, Protocolo de Retaliação, Clone, Raio em Cadeia, Couraça Adaptativa, Execução, Vingança, Sede Eterna (com a Marca da Sede) e Ressurreição. Tudo determinístico (a partida continua refazível e verificável).
- **Banner:** chance de **Mítico 0,5%** (tirada do Comum: 40% → 39,5%) para as cartas que começam no Mítico.
- **Ajustes no projeto:** Nalia passa a dano físico (arqueira); Tetsuo, Mag'ra, Grendar e Ghor ganham Postura de Guarda (todo Tanque tem resistência); Investida, Lentidão e Teleporte com o texto do jogo. O baralho automático completa com mais personagens quando sobram vagas de feitiço.
- **Campanha igual:** 300 batalhas de fase com a mesma semente dão exatamente o mesmo resultado antes e depois.

## [0.29.0] — 27/10/2026 · PR #62 — Artes novas nas cartas
- **Artes ilustradas:** os 20 personagens do jogo ganham a ilustração desenhada pelo jogador com outra IA, na carta (fundo inteiro), na Coleção, no Treinar/Despertar, na tela inicial, na janela da fase e na batalha (retrato emoldurado, virado para o lado do inimigo). A Cria Sombria continua com o desenho antigo.
- **Só a ilustração foi aproveitada:** as imagens vieram no modelo antigo de carta; o script `scripts/art/build_cards.py` acha a moldura e a faixa do nome, apaga a gota de custo, a pílula ⚡ e a estrela "Nv." preenchendo com as cores ao redor e recorta no formato da carta (400×488, WebP). Números, raridade e grupo continuam os do jogo (CARTAS.md).
- As 120 artes (inclusive as das 99 cartas novas, que entram na próxima versão) ficam em `src/assets/chars/` (~4,3 MB).

## [0.28.9] — 27/10/2026 · PR #61 — Monstro com ataque na diagonal de trás
- Projeto das cartas (CARTAS.md): **Grub Presa-Lamacenta** (Monstro) ganha o ↙ Golpe Reverso, assim todo tipo tem quem ataque na diagonal de trás. Sem mudança no jogo.

## [0.28.8] — 27/10/2026 · PR #60 — Fichas das 120 cartas (CARTAS.md)
- Sem mudança no jogo. Novo **[CARTAS.md](CARTAS.md)**: o projeto das 120 cartas (6 tipos × 20). Os 20 personagens atuais contam; **99 são novas**. Cada ficha tem nome, tipo, grupo, raridade, dano, padrão de ataque, espera, habilidades, história, dica de aparência (para a outra IA desenhar) e ataque/vida em cada degrau (fórmula real do jogo).
- Cada tipo tem 1–2 Míticos, 3–4 Lendários e personagens que atacam pelas costas e na diagonal. As 31 habilidades pedidas (2 já existiam: Couraça de Espinhos e Sopro Restaurador) + 5 sugeridas; as fortes são únicas.
- Gerado por `scripts/cartas/gerar.ts` (confere as regras); versão para programas em `docs/cartas.json`.

## [0.28.7] — 27/10/2026 · PR #59 — Ícone do grupo no canto da carta
- **Canto direito de cima da carta:** sai a estrela dourada do degrau (o "+"/"++" já aparece em "Raro++" etc.) e entra o **ícone colorido do grupo**, sem círculo: ➕ verde (Suporte), 🛡 azul (Tanque), ⚔ vermelho (DPS), 🪄 roxo (Mago), 🏹 laranja (Arqueiro) e 💀 cinza (Assassino). Desenhos próprios, em cache (a carta continua sem SVG em linha).

## [0.28.6] — 27/10/2026 · PR #58 — Botão ⟳ gira no lugar
- **Botão de atualizar:** o símbolo ⟳ virou um ícone desenhado e centralizado; ao procurar atualização só o ícone gira, em torno do próprio centro, e o botão fica parado (antes o botão inteiro girava torto).

## [0.28.5] — 27/10/2026 · PR #57 — Tela inicial cabe no celular e moeda corrigida
- **Tela inicial sem rolagem** no celular em pé: logo, cartas, recursos e botões se ajustam à altura da tela.
- **🪙 Moeda corrigida na barra de recursos:** o estilo de "pílula" da barra era aplicado também às partes de dentro da moeda, e o dragão aparecia solto fora dela (e os Orbes com pílula dupla). Agora só os itens da barra ganham a pílula.

## [0.28.4] — 27/10/2026 · PR #56 — Ideias do tipo do personagem anotadas
- Sem mudança no jogo. O [MELHORIAS.md](MELHORIAS.md) ganhou duas ideias para o tipo do personagem: bônus de equipe (3 ou mais do mesmo tipo) e objetivos/missões por tipo.

## [0.28.3] — 27/10/2026 · PR #55 — Tela de batalha organizada e XP que sobra vira Orbe
- **XP que sobra vira Orbe:** quando o XP de uma **cópia repetida** (Banner ou pacote de fase) passa da barra cheia, **25% do que passou volta como Orbes** na bolsa (do Orbe maior para o menor; o resto abaixo de 100 XP é descartado). A carta recebida mostra "XP que passou: +N Orbes". Orbes e XP por jogar mantêm a regra de antes.
- **Tela de batalha organizada** (sem mudança no jogo): `battleView.ts` dividido em `battleHand.ts` (mão), `battleModals.ts` (janelas de detalhes), `battleRender.ts` (tabuleiro) e `battleEffects.ts` (animações); ficou com 467 linhas.
- MELHORIAS.md: saem as duas pendências técnicas feitas.

## [0.28.2] — 27/10/2026 · PR #54 — MELHORIAS.md atualizado
- Sem mudança no jogo. O [MELHORIAS.md](MELHORIAS.md) agora tem só o que falta fazer (novas fases e cartas, progressão final, arte dos Comandantes, modo online e pendências técnicas); tudo o que já entrou no jogo saiu de lá.

## [0.28.1] — 27/10/2026 · PR #53 — Organização do código
- Sem mudança no jogo. `main.ts` dividido em telas (`src/app/`), `battle.ts` em regras de combate / movimento / feitiços, efeitos da batalha em `battleFx.ts`.
- Testes agrupados por assunto em pastas (mesmos 384 testes).
- **ESLint** (`npm run lint`, typescript-eslint) na CI.

## [0.28.0] — 27/10/2026 · PR #52 — Campanha: equilíbrio, liberação, Comandantes e estrelas
- **⭐ Estrelas por fase:** a 1ª é vencer; a 2ª e a 3ª são 2 objetivos fixos de cada fase em cada dificuldade (❤️ vida do Comandante 50/70/100% · 🃏 no máximo 8/10/12 cartas · 🪄 sem feitiços ou 2 feitiços · 💀 6/8/10 abates). Normal e Difícil têm objetivos diferentes ou mais apertados. Saiu o "até 15 turnos". As estrelas já ganhas continuam valendo. A batalha agora conta cartas, feitiços e abates.
- **🔓 Liberação fase a fase:** a fase N do Normal abre ao vencer a fase N no Fácil (e a N−1 no Normal); o Difícil igual em relação ao Normal.
- **👹 Comandante de cada fase:** fases 1–9 mostram o personagem mais forte da fase (sem repetir); o minotauro fica só na fase 10. No mapa, na janela da fase e na batalha.
- **⚖ Fácil reequilibrado** (degraus, vida do Comandante e feitiços dos inimigos): vitória ao chegar 93/92/90/79/74/77/71/68/66/67% (antes 93/92/94/63/62/61/55/57/59/57%).

## [0.27.0] — 27/10/2026 · PR #51 — Banner de cartas e cópias repetidas
- **🎴 Banner "Despertar do Dragão"** na 🏪 Loja: paisagem com Kenji e Vorax em destaque. 1 carta = 300 Ouro de Dragão, 10 cartas = 2.700 (pelo menos 1 Rara ou melhor no pacote de 10). Chances: Comum 40% · Incomum 27% · Raro 20% · Épico 10% · Lendário 3%.
- Cada carta é um personagem na raridade sorteada (entre os que podem ter essa raridade). **Kenji e Vorax** deixam de ser "em breve" e saem **só no Banner**, na metade das cartas Lendárias.
- **Cópia repetida vira XP** (Banner e pacotes de fase): Orbe da raridade da carta + 20% por "+", com sorte de 12% ×2, 5% ×5 e 1% ×10. A cópia não sobe a raridade.
- Banners como dados (`BANNERS`), prontos para cartas e fases futuras. Tela de revelação das cartas (1 ou 10).

## [0.26.2] — 26/10/2026 · PR #50 — Moeda com cara de moeda
- **🪙 Ouro de Dragão:** borda serrilhada, anel de pontinhos em relevo, campo do meio rebaixado, ouro metálico com sombreamento e um brilho passando. O dragão 🐉 voltou ao dourado um pouco laranja (pedido do jogador) e ficou em relevo (luz em cima, sombra embaixo).

## [0.26.1] — 26/10/2026 · PR #49 — Moeda com o dragão no meio
- **🪙 Ouro de Dragão:** a moeda agora é a Ryo dourada redonda com o **dragão 🐉 dourado no meio**, no lugar do furo (pedido do jogador). O desenho oval da v0.26.0 saiu.

## [0.26.0] — 26/10/2026 · PR #48 — Energia, XP de perfil, Ouro de Dragão e Loja
- **⚡ Energia:** Jogar ou Repetir gasta energia (Fácil 1 · Normal 3 · Difícil 6; na batalha, ao começar). Máximo pelo nível de perfil (nível 1 = 20 … nível 100 = 300), recupera 1 a cada 6 minutos. Ao subir de nível, ganha a energia máxima do nível novo (pode passar do máximo). O tutorial é grátis e o limite de 5 por dia continua.
- **👤 Nível de perfil de verdade (1 a 100):** XP de perfil = 1 por energia gasta + (4 + fase) × custo a cada vitória ou Repetir (em dobro na primeira vitória). O nível continua aumentando o baralho (até 40). Barra de nível na Base.
- **🪙 Ouro de Dragão:** moeda oval japonesa (Ryo) dourada com um dragão dourado no meio (desenho próprio). Cada vitória ou Repetir dá (10 + 5 × fase) × custo de energia (em dobro na primeira vitória).
- **🏪 Loja:** itens de ascensão (cinza 40 · verde 100 · azul 250 · roxo 600 · laranja 1.500), com a aba "Faltando no baralho", e Orbes (30 a 900). Não vende energia.
- Energia e Ouro na barra de cima; custo de energia nos botões Jogar/Repetir; Ouro e XP de perfil na janela da fase e no resultado.
- **Saves:** antigos começam no nível de perfil que tinham (1 + fases vencidas), com energia cheia e 0 de Ouro; o baralho não perde espaço. ADM no nível 100, com muita energia e Ouro.
- Simulação (Fácil, baralho só de personagens): com a Loja, vitória ao chegar 93/92/95/64/62/62/54/59/60/58% (sem Loja: 93/93/94/63/59/56/63/62/51/52%). Ver REGRAS seção 25.

## [0.25.0] — 26/10/2026 · PR #47 — Tutorial
- **🎓 Tutorial:** o jogo novo começa numa fase só do tutorial, antes da fase 1 (que não mudou). Batalha 1: Riku contra 1 inimigo, feita para vencer. 🎁 Pacote grátis com Sora (suporte de longo alcance) e Nara (Corte Diagonal). Batalha 2: contra Daichi, Hana e Tobi, para conhecer as habilidades. Caixinhas de dica, uma por vez, por cima da batalha (dá para passar ou fechar). "Pular tutorial" dá tudo do mesmo jeito.
- **Recompensa do tutorial:** os Orbes do começo de antes (10 Comuns + 3 Raros), ✴12 e os itens do "+" dos 3 personagens — os 3 sobem para Comum+. O save novo começa só com o Riku, sem Orbes nem Essências.
- **Pacote na primeira vitória de cada fase:** o desbloqueio de sempre + um personagem de Comum (fases 1–9). A janela da fase mostra o pacote.
- **Mínimo do baralho = 3 × personagens que você tem** (até 20): com 3 personagens, 9 cartas.
- Saves antigos e a conta ADM pulam o tutorial e ficam com tudo.
- Simulação (Fácil, baralho só de personagens): vitória ao chegar 93/92/95/63/59/56/61/62/52/52% (v0.24.1: 71/87/89/66/65/65/64/51/47/46%). Ver REGRAS seção 24.

## [0.24.1] — 26/10/2026 · PR #46 — Mais itens verdes no Fácil e bônus da primeira vitória
- **Fácil 60/40:** os itens do Fácil saem cinza 60% / verde 40% (antes 80/20). Normal e Difícil continuam 80/20. A janela da fase e a 🎒 mochila mostram as novas chances.
- **Bônus da primeira vitória:** na primeira vitória de cada fase (em cada dificuldade) os 3 itens da fase saem **2 vezes** e o **XP por jogar vem em dobro**. O XP de perfil vem com a energia.
- Simulação (Fácil, sem Repetir): vitória ao chegar 71/87/89/66/65/65/64/51/47/46% (v0.24.0: 71/87/88/65/65/62/62/48/50/46%). O que segura a evolução é a quantidade de itens; o reequilíbrio continua no tutorial e na energia.

## [0.24.0] — 26/10/2026 · PR #45 — Itens de ascensão
- **🎒 Itens de ascensão:** 30 itens, 5 por categoria (Tanque: elmo, armadura, escudo, manoplas, botas de ferro · Suporte: tiara, túnica, amuleto, bastão, sandálias · DPS: bandana, colete, espada, luvas, botas · Mago: chapéu, manto, cajado, cristal, anel · Arqueiro: capuz, jaqueta, arco, aljava, botas leves · Assassino: máscara, capa, adagas, cinto, diamante negro). A raridade aparece só na cor do fundo do ícone (cinza, verde, azul, roxo, laranja).
- **Despertar pede itens:** barra cheia + Essências + 1 de cada item: **3 no "+"**, **4 no "++"** e **5 na nova raridade**. Desses, **1 / 2 / 3 são da raridade um acima** da carta e 2 da raridade dela (Comum: "+" = 2 cinza + 1 verde). Cartas Lendárias e Míticas pedem só laranja. Os itens de cada personagem são fixos e variam entre personagens da mesma categoria. O Treinar mostra os itens do próximo degrau (os que faltam ficam apagados) e os de cada degrau.
- **Barras 3 / 6 / 10:** a barra do "+" tem 30% e a do "++" 60% do XP do Despertar; o XP total por raridade não mudou. Saves mantêm a fração da barra.
- **Fases dão itens:** cada fase dá sempre os mesmos 3 itens (de categorias diferentes) em toda vitória e Repetir; as 10 fases cobrem os 30. Raridade 80/20: Fácil cinza/verde · Normal azul/roxo · Difícil roxo/laranja. A janela da fase mostra os itens e as chances.
- **Mochila** em Treinar → 🎒 Itens de ascensão. Saves antigos começam com ela vazia; ADM com 99 de cada item em cada raridade.
- Simulação (Fácil, sem Repetir): vitória ao chegar 71/87/88/65/65/62/62/48/50/46% (v0.23.0: 74/90/95/81/86/78/84/72/74/69%). Os itens seguram a evolução; o reequilíbrio vem com o tutorial e a energia (REGRAS seção 23).

## [0.23.0] — 26/10/2026 · PR #44 — Carta sem nível e degraus + / ++
- **Sem nível numerado:** a carta não tem mais "Nv." nem nível máximo. Cada raridade tem 3 degraus: **base → "+" → "++"** → próxima raridade. O topo de cada personagem é a raridade máxima "++".
- **Estrela dourada da carta** mostra o degrau ("+" ou "++"; nada no degrau base).
- **Status por degrau:** ataque e vida = base × 1,17^(degrau na escada). Cada degrau dá +17% nos dois; a barra de XP não muda os status.
- **Barra de XP por degrau** (só no Treinar), cheia com Orbes e XP por jogar; o XP que passa do cheio se perde. Com a barra cheia, o **Despertar** sobe o degrau com Essências: 4 × raridade (base → +), 5 × (+ → ++) e 6 × (++ → próxima raridade).
- **Habilidades** que melhoravam no nível 20/25/30 agora melhoram em Incomum+ / Raro / Raro+ (textos atualizados).
- **Inimigos por degrau** (Normal +1, Difícil +2 degraus; provisório), fase 8 sem feitiços e novos requisitos de Poder do Comandante, recalibrados no simulador (vitória ao chegar 74/90/95/81/86/78/84/72/74/69%; a fase 1 ficou mais difícil, ver REGRAS seção 22).
- **Saves convertidos:** mesma raridade e degrau (o "+" antigo vira "+"), barra cheia na proporção do progresso antigo; nenhum personagem se perde. ADM no topo ("++").
- "Como jogar", Coleção, detalhes da carta, batalha e janela da fase sem nível.

## [0.22.0] — 26/10/2026 · PR #43 — Orbes por raridade e XP por jogar
- **🔮 Orbes por raridade:** o único item de XP, em 6 raridades (Comum 100 · Incomum 250 · Raro 400 · Épico 800 · Lendário 1.500 · Mítico 3.000 XP), com a cor da raridade. Substituem o 📜 Pergaminho e o 💎 Cristal; os saves são convertidos sem perder XP (📜 → Comum, 💎 → Raro, 🔮 antigo → Lendário).
- **Orbes pela dificuldade:** Fácil dá Comuns e Incomuns; Normal, Raros e Épicos; Difícil, Épicos com 10% de chance de 1 Lendário e 2% de 1 Mítico. XP total parecido nas três.
- **XP por jogar:** ao vencer jogando, todo o baralho ganha 15 + 5 × fase de XP (derrota e Repetir não dão).
- Derrota dá 1 Orbe Comum de consolo. Barras de recursos mostram só os Orbes que o jogador tem.
- Simulação: a campanha ficou um pouco mais fácil com o XP por jogar (vitória ao chegar 93/91/96/84/85/79/86/82/79/73%). Ajuste junto com os itens de ascensão e a energia.

## [0.21.0] — 26/10/2026 · PR #42 — Estrelas por fase e "raridade"
- **⭐ Estrelas por fase:** 3 objetivos por fase e por dificuldade: vencer · vencer com o Comandante com 50%+ da vida · vencer em até 15 turnos. Somam entre vitórias e aparecem no mapa, na janela da fase e na vitória ("nova!").
- **⟲ Repetir só com 3 ⭐** naquela fase e dificuldade.
- **Saves antigos:** fases já vencidas começam com 1 ⭐. ADM com 3 ⭐ em tudo.
- **"Raridade" no lugar de "cor"** nos textos das telas (Treinar, Coleção, Como jogar, habilidades) e no REGRAS.

## [0.20.1] — 26/10/2026 · PR #41 — Correção do Reflexo, simulação da economia e plano do projeto
- **Correção (Reflexo de Magia):** a Nyx-07 derrotada pelo golpe não devolve mais dano (antes devolvia mesmo caída). Se ela continuar de pé, reflete como antes.
- **Simulação da economia da v0.20.0** (`scripts/balance/v20.ts`): com 5 Repetir de recompensa inteira antes de cada fase nova, o jogador simulado chega com **100%** de vitória da fase 2 à 10 (antes: 89 → 62%). Decidido manter o Repetir com recompensa inteira; o equilíbrio virá da energia, dos itens de ascensão e do Repetir só em fases com 3 ⭐ (planejado no MELHORIAS.md).
- **Documentação:** novo **[PLANO.md](PLANO.md)** (as 38 decisões, o que foi feito e o que falta) e decisões novas no MELHORIAS.md: itens de ascensão, Orbes por raridade, estrelas por fase, "raridade" no lugar de "cor".

## [0.20.0] — 26/10/2026 · PR #39 — Aventura em mapa, dificuldades e limite diário
- **Mapa da Aventura:** as fases viram bolinhas num caminho pontilhado (fase 1 embaixo), com o Comandante inimigo em cima de cada uma, se movimentando. Vencidas douradas e acesas, a próxima em azul, bloqueadas escuras. Saiu o texto do topo (Comandante, Poder e baralho).
- **Dificuldades Fácil / Normal / Difícil** no topo, ao centro: mesmas fases, inimigos com +3 / +6 níveis (provisório), progresso separado. Normal abre com a fase 10 no Fácil; Difícil com a fase 10 no Normal.
- **Jogar e Repetir:** tocar numa fase abre a janela com ⚔ Jogar e ⟲ Repetir (recompensa na hora, sem jogar). Toda vitória e todo Repetir dão a recompensa inteira, com **limite de 5 por dia em cada fase** (primeira vitória e derrotas não gastam; volta à meia-noite de Brasília). Antes, repetir dava 50%.
- **Batalha:** Comandantes ocupam a altura do retângulo das pontas; no app, a tela deita sozinha na batalha (sem o aviso "Gire o celular").
- **Botões sem explicação:** saiu "Suba nível e evolua de cor" do Treinar & Despertar.
- **Botão ⬇ Baixar** no canto inferior direito da Base do site: baixa o APK da última versão (a CI agora publica também `Ki-Clash.apk`, com nome fixo).
- **Telas em qualquer tamanho:** conferido em 8 tamanhos de celular, tablet e computador; a interface cresce em monitores grandes (1,3× a partir de 1700×950, 1,75× a partir de 2300×1300) e a batalha em pé não vaza mais para os lados.

## Documentação — 26/10/2026 · PR #38 — Lista de melhorias futuras
- Novo arquivo **[MELHORIAS.md](MELHORIAS.md)**: a próxima atualização já decidida (Aventura sem o texto do topo; botões Jogar/Repetir com limite de 5 por dia por fase), as ideias para o futuro (energia; equipamentos para ascender personagens, cada um vindo de fases específicas) e as pendências técnicas da análise. Nenhuma regra do jogo mudou.

## [0.19.0] — 26/10/2026 · PR #37 — App Android (APK)
- **APK Android:** o jogo agora tem um app para celular (`Ki-Clash-0.19.0.apk`), o mesmo jogo web empacotado com o Capacitor, em tela cheia, com ícone e tela de abertura do jogo. Funciona sem internet; o progresso fica no próprio app.
- **Download automático:** a cada versão na `main`, a CI gera o APK e o publica na página de Releases do GitHub. Toda versão é assinada com a mesma chave privada (guardada nos segredos do repositório, nunca no código), então instala por cima da anterior sem perder o progresso.
- **Botão ⟳ de atualização:** botão redondo no canto superior direito da Base, com a versão atual ao lado. No app, procura a última versão na página de Releases e, se houver uma nova, abre o APK para baixar e instalar por cima. No site, compara com a versão publicada e recarrega a página. O progresso continua nos dois casos.
- O progresso do app e o do site são separados (cada um guarda o seu no aparelho).

## [0.18.0] — 26/10/2026 · PR #36 — Dificuldade crescente, feitiços da IA e partidas verificáveis
- **Feitiços da IA:** os inimigos da Aventura agora usam feitiços (2 cópias de cada): Raio Paralisante nas fases 3 e 5, e de 2 a 3 feitiços por fase da 6 à 10 (tabela no REGRAS.md, seção 17).
- **Dificuldade crescente:** nível das cartas da IA recalibrado no simulador (fases 1 a 10 = 1, 4, 4, 5, 6, 6, 11, 14, 17, 12). Vitória ao chegar (300 jogadores simulados): 93/89/90/81/79/76/70/68/65/62% (v0.17.1: 93/99/91/77/82/53/82/89/86/53%). A fase 2 deixou de ser mais fácil que a 1, e as fases 6 e 10 deixaram de ser picos de dificuldade. A vida dos Comandantes inimigos não mudou.
- **Partidas verificáveis:** toda batalha grava a configuração (baralhos, vidas, semente) e as jogadas do jogador; `verifyMatch` refaz a partida e confere o resultado. É a base para o servidor validar as recompensas no futuro modo online (por enquanto nada muda para quem joga).
- **Tela da Aventura:** cada fase mostra os ícones ✦ dos feitiços inimigos, e o nível inimigo mostra o maior nível das cartas da fase (antes mostrava o da primeira carta).
- Novo script de equilíbrio `scripts/balance/v18.ts`.

## [0.17.1] — 26/10/2026 · PR #35 — Escudo, Anjo da Guarda e documentação
- **🛡 Escudo temporário (Muralha):** a duração agora conta os **turnos do adversário**. A Muralha de 2 rodadas lançada no seu turno protege contra os 2 turnos inimigos seguintes; antes perdia 1 rodada já no fim do seu próprio turno e cobria só 1 turno inimigo. O atordoado não mudou.
- **Conferidos os outros efeitos com duração** (Flecha Envenenada, Veneno Mortal, Bola de Fogo, Tremor, Raio Paralisante): já estavam certos, porque contam os turnos da unidade atingida, que é inimiga de quem lança. Veneno de 3 rodadas faz dano 3 vezes, queimadura de 2 faz 2 vezes e o atordoar tira exatamente 1 ação, lançados pelo jogador ou pelo inimigo (testes novos no ciclo real de turnos).
- **👼 Anjo da Guarda (feitiço):** o texto da carta agora diz que o efeito **dura até ser usado** (já funcionava assim).
- **Documentação:** o resumo do README estava na versão antiga (arena 2×7, baralho 10 × 4, alcance 3, passo da vitória) e foi atualizado; comentários antigos no código (arena 2×7, baralho 10 × 4) corrigidos.

## [0.17.0] — 26/10/2026 · PR #34 — Fase 2 do plano: habilidades, efeitos, feitiços e baralho com cópias
- **Efeitos com duração:** 🧪 veneno (ignora resistência), 🔥 queimadura (reduzida pela resistência mágica), 💫 atordoado (perde a ação) e 🛡 escudo temporário (absorve antes da vida). Selos parados no lutador e lista na janela da unidade.
- **Ícone de aura no beneficiado:** 🥁 em quem recebe o Tambor de Guerra e 🌀 em quem é drenado pelo Sifão.
- **Novas habilidades:** 👁 Vigia (Jin, age primeiro), ♻ Renascer (Zarek, volta 1 vez com 30/40/50%), 👼 Anjo da Guarda (Mei, salva 1 vizinho com 1 de vida, 1 vez), 🪞 Reflexo de Magia (Nyx, 30/40/50% do dano mágico e de feitiço volta), 💢 Ombrada (Gorath, empurra ao acertar de frente), ⚰️ Necromancia (Vorax, traz a última carta derrotada para a mão pronta) e 🔰 Barreira Arcana (Lyra, resistência mágica).
- **Resistência só por habilidade:** ninguém tem mais resistência de atributo; Toru, Gorath, Daichi e Lyra têm por habilidade. Kenji perdeu a física 1 e os magos a mágica 1. Ataque e vida não mudaram.
- **Feitiços:** 13 cartas de feitiço (2 ou mais por categoria, 5 cruzados) que ocupam vagas do baralho, esperam custo − 1 rodadas e precisam de um aliado da categoria em campo para lançar (força pelo ataque do conjurador). Toque/arraste até uma casa roxa. Depois de lançado volta ao Baralho. Seção ✦ Feitiços na Coleção; a IA do Auto também lança.
- **Baralho com cópias:** cada carta com 1 a 3 cópias (botões − / +), baralho de 20 até 28 + 2 × nível de perfil (30 no nível 1, 40 no nível 6+); nível de perfil provisório = 1 + fases vencidas. Saves antigos viram 10 × 3 = 30. Inimigos com 3 cópias, sem feitiços.
- **Conta ADM:** baralho de 40 (10 mais fortes × 3 + 10 feitiços).
- Simulação das 10 fases (300 jogadores, com até 4 cartas de feitiço quando o nível permite): 93/99/91/77/82/53/82/89/86/53% de vitória ao chegar (v0.16.0: 92/98/76/76/80/47/81/86/87/66%). Detalhes no REGRAS.md, seções 15 e 16.

## [0.16.0] — 25/10/2026 · PR #33 — Fase 1 do plano: arena 2 × 12, contagem de rodadas e contas locais
- **Arena 2 × 12** (antes 2 × 7): zonas de invocação nas 3 colunas de cada ponta (1–3 e 10–12), 6 colunas livres no meio, Comandantes nas pontas. Casas redimensionadas para deitado, em pé e computador, mantendo ~60 FPS (em pé, sem coordenadas e com placa menor).
- **Contagem de rodadas no lugar da energia:** cada carta na mão espera **2 × custo − 1** rodadas (3, 5, 7, 9 ou 11), cai 1 por turno seu e só pode ser invocada em **0**; dá para invocar todas as prontas no mesmo turno. A mão inicial começa 2 rodadas adiantada. A **gota** da carta mostra as rodadas (na mão, as que faltam) e o orbe ⏳ mostra quantas estão prontas. A IA e o Auto invocam todas as prontas.
- **Corpo a corpo só na casa da frente** (confirmado; 2 casas só por habilidade).
- **Longo alcance 4** (antes 3): magos, arqueiros e suportes à distância.
- **Desempate:** na mesma coluna, a **fileira de cima age primeiro** (já era assim; agora documentado e testado).
- **Contas locais:** botão **👤 Entrar / Criar conta** no canto superior esquerdo da Base (nome + senha, janela do jogo); cada conta guarda o próprio progresso no aparelho. Conta de teste **ADM / 12345** com perfil no máximo. ⚠ Não é segurança de verdade (sem servidor; senha da ADM no código).
- Simulação das 10 fases (300 jogadores): 92/98/76/76/80/47/81/86/87/66% de vitória ao chegar (antes 98/95/92/61/82/45/80/49/76/38%). Detalhes no REGRAS.md, seção 15.

## [0.15.4] — 25/10/2026 · PR #32 — Riku sempre se move saltando
- **Salto Vendaval:** o movimento do Riku agora é **sempre um salto** para a **3ª casa à frente**, por cima de aliados ou inimigos nas casas 1–2. 3ª ocupada ou fora do campo → cai na 2ª; 2ª também → na 1ª; as três ocupadas → fica. Nunca vai além da 3ª e não anda depois de cair.
- Inimigo logo à frente: salta por cima dele se houver casa de pouso livre (3ª, senão 2ª); sem pouso, ataca normalmente.
- Ao cair, ataca com o **bônus de investida** se houver alvo no alcance (inclusive o Comandante). Seta **JUMP** em todo movimento do Riku.

## [0.15.3] — 25/10/2026 · PR #31 — Riku para depois do salto
- **Salto Vendaval (Riku):** ao saltar por cima de um inimigo, o Riku cai **2 casas à frente e para** (não anda a 3ª casa depois do salto). Se houver alvo no alcance ao cair, ataca com o bônus de investida.
- Com o caminho livre, continua andando até **3 casas** (fixo em todas as cores e níveis). Passar por aliados não é salto e não o faz parar.

## [0.15.2] — 25/10/2026 · PR #30 — Riku salta por cima do inimigo
- **Salto Vendaval (Riku):** quando o inimigo logo à frente está no alcance e a casa atrás dele está livre, o Riku salta por cima dele (gasta 2 das 3 casas), cai nessa casa e ataca com o **bônus de investida** quem estiver no alcance à frente, inclusive o Comandante. Se ninguém estiver no alcance, usa a casa que sobra para andar.
- Casa de trás ocupada (aliado ou inimigo) ou fora do campo: ataca o inimigo da frente normalmente.
- A seta **JUMP** e a investida aparecem só nesse salto de verdade.
- Simulador (100 jogadores): vitória por fase praticamente igual (0 a 2 pontos).

## [0.15.1] — 25/10/2026 · PR #29 — Tetos em habilidades
- **Feixe Perfurante (Lyra):** dano nos que estão atrás do alvo agora vai até **75%** (50% Incomum · 75% de Raro em diante). Antes chegava a 100% no Épico.
- **Corte Diagonal (Nara):** o segundo alvo, na outra fileira, leva no máximo **50%** (antes 100% no Épico).
- **Bênção do Lótus (Mei):** cura só os **2 aliados vizinhos mais feridos** (mesma quantidade de cura). Empate: quem tem menos vida, depois quem entrou em campo antes.
- **Salto Vendaval (Riku):** a investida só vale quando ele **salta com a habilidade** (por cima de um inimigo). Passar por aliados é a regra comum de movimento e não conta como salto, nem para o Riku; a seta **JUMP** só aparece no salto de verdade (passar por aliado mostra **PASSA**).
- Punho Espelhado sem mudança (forte de propósito). Emboscada e Prole Sombria ficam para depois.
- Simulador (100 jogadores): vitória por fase praticamente igual (diferenças de 0 a 2 pontos).

## [0.15.0] — 25/10/2026 · PR #28 — Nova regra de movimento
- **Sem passo da vitória:** quem derrota um inimigo agora fica onde está (não avança 1 casa).
- **Atravessar aliados:** no movimento (até 2 casas) a unidade passa pelos aliados, mas só para em casa livre; ninguém termina numa casa ocupada. Se só houver aliados à frente, fica na última casa livre. O alcance é conferido a cada casa livre. Inimigos continuam bloqueando.
- **Salto Vendaval (Riku):** anda até **3 casas, fixo em todas as cores e níveis**, e pode pular 1 unidade (aliada ou inimiga), caindo numa casa livre. O bônus de investida continua crescendo como antes (máx. +3). Descrição e evolução da habilidade atualizadas.
- **Arena:** ao passar por um aliado, quem anda dá um pulinho por cima dele e o aliado se abaixa; a seta mostra **PASSA** (Riku: **JUMP**). Só transform, sem animação contínua nova.
- **Simulador** (`scripts/balance/move15.ts`, 100 jogadores): fases finais mais fáceis (fase 6: 30% → 41%, fase 8: 30% → 45%, fase 9: 58% → 74%, fase 10: 26% → 36%); tabela completa no REGRAS.md.
- Testes: atravessar aliados, nunca terminar em casa ocupada, inimigos bloqueiam, sem passo da vitória, Riku 3 casas em todas as cores/níveis.

## [0.14.4] — 25/10/2026 · PR #27 — Arrastar a carta até o campo
- **Arrastar para invocar:** segure uma carta da mão e arraste até uma casa da sua zona para invocá-la (funciona no toque e no mouse). O jeito antigo (tocar na carta e depois na casa) continua funcionando igual.
- Durante o arrasto a carta segue o dedo, a da mão fica apagada e as casas livres da sua zona ficam destacadas; a casa embaixo do dedo brilha mais.
- Soltar numa casa destacada invoca com as mesmas regras do toque (energia, zona, casa livre); soltar em outro lugar ou fora do campo cancela e a carta volta para a mão.
- Toque curto continua selecionando; segurar parado (~0,5 s) continua abrindo os detalhes; com o celular em pé, arrastar para o lado continua rolando a mão.
- A carta que segue o dedo só muda de posição (transform), sem redesenhar a tela: ~60 FPS durante o arrasto.

## [0.14.3] — 25/10/2026 · PR #26 — Habilidades também nas cartas pequenas
- Na **mão da batalha**, na **equipe da Coleção**, na lista do **Treinar**, na **troca rápida** e na carta de personagem novo, o espaço vazio **entre o ataque e a vida** agora mostra os **ícones das habilidades** do personagem (os mesmos da carta grande, com o peitoral da Resistência Física), separados por pontinhos.
- As bolinhas são dimensionadas para caber entre o emblema de ataque e o coração sem encostar em nenhum dos dois; as cartas **não ficaram mais altas** (a mão continua com 110 px de altura no celular deitado). Com 3 ou mais habilidades as bolinhas ficam menores em vez de esconder alguma.
- Nessas cartas pequenas a fileira ocupa o lugar da cápsula raça/categoria (que segue na carta grande e na inspeção ao tocar na carta). Só HTML/CSS estático: continua a ~60 FPS.

## [0.14.2] — 25/10/2026 · PR #25 — Acabamento da carta (prévia v14.2f)
- **Topo:** o **⚡Poder** fica sozinho numa pílula centralizada (a largura acompanha o número, testado com 47, 100, 1000 e 10000) e o **nível** virou uma **estrela dourada com asinhas** no canto direito, com "Nv." em cima do número (como a gota no canto esquerdo).
- **Números mais fortes:** custo, ataque e vida com contorno preto grosso e sombra forte; brilho azul neon na gota e vermelho suave no coração.
- **Faixa do nome:** degradê vertical (mais escura embaixo) e borda prata fina; o nome subiu um pouco e não encosta mais na gema. A palavra da cor ("Comum" etc.) ficou branca/prata e longe da gema.
- **Painel de baixo:** ataque e vida **centralizados na altura do painel escuro**, nas laterais; ícones de raça/categoria e de habilidades um pouco menores, com uma **linha com pontinhos brilhantes** entre as duas fileiras. Nada encosta na borda de baixo.
- **Novos emblemas de ataque, um por categoria** (fundo laranja liso, aro dourado, contorno preto grosso, sem a explosão de pontas, armas cruzadas **na frente** da base): Tanque placa octogonal rebitada + martelos, DPS medalhão + duas espadas inteiras, Mago círculo de runas + cajados, Arqueiro alvo + arco e flecha, Assassino losango + adagas, Suporte cristal + cetros.
- **Resistência Física** (Postura de Guarda) agora tem ícone de **peitoral de armadura**, na carta e na lista de habilidades.
- **Arte:** nas cartas com habilidades a arte ficou mais alta e o personagem um pouco mais para cima; o personagem fica preso na janela da arte (a lâmina do Toru não sai mais da carta).
- **Nomes compridos** (Tobi Tambor-de-Guerra, Gorath Muralha-de-Ferro) cabem inteiros na grade da Coleção (letra um pouco menor só nesses).
- Cartas pequenas (mão da batalha, equipe, Treinar, troca rápida) seguem com a mesma altura de antes, com tudo em tamanho ajustado. Só SVG estático, contorno/sombra de texto e degradês: Coleção e batalha seguem a ~60 FPS.

## [0.14.1] — 25/10/2026 · PR #24 — Habilidades dentro da carta
- **A fileira de habilidades agora fica dentro da carta:** a moldura (borda prata/da cor e fundo escuro) desce e envolve as bolinhas de habilidade no centro de baixo, abaixo da cápsula raça/categoria — antes elas ficavam soltas embaixo da carta.
- Ataque (canto esquerdo) e coração (canto direito) continuam nos cantos de baixo, um pouco mais acima, sem tocar a fileira.
- Vale para a carta grande (detalhes, Treinar, inspeção) e para as cartas da grade da Coleção. Na mão da batalha (cartas de ~60–98 px) a fileira continua escondida porque ficaria ilegível; as habilidades aparecem ao tocar na carta.
- Só CSS/HTML estático, sem animação nova: Coleção e batalha seguem a ~60 FPS. Nenhuma outra mudança visual.

## [0.14.0] — 25/10/2026 · PR #23 — Novo padrão de carta
- **Todas as cartas seguem o modelo enviado:** moldura metálica na cor do tier, **gota azul com o custo** no topo esquerdo, **pílula "Nv N | ⚡Poder"** no topo direito, arte grande, **faixa escura com o nome** (cantos ornamentados, letra serifada, até 2 linhas) com gema e a **palavra da cor** embaixo, **cápsula com raça e categoria** no centro de baixo, **ataque** embaixo à esquerda, **coração com a vida** embaixo à direita e a **fileira de habilidades** (bolinhas separadas por pontos) embaixo da carta.
- **Emblema de ataque por categoria** (explosão laranja + escudo + arma): DPS espadas cruzadas (as duas lâminas inteiras, com as duas pontas à mostra), Mago cajado com orbe, Arqueiro arco e flecha, Assassino adagas cruzadas, Tanque martelos de guerra, Suporte cetro de cristal.
- **Saíram:** o medalhão de categoria do topo direito, a linha "👊 ataque ❤ vida + ícones" e a linha "RAÇA · COR · CATEGORIA".
- **Cartas pequenas** (equipe, lista do Treinar, mão da batalha): primeiro nome, sem gema, sem palavra da cor e sem fileira de habilidades. Abaixo de 84 px de largura a cápsula raça/categoria também some. Na mão, ataque e vida ficam dentro da borda de baixo.
- Gota, coração e emblemas são SVG estáticos (sem animação nem filtro): Coleção e batalha seguem a ~60 FPS. A arte dos personagens não mudou.

## [0.13.1] — 25/10/2026 · PR #22 — O herói principal agora se chama Comandante
- **"Líder" e "herói" viraram "Comandante"** em todo texto do jogo:
  - painel de Coleção & Equipe ("👑 Comandante Bárbaro") e janela de Evoluir ("Evoluir o Comandante Bárbaro?", "Vida máxima do Comandante");
  - Aventura ("Seu Comandante", "Comandante inimigo ❤");
  - batalha: registro ("ataca o Comandante inimigo", "Comandante aliado sofre…", "O Comandante inimigo caiu"), janela de carta ("Comandante: Você"), textos alternativos das artes;
  - habilidades que citavam o herói ("inclusive o Comandante", Maré Implacável "Comandante +N"), história da Suri e o Como jogar.
- REGRAS.md e README atualizados com o novo nome. Nova regra futura: o Comandante muda levemente de aparência a cada 10 níveis (níveis 11, 21, 31…). Como hoje o máximo é o nível 10, nenhuma arte nova por enquanto.
- Nada muda nas regras, no visual das cartas, nem no save (os campos internos continuam os mesmos; saves antigos carregam normalmente).

## [0.13.0] — 25/10/2026 · PR #21 — Poder das cartas e do baralho, Líder com níveis
- **Poder ⚡ em cada carta:** 10 × peso da habilidade × √(ataque × vida). Sobe a cada nível, no "+" e a cada cor. O peso de cada personagem (de 0,78 a 1,39, média 1) foi medido em 30 000 batalhas IA × IA. Aparece num selo na Coleção, na Equipe e na janela de detalhes.
- **Poder do baralho** = soma das 10 cartas da equipe, em destaque em Coleção & Equipe e na Aventura.
- **O Líder (Bárbaro) sobe de nível:** novo painel em Coleção & Equipe, com a arte, o nível, a vida, o Poder do baralho, uma barra até o próximo requisito e o botão **Evoluir** (janela do próprio jogo). Evoluir é grátis: basta o Poder do baralho alcançar o requisito na hora (480, 510, 560, 610, 660, 760, 840, 930, 980). Depois o Líder **nunca perde o nível**, mesmo trocando cartas.
- **Vida do Líder:** +10 por nível, de 20 a 110. Simulamos +5, +10 e passos crescentes (+3/+5/+10). Só +10 impede que um único turno inimigo derrube o Líder de vida cheia em qualquer fase (antes, na fase 10, chegava a 190% da vida).
- **Líder inimigo mais resistente:** 12 + 7 por fase (12 → 75; antes 12 → 30). É metade do que o seu Líder ganha, para a campanha continuar desafiadora: as chances de vitória ao chegar em cada fase ficaram como antes (ex.: fase 10 27% → 25%).
- **Preparado para mais Líderes** (1 por categoria, com habilidades próprias): os Líderes viraram uma lista; por enquanto só o Bárbaro.
- **Saves antigos** ganham o Líder no nível 1 (20 de vida, como antes).
- Tabelas completas no REGRAS.md (seção 15). Simuladores em `scripts/balance/`. Coleção & Equipe a ~60 FPS.

## [0.12.2] — 24/10/2026 · PR #20 — Minotauro com machado no ombro, Líderes na altura da arena
- **Novo minotauro** (Líder adversário): mesma criatura, de pé, com o machado apoiado no ombro direito (pose estreita). Arte animada com respiração (17 quadros, 1,6 s, transparente), **WebP animado de 235 KB** (o GIF tinha 1,29 MB). Sem espelhar: o machado fica no ombro do lado de fora da tela, e o rosto já está virado para a arena.
- **Colunas dos Líderes iguais de novo** (13,5% da largura cada): as casas da arena voltam ao tamanho da v0.12.0 (84 → 90 px em 915×412).
- **Os dois Líderes têm a altura da arena:** dos pés à cabeça a figura mede o mesmo que as 2 fileiras (915×412: arena 179 px, bárbaro 179 px, que antes tinha 193 px; minotauro 181 px). A barra e os números de vida ficam embaixo; aura azul/rosa, piso brilhante e fundo das colunas mantidos.
- Tremor ao levar dano mantido. Batalha Auto a ~60 FPS.

## [0.12.1] — 24/10/2026 · PR #19 — Minotauro como Líder adversário, Líderes maiores
- **Líder adversário (direita) agora é o minotauro** enviado: pelo marrom, chifres, machado de pedra com runas laranja, tanga e braçadeira. Arte animada com respiração (17 quadros, 1,6 s, fundo transparente), convertida em **WebP animado de 288 KB** (o GIF tinha 1,5 MB). Sem espelhar: ele já segura o machado apontado para a arena.
- **Textos "Líder Aliado" e "Líder Inimigo" removidos**: os dois Líderes ocupam a altura toda da coluna, de pé no piso, com a barra e os números de vida embaixo. Em 915×412 o bárbaro passou de 161 px para 202 px e o minotauro tem 186 px. A coluna do minotauro é mais larga e a do bárbaro mais estreita (as casas ficaram um pouco menores, 90 → 84 px).
- **Aura atrás de cada Líder** de volta: azul/ciano no seu lado, rosa/magenta no adversário, mais o piso brilhante na mesma cor. É uma camada fixa (gradiente) atrás da imagem, sem filtro na imagem animada.
- As duas artes são baixadas e decodificadas ao abrir o jogo. Tremor ao levar dano mantido. Batalha Auto a ~60 FPS.

## [0.12.0] — 24/10/2026 · PR #18 — Novo Líder Aliado: o bárbaro
- **O seu Líder (coluna da esquerda) agora é o bárbaro** enviado: cabelo e barba pretos, machado de duas lâminas, saiote de pele, braçadeiras, botas e tatuagem. Substitui o Líder azul e dourado em SVG. O Líder Inimigo não mudou.
- **Animação mantida:** o GIF tinha 17 quadros de respiração (1,6 s em loop, fundo já transparente). Virou um **WebP animado de 266 KB** (o GIF tinha 1,2 MB), no tamanho original (271×512), sem fundo.
- Mesma proporção da v0.11.1: o Líder fica de pé no piso da coluna, com ~2 fileiras de altura e a barra de vida logo abaixo, deitado e em pé. Olha para a frente (o machado fica do lado de fora), sem espelhar.
- **Desempenho:** a imagem é baixada e decodificada ao abrir o jogo (antes da 1ª batalha). Ela não tem filtro nem animação CSS (o brilho de antes, um filtro, repintaria a cada quadro da animação). O brilho agora é um piso ciano fixo. Batalha Auto a ~60 FPS.
- O tremor ao levar dano continua na coluna do Líder.

## [0.11.3] — 24/10/2026 · PR #17 — Mesmo rosto na carta e na arena
- **Os lutadores da arena agora têm o rosto da própria carta.** Antes todos usavam o mesmo olho redondo genérico, a mesma boca e sobrancelhas simples; as cartas tinham olhos anime puxados, cor de íris, presas, barba, marcas e acessórios próprios.
- Agora existe **uma definição de rosto por personagem** (`faceParts`), usada pela carta e pela arena — não dá mais para um ficar diferente do outro: formato do olho, íris (inclusive a cor de Épico+ e os olhos escuros dos Necromantes), sobrancelhas, boca/presas, barba (Gorath, Daichi), marcas de raça e de personagem (pintura do Tobi, chama do Kael, tiara da Suri, óculos do Jin, lenço do Ren, orelhas do Kuro, pena da Hana, faixa do Daichi, faixas de Riku/Kenji/Toru/Tobi), máscara do Toru (Incomum+) e visor do Zarek.
- Na arena a íris fica um pouco maior para ler no tamanho pequeno; o visor da Nyx não pisca na arena (nenhuma animação nova).
- **As cartas não mudaram:** comparamos o desenho das 396 combinações (personagem × cor × camada) antes e depois — idênticas.
- Novo teste: para cada personagem e cor, o rosto da arena tem que ser o rosto da carta (mesmos traços; só a íris maior).

## [0.11.2] — 24/10/2026 · PR #16 — Cabelos presos à cabeça
- **Cabelos que pareciam perucas flutuando corrigidos em todos os personagens** (carta, lutador da arena, Líderes, Base e janela de detalhes).
- **Causas:**
  - O cabelo **crescia a cada cor** (até +30% na carta e +20% na arena), mas a cabeça não: em Lendário/Mítico virava uma peruca de cabeça maior e saía da moldura da carta (Zarek Lendário, Kenji, Vorax…).
  - Os desenhos de cabelo eram **largos demais** (1,4× a 2× a largura da cabeça) e vários **não encostavam no couro cabeludo**: a base ficava acima do topo da cabeça (cristas, chifres, penteado para trás) ou o cabelo era deslocado para um lado (penteado para trás do Zarek, Toru e Jin).
- **Correção:** os 8 penteados foram redesenhados sobre o crânio (topo da cabeça coberto, franja na testa, mechas rente às têmporas, largura 1,1× a 1,6× a cabeça; a juba do Daichi 1,85× por ser juba) e o tamanho passa a ser o mesmo em todas as cores. A evolução por cor continua no brilho/gradiente do cabelo, coroa, halo etc. O cabelo dos Líderes também foi ajustado à cabeça.
- Nova verificação automática (`hairAudit`): para cada penteado mede largura × cabeça, centro e contato com o couro cabeludo e se fica dentro da moldura; teste falha se algum cabelo ficar solto, largo ou deslocado.
- O resto da carta não muda. As imagens prontas das cartas são geradas a cada carregamento (cache só em memória), então já saem com o cabelo novo.

## [0.11.1] — 24/10/2026 · PR #15 — Líderes grandes, unidades dentro das casas
- **Proporção corrigida (estava ao contrário da referência):** os **Líderes** agora são as maiores figuras da arena, de corpo inteiro com ~2 fileiras de altura, em pé sobre um piso na sua ponta e com a barra de vida perto. Coluna do Líder deitada: de 7% para 13,5% da largura.
- **Unidades invocadas menores:** o lutador fica **inteiro dentro da sua casa** (antes passava ~24% para cima e 8% para os lados, invadindo as casas vizinhas). Placa ATQ | VIDA e barra de vida continuam legíveis.
- Medido: Líder ≈ 2,2× a altura de uma unidade (915×412: Líder 148 px, unidade 68 px numa casa de 90 px); nenhuma unidade sai da casa em 915×412, 844×390 e 1366×768.
- Celular em pé: coluna do Líder um pouco mais larga e figura maior (≈ 50 px contra 31 px das unidades).
- Sem animações novas; batalha Auto a ~60 FPS. Nenhuma regra mudou.

## [0.11.0] — 24/10/2026 · PR #14 — Batalha deitada (paisagem)
- **Novo layout de batalha para tela deitada** (celular girado, tablet e computador): HUD VS fino no topo, **arena 2×7 bem maior** ocupando a largura com os Líderes visíveis, e embaixo **uma linha só**: Baralho à esquerda, **as 6 cartas da mão inteiras** (sem apertar e sem barra de rolagem), Necropolis, energia e **LUTAR** na ponta direita.
- **Sem rolagem nenhuma** na batalha deitada: altura em `100dvh` (acompanha a barra do Chrome) e respeito aos recortes da tela.
- **Painel de informações** virou janela sobreposta (✕ para fechar) sobre a metade inimiga; fecha sozinho ao tocar LUTAR. **Registro da batalha** virou gaveta lateral (botão 📜).
- **Celular em pé:** aviso do jogo "Gire o celular para jogar deitado" com botões **⟳ Tela cheia deitada** e **Jogar em pé** (mantém o layout em pé de antes).
- **Tela cheia + trava deitada** ao entrar na batalha no celular (quando o navegador permite; falha sem quebrar). Ao sair da batalha, destrava e sai da tela cheia.
- **Manifesto do app** (`manifest.webmanifest`) com nome, ícones (192/512/maskable) e `display: fullscreen` para "Adicionar à tela inicial". Sem orientação forçada.
- Menus deitados no celular: heróis da Base menores para caber pela altura.
- Verificado em 915×412, 844×390 e 1366×768 (batalha manual + Auto até o fim: 6/6 cartas visíveis, nenhuma rolagem, ~60 FPS) e 390×844 em pé (aviso + layout em pé).

## [0.10.3] — 24/10/2026 · PR #13 — Cartas "Ainda não obtidos" sem travadas ao rolar
- **Travadas fortes quando o "Ainda não obtidos" entrava na tela (descendo e subindo) corrigidas.** As cartas bloqueadas usavam `filter: grayscale(1)` + `opacity: .55` na carta inteira e `brightness(.45)` na arte: no celular, essa camada cinza era recalculada pela GPU toda vez que as cartas entravam na tela.
  - Agora a arte cinza escurecida vem **pronta no bitmap** e a moldura, os medalhões e a placa do nome usam **tons cinza diretos** (os mesmos que o filtro produzia). Nenhum filtro e nenhuma opacidade de grupo na grade. Os ícones coloridos (emoji) ficam só apagados.
  - O cadeado do "Em breve" saiu de `drop-shadow` para sombra de texto.
- **Imagens das cartas de grade** passam a ser carregadas e decodificadas antes de aparecer (sem carregamento preguiçoso, que podia decodificar no meio da rolagem).
- **Barra de endereço do celular:** o fundo fixo da página agora tem a altura do maior viewport (`100lvh`), então não é redimensionado/redesenhado quando a barra some ou volta.
- Rastreamento de rolagem por toque (390×844, CPU 6×, com 9 cartas bloqueadas): **0 pinturas, 0 recálculos de estilo, 0 layouts**, quadros em 16,7 ms; trabalho da thread principal ≈ 0,2–0,5 ms por quadro (cabe em 120 Hz / 8,3 ms).

## [0.10.2] — 24/10/2026 · PR #12 — Rolagem fluida na Coleção & Equipe (celular)
- **Travadas ao rolar a Coleção no celular corrigidas.** Medido com rastreamento do Chrome durante um gesto real de rolagem por toque (390×844, CPU 4× e 6× mais lenta): a cada passo da rolagem a v0.10.1 ainda **redesenhava as cartas** (~1.200 pinturas, ~840 recálculos de estilo e ~190 camadas por quadro em 7 s de rolagem). Agora: **0 pinturas, 0 recálculos de estilo, 0 layouts** durante a rolagem, quadros sempre em 16,7 ms.
- **Causas:**
  - O fundo da página usava `background-attachment: fixed`, que obriga a redesenhar a tela inteira a cada passo da rolagem.
  - As cartas da grade ainda tinham animações (aura, raios, reflexo, faíscas) e cada uma virava uma camada separada (camadas demais travam o Android).
  - Filtros (sombra do personagem) e mistura de cores (aura) eram recalculados ao pintar cada carta.
- **Correções:**
  - Fundo da página virou uma camada fixa própria, pintada uma vez (mesma imagem).
  - **Cartas de grade = quadro congelado:** fundo + aura + raios e o personagem com sombra são desenhados **uma vez** num bitmap (por personagem, cor e bloqueado), no tamanho certo para a densidade da tela, decodificado fora da tela antes de aparecer e carregado sob demanda. Na grade, cada carta é só imagens + textos, sem animação, filtro, mistura de cores ou transição. Faíscas Lendário/Mítico aparecem acesas e paradas.
  - Cartas em foco (detalhes, Treinar, mão, inspeção, Despertar) continuam com **todos os efeitos animados**.
  - Saiu o observador que marcava cartas fora da tela durante a rolagem e as camadas forçadas (`will-change`).
  - No celular, tocar numa carta durante a rolagem não a "levanta" mais.
- Regras e equilíbrio não mudaram.

## [0.10.1] — 24/10/2026 · PR #11 — Desempenho (60 FPS) e correções
- **Queda de FPS na Coleção & Equipe corrigida.** Medido antes e depois em Chromium (desktop e celular, CPU normal e 4× mais lenta), quadro a quadro:
  - Detalhes da carta: **31 → 60 FPS** (desktop) e **27 → 60 FPS** (CPU 4×). Janela de troca da equipe: **26 → 60 FPS**. Tela de fim de luta: **38 → 60 FPS**. Janela de carta na batalha: **48 → 60 FPS**.
  - Coleção parada/rolando com CPU 4×: **54–56 → 60 FPS**.
- **Causas e correções:**
  - O **desfoque do fundo** (backdrop-filter) de todas as janelas era refeito a cada quadro, por baixo de cartas animadas → removido; o fundo continua escurecido.
  - Cada carta tinha **2 retratos SVG em linha** (centenas de nós, ids de gradiente repetidos): agora os retratos são gerados **uma vez por personagem/cor** e reaproveitados como imagem. A Coleção caiu de **4.880 para 956 elementos**; o visual é o mesmo desenho.
  - Atrás de janelas e fora da tela, as **animações das cartas pausam**. Nas grades, o brilho premium pulsante e o metal em movimento (que redesenhavam a carta inteira a cada quadro) ficam no quadro inicial; aura, raios, reflexo e faíscas continuam. A carta em foco (detalhes, Treinar, mão, inspeção, Despertar) mantém todos os efeitos.
  - O brilho pulsante Lendário/Mítico agora anima só a opacidade de um véu luminoso (antes animava um filtro na carta toda).
  - Retratos pré-carregados em tempo ocioso ao abrir o jogo.
- **Correções:**
  - **Sair → Cancelar** na batalha desligava o Auto em silêncio (o botão continuava "Auto: ON" e a luta parava). Agora cancelar não muda nada.
  - **Sair** no meio de uma luta interrompe na hora as animações e turnos pendentes (antes continuavam rodando em segundo plano e podiam anunciar o fim da luta em outra tela).
- Sem vazamento: memória e número de elementos estáveis depois de 4 lutas seguidas; sem erros no console.
- Regras e equilíbrio não mudaram.

## [0.10.0] — 24/10/2026 · PR #10 — Cores com "+" no lugar das estrelas e correções da v0.9
- **Fim das estrelas:** a carta não mostra mais estrelas (nem na barra do topo, nem nos detalhes, nem nos textos). As cores continuam **exatamente as mesmas** (cinza, verde, azul, roxo, laranja, vermelho); agora cada cor tem nome de raridade: **Comum, Incomum, Raro, Épico, Lendário, Mítico**. O topo da carta mostra o nome (ex.: **RARO+**).
  - A raridade fixa antiga de cada personagem saiu: o nome sempre bate com a cor da carta.
  - O seletor de estrelas dos detalhes virou **seletor de cor**.
- **Degrau "+" entre as cores:** Comum → Comum+ → Incomum → Incomum+ → Raro → Raro+ → Épico → ... A cor máxima de cada personagem também tem o "+" final (ex.: Épico+, Mítico+).
  - 1º Despertar no nível máximo: cor → "+". 2º Despertar: "+" → próxima cor.
  - O "+" **não muda habilidades nem visual**; dá só **+10% (mín. +1)** de vida (tanques, suportes e Suri) ou de ataque (os demais) e **+5 níveis máximos**.
  - Habilidades e visual (roupa, aura, físico e cenário) mudam só quando a **cor** muda. Todos os tetos continuam.
- **Mais difícil:** do "+" para a próxima cor custa **50% a mais** que da cor para o "+", em **Essências** (4 × cor → 6 × cor) e em **XP** (a cor base custa o XP de uma cor inteira da v0.9; o "+" custa 1,5 × isso). Comum base continua igual. Cada cor completa custa 2,5 × o que custava antes.
  - Nova **Escada de Despertar** na tela Treinar, com nível máximo, XP e Essências de cada degrau; o botão mostra o próximo degrau e o custo.
  - Animação própria para o "+" ("DESPERTAR +"), sem trocar o visual.
- **Saves antigos:** as estrelas viram a cor de mesmo número (1★ Comum … 6★ Mítico), na cor base, mantendo nível e XP.
- **Equilíbrio (simulações IA × IA):** com todos no topo (cor máxima+), cada personagem comum vence de 46,8% a 52,1% (Kenji 59,6% e Vorax 55,5%, bloqueados para o jogador). Equipe inicial vence a fase 1 em 97%. Com o mesmo XP gasto, a fase 10 caiu de 95% (v0.9) para 47% (v0.10).
- **Correções da v0.9:**
  - Janela de detalhes da carta na batalha no celular: cabe na tela, rola por dentro e o ✕ fica sempre visível.
  - Tocar de novo na carta selecionada da mão agora **tira a seleção**. Os detalhes abrem **segurando a carta** ou por **🔍 Detalhes**; ao fechar a janela, a carta não fica selecionada.
  - O painel de informações volta ao texto inicial quando a unidade mostrada é derrotada.
  - HUD do celular: o nome do inimigo diminui e quebra a linha em vez de ser cortado.
  - Nome completo nas cartas grandes (detalhes, treino e inspeção); só as cartas pequenas abreviam.

## [0.9.0] — 24/10/2026 · PR #9 — Cartas estilo Anime TCG, 6 Raças/Origens e Lutadores Interativos na Arena
- **Cartas redesenhadas no estilo Anime TCG (inspiradas em Legend of Dragon):**
  - Topo da carta com **medalhão verde de Custo** à esquerda, **barra chanfrada escura com Estrelas** no centro e **orbe de Facção/Categoria** à direita.
  - Base da carta com **emblema explosivo de Ataque (punho/magia)** à esquerda, **placa metálica chanfrada com o Nome** no centro e **gota rubra de Vida** à direita — visíveis inclusive na mão de batalha.
  - Fundo da arte com linhas de velocidade e esferas estelares de anime combinadas ao cenário próprio de cada personagem.
- **6 Raças / Origens Anime (`Humano`, `Extraterrestre`, `Monstro`, `Mago Arcano`, `Androide`, `Necromante`):**
  - Cada personagem agora possui anatomia, expressão, arma/Ki em primeiro plano e silhueta únicas da sua raça:
    - 🌍 **Humanos:** Riku Vendaval, Kenji Punho-Espelhado, Hana Pena-Veloz, Ren Presa-Oculta.
    - 🪐 **Extraterrestres:** Nara Lâmina-Lunar, Aiko Flecha-Celeste, Zarek do Eclipse, Suri Maré-Gélida.
    - 👹 **Monstros:** Gorath Muralha-de-Ferro, Daichi Punho-de-Rocha, Tobi Tambor-de-Guerra, Kuro Garra-Noturna.
    - 🔮 **Magos Arcanos:** Lyra Olho-de-Falcão, Mei Lótus-Celeste, Kael Chama-Rubra, Sora Brisa-Serena.
    - 🤖 **Androides:** Nyx-07, Jin Arco-Trovão, Toru Sombra-Reversa.
    - ☠️ **Necromantes:** Vorax, Yume Caçadora, Cria Sombria.
  - Filtro por raça na tela de **Coleção & Equipe** e seletor interativo de estrelas (**1★ a 6★**) nos detalhes da carta para inspecionar a evolução de roupa, armadura, armas e poder.
- **Lutadores de Corpo Inteiro Interativos na Arena (2×7):**
  - As unidades invocadas na arena agora aparecem como **personagens de corpo inteiro** (com pernas, torso, armadura evolutiva por estrela, cabeça, cabelo e arma/Ki na mão) sobre um círculo tático de invocação, com a placa `ATQ | VIDA` nos pés.
  - **Animações interativas de gameplay na arena:**
    - **Andar (`MOVE`):** ciclo de caminhada/corrida nas pernas, nuvens de poeira e seta dourada `MOVE` / `JUMP` indicando o avanço pelas casas.
    - **Atacar (`HIT` / Feixe de Ki):** investida corpo a corpo com golpe de braço, onda de corte crescente e selo `HIT!`, ou postura de disparo à distância com **feixe de Ki contínuo** (estilo Kamehameha) e projéteis energéticos.
    - **Sofrer dano e Derrota (`Necropolis`):** reação de recuo e flash de impacto com números flutuantes de dano, e envio das cópias caídas para a **Necropolis**.
  - **HUD Superior VS, Modo `Auto` e Modal de Inspeção de Carta em Batalha:** barra de vida dos Líderes no topo da tela, botão `Auto` para combate automático, contador `Em campo` e janela de detalhes da carta durante a luta.
- **Correções da integração (feitas no PR):**
  - O build (`tsc`) falhava por 3 variáveis declaradas e nunca usadas (`STARTER_IDS` em `main.ts`, `cat` e `y2` em `battleView.ts`); foram removidas sem mudar nenhum comportamento.
  - O **REGRAS.md** recuperou as regras que tinham sumido nesta versão (coluna virtual do herói, ordem do LUTAR, Baralho/Derrotadas, ordem de compra e efeito prático da aleatoriedade, tabela de estrelas, evolução por estrela, cenários de fundo, marcas dos iniciais, limites das habilidades, tabela completa de personagens, equipe, progressão e aventura) e ganhou as novidades desta versão: raças, lutadores de corpo inteiro, tela de batalha (HUD, Auto, Em campo, inspeção de carta) e o visual Anime TCG.

## [0.8.0] — 24/10/2026 · PR #8 — Mão sempre cheia, equipe de 10 obrigatória e 9 novos personagens de 1★
- **Compra até completar a mão:** a cada rodada você compra **quantas cartas faltarem para voltar a 6** (antes era 1 por rodada). Todas as cartas da rodada contam como **uma compra só** na fila.
  - A fila de cada carta continua igual: bloqueada nas 6 compras seguintes, sorteio na 7ª–9ª, garantida na 10ª, garantias em fila e exceção da mão inicial (volta na 5ª compra).
  - Uma compra de várias cartas atende várias garantias de uma vez.
  - Como a quantidade por rodada varia, a ordem das cartas **não fica mais presa num ciclo fixo**.
  - Se faltarem cartas liberadas para completar 6, vem a que está mais perto de liberar (completar a mão tem prioridade).
- **Equipe de 10 obrigatória:** sem 10 personagens diferentes não há batalha. Acabou o preenchimento com a 1ª carta repetida.
  - **Lutar** com menos de 10 abre a janela do jogo **Equipe incompleta**, com a contagem (ex.: 9/10) e o botão **Ir para a equipe**.
  - A Coleção mostra "faltam N" em vermelho; a Aventura mostra um aviso com **Completar equipe**; tirar alguém da equipe avisa que a batalha fica bloqueada.
  - Toda fase da IA agora tem **10 personagens diferentes**.
- **Progressão nova:** o jogador novo começa **só com personagens de 1★** — **12 iniciais**, 2 de cada categoria.
  - 2★, 3★ e 4★ saem na primeira vitória das fases: Aiko (1), Mei (2), Lyra (3), Gorath (4), Yume (5), Zarek (6) e Nyx-07 (8).
  - **Kenji e Vorax (5★) ficam bloqueados por enquanto**, sem forma de obter. Na coleção aparecem apagados, com cadeado e **"🔒 Em breve"**. Continuam como inimigos nas fases finais.
  - Fases 1 e 2 ficaram mais leves para a equipe inicial (inimigos nível 1 e 2; a fase 1 sem tanques).
- **9 novos personagens de 1★ (vão até 4★)**, cada um com cenário próprio que evolui por estrela, marca visual própria e habilidade da categoria:
  - 🛡️ **Daichi Punho-de-Rocha** — Couraça de Espinhos: quem bate nele corpo a corpo sofre dano de volta.
  - ➕ **Sora Brisa-Serena** — Sopro Restaurador: cura o aliado mais ferido da fileira (ataca à distância).
  - ➕ **Tobi Tambor-de-Guerra** — Tambor de Guerra: aliados vizinhos ganham ataque.
  - 🪄 **Kael Chama-Rubra** — Explosão de Brasas: a explosão atinge também a outra fileira, na mesma coluna.
  - 🪄 **Suri Maré-Gélida** — Maré Implacável: dano extra no herói inimigo.
  - 🏹 **Hana Pena-Veloz** — Tiro Certeiro: ignora resistência física.
  - 🏹 **Jin Arco-Trovão** — Olho de Águia: mais dano em alvos a 2–3 casas.
  - 💀 **Ren Presa-Oculta** — Caça-Conjuradores: caça magos, arqueiros e suportes à distância.
  - 💀 **Kuro Garra-Noturna** — Ataque Surpresa: mira o inimigo de maior ataque e bate mais em quem está com a vida cheia.
- **Saves antigos:** mantêm todos os personagens e o progresso (inclusive Kenji e Vorax, se já obtidos), ganham os 9 novos de 1★ e têm a equipe completada até 10.
- Testes novos: compra até 6 numa compra só, várias garantias numa compra, ordem variando, baralho de 10 obrigatório, fases com 10 diferentes, progressão só com 1★, bloqueio de Kenji/Vorax, migração de save e as 9 habilidades novas.
- **Simulações (IA × IA):**
  - Só os 12 de 1★ (nível 1): cada um entre 48% e 53% de vitórias nas equipes em que está; média de 17,6 turnos.
  - Todos no máximo (equipes de 10): os personagens que vão até 4★, 5★ e o Nyx ficam entre 47% e 53%. Kenji (60%) e Vorax (56%) ficam acima por chegarem a 6★, mas estão bloqueados.
  - Equipe inicial de 1★ nível 1: vence a fase 1 em 97% e a fase 2 em 53% (93% treinando até o nível 3 com os itens iniciais).
  - Fase 10 continua difícil: 55% para uma equipe treinada no nível da fase e 100% com equipe no máximo.

## [0.7.0] — 24/10/2026 · PR #7 — Baralho de 40 cartas, Cria Sombria e cartas redesenhadas
- **Novo baralho:** a equipe vira o baralho, com **10 cartas × 4 cópias = 40**. A IA também usa 10 × 4: o conjunto de cada fase é repetido até formar 10 grupos.
  - Equipe com menos de 10 personagens: os primeiros da equipe se repetem até completar 10 grupos.
  - Saves antigos com equipe de 6 são completados até 10 automaticamente, uma única vez.
  - Personagem desbloqueado entra direto na equipe se houver vaga.
- **Mão de 6 cartas:** a luta começa com 6 cartas diferentes e você compra 1 por rodada (com a mão cheia não compra).
- **Baralho e Derrotadas na batalha:** o Baralho fica à esquerda da mão e as Derrotadas à direita, cada um com seu contador. O contador pulsa quando muda.
- **Cópias derrotadas não voltam:** a carta jogada vira unidade. Quando a unidade morre, aquela cópia vai para as Derrotadas e não volta mais. Carta sem cópias sai do rodízio.
- **Compra semi-aleatória por carta:**
  - Depois de comprada, a carta fica bloqueada nas 6 compras seguintes, pode vir sorteada na 7ª, 8ª e 9ª, e vem garantida na 10ª.
  - A contagem começa na compra, inclusive a da mão inicial, e não pausa enquanto a carta fica na mão.
  - Exceção do começo: as 6 cartas iniciais voltam ao sorteio na 5ª compra e ficam garantidas na 8ª.
  - Garantias simultâneas saem em fila, uma por compra. Uma compra de 2 cartas atende 2 garantias.
- **Cria Sombria:** ataque 2 com Vorax 5★ e ataque 3 com Vorax 6★ (antes dependia do nível). Ganhou o **Disparo Sombrio**: ataque mágico no inimigo mais próximo até **2 casas** à frente (antes 3).
- **Cartas redesenhadas** em todas as telas: mão, coleção, equipe, treino, troca, detalhes e recompensa.
  - Moldura metálica chanfrada na cor das estrelas, aura de energia e personagem saindo pela borda.
  - Medalhões de custo, categoria e nível, estrelas no topo e faixa com o nome.
  - 3★ ganha reflexo de luz; 4★ aura pulsando com raios.
  - 5★ e 6★ são premium, com borda dourada, brilho e faíscas.
  - O tamanho se adapta à carta: na mão do celular aparece só o primeiro nome.
- **Celular:** na batalha, Baralho, mão e Derrotadas ocupam a linha inteira, e a energia e o LUTAR ficam embaixo.
- Testes novos do baralho: bloqueio, janela de sorteio 7ª–9ª, garantia na 10ª, fila de garantias, exceção da 5ª compra, cópias derrotadas, mão cheia e compra sem carta liberada. Também há testes da Cria e do visual das cartas.
- **Simulações (IA × IA):**
  - Equipes de 10 no máximo: cada personagem fica entre 48% e 53% de vitórias nas equipes em que está (antes 44% a 58%), com média de 11,4 turnos e nenhuma luta no limite.
  - Fase 10 continua difícil: 44% para uma equipe treinada no nível da fase e 100% com equipe no máximo.

## [0.6.0] — 24/10/2026 · PR #6 — Cenários de fundo nos retratos
- **Cenário próprio para cada personagem:** vento e céu (Riku), noite de luar (Nara), templo das sombras (Toru), acima das nuvens (Aiko), campo de estrelas (Lyra), fortaleza de ferro (Gorath), lago de lótus (Mei), floresta (Yume), eclipse (Zarek), dojô (Kenji), laboratório (Nyx-07), abismo (Vorax e Cria).
- **O cenário evolui a cada estrela:** mais camadas, luz, partículas e cores.
- Vinheta suave nas bordas para a borda colorida da carta continuar legível; elementos da cena ficam nas laterais para não sumirem atrás do personagem.
- Vale em todas as telas (coleção, equipe, treino, mão, batalha, fases).
- Testes: cada personagem tem cena diferente, a cena cresce a cada estrela e continua leve.

## [0.5.0] — 24/10/2026 · PR #5 — Janelas do jogo, troca de equipe e evolução visual
- **Janelas do jogo** no lugar de todos os `confirm`/`alert` do navegador (sair da batalha, apagar progresso, equipe mínima).
- **Troca de equipe:** com a equipe cheia, escolha quem sai tocando nas cartas; **Trocar** só libera com a quantidade certa; dá para cancelar.
- **Novas faixas de estrelas:** 1–2★ → 4★, 3★ → 5★, 4–5★ → 6★. **Únicos** (Kenji e Vorax) começam em 5★ e vão a 6★.
  - Riku, Nara, Toru 1–4★ · Aiko, Lyra, Gorath, Mei 2–4★ · Yume, Zarek 3–5★ · Nyx-07 4–6★ · Kenji, Vorax 5–6★.
- **Habilidades reajustadas** às novas faixas (ex.: Postura de Guarda +2 em 4★; Flecha Dupla 1/2/3 em 2/3/4★; Feixe 50/75/100% em 2/3/4★; Punho ×2/×2,25; Sifão −1 em 4–5★ e −2 em 6★; Cria com vida 1/2).
- Status reajustados: Toru 2/11, Aiko 3/5, Kenji 3/7, Nyx 2/6, Vorax 3/6.
- **Evolução visual por estrela** em todos os personagens: ombreiras, peitoral, capa, coroa, cabelo energizado, halo, raios e aura maiores; físico mais largo.
- **Animação de Despertar** ao ganhar estrela.
- Simulações com equipes no máximo: todos entre 46% e 56% de vitórias; equipes no máximo vencem a fase 10.

## [0.4.0] — 24/10/2026 · PR #4 — Categorias, cores por estrela e rebalanceamento
- Novos arquivos **REGRAS.md** (todas as regras) e **CHANGELOG.md** (este histórico); a CI exige que toda PR atualize os dois.
- **Passo da vitória:** quem derrota um inimigo avança 1 casa, se estiver livre.
- **Longo alcance agora é 3 casas**, sempre no inimigo **mais próximo** (salvo habilidade).
- **Só a própria fileira:** ninguém ataca a outra fileira, exceto as habilidades diagonais.
- Habilidades refeitas:
  - Lyra virou **Feixe Perfurante** (atravessa a fileira).
  - Zarek: **Emboscada** só na fileira, perfurando resistência.
  - Yume: **Instinto Predador** só na fileira, com execução.
- **Categorias** com ícone no canto da carta: 🛡️ Tanque, ➕ Suporte, ⚔️ DPS, 🪄 Mago, 🏹 Arqueiro, 💀 Assassino.
- **Cor da carta pelas estrelas** (1★ cinza → 6★ vermelho) em todas as telas; raridade vira texto.
- **Coleção:** obtidos em cima; não obtidos embaixo, após uma divisória, cinza e sem animação.
- **Rebalanceamento por categoria** e **habilidades que evoluem por estrela/nível** com tetos (resistência ≤ 3, Sifão ≤ 2, ≤ 3 Crias por lado, dano mínimo 1).
- **Nova personagem:** Mei Lótus-Celeste (➕ Suporte, cura vizinhos), já na coleção inicial.
- Fúria de batalha mantida. Simulações: sem ela, 4,5% das lutas no início do jogo chegam ao limite de turnos.

## [0.3.0] — 24/10/2026 09:27 · PR #3 — Herói como alvo
- O herói passa a ser uma unidade numa coluna virtual após a arena, alcançável pelas duas fileiras.
- Todas as unidades atacam o herói com o próprio alcance quando não há inimigo válido.
- Removida a regra de Lyra, Zarek e Yume só baterem no herói da última coluna.
- A Fúria de batalha pode ser desligada nas configurações da partida (para simulações).

## [0.2.0] — 24/10/2026 09:14 · PR #2 — Arena 2×7
- Arena de 2 fileiras × 7 colunas, com os heróis nas pontas.
- Zona de invocação de 3 colunas.
- Corpo a corpo com alcance 1; longo alcance com 2; miras especiais limitadas.
- Ciclo de cartas: a mão não esvazia, compra de 1 carta por rodada, carta usada volta ao baralho.
- **Fúria de batalha** (anti-empate).
- Vida dos personagens −25%; herói do jogador com 20 de vida.
- Fases rebalanceadas.

## [0.1.0] — 24/10/2026 01:04 · PR #1 — Primeira versão jogável
- Batalha automática em grade (5×9) contra a IA.
- 11 personagens originais com retratos SVG.
- Habilidades orientadas a dados.
- Raridades e estrelas 1–6★.
- Treino com itens de XP e Despertar.
- Coleção e equipe, Aventura com 10 fases, save em localStorage.
- Deploy no GitHub Pages.
