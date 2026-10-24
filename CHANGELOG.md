# Histórico de atualizações

Toda PR deve adicionar uma entrada aqui e atualizar o [REGRAS.md](REGRAS.md). Horários em Brasília (UTC−3).

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
