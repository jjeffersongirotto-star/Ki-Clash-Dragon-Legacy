# Histórico de atualizações

Toda PR deve adicionar uma entrada aqui e atualizar o [REGRAS.md](REGRAS.md). Horários em Brasília (UTC−3).

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
