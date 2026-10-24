# Histórico de atualizações

Toda PR deve adicionar uma entrada aqui e atualizar o [REGRAS.md](REGRAS.md). Horários em Brasília (UTC−3).

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
