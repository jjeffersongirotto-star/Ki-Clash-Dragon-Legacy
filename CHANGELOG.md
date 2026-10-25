# Histórico de atualizações

Toda PR deve adicionar uma entrada aqui e atualizar o [REGRAS.md](REGRAS.md). Horários em Brasília (UTC−3).

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
