# Cartas do Ki-Clash: Dragon Legacy — projeto das 120 cartas

> **Ainda não estão no jogo.** Este arquivo é o projeto das cartas: 6 tipos × 20 cartas = **120**. Os 20 personagens que já existem contam (marcados *já no jogo*; a Cria Sombria é só uma invocação e não conta). As outras **99** são novas.
> Serve para outra IA desenhar a aparência de cada personagem (carta e batalha). Depois as artes voltam e as cartas entram no jogo.
> Ataque e vida saem da fórmula real do jogo: base × 1,17 a cada degrau (Comum, Comum+, Comum++, Incomum…). O arquivo é gerado por `scripts/cartas/gerar.ts`; a versão para programas está em `docs/cartas.json`.

## Resumo por tipo

| Tipo | Total | Novas | Comum | Incomum | Raro | Épico | Lendário | Mítico | Ataca pelas costas | Ataca na diagonal |
|---|---|---|---|---|---|---|---|---|---|---|
| 🌍 Humano | 20 | 16 | 4 | 4 | 4 | 3 | 3 | 2 | Shin, Sayuri | Akemi, Masao, Hayato |
| 🪐 Extraterrestre | 20 | 16 | 4 | 4 | 4 | 3 | 4 | 1 | Zarek, Velka, Zynna, Nhyra | Nara, Thessa, Kryx, Vexar |
| 👹 Monstro | 20 | 16 | 4 | 4 | 4 | 3 | 3 | 2 | Skarr, Ysmera | Grub, Trokk |
| 🔮 Mago Arcano | 20 | 16 | 4 | 4 | 4 | 3 | 4 | 1 | Odo, Kaela | Isel, Corvin |
| 🤖 Androide | 20 | 17 | 4 | 4 | 4 | 3 | 3 | 2 | Vex-4, Phase-3 | Toru, Kraz-9, Razor-V |
| ☠️ Necromante | 20 | 18 | 4 | 4 | 4 | 3 | 3 | 2 | Lethe, Sabbath | Ossian, Morrigan, Drakon |

| Tipo | 🛡️ Tanque | ➕ Suporte | ⚔️ DPS | 🪄 Mago | 🏹 Arqueiro | 💀 Assassino |
|---|---|---|---|---|---|---|
| 🌍 Humano | 3 | 2 | 8 | 1 | 3 | 3 |
| 🪐 Extraterrestre | 3 | 3 | 4 | 3 | 3 | 4 |
| 👹 Monstro | 6 | 2 | 5 | 2 | 1 | 4 |
| 🔮 Mago Arcano | 2 | 5 | 2 | 8 | 1 | 2 |
| 🤖 Androide | 5 | 3 | 5 | 3 | 2 | 2 |
| ☠️ Necromante | 3 | 3 | 5 | 5 | 1 | 3 |

**Como ler a raridade:** a carta começa na raridade de entrada e pode subir até a máxima (degraus base, + e ++ em cada uma). Cartas Míticas já começam no Mítico. Quanto mais forte a habilidade, menor a vida ou o ataque, para nenhuma carta ficar invencível.

**Espera:** quantas rodadas a carta fica na mão antes de poder entrar em campo (Comum 2–3 · Incomum 3 · Raro 3–4 · Épico 4 · Lendário 5 · Mítico 6).

## 🌍 Humano

> Artistas marciais e guerreiros da Terra que dominam o fluxo de Ki.

| Carta | Grupo | Raridade | Ataque | ⚔ / ❤ ao chegar | Habilidades |
|---|---|---|---|---|---|
| Hana Pena-Veloz *(já no jogo)* | 🏹 Arqueiro | Comum | físico | 2 / 5 | 🎯 Longo Alcance, ➹ Tiro Certeiro |
| Ren Presa-Oculta *(já no jogo)* | 💀 Assassino | Comum | físico | 3 / 5 | 🪓 Caça-Conjuradores |
| Riku Vendaval *(já no jogo)* | ⚔️ DPS | Comum | físico | 3 / 6 | ⤴ Salto Vendaval |
| Taro Escudo-de-Bambu | 🛡️ Tanque | Comum | físico | 2 / 10 | 🛡 Postura de Guarda, 🗯️ Provocar |
| Akemi Lança-Dupla | ⚔️ DPS | Incomum | físico | 5 / 10 | ↗ Corte Diagonal, 🩸 Sangramento |
| Daisuke Arco-de-Ferro | 🏹 Arqueiro | Incomum | físico | 5 / 8 | 🎯 Longo Alcance, 🐌 Lentidão |
| Shin Passo-Fantasma | 💀 Assassino | Incomum | físico | 6 / 6 | 🔙 Golpe pelas Costas, 🎯 Golpe Crítico |
| Yuna Mão-Curadora | ➕ Suporte | Incomum | mágico | 2 / 10 | 🎯 Longo Alcance, 🍃 Sopro Restaurador, 🌿 Purificar |
| Emi Brisa-Arcana | 🪄 Mago | Raro | mágico | 8 / 10 | 🎯 Longo Alcance, 🕯️ Maldição |
| Goro Martelo-Solar | 🛡️ Tanque | Raro | físico | 5 / 28 | 💢 Ombrada, 🛡 Postura de Guarda |
| Masao Leque-Cortante | ⚔️ DPS | Raro | físico | 8 / 15 | ↙ Golpe Reverso, 🎯 Golpe Crítico |
| Sayuri Agulha-Venenosa | 💀 Assassino | Raro | físico | 10 / 10 | 🗡️ Emboscada, 🧪 Veneno |
| Kaori Vendaval-Sagrado | ➕ Suporte | Épico | mágico | 8 / 25 | 📯 Grito de Guerra, 🍃 Sopro Restaurador |
| Ryuji Punho-de-Tempestade | ⚔️ DPS | Épico | físico | 12 / 25 | 📈 Fúria, 🎯 Golpe Crítico |
| Tetsuo Muralha-Viva | 🛡️ Tanque | Épico | físico | 8 / 49 | 🛡️ Protetor, 🗯️ Provocar, 🛡 Postura de Guarda |
| Kenji Punho-Espelhado *(já no jogo)* | ⚔️ DPS | Lendário | físico | 20 / 46 | 🔁 Punho Espelhado |
| Mestre Hayato Céu-Partido | ⚔️ DPS | Lendário | físico | 20 / 46 | 💫 Atordoamento, ↗ Corte Diagonal |
| Rin Flecha-do-Amanhecer | 🏹 Arqueiro | Lendário | físico | 20 / 33 | 🎯 Longo Alcance, 🗡️ Perfurar, 🎯 Golpe Crítico |
| Aya Vontade-Inquebrável | ⚔️ DPS | Mítico | físico | 32 / 63 | ⏳ Vontade Inquebrável, 🐎 Investida |
| Kaito Selo-do-Vazio | ⚔️ DPS | Mítico | físico | 32 / 53 | 🚫 Selo do Vazio, 🎯 Golpe Crítico |

### Fichas

#### Hana Pena-Veloz *(já no jogo)*
- **Grupo:** 🏹 Arqueiro · **Raridade:** Comum → até Épico++ · **Dano:** físico · **Espera:** 2 rodada(s) na mão
- **Ataque:** 🎯 Longe: o inimigo mais próximo até 4 casas à frente na fileira
- **Ao chegar (Comum):** ⚔ 2 de ataque · ❤ 5 de vida
- **Habilidades:**
  - 🎯 Longo Alcance: Ataca o inimigo mais próximo até 4 casas à frente na sua fileira (inclusive o Comandante). Não avança quando consegue atacar.
  - ➹ Tiro Certeiro: A flecha ignora parte da resistência física do alvo.
- **História:** Caçadora humana de pés leves: suas flechas revestidas de Ki verde encontram a fresta de qualquer armadura.
- **Aparência:** Já tem arte no jogo.

<details><summary>Ataque e vida em cada degrau</summary>

| Raridade | Base | + | ++ |
|---|---|---|---|
| Comum | ⚔ 2 · ❤ 5 | ⚔ 2 · ❤ 6 | ⚔ 3 · ❤ 7 |
| Incomum | ⚔ 3 · ❤ 8 | ⚔ 4 · ❤ 9 | ⚔ 4 · ❤ 11 |
| Raro | ⚔ 5 · ❤ 13 | ⚔ 6 · ❤ 15 | ⚔ 7 · ❤ 18 |
| Épico | ⚔ 8 · ❤ 21 | ⚔ 10 · ❤ 24 | ⚔ 11 · ❤ 28 |

</details>

#### Ren Presa-Oculta *(já no jogo)*
- **Grupo:** 💀 Assassino · **Raridade:** Comum → até Épico++ · **Dano:** físico · **Espera:** 2 rodada(s) na mão
- **Ataque:** 👊 Frente: corpo a corpo, o inimigo logo à frente · 🎯 Prioriza unidades de longo alcance até 2 casas
- **Ao chegar (Comum):** ⚔ 3 de ataque · ❤ 5 de vida
- **Habilidades:**
  - 🪓 Caça-Conjuradores: Prioriza unidades de longo alcance (magos, arqueiros e suportes à distância) da sua fileira até 2 casas à frente.
- **História:** Ninja humano que cresceu nas vielas sombrias caçando conjuradores que se escondem atrás da linha de frente.
- **Aparência:** Já tem arte no jogo.

<details><summary>Ataque e vida em cada degrau</summary>

| Raridade | Base | + | ++ |
|---|---|---|---|
| Comum | ⚔ 3 · ❤ 5 | ⚔ 4 · ❤ 6 | ⚔ 4 · ❤ 7 |
| Incomum | ⚔ 5 · ❤ 8 | ⚔ 6 · ❤ 9 | ⚔ 7 · ❤ 11 |
| Raro | ⚔ 8 · ❤ 13 | ⚔ 9 · ❤ 15 | ⚔ 11 · ❤ 18 |
| Épico | ⚔ 12 · ❤ 21 | ⚔ 14 · ❤ 24 | ⚔ 17 · ❤ 28 |

</details>

#### Riku Vendaval *(já no jogo)*
- **Grupo:** ⚔️ DPS · **Raridade:** Comum → até Épico++ · **Dano:** físico · **Espera:** 2 rodada(s) na mão
- **Ataque:** 👊 Frente: corpo a corpo, o inimigo logo à frente · 🦘 Salta 3 casas e ataca ao cair
- **Ao chegar (Comum):** ⚔ 3 de ataque · ❤ 6 de vida
- **Habilidades:**
  - ⤴ Salto Vendaval *(única)*: Move-se sempre saltando para a 3ª casa à frente, por cima de aliados ou inimigos (2ª ou 1ª se a de cima estiver ocupada). Salta também por cima do inimigo da frente. Ao cair, ataca com bônus.
- **História:** Aprendiz humano de um mosteiro nas montanhas, concentra espirais de Ki nos punhos e salta sobre inimigos como o vento.
- **Aparência:** Já tem arte no jogo.

<details><summary>Ataque e vida em cada degrau</summary>

| Raridade | Base | + | ++ |
|---|---|---|---|
| Comum | ⚔ 3 · ❤ 6 | ⚔ 4 · ❤ 7 | ⚔ 4 · ❤ 8 |
| Incomum | ⚔ 5 · ❤ 10 | ⚔ 6 · ❤ 11 | ⚔ 7 · ❤ 13 |
| Raro | ⚔ 8 · ❤ 15 | ⚔ 9 · ❤ 18 | ⚔ 11 · ❤ 21 |
| Épico | ⚔ 12 · ❤ 25 | ⚔ 14 · ❤ 29 | ⚔ 17 · ❤ 34 |

</details>

#### Taro Escudo-de-Bambu
- **Grupo:** 🛡️ Tanque · **Raridade:** Comum → até Épico++ · **Dano:** físico · **Espera:** 3 rodada(s) na mão
- **Ataque:** 👊 Frente: corpo a corpo, o inimigo logo à frente
- **Ao chegar (Comum):** ⚔ 2 de ataque · ❤ 10 de vida
- **Habilidades:**
  - 🛡 Postura de Guarda: Resistência física: reduz o dano de cada golpe físico (v0.17.0: a resistência é habilidade, não status de toda carta).
  - 🗯️ Provocar: Os inimigos vizinhos são obrigados a atacá-lo, se puderem.
- **História:** Lenhador da aldeia que aprendeu a parar golpes com um escudo de bambu trançado.
- **Aparência:** Jovem forte de quimono marrom, faixa verde, escudo redondo de bambu, pose firme agachado.

<details><summary>Ataque e vida em cada degrau</summary>

| Raridade | Base | + | ++ |
|---|---|---|---|
| Comum | ⚔ 2 · ❤ 10 | ⚔ 2 · ❤ 12 | ⚔ 3 · ❤ 14 |
| Incomum | ⚔ 3 · ❤ 16 | ⚔ 4 · ❤ 19 | ⚔ 4 · ❤ 22 |
| Raro | ⚔ 5 · ❤ 26 | ⚔ 6 · ❤ 30 | ⚔ 7 · ❤ 35 |
| Épico | ⚔ 8 · ❤ 41 | ⚔ 10 · ❤ 48 | ⚔ 11 · ❤ 56 |

</details>

#### Akemi Lança-Dupla
- **Grupo:** ⚔️ DPS · **Raridade:** Incomum → até Épico++ · **Dano:** físico · **Espera:** 3 rodada(s) na mão
- **Ataque:** 👊 Frente: corpo a corpo, o inimigo logo à frente · ↗ Diagonal: também corta a diagonal à frente
- **Ao chegar (Incomum):** ⚔ 5 de ataque · ❤ 10 de vida
- **Habilidades:**
  - ↗ Corte Diagonal: Também ataca o inimigo na diagonal logo à frente (outra fileira, 1 coluna adiante).
  - 🩸 Sangramento: Golpes físicos abrem feridas: o alvo perde 1 de vida por turno por 3 turnos, e mais 1 em cada turno em que andar.
- **História:** Lanceira do templo que corta em arco quem tenta passar pelos lados.
- **Aparência:** Mulher de rabo de cavalo alto, roupa vermelha e branca, lança de duas pontas girando.

<details><summary>Ataque e vida em cada degrau</summary>

| Raridade | Base | + | ++ |
|---|---|---|---|
| Incomum | ⚔ 5 · ❤ 10 | ⚔ 6 · ❤ 11 | ⚔ 7 · ❤ 13 |
| Raro | ⚔ 8 · ❤ 15 | ⚔ 9 · ❤ 18 | ⚔ 11 · ❤ 21 |
| Épico | ⚔ 12 · ❤ 25 | ⚔ 14 · ❤ 29 | ⚔ 17 · ❤ 34 |

</details>

#### Daisuke Arco-de-Ferro
- **Grupo:** 🏹 Arqueiro · **Raridade:** Incomum → até Épico++ · **Dano:** físico · **Espera:** 3 rodada(s) na mão
- **Ataque:** 🎯 Longe: o inimigo mais próximo até 4 casas à frente na fileira
- **Ao chegar (Incomum):** ⚔ 5 de ataque · ❤ 8 de vida
- **Habilidades:**
  - 🎯 Longo Alcance: Ataca o inimigo mais próximo até 4 casas à frente na sua fileira (inclusive o Comandante). Não avança quando consegue atacar.
  - 🐌 Lentidão: O alvo fica lento por 2 turnos: anda só 1 casa e perde o ataque no primeiro desses turnos.
- **História:** Caçador das montanhas cujas flechas com peso de ferro deixam o alvo lento.
- **Aparência:** Homem barbado com capa de pele, arco longo de metal escuro, aljava nas costas.

<details><summary>Ataque e vida em cada degrau</summary>

| Raridade | Base | + | ++ |
|---|---|---|---|
| Incomum | ⚔ 5 · ❤ 8 | ⚔ 6 · ❤ 9 | ⚔ 7 · ❤ 11 |
| Raro | ⚔ 8 · ❤ 13 | ⚔ 9 · ❤ 15 | ⚔ 11 · ❤ 18 |
| Épico | ⚔ 12 · ❤ 21 | ⚔ 14 · ❤ 24 | ⚔ 17 · ❤ 28 |

</details>

#### Shin Passo-Fantasma
- **Grupo:** 💀 Assassino · **Raridade:** Incomum → até Épico++ · **Dano:** físico · **Espera:** 3 rodada(s) na mão
- **Ataque:** 👊 Frente: corpo a corpo, o inimigo logo à frente · 🔙 Costas: quem já passou por ele na fileira
- **Ao chegar (Incomum):** ⚔ 6 de ataque · ❤ 6 de vida
- **Habilidades:**
  - 🔙 Golpe pelas Costas: Ataca primeiro o inimigo que já passou por ele na mesma fileira (atrás dele), com +1 de dano nesse golpe; se não houver, ataca à frente.
  - 🎯 Golpe Crítico: 25% de chance de causar o dobro de dano (30% no Lendário e no Mítico).
- **História:** Ninja silencioso que espera o inimigo passar para golpear pelas costas.
- **Aparência:** Ninja de roupa azul-escura, máscara cobrindo o rosto, duas kunai, pose de salto baixo.

<details><summary>Ataque e vida em cada degrau</summary>

| Raridade | Base | + | ++ |
|---|---|---|---|
| Incomum | ⚔ 6 · ❤ 6 | ⚔ 7 · ❤ 7 | ⚔ 9 · ❤ 9 |
| Raro | ⚔ 10 · ❤ 10 | ⚔ 12 · ❤ 12 | ⚔ 14 · ❤ 14 |
| Épico | ⚔ 16 · ❤ 16 | ⚔ 19 · ❤ 19 | ⚔ 22 · ❤ 22 |

</details>

#### Yuna Mão-Curadora
- **Grupo:** ➕ Suporte · **Raridade:** Incomum → até Épico++ · **Dano:** mágico · **Espera:** 3 rodada(s) na mão
- **Ataque:** 🎯 Longe: o inimigo mais próximo até 4 casas à frente na fileira
- **Ao chegar (Incomum):** ⚔ 2 de ataque · ❤ 10 de vida
- **Habilidades:**
  - 🎯 Longo Alcance: Ataca o inimigo mais próximo até 4 casas à frente na sua fileira (inclusive o Comandante). Não avança quando consegue atacar.
  - 🍃 Sopro Restaurador: No início da sua ação, cura o aliado mais ferido da própria fileira (qualquer distância).
  - 🌿 Purificar: No início da sua ação, tira um efeito ruim (veneno, queimadura, sangramento, congelamento, atordoamento, lentidão ou maldição) do aliado vizinho mais afetado.
- **História:** Curandeira de vila que dissolve venenos com chá de ervas e Ki.
- **Aparência:** Moça de túnica branca e verde-claro, cesto de ervas, mãos brilhando em verde.

<details><summary>Ataque e vida em cada degrau</summary>

| Raridade | Base | + | ++ |
|---|---|---|---|
| Incomum | ⚔ 2 · ❤ 10 | ⚔ 2 · ❤ 11 | ⚔ 2 · ❤ 13 |
| Raro | ⚔ 3 · ❤ 15 | ⚔ 3 · ❤ 18 | ⚔ 4 · ❤ 21 |
| Épico | ⚔ 4 · ❤ 25 | ⚔ 5 · ❤ 29 | ⚔ 6 · ❤ 34 |

</details>

#### Emi Brisa-Arcana
- **Grupo:** 🪄 Mago · **Raridade:** Raro → até Lendário++ · **Dano:** mágico · **Espera:** 4 rodada(s) na mão
- **Ataque:** 🎯 Longe: o inimigo mais próximo até 4 casas à frente na fileira
- **Ao chegar (Raro):** ⚔ 8 de ataque · ❤ 10 de vida
- **Habilidades:**
  - 🎯 Longo Alcance: Ataca o inimigo mais próximo até 4 casas à frente na sua fileira (inclusive o Comandante). Não avança quando consegue atacar.
  - 🕯️ Maldição: O alvo recebe +25% de dano de todas as fontes por 2 turnos.
- **História:** Estudante de pergaminhos proibidos que amaldiçoa com símbolos de vento.
- **Aparência:** Garota de óculos, uniforme escolar azul com capa, pergaminho flutuando, símbolos roxos no ar.

<details><summary>Ataque e vida em cada degrau</summary>

| Raridade | Base | + | ++ |
|---|---|---|---|
| Raro | ⚔ 8 · ❤ 10 | ⚔ 9 · ❤ 12 | ⚔ 11 · ❤ 14 |
| Épico | ⚔ 12 · ❤ 16 | ⚔ 14 · ❤ 19 | ⚔ 17 · ❤ 22 |
| Lendário | ⚔ 20 · ❤ 26 | ⚔ 23 · ❤ 31 | ⚔ 27 · ❤ 36 |

</details>

#### Goro Martelo-Solar
- **Grupo:** 🛡️ Tanque · **Raridade:** Raro → até Lendário++ · **Dano:** físico · **Espera:** 4 rodada(s) na mão
- **Ataque:** 👊 Frente: corpo a corpo, o inimigo logo à frente
- **Ao chegar (Raro):** ⚔ 5 de ataque · ❤ 28 de vida
- **Habilidades:**
  - 💢 Ombrada: Ao acertar um inimigo corpo a corpo de frente, empurra o alvo 1 casa para trás (se a casa estiver livre).
  - 🛡 Postura de Guarda: Resistência física: reduz o dano de cada golpe físico (v0.17.0: a resistência é habilidade, não status de toda carta).
- **História:** Ferreiro gigante que empurra inimigos com o próprio martelo.
- **Aparência:** Homem enorme de avental de couro, braços queimados de sol, martelo de forja dourado.

<details><summary>Ataque e vida em cada degrau</summary>

| Raridade | Base | + | ++ |
|---|---|---|---|
| Raro | ⚔ 5 · ❤ 28 | ⚔ 6 · ❤ 33 | ⚔ 7 · ❤ 39 |
| Épico | ⚔ 8 · ❤ 45 | ⚔ 10 · ❤ 53 | ⚔ 11 · ❤ 62 |
| Lendário | ⚔ 13 · ❤ 72 | ⚔ 15 · ❤ 85 | ⚔ 18 · ❤ 99 |

</details>

#### Masao Leque-Cortante
- **Grupo:** ⚔️ DPS · **Raridade:** Raro → até Lendário++ · **Dano:** físico · **Espera:** 3 rodada(s) na mão
- **Ataque:** 👊 Frente: corpo a corpo, o inimigo logo à frente · ↘ Diagonal: prioriza a diagonal logo atrás
- **Ao chegar (Raro):** ⚔ 8 de ataque · ❤ 15 de vida
- **Habilidades:**
  - ↙ Golpe Reverso: Prioriza o inimigo na diagonal logo atrás (pega quem passou por ele na outra fileira).
  - 🎯 Golpe Crítico: 25% de chance de causar o dobro de dano (30% no Lendário e no Mítico).
- **História:** Dançarino de guerra que corta com leques de aço quem ficou para trás.
- **Aparência:** Homem elegante de roupa roxa com dourado, dois leques de aço abertos, pose de dança.

<details><summary>Ataque e vida em cada degrau</summary>

| Raridade | Base | + | ++ |
|---|---|---|---|
| Raro | ⚔ 8 · ❤ 15 | ⚔ 9 · ❤ 18 | ⚔ 11 · ❤ 21 |
| Épico | ⚔ 12 · ❤ 25 | ⚔ 14 · ❤ 29 | ⚔ 17 · ❤ 34 |
| Lendário | ⚔ 20 · ❤ 39 | ⚔ 23 · ❤ 46 | ⚔ 27 · ❤ 54 |

</details>

#### Sayuri Agulha-Venenosa
- **Grupo:** 💀 Assassino · **Raridade:** Raro → até Lendário++ · **Dano:** físico · **Espera:** 3 rodada(s) na mão
- **Ataque:** 👊 Frente: corpo a corpo, o inimigo logo à frente · 🔙 Costas: o inimigo mais recuado até 2 casas
- **Ao chegar (Raro):** ⚔ 10 de ataque · ❤ 10 de vida
- **Habilidades:**
  - 🗡️ Emboscada: Ataca o inimigo mais distante da sua fileira até 2 casas à frente, ignorando parte da resistência.
  - 🧪 Veneno: O alvo fica envenenado: perde 1 de vida no fim de cada turno dele por 3 turnos (2 de vida por turno a partir do Épico). Não acumula; um novo golpe renova.
- **História:** Espiã do palácio que acerta os inimigos mais recuados com agulhas envenenadas.
- **Aparência:** Mulher de quimono preto com flores lilás, agulhas entre os dedos, olhar frio.

<details><summary>Ataque e vida em cada degrau</summary>

| Raridade | Base | + | ++ |
|---|---|---|---|
| Raro | ⚔ 10 · ❤ 10 | ⚔ 12 · ❤ 12 | ⚔ 14 · ❤ 14 |
| Épico | ⚔ 16 · ❤ 16 | ⚔ 19 · ❤ 19 | ⚔ 22 · ❤ 22 |
| Lendário | ⚔ 26 · ❤ 26 | ⚔ 31 · ❤ 31 | ⚔ 36 · ❤ 36 |

</details>

#### Kaori Vendaval-Sagrado
- **Grupo:** ➕ Suporte · **Raridade:** Épico → até Mítico++ · **Dano:** mágico · **Espera:** 4 rodada(s) na mão
- **Ataque:** 👊 Frente: corpo a corpo, o inimigo logo à frente
- **Ao chegar (Épico):** ⚔ 8 de ataque · ❤ 25 de vida
- **Habilidades:**
  - 📯 Grito de Guerra: Enquanto estiver vivo, todos os aliados da MESMA FILEIRA ganham +1 de ataque (não soma com o Tambor de Guerra; teto de bônus 2).
  - 🍃 Sopro Restaurador: No início da sua ação, cura o aliado mais ferido da própria fileira (qualquer distância).
- **História:** Sacerdotisa que toca o sino do templo e anima a fileira inteira.
- **Aparência:** Sacerdotisa de hakama vermelho e branco, sino dourado na mão, fitas voando.

<details><summary>Ataque e vida em cada degrau</summary>

| Raridade | Base | + | ++ |
|---|---|---|---|
| Épico | ⚔ 8 · ❤ 25 | ⚔ 10 · ❤ 29 | ⚔ 11 · ❤ 34 |
| Lendário | ⚔ 13 · ❤ 39 | ⚔ 15 · ❤ 46 | ⚔ 18 · ❤ 54 |
| Mítico | ⚔ 21 · ❤ 63 | ⚔ 25 · ❤ 74 | ⚔ 29 · ❤ 87 |

</details>

#### Ryuji Punho-de-Tempestade
- **Grupo:** ⚔️ DPS · **Raridade:** Épico → até Mítico++ · **Dano:** físico · **Espera:** 4 rodada(s) na mão
- **Ataque:** 👊 Frente: corpo a corpo, o inimigo logo à frente
- **Ao chegar (Épico):** ⚔ 12 de ataque · ❤ 25 de vida
- **Habilidades:**
  - 📈 Fúria: Ganha +1 de ataque a cada inimigo derrotado (por qualquer aliado), até +3.
  - 🎯 Golpe Crítico: 25% de chance de causar o dobro de dano (30% no Lendário e no Mítico).
- **História:** Lutador de torneio que fica mais forte a cada inimigo que cai.
- **Aparência:** Lutador musculoso de faixa na cabeça, luvas de pano rasgadas, raios azuis nos punhos.

<details><summary>Ataque e vida em cada degrau</summary>

| Raridade | Base | + | ++ |
|---|---|---|---|
| Épico | ⚔ 12 · ❤ 25 | ⚔ 14 · ❤ 29 | ⚔ 17 · ❤ 34 |
| Lendário | ⚔ 20 · ❤ 39 | ⚔ 23 · ❤ 46 | ⚔ 27 · ❤ 54 |
| Mítico | ⚔ 32 · ❤ 63 | ⚔ 37 · ❤ 74 | ⚔ 43 · ❤ 87 |

</details>

#### Tetsuo Muralha-Viva
- **Grupo:** 🛡️ Tanque · **Raridade:** Épico → até Mítico++ · **Dano:** físico · **Espera:** 4 rodada(s) na mão
- **Ataque:** 👊 Frente: corpo a corpo, o inimigo logo à frente
- **Ao chegar (Épico):** ⚔ 8 de ataque · ❤ 49 de vida
- **Habilidades:**
  - 🛡️ Protetor: Recebe no lugar dos aliados vizinhos 30% do dano que eles sofreriam (40% a partir do Épico). É sempre um personagem de muita vida e pouco ataque.
  - 🗯️ Provocar: Os inimigos vizinhos são obrigados a atacá-lo, se puderem.
  - 🛡 Postura de Guarda: Resistência física: reduz o dano de cada golpe físico (v0.17.0: a resistência é habilidade, não status de toda carta).
- **História:** Guarda-costas do imperador; ninguém fere quem está ao lado dele.
- **Aparência:** Samurai de armadura pesada azul-marinho, escudo retangular grande, postura de guarda.

<details><summary>Ataque e vida em cada degrau</summary>

| Raridade | Base | + | ++ |
|---|---|---|---|
| Épico | ⚔ 8 · ❤ 49 | ⚔ 10 · ❤ 58 | ⚔ 11 · ❤ 67 |
| Lendário | ⚔ 13 · ❤ 79 | ⚔ 15 · ❤ 92 | ⚔ 18 · ❤ 108 |
| Mítico | ⚔ 21 · ❤ 126 | ⚔ 25 · ❤ 148 | ⚔ 29 · ❤ 173 |

</details>

#### Kenji Punho-Espelhado *(já no jogo)*
- **Grupo:** ⚔️ DPS · **Raridade:** Lendário → até Mítico++ · **Dano:** físico · **Espera:** 5 rodada(s) na mão
- **Ataque:** 👊 Frente: corpo a corpo, o inimigo logo à frente
- **Ao chegar (Lendário):** ⚔ 20 de ataque · ❤ 46 de vida
- **Habilidades:**
  - 🔁 Punho Espelhado *(única)*: Ao sofrer ataque físico corpo a corpo de frente, contra-ataca com ataque multiplicado e empurra o agressor 1 casa para trás.
- **História:** Grande mestre humano do Estilo Dragão Espelhado: quem o ataca de frente sente a própria força voltar em dobro.
- **Aparência:** Já tem arte no jogo.

<details><summary>Ataque e vida em cada degrau</summary>

| Raridade | Base | + | ++ |
|---|---|---|---|
| Lendário | ⚔ 20 · ❤ 46 | ⚔ 23 · ❤ 54 | ⚔ 27 · ❤ 63 |
| Mítico | ⚔ 32 · ❤ 74 | ⚔ 37 · ❤ 86 | ⚔ 43 · ❤ 101 |

</details>

#### Mestre Hayato Céu-Partido
- **Grupo:** ⚔️ DPS · **Raridade:** Lendário → até Mítico++ · **Dano:** físico · **Espera:** 5 rodada(s) na mão
- **Ataque:** 👊 Frente: corpo a corpo, o inimigo logo à frente · ↗ Diagonal: também corta a diagonal à frente
- **Ao chegar (Lendário):** ⚔ 20 de ataque · ❤ 46 de vida
- **Habilidades:**
  - 💫 Atordoamento: Ao acertar, 50% de chance de atordoar o alvo: no próximo turno ele não age (não anda, não ataca, não usa habilidade). Não atordoa o mesmo alvo duas vezes seguidas.
  - ↗ Corte Diagonal: Também ataca o inimigo na diagonal logo à frente (outra fileira, 1 coluna adiante).
- **História:** Velho mestre cujo golpe de palma faz o inimigo perder os sentidos.
- **Aparência:** Ancião de barba branca longa, roupa de monge laranja, palma aberta com onda de choque.

<details><summary>Ataque e vida em cada degrau</summary>

| Raridade | Base | + | ++ |
|---|---|---|---|
| Lendário | ⚔ 20 · ❤ 46 | ⚔ 23 · ❤ 54 | ⚔ 27 · ❤ 63 |
| Mítico | ⚔ 32 · ❤ 74 | ⚔ 37 · ❤ 86 | ⚔ 43 · ❤ 101 |

</details>

#### Rin Flecha-do-Amanhecer
- **Grupo:** 🏹 Arqueiro · **Raridade:** Lendário → até Mítico++ · **Dano:** físico · **Espera:** 5 rodada(s) na mão
- **Ataque:** 🎯 Longe: o inimigo mais próximo até 4 casas à frente na fileira
- **Ao chegar (Lendário):** ⚔ 20 de ataque · ❤ 33 de vida
- **Habilidades:**
  - 🎯 Longo Alcance: Ataca o inimigo mais próximo até 4 casas à frente na sua fileira (inclusive o Comandante). Não avança quando consegue atacar.
  - 🗡️ Perfurar: O ataque ignora escudos e TODA a resistência do alvo.
  - 🎯 Golpe Crítico: 25% de chance de causar o dobro de dano (30% no Lendário e no Mítico).
- **História:** Arqueira lendária cujas flechas de luz atravessam qualquer armadura.
- **Aparência:** Arqueira de cabelo ruivo curto, armadura leve dourada, arco de luz alaranjada.

<details><summary>Ataque e vida em cada degrau</summary>

| Raridade | Base | + | ++ |
|---|---|---|---|
| Lendário | ⚔ 20 · ❤ 33 | ⚔ 23 · ❤ 38 | ⚔ 27 · ❤ 45 |
| Mítico | ⚔ 32 · ❤ 53 | ⚔ 37 · ❤ 62 | ⚔ 43 · ❤ 72 |

</details>

#### Aya Vontade-Inquebrável
- **Grupo:** ⚔️ DPS · **Raridade:** Mítico → até Mítico++ · **Dano:** físico · **Espera:** 6 rodada(s) na mão
- **Ataque:** 👊 Frente: corpo a corpo, o inimigo logo à frente
- **Ao chegar (Mítico):** ⚔ 32 de ataque · ❤ 63 de vida
- **Habilidades:**
  - ⏳ Vontade Inquebrável *(única)*: Na primeira vez que receberia um golpe fatal, fica com 1 de vida e imune a todo dano até o fim do turno inimigo.
  - 🐎 Investida: Na primeira ação depois de entrar em campo, anda 2 casas a mais e o primeiro golpe causa +1 de dano.
- **História:** Heroína que já se levantou de golpes que derrubariam qualquer outro.
- **Aparência:** Guerreira de cabelo preto curto com bandana branca, roupa vermelha rasgada, punhos em chamas douradas.

<details><summary>Ataque e vida em cada degrau</summary>

| Raridade | Base | + | ++ |
|---|---|---|---|
| Mítico | ⚔ 32 · ❤ 63 | ⚔ 37 · ❤ 74 | ⚔ 43 · ❤ 87 |

</details>

#### Kaito Selo-do-Vazio
- **Grupo:** ⚔️ DPS · **Raridade:** Mítico → até Mítico++ · **Dano:** físico · **Espera:** 6 rodada(s) na mão
- **Ataque:** 👊 Frente: corpo a corpo, o inimigo logo à frente
- **Ao chegar (Mítico):** ⚔ 32 de ataque · ❤ 53 de vida
- **Habilidades:**
  - 🚫 Selo do Vazio *(única)*: Cada golpe físico tira TODAS as habilidades do alvo até o fim da partida (ele vira uma unidade sem habilidades). Não afeta Comandantes. Personagem de ataque físico.
  - 🎯 Golpe Crítico: 25% de chance de causar o dobro de dano (30% no Lendário e no Mítico).
- **História:** Monge exilado que sela o poder dos inimigos com cada golpe do punho.
- **Aparência:** Monge de cabeça raspada, tatuagens de selos pretos nos braços, aura cinza e branca.

<details><summary>Ataque e vida em cada degrau</summary>

| Raridade | Base | + | ++ |
|---|---|---|---|
| Mítico | ⚔ 32 · ❤ 53 | ⚔ 37 · ❤ 62 | ⚔ 43 · ❤ 72 |

</details>

## 🪐 Extraterrestre

> Combatentes cósmicos vindos de luas e galáxias distantes.

| Carta | Grupo | Raridade | Ataque | ⚔ / ❤ ao chegar | Habilidades |
|---|---|---|---|---|---|
| Nara Lâmina-Lunar *(já no jogo)* | ⚔️ DPS | Comum | físico | 3 / 6 | ↗ Corte Diagonal |
| Suri Maré-Gélida *(já no jogo)* | 🪄 Mago | Comum | mágico | 2 / 5 | 🎯 Longo Alcance, 🌊 Maré Implacável |
| Pip Faísca-Lunar | ➕ Suporte | Comum | mágico | 1 / 5 | 🎯 Longo Alcance, 🌿 Purificar |
| Quorr Casco-Estelar | 🛡️ Tanque | Comum | físico | 2 / 10 | 🛡 Postura de Guarda, 💗 Regeneração |
| Aiko Flecha-Celeste *(já no jogo)* | 🏹 Arqueiro | Incomum | físico | 5 / 8 | 🎯 Longo Alcance, ➶ Flecha Dupla |
| Orun Arpão-Gélido | 🏹 Arqueiro | Incomum | físico | 5 / 8 | 🎯 Longo Alcance, ❄️ Congelamento |
| Thessa Espiral-Prateada | ⚔️ DPS | Incomum | físico | 5 / 10 | ↙ Golpe Reverso, 🐌 Lentidão |
| Velka Garra-de-Cometa | 💀 Assassino | Incomum | físico | 6 / 6 | 🔙 Golpe pelas Costas, 🩸 Sangramento |
| Zarek do Eclipse *(já no jogo)* | 💀 Assassino | Raro | físico | 10 / 13 | 🗡️ Emboscada, ♻ Renascer |
| Brakk Couraça-de-Meteoro | 🛡️ Tanque | Raro | físico | 5 / 28 | 🌵 Couraça de Espinhos, 🗯️ Provocar |
| Ilun Olho-Cósmico | 🪄 Mago | Raro | mágico | 8 / 10 | 🎯 Longo Alcance, 🕯️ Maldição |
| Kryx Lâmina-Nebulosa | ⚔️ DPS | Raro | físico | 8 / 15 | ↗ Corte Diagonal, 🎯 Golpe Crítico |
| Aurel Farol-Celeste | ➕ Suporte | Épico | mágico | 8 / 25 | 🎯 Longo Alcance, 🍃 Sopro Restaurador, 🔰 Escudo de Entrada |
| Morv Coração-de-Gelo | 🪄 Mago | Épico | mágico | 12 / 16 | 🎯 Longo Alcance, ❄️ Congelamento, 🔰 Barreira Arcana |
| Zynna Portal-Errante | 💀 Assassino | Épico | físico | 16 / 16 | 🌀 Teleporte, 🎯 Golpe Crítico |
| Gorm Titã-Orbital | 🛡️ Tanque | Lendário | físico | 13 / 79 | 🛡️ Protetor, ⛰ Inabalável, 💗 Regeneração |
| Lunaris Arqueira-do-Vácuo | 🏹 Arqueiro | Lendário | físico | 20 / 33 | 🎯 Longo Alcance, 🦅 Olho de Águia, 🐌 Lentidão |
| Sylith Tecelã-de-Luz | ➕ Suporte | Lendário | mágico | 13 / 39 | 📯 Grito de Guerra, 🌿 Purificar, 🔰 Escudo de Entrada |
| Vexar Rei-das-Marés | ⚔️ DPS | Lendário | físico | 20 / 46 | 📈 Fúria, 🩸 Sangramento, ↗ Corte Diagonal |
| Nhyra Fantasma-Estelar | 💀 Assassino | Mítico | físico | 42 / 42 | 💨 Evasão, 🔙 Golpe pelas Costas |

### Fichas

#### Nara Lâmina-Lunar *(já no jogo)*
- **Grupo:** ⚔️ DPS · **Raridade:** Comum → até Épico++ · **Dano:** físico · **Espera:** 2 rodada(s) na mão
- **Ataque:** 👊 Frente: corpo a corpo, o inimigo logo à frente · ↗ Diagonal: também corta a diagonal à frente
- **Ao chegar (Comum):** ⚔ 3 de ataque · ❤ 6 de vida
- **Habilidades:**
  - ↗ Corte Diagonal: Também ataca o inimigo na diagonal logo à frente (outra fileira, 1 coluna adiante).
- **História:** Guerreira extraterrestre das luas prateadas; sua lâmina curva de plasma corta em arcos quem tenta flanquear.
- **Aparência:** Já tem arte no jogo.

<details><summary>Ataque e vida em cada degrau</summary>

| Raridade | Base | + | ++ |
|---|---|---|---|
| Comum | ⚔ 3 · ❤ 6 | ⚔ 4 · ❤ 7 | ⚔ 4 · ❤ 8 |
| Incomum | ⚔ 5 · ❤ 10 | ⚔ 6 · ❤ 11 | ⚔ 7 · ❤ 13 |
| Raro | ⚔ 8 · ❤ 15 | ⚔ 9 · ❤ 18 | ⚔ 11 · ❤ 21 |
| Épico | ⚔ 12 · ❤ 25 | ⚔ 14 · ❤ 29 | ⚔ 17 · ❤ 34 |

</details>

#### Suri Maré-Gélida *(já no jogo)*
- **Grupo:** 🪄 Mago · **Raridade:** Comum → até Épico++ · **Dano:** mágico · **Espera:** 2 rodada(s) na mão
- **Ataque:** 🎯 Longe: o inimigo mais próximo até 4 casas à frente na fileira
- **Ao chegar (Comum):** ⚔ 2 de ataque · ❤ 5 de vida
- **Habilidades:**
  - 🎯 Longo Alcance: Ataca o inimigo mais próximo até 4 casas à frente na sua fileira (inclusive o Comandante). Não avança quando consegue atacar.
  - 🌊 Maré Implacável: Causa dano extra ao atacar o Comandante inimigo.
- **História:** Habitante dos oceanos congelados de Europa: invoca lanças e marés criogênicas que quebram as defesas do Comandante inimigo.
- **Aparência:** Já tem arte no jogo.

<details><summary>Ataque e vida em cada degrau</summary>

| Raridade | Base | + | ++ |
|---|---|---|---|
| Comum | ⚔ 2 · ❤ 5 | ⚔ 2 · ❤ 6 | ⚔ 3 · ❤ 7 |
| Incomum | ⚔ 3 · ❤ 8 | ⚔ 4 · ❤ 9 | ⚔ 4 · ❤ 11 |
| Raro | ⚔ 5 · ❤ 13 | ⚔ 6 · ❤ 15 | ⚔ 7 · ❤ 18 |
| Épico | ⚔ 8 · ❤ 21 | ⚔ 10 · ❤ 24 | ⚔ 11 · ❤ 28 |

</details>

#### Pip Faísca-Lunar
- **Grupo:** ➕ Suporte · **Raridade:** Comum → até Épico++ · **Dano:** mágico · **Espera:** 2 rodada(s) na mão
- **Ataque:** 🎯 Longe: o inimigo mais próximo até 4 casas à frente na fileira
- **Ao chegar (Comum):** ⚔ 1 de ataque · ❤ 5 de vida
- **Habilidades:**
  - 🎯 Longo Alcance: Ataca o inimigo mais próximo até 4 casas à frente na sua fileira (inclusive o Comandante). Não avança quando consegue atacar.
  - 🌿 Purificar: No início da sua ação, tira um efeito ruim (veneno, queimadura, sangramento, congelamento, atordoamento, lentidão ou maldição) do aliado vizinho mais afetado.
- **História:** Pequeno visitante da lua que limpa feitiços ruins com faíscas.
- **Aparência:** Alienígena pequeno e redondo, pele lilás, antenas com bolinhas brilhantes, sorriso.

<details><summary>Ataque e vida em cada degrau</summary>

| Raridade | Base | + | ++ |
|---|---|---|---|
| Comum | ⚔ 1 · ❤ 5 | ⚔ 1 · ❤ 6 | ⚔ 1 · ❤ 7 |
| Incomum | ⚔ 2 · ❤ 8 | ⚔ 2 · ❤ 9 | ⚔ 2 · ❤ 11 |
| Raro | ⚔ 3 · ❤ 13 | ⚔ 3 · ❤ 15 | ⚔ 4 · ❤ 18 |
| Épico | ⚔ 4 · ❤ 21 | ⚔ 5 · ❤ 24 | ⚔ 6 · ❤ 28 |

</details>

#### Quorr Casco-Estelar
- **Grupo:** 🛡️ Tanque · **Raridade:** Comum → até Épico++ · **Dano:** físico · **Espera:** 3 rodada(s) na mão
- **Ataque:** 👊 Frente: corpo a corpo, o inimigo logo à frente
- **Ao chegar (Comum):** ⚔ 2 de ataque · ❤ 10 de vida
- **Habilidades:**
  - 🛡 Postura de Guarda: Resistência física: reduz o dano de cada golpe físico (v0.17.0: a resistência é habilidade, não status de toda carta).
  - 💗 Regeneração: No fim de cada turno, recupera 1 de vida (2 a partir do Épico).
- **História:** Alienígena de carapaça que se regenera como coral.
- **Aparência:** Criatura de casco azul-acinzentado, olhos grandes amarelos, braços grossos como pinças.

<details><summary>Ataque e vida em cada degrau</summary>

| Raridade | Base | + | ++ |
|---|---|---|---|
| Comum | ⚔ 2 · ❤ 10 | ⚔ 2 · ❤ 12 | ⚔ 3 · ❤ 14 |
| Incomum | ⚔ 3 · ❤ 16 | ⚔ 4 · ❤ 19 | ⚔ 4 · ❤ 22 |
| Raro | ⚔ 5 · ❤ 26 | ⚔ 6 · ❤ 30 | ⚔ 7 · ❤ 35 |
| Épico | ⚔ 8 · ❤ 41 | ⚔ 10 · ❤ 48 | ⚔ 11 · ❤ 56 |

</details>

#### Aiko Flecha-Celeste *(já no jogo)*
- **Grupo:** 🏹 Arqueiro · **Raridade:** Incomum → até Épico++ · **Dano:** físico · **Espera:** 3 rodada(s) na mão
- **Ataque:** 🎯 Longe: o inimigo mais próximo até 4 casas à frente na fileira
- **Ao chegar (Incomum):** ⚔ 5 de ataque · ❤ 8 de vida
- **Habilidades:**
  - 🎯 Longo Alcance: Ataca o inimigo mais próximo até 4 casas à frente na sua fileira (inclusive o Comandante). Não avança quando consegue atacar.
  - ➶ Flecha Dupla: Dispara uma segunda flecha no mesmo alvo.
- **História:** Sentinela estelar de órbita alta que dispara flechas duplas de fótons capazes de cruzar metade da arena.
- **Aparência:** Já tem arte no jogo.

<details><summary>Ataque e vida em cada degrau</summary>

| Raridade | Base | + | ++ |
|---|---|---|---|
| Incomum | ⚔ 5 · ❤ 8 | ⚔ 6 · ❤ 9 | ⚔ 7 · ❤ 11 |
| Raro | ⚔ 8 · ❤ 13 | ⚔ 9 · ❤ 15 | ⚔ 11 · ❤ 18 |
| Épico | ⚔ 12 · ❤ 21 | ⚔ 14 · ❤ 24 | ⚔ 17 · ❤ 28 |

</details>

#### Orun Arpão-Gélido
- **Grupo:** 🏹 Arqueiro · **Raridade:** Incomum → até Épico++ · **Dano:** físico · **Espera:** 3 rodada(s) na mão
- **Ataque:** 🎯 Longe: o inimigo mais próximo até 4 casas à frente na fileira
- **Ao chegar (Incomum):** ⚔ 5 de ataque · ❤ 8 de vida
- **Habilidades:**
  - 🎯 Longo Alcance: Ataca o inimigo mais próximo até 4 casas à frente na sua fileira (inclusive o Comandante). Não avança quando consegue atacar.
  - ❄️ Congelamento: Ao acertar, 50% de chance de congelar o alvo: ele não ataca no próximo turno (ainda pode andar). Não congela o mesmo alvo duas vezes seguidas.
- **História:** Pescador de um planeta gelado que dispara arpões que congelam.
- **Aparência:** Alienígena de pele azul-clara, roupa de pele branca, arpão-besta com ponta de gelo.

<details><summary>Ataque e vida em cada degrau</summary>

| Raridade | Base | + | ++ |
|---|---|---|---|
| Incomum | ⚔ 5 · ❤ 8 | ⚔ 6 · ❤ 9 | ⚔ 7 · ❤ 11 |
| Raro | ⚔ 8 · ❤ 13 | ⚔ 9 · ❤ 15 | ⚔ 11 · ❤ 18 |
| Épico | ⚔ 12 · ❤ 21 | ⚔ 14 · ❤ 24 | ⚔ 17 · ❤ 28 |

</details>

#### Thessa Espiral-Prateada
- **Grupo:** ⚔️ DPS · **Raridade:** Incomum → até Épico++ · **Dano:** físico · **Espera:** 3 rodada(s) na mão
- **Ataque:** 👊 Frente: corpo a corpo, o inimigo logo à frente · ↘ Diagonal: prioriza a diagonal logo atrás
- **Ao chegar (Incomum):** ⚔ 5 de ataque · ❤ 10 de vida
- **Habilidades:**
  - ↙ Golpe Reverso: Prioriza o inimigo na diagonal logo atrás (pega quem passou por ele na outra fileira).
  - 🐌 Lentidão: O alvo fica lento por 2 turnos: anda só 1 casa e perde o ataque no primeiro desses turnos.
- **História:** Guerreira que gira e acerta quem tenta escapar por trás.
- **Aparência:** Mulher alienígena alta de pele prateada, cabelo em espiral, chicote de energia.

<details><summary>Ataque e vida em cada degrau</summary>

| Raridade | Base | + | ++ |
|---|---|---|---|
| Incomum | ⚔ 5 · ❤ 10 | ⚔ 6 · ❤ 11 | ⚔ 7 · ❤ 13 |
| Raro | ⚔ 8 · ❤ 15 | ⚔ 9 · ❤ 18 | ⚔ 11 · ❤ 21 |
| Épico | ⚔ 12 · ❤ 25 | ⚔ 14 · ❤ 29 | ⚔ 17 · ❤ 34 |

</details>

#### Velka Garra-de-Cometa
- **Grupo:** 💀 Assassino · **Raridade:** Incomum → até Épico++ · **Dano:** físico · **Espera:** 3 rodada(s) na mão
- **Ataque:** 👊 Frente: corpo a corpo, o inimigo logo à frente · 🔙 Costas: quem já passou por ele na fileira
- **Ao chegar (Incomum):** ⚔ 6 de ataque · ❤ 6 de vida
- **Habilidades:**
  - 🔙 Golpe pelas Costas: Ataca primeiro o inimigo que já passou por ele na mesma fileira (atrás dele), com +1 de dano nesse golpe; se não houver, ataca à frente.
  - 🩸 Sangramento: Golpes físicos abrem feridas: o alvo perde 1 de vida por turno por 3 turnos, e mais 1 em cada turno em que andar.
- **História:** Caçadora que cai do céu atrás das linhas inimigas.
- **Aparência:** Felina alienígena de pelo prateado, garras de cristal, rastro de cometa nas costas.

<details><summary>Ataque e vida em cada degrau</summary>

| Raridade | Base | + | ++ |
|---|---|---|---|
| Incomum | ⚔ 6 · ❤ 6 | ⚔ 7 · ❤ 7 | ⚔ 9 · ❤ 9 |
| Raro | ⚔ 10 · ❤ 10 | ⚔ 12 · ❤ 12 | ⚔ 14 · ❤ 14 |
| Épico | ⚔ 16 · ❤ 16 | ⚔ 19 · ❤ 19 | ⚔ 22 · ❤ 22 |

</details>

#### Zarek do Eclipse *(já no jogo)*
- **Grupo:** 💀 Assassino · **Raridade:** Raro → até Lendário++ · **Dano:** físico · **Espera:** 4 rodada(s) na mão
- **Ataque:** 👊 Frente: corpo a corpo, o inimigo logo à frente · 🔙 Costas: o inimigo mais recuado até 2 casas
- **Ao chegar (Raro):** ⚔ 10 de ataque · ❤ 13 de vida
- **Habilidades:**
  - 🗡️ Emboscada: Ataca o inimigo mais distante da sua fileira até 2 casas à frente, ignorando parte da resistência.
  - ♻ Renascer *(única)*: Na primeira vez que cai, renasce na mesma casa com parte da vida (uma vez por partida). Não vai para a Necropolis.
- **História:** Mercenário alienígena do planeta Eclipse: rastreia alvos pelo visor tático e teleporta-se atrás das linhas inimigas.
- **Aparência:** Já tem arte no jogo.

<details><summary>Ataque e vida em cada degrau</summary>

| Raridade | Base | + | ++ |
|---|---|---|---|
| Raro | ⚔ 10 · ❤ 13 | ⚔ 12 · ❤ 15 | ⚔ 14 · ❤ 18 |
| Épico | ⚔ 16 · ❤ 21 | ⚔ 19 · ❤ 24 | ⚔ 22 · ❤ 28 |
| Lendário | ⚔ 26 · ❤ 33 | ⚔ 31 · ❤ 38 | ⚔ 36 · ❤ 45 |

</details>

#### Brakk Couraça-de-Meteoro
- **Grupo:** 🛡️ Tanque · **Raridade:** Raro → até Lendário++ · **Dano:** físico · **Espera:** 4 rodada(s) na mão
- **Ataque:** 👊 Frente: corpo a corpo, o inimigo logo à frente
- **Ao chegar (Raro):** ⚔ 5 de ataque · ❤ 28 de vida
- **Habilidades:**
  - 🌵 Couraça de Espinhos: Quem o ataca corpo a corpo de frente sofre dano fixo de volta (se ele sobreviver ao golpe). Couraça: resistência física 1.
  - 🗯️ Provocar: Os inimigos vizinhos são obrigados a atacá-lo, se puderem.
- **História:** Colosso de rocha espacial coberto de espinhos de meteoro.
- **Aparência:** Criatura de pedra marrom com cristais vermelhos saindo dos ombros, punhos enormes.

<details><summary>Ataque e vida em cada degrau</summary>

| Raridade | Base | + | ++ |
|---|---|---|---|
| Raro | ⚔ 5 · ❤ 28 | ⚔ 6 · ❤ 33 | ⚔ 7 · ❤ 39 |
| Épico | ⚔ 8 · ❤ 45 | ⚔ 10 · ❤ 53 | ⚔ 11 · ❤ 62 |
| Lendário | ⚔ 13 · ❤ 72 | ⚔ 15 · ❤ 85 | ⚔ 18 · ❤ 99 |

</details>

#### Ilun Olho-Cósmico
- **Grupo:** 🪄 Mago · **Raridade:** Raro → até Lendário++ · **Dano:** mágico · **Espera:** 4 rodada(s) na mão
- **Ataque:** 🎯 Longe: o inimigo mais próximo até 4 casas à frente na fileira
- **Ao chegar (Raro):** ⚔ 8 de ataque · ❤ 10 de vida
- **Habilidades:**
  - 🎯 Longo Alcance: Ataca o inimigo mais próximo até 4 casas à frente na sua fileira (inclusive o Comandante). Não avança quando consegue atacar.
  - 🕯️ Maldição: O alvo recebe +25% de dano de todas as fontes por 2 turnos.
- **História:** Vidente de três olhos que marca os inimigos para a queda.
- **Aparência:** Alienígena magro de manto azul estrelado, três olhos brilhantes na testa, cajado com orbe.

<details><summary>Ataque e vida em cada degrau</summary>

| Raridade | Base | + | ++ |
|---|---|---|---|
| Raro | ⚔ 8 · ❤ 10 | ⚔ 9 · ❤ 12 | ⚔ 11 · ❤ 14 |
| Épico | ⚔ 12 · ❤ 16 | ⚔ 14 · ❤ 19 | ⚔ 17 · ❤ 22 |
| Lendário | ⚔ 20 · ❤ 26 | ⚔ 23 · ❤ 31 | ⚔ 27 · ❤ 36 |

</details>

#### Kryx Lâmina-Nebulosa
- **Grupo:** ⚔️ DPS · **Raridade:** Raro → até Lendário++ · **Dano:** físico · **Espera:** 3 rodada(s) na mão
- **Ataque:** 👊 Frente: corpo a corpo, o inimigo logo à frente · ↗ Diagonal: também corta a diagonal à frente
- **Ao chegar (Raro):** ⚔ 8 de ataque · ❤ 15 de vida
- **Habilidades:**
  - ↗ Corte Diagonal: Também ataca o inimigo na diagonal logo à frente (outra fileira, 1 coluna adiante).
  - 🎯 Golpe Crítico: 25% de chance de causar o dobro de dano (30% no Lendário e no Mítico).
- **História:** Mercenário de nebulosa com espada que corta em diagonal.
- **Aparência:** Alienígena de quatro braços, pele roxa, espada curva de plasma rosa.

<details><summary>Ataque e vida em cada degrau</summary>

| Raridade | Base | + | ++ |
|---|---|---|---|
| Raro | ⚔ 8 · ❤ 15 | ⚔ 9 · ❤ 18 | ⚔ 11 · ❤ 21 |
| Épico | ⚔ 12 · ❤ 25 | ⚔ 14 · ❤ 29 | ⚔ 17 · ❤ 34 |
| Lendário | ⚔ 20 · ❤ 39 | ⚔ 23 · ❤ 46 | ⚔ 27 · ❤ 54 |

</details>

#### Aurel Farol-Celeste
- **Grupo:** ➕ Suporte · **Raridade:** Épico → até Mítico++ · **Dano:** mágico · **Espera:** 4 rodada(s) na mão
- **Ataque:** 🎯 Longe: o inimigo mais próximo até 4 casas à frente na fileira
- **Ao chegar (Épico):** ⚔ 8 de ataque · ❤ 25 de vida
- **Habilidades:**
  - 🎯 Longo Alcance: Ataca o inimigo mais próximo até 4 casas à frente na sua fileira (inclusive o Comandante). Não avança quando consegue atacar.
  - 🍃 Sopro Restaurador: No início da sua ação, cura o aliado mais ferido da própria fileira (qualquer distância).
  - 🔰 Escudo de Entrada: Entra em campo com um escudo que absorve 3 de dano (5 a partir do Épico).
- **História:** Guardião de uma estação de luz que protege quem chega ao campo.
- **Aparência:** Ser de pele dourada com halo de luz, armadura branca leve, lanterna flutuante.

<details><summary>Ataque e vida em cada degrau</summary>

| Raridade | Base | + | ++ |
|---|---|---|---|
| Épico | ⚔ 8 · ❤ 25 | ⚔ 10 · ❤ 29 | ⚔ 11 · ❤ 34 |
| Lendário | ⚔ 13 · ❤ 39 | ⚔ 15 · ❤ 46 | ⚔ 18 · ❤ 54 |
| Mítico | ⚔ 21 · ❤ 63 | ⚔ 25 · ❤ 74 | ⚔ 29 · ❤ 87 |

</details>

#### Morv Coração-de-Gelo
- **Grupo:** 🪄 Mago · **Raridade:** Épico → até Mítico++ · **Dano:** mágico · **Espera:** 4 rodada(s) na mão
- **Ataque:** 🎯 Longe: o inimigo mais próximo até 4 casas à frente na fileira
- **Ao chegar (Épico):** ⚔ 12 de ataque · ❤ 16 de vida
- **Habilidades:**
  - 🎯 Longo Alcance: Ataca o inimigo mais próximo até 4 casas à frente na sua fileira (inclusive o Comandante). Não avança quando consegue atacar.
  - ❄️ Congelamento: Ao acertar, 50% de chance de congelar o alvo: ele não ataca no próximo turno (ainda pode andar). Não congela o mesmo alvo duas vezes seguidas.
  - 🔰 Barreira Arcana: Resistência mágica: reduz o dano de cada golpe mágico.
- **História:** Sábio de um cometa congelado que transforma o ar em gelo.
- **Aparência:** Alienígena idoso de barba de cristais de gelo, manto azul-escuro, mãos soltando neve.

<details><summary>Ataque e vida em cada degrau</summary>

| Raridade | Base | + | ++ |
|---|---|---|---|
| Épico | ⚔ 12 · ❤ 16 | ⚔ 14 · ❤ 19 | ⚔ 17 · ❤ 22 |
| Lendário | ⚔ 20 · ❤ 26 | ⚔ 23 · ❤ 31 | ⚔ 27 · ❤ 36 |
| Mítico | ⚔ 32 · ❤ 42 | ⚔ 37 · ❤ 49 | ⚔ 43 · ❤ 58 |

</details>

#### Zynna Portal-Errante
- **Grupo:** 💀 Assassino · **Raridade:** Épico → até Mítico++ · **Dano:** físico · **Espera:** 4 rodada(s) na mão
- **Ataque:** 👊 Frente: corpo a corpo, o inimigo logo à frente · 🌀 Costas: 1× por partida aparece atrás do inimigo mais avançado
- **Ao chegar (Épico):** ⚔ 16 de ataque · ❤ 16 de vida
- **Habilidades:**
  - 🌀 Teleporte: Uma vez por partida, no início da ação, pula para a casa livre logo atrás do inimigo mais avançado da fileira e o ataca pelas costas (+1 de dano).
  - 🎯 Golpe Crítico: 25% de chance de causar o dobro de dano (30% no Lendário e no Mítico).
- **História:** Ladra que abre portais e aparece atrás do alvo.
- **Aparência:** Alienígena ágil de pele verde-água, capuz curto, adagas e um portal roxo atrás dela.

<details><summary>Ataque e vida em cada degrau</summary>

| Raridade | Base | + | ++ |
|---|---|---|---|
| Épico | ⚔ 16 · ❤ 16 | ⚔ 19 · ❤ 19 | ⚔ 22 · ❤ 22 |
| Lendário | ⚔ 26 · ❤ 26 | ⚔ 31 · ❤ 31 | ⚔ 36 · ❤ 36 |
| Mítico | ⚔ 42 · ❤ 42 | ⚔ 49 · ❤ 49 | ⚔ 58 · ❤ 58 |

</details>

#### Gorm Titã-Orbital
- **Grupo:** 🛡️ Tanque · **Raridade:** Lendário → até Mítico++ · **Dano:** físico · **Espera:** 5 rodada(s) na mão
- **Ataque:** 👊 Frente: corpo a corpo, o inimigo logo à frente
- **Ao chegar (Lendário):** ⚔ 13 de ataque · ❤ 79 de vida
- **Habilidades:**
  - 🛡️ Protetor: Recebe no lugar dos aliados vizinhos 30% do dano que eles sofreriam (40% a partir do Épico). É sempre um personagem de muita vida e pouco ataque.
  - ⛰ Inabalável: Não pode ser empurrado. Resistência física (e mágica no Épico).
  - 💗 Regeneração: No fim de cada turno, recupera 1 de vida (2 a partir do Épico).
- **História:** Gigante que já foi uma lua; protege os aliados com o próprio corpo.
- **Aparência:** Titã de pele cinza-lunar cheia de crateras, anel de asteroides girando em volta.

<details><summary>Ataque e vida em cada degrau</summary>

| Raridade | Base | + | ++ |
|---|---|---|---|
| Lendário | ⚔ 13 · ❤ 79 | ⚔ 15 · ❤ 92 | ⚔ 18 · ❤ 108 |
| Mítico | ⚔ 21 · ❤ 126 | ⚔ 25 · ❤ 148 | ⚔ 29 · ❤ 173 |

</details>

#### Lunaris Arqueira-do-Vácuo
- **Grupo:** 🏹 Arqueiro · **Raridade:** Lendário → até Mítico++ · **Dano:** físico · **Espera:** 5 rodada(s) na mão
- **Ataque:** 🎯 Longe: o inimigo mais próximo até 4 casas à frente na fileira
- **Ao chegar (Lendário):** ⚔ 20 de ataque · ❤ 33 de vida
- **Habilidades:**
  - 🎯 Longo Alcance: Ataca o inimigo mais próximo até 4 casas à frente na sua fileira (inclusive o Comandante). Não avança quando consegue atacar.
  - 🦅 Olho de Águia: Causa dano extra em unidades a 2 ou mais casas de distância (quanto mais longe, mais certeiro).
  - 🐌 Lentidão: O alvo fica lento por 2 turnos: anda só 1 casa e perde o ataque no primeiro desses turnos.
- **História:** Atiradora que acerta alvos a anos-luz de distância.
- **Aparência:** Alienígena esguia de pele azul-noite, visor prateado, arco feito de luz de estrelas.

<details><summary>Ataque e vida em cada degrau</summary>

| Raridade | Base | + | ++ |
|---|---|---|---|
| Lendário | ⚔ 20 · ❤ 33 | ⚔ 23 · ❤ 38 | ⚔ 27 · ❤ 45 |
| Mítico | ⚔ 32 · ❤ 53 | ⚔ 37 · ❤ 62 | ⚔ 43 · ❤ 72 |

</details>

#### Sylith Tecelã-de-Luz
- **Grupo:** ➕ Suporte · **Raridade:** Lendário → até Mítico++ · **Dano:** mágico · **Espera:** 5 rodada(s) na mão
- **Ataque:** 👊 Frente: corpo a corpo, o inimigo logo à frente
- **Ao chegar (Lendário):** ⚔ 13 de ataque · ❤ 39 de vida
- **Habilidades:**
  - 📯 Grito de Guerra: Enquanto estiver vivo, todos os aliados da MESMA FILEIRA ganham +1 de ataque (não soma com o Tambor de Guerra; teto de bônus 2).
  - 🌿 Purificar: No início da sua ação, tira um efeito ruim (veneno, queimadura, sangramento, congelamento, atordoamento, lentidão ou maldição) do aliado vizinho mais afetado.
  - 🔰 Escudo de Entrada: Entra em campo com um escudo que absorve 3 de dano (5 a partir do Épico).
- **História:** Rainha de uma colmeia de luz que fortalece toda a fileira.
- **Aparência:** Alienígena com asas translúcidas de inseto, vestido de luz, coroa de antenas.

<details><summary>Ataque e vida em cada degrau</summary>

| Raridade | Base | + | ++ |
|---|---|---|---|
| Lendário | ⚔ 13 · ❤ 39 | ⚔ 15 · ❤ 46 | ⚔ 18 · ❤ 54 |
| Mítico | ⚔ 21 · ❤ 63 | ⚔ 25 · ❤ 74 | ⚔ 29 · ❤ 87 |

</details>

#### Vexar Rei-das-Marés
- **Grupo:** ⚔️ DPS · **Raridade:** Lendário → até Mítico++ · **Dano:** físico · **Espera:** 5 rodada(s) na mão
- **Ataque:** 👊 Frente: corpo a corpo, o inimigo logo à frente · ↗ Diagonal: também corta a diagonal à frente
- **Ao chegar (Lendário):** ⚔ 20 de ataque · ❤ 46 de vida
- **Habilidades:**
  - 📈 Fúria: Ganha +1 de ataque a cada inimigo derrotado (por qualquer aliado), até +3.
  - 🩸 Sangramento: Golpes físicos abrem feridas: o alvo perde 1 de vida por turno por 3 turnos, e mais 1 em cada turno em que andar.
  - ↗ Corte Diagonal: Também ataca o inimigo na diagonal logo à frente (outra fileira, 1 coluna adiante).
- **História:** Soberano de um oceano alienígena que fica mais feroz a cada vitória.
- **Aparência:** Alienígena aquático de escamas azul-esverdeadas, coroa de coral, tridente.

<details><summary>Ataque e vida em cada degrau</summary>

| Raridade | Base | + | ++ |
|---|---|---|---|
| Lendário | ⚔ 20 · ❤ 46 | ⚔ 23 · ❤ 54 | ⚔ 27 · ❤ 63 |
| Mítico | ⚔ 32 · ❤ 74 | ⚔ 37 · ❤ 86 | ⚔ 43 · ❤ 101 |

</details>

#### Nhyra Fantasma-Estelar
- **Grupo:** 💀 Assassino · **Raridade:** Mítico → até Mítico++ · **Dano:** físico · **Espera:** 6 rodada(s) na mão
- **Ataque:** 👊 Frente: corpo a corpo, o inimigo logo à frente · 🔙 Costas: quem já passou por ele na fileira
- **Ao chegar (Mítico):** ⚔ 42 de ataque · ❤ 42 de vida
- **Habilidades:**
  - 💨 Evasão *(única)*: Desvia de TODOS os ataques à distância (longo alcance, flechas e feitiços de 1 alvo). Se estiver congelado, atordoado ou lento, é atingido normalmente.
  - 🔙 Golpe pelas Costas: Ataca primeiro o inimigo que já passou por ele na mesma fileira (atrás dele), com +1 de dano nesse golpe; se não houver, ataca à frente.
- **História:** Assassina feita de poeira de estrelas: flechas e feitiços atravessam o corpo dela.
- **Aparência:** Figura translúcida azul e branca, corpo de poeira estelar, lâminas de luz, olhos sem pupila.

<details><summary>Ataque e vida em cada degrau</summary>

| Raridade | Base | + | ++ |
|---|---|---|---|
| Mítico | ⚔ 42 · ❤ 42 | ⚔ 49 · ❤ 49 | ⚔ 58 · ❤ 58 |

</details>

## 👹 Monstro

> Colossos, feras místicas e titãs de força bruta ancestral.

| Carta | Grupo | Raridade | Ataque | ⚔ / ❤ ao chegar | Habilidades |
|---|---|---|---|---|---|
| Daichi Punho-de-Rocha *(já no jogo)* | 🛡️ Tanque | Comum | físico | 2 / 9 | 🌵 Couraça de Espinhos |
| Kuro Garra-Noturna *(já no jogo)* | 💀 Assassino | Comum | físico | 3 / 5 | 🐾 Ataque Surpresa |
| Tobi Tambor-de-Guerra *(já no jogo)* | ➕ Suporte | Comum | físico | 2 / 7 | 🥁 Tambor de Guerra |
| Grub Presa-Lamacenta | ⚔️ DPS | Comum | físico | 3 / 6 | ↙ Golpe Reverso, 🩸 Sangramento |
| Gorath Muralha-de-Ferro *(já no jogo)* | 🛡️ Tanque | Incomum | físico | 3 / 19 | ⛰ Inabalável, 💢 Ombrada |
| Bufo Sapo-Ácido | 🪄 Mago | Incomum | mágico | 5 / 8 | 🎯 Longo Alcance, 🧪 Veneno |
| Skarr Escorpião-de-Areia | 💀 Assassino | Incomum | físico | 6 / 6 | 🗡️ Emboscada, 🧪 Veneno |
| Trokk Chifre-Partido | ⚔️ DPS | Incomum | físico | 5 / 11 | ↗ Corte Diagonal, 💢 Ombrada |
| Fenra Loba-Uivante | ➕ Suporte | Raro | físico | 5 / 18 | 📯 Grito de Guerra, 💗 Regeneração |
| Ghul Devora-Ossos | ⚔️ DPS | Raro | físico | 8 / 18 | 🧛 Vampirismo, 📈 Fúria |
| Mag'ra Colosso-de-Lava | 🛡️ Tanque | Raro | físico | 5 / 28 | 💥 Explosão, 🗯️ Provocar, 🛡 Postura de Guarda |
| Spindra Aranha-Tecelã | 🏹 Arqueiro | Raro | físico | 8 / 13 | 🎯 Longo Alcance, 🐌 Lentidão, 🧪 Veneno |
| Borgo Tronco-Antigo | 🛡️ Tanque | Épico | físico | 8 / 49 | 💗 Regeneração, 🌵 Couraça de Espinhos, 🗯️ Provocar |
| Krag Javali-de-Guerra | ⚔️ DPS | Épico | físico | 12 / 29 | 🐎 Investida, 💢 Ombrada, 🎯 Golpe Crítico |
| Ysmera Serpente-Abissal | 💀 Assassino | Épico | físico | 16 / 21 | 🔙 Golpe pelas Costas, 🧪 Veneno |
| Grendar Pai-da-Ninhada | 🛡️ Tanque | Lendário | físico | 13 / 79 | 🗯️ Provocar, 🛡️ Protetor, 💥 Explosão, 🛡 Postura de Guarda |
| Oculus Olho-Medonho | 🪄 Mago | Lendário | mágico | 20 / 33 | 🎯 Longo Alcance, 🕯️ Maldição, 🐌 Lentidão |
| Rhazor Rei-das-Feras | ⚔️ DPS | Lendário | físico | 20 / 46 | 📈 Fúria, 🩸 Sangramento, 🎯 Golpe Crítico |
| Kolossus Couraça-Viva | 🛡️ Tanque | Mítico | físico | 21 / 105 | 🛡️ Couraça Adaptativa, 🗯️ Provocar |
| Vharga Ceifadora-Voraz | 💀 Assassino | Mítico | físico | 42 / 42 | ☠️ Execução, 🩸 Instinto Predador |

### Fichas

#### Daichi Punho-de-Rocha *(já no jogo)*
- **Grupo:** 🛡️ Tanque · **Raridade:** Comum → até Épico++ · **Dano:** físico · **Espera:** 3 rodada(s) na mão
- **Ataque:** 👊 Frente: corpo a corpo, o inimigo logo à frente
- **Ao chegar (Comum):** ⚔ 2 de ataque · ❤ 9 de vida
- **Habilidades:**
  - 🌵 Couraça de Espinhos: Quem o ataca corpo a corpo de frente sofre dano fixo de volta (se ele sobreviver ao golpe). Couraça: resistência física 1.
- **História:** Titã monstruoso de rocha viva e magma que veste uma carapaça de espinhos minerais. Quem o golpeia sangra junto.
- **Aparência:** Já tem arte no jogo.

<details><summary>Ataque e vida em cada degrau</summary>

| Raridade | Base | + | ++ |
|---|---|---|---|
| Comum | ⚔ 2 · ❤ 9 | ⚔ 2 · ❤ 11 | ⚔ 3 · ❤ 12 |
| Incomum | ⚔ 3 · ❤ 14 | ⚔ 4 · ❤ 17 | ⚔ 4 · ❤ 20 |
| Raro | ⚔ 5 · ❤ 23 | ⚔ 6 · ❤ 27 | ⚔ 7 · ❤ 32 |
| Épico | ⚔ 8 · ❤ 37 | ⚔ 10 · ❤ 43 | ⚔ 11 · ❤ 51 |

</details>

#### Kuro Garra-Noturna *(já no jogo)*
- **Grupo:** 💀 Assassino · **Raridade:** Comum → até Épico++ · **Dano:** físico · **Espera:** 3 rodada(s) na mão
- **Ataque:** 👊 Frente: corpo a corpo, o inimigo logo à frente · 🎯 Mira o inimigo de maior ataque até 2 casas
- **Ao chegar (Comum):** ⚔ 3 de ataque · ❤ 5 de vida
- **Habilidades:**
  - 🐾 Ataque Surpresa: Mira o inimigo de maior ataque da sua fileira até 2 casas à frente e causa dano extra em quem ainda está com a vida cheia.
- **História:** Homem-fera felino da noite eterna: salta das sombras com garras de Ki púrpura sobre o inimigo mais perigoso.
- **Aparência:** Já tem arte no jogo.

<details><summary>Ataque e vida em cada degrau</summary>

| Raridade | Base | + | ++ |
|---|---|---|---|
| Comum | ⚔ 3 · ❤ 5 | ⚔ 4 · ❤ 6 | ⚔ 4 · ❤ 7 |
| Incomum | ⚔ 5 · ❤ 8 | ⚔ 6 · ❤ 9 | ⚔ 7 · ❤ 11 |
| Raro | ⚔ 8 · ❤ 13 | ⚔ 9 · ❤ 15 | ⚔ 11 · ❤ 18 |
| Épico | ⚔ 12 · ❤ 21 | ⚔ 14 · ❤ 24 | ⚔ 17 · ❤ 28 |

</details>

#### Tobi Tambor-de-Guerra *(já no jogo)*
- **Grupo:** ➕ Suporte · **Raridade:** Comum → até Épico++ · **Dano:** físico · **Espera:** 3 rodada(s) na mão
- **Ataque:** 👊 Frente: corpo a corpo, o inimigo logo à frente
- **Ao chegar (Comum):** ⚔ 2 de ataque · ❤ 7 de vida
- **Habilidades:**
  - 🥁 Tambor de Guerra: Enquanto estiver em campo, os aliados vizinhos (inclusive diagonais e a outra fileira) ganham ataque. Vários tambores não se somam.
- **História:** Guerreiro Oni cujo tambor trovão faz o sangue e o Ki dos aliados vizinhos ferverem em combate.
- **Aparência:** Já tem arte no jogo.

<details><summary>Ataque e vida em cada degrau</summary>

| Raridade | Base | + | ++ |
|---|---|---|---|
| Comum | ⚔ 2 · ❤ 7 | ⚔ 2 · ❤ 8 | ⚔ 3 · ❤ 10 |
| Incomum | ⚔ 3 · ❤ 11 | ⚔ 4 · ❤ 13 | ⚔ 4 · ❤ 15 |
| Raro | ⚔ 5 · ❤ 18 | ⚔ 6 · ❤ 21 | ⚔ 7 · ❤ 25 |
| Épico | ⚔ 8 · ❤ 29 | ⚔ 10 · ❤ 34 | ⚔ 11 · ❤ 39 |

</details>

#### Grub Presa-Lamacenta
- **Grupo:** ⚔️ DPS · **Raridade:** Comum → até Épico++ · **Dano:** físico · **Espera:** 2 rodada(s) na mão
- **Ataque:** 👊 Frente: corpo a corpo, o inimigo logo à frente · ↘ Diagonal: prioriza a diagonal logo atrás
- **Ao chegar (Comum):** ⚔ 3 de ataque · ❤ 6 de vida
- **Habilidades:**
  - ↙ Golpe Reverso: Prioriza o inimigo na diagonal logo atrás (pega quem passou por ele na outra fileira).
  - 🩸 Sangramento: Golpes físicos abrem feridas: o alvo perde 1 de vida por turno por 3 turnos, e mais 1 em cada turno em que andar.
- **História:** Fera do pântano que morde de lado quem tenta passar por ela, deixando feridas abertas.
- **Aparência:** Monstrinho verde-lama de presas grandes, olhos amarelos, garras sujas.

<details><summary>Ataque e vida em cada degrau</summary>

| Raridade | Base | + | ++ |
|---|---|---|---|
| Comum | ⚔ 3 · ❤ 6 | ⚔ 4 · ❤ 7 | ⚔ 4 · ❤ 8 |
| Incomum | ⚔ 5 · ❤ 10 | ⚔ 6 · ❤ 11 | ⚔ 7 · ❤ 13 |
| Raro | ⚔ 8 · ❤ 15 | ⚔ 9 · ❤ 18 | ⚔ 11 · ❤ 21 |
| Épico | ⚔ 12 · ❤ 25 | ⚔ 14 · ❤ 29 | ⚔ 17 · ❤ 34 |

</details>

#### Gorath Muralha-de-Ferro *(já no jogo)*
- **Grupo:** 🛡️ Tanque · **Raridade:** Incomum → até Épico++ · **Dano:** físico · **Espera:** 4 rodada(s) na mão
- **Ataque:** 👊 Frente: corpo a corpo, o inimigo logo à frente
- **Ao chegar (Incomum):** ⚔ 3 de ataque · ❤ 19 de vida
- **Habilidades:**
  - ⛰ Inabalável: Não pode ser empurrado. Resistência física (e mágica no Épico).
  - 💢 Ombrada: Ao acertar um inimigo corpo a corpo de frente, empurra o alvo 1 casa para trás (se a casa estiver livre).
- **História:** Behemoth monstruoso de couraça metálica e presas de titânio: golpes físicos mal arranham sua carapaça.
- **Aparência:** Já tem arte no jogo.

<details><summary>Ataque e vida em cada degrau</summary>

| Raridade | Base | + | ++ |
|---|---|---|---|
| Incomum | ⚔ 3 · ❤ 19 | ⚔ 4 · ❤ 22 | ⚔ 4 · ❤ 26 |
| Raro | ⚔ 5 · ❤ 31 | ⚔ 6 · ❤ 36 | ⚔ 7 · ❤ 42 |
| Épico | ⚔ 8 · ❤ 49 | ⚔ 10 · ❤ 58 | ⚔ 11 · ❤ 67 |

</details>

#### Bufo Sapo-Ácido
- **Grupo:** 🪄 Mago · **Raridade:** Incomum → até Épico++ · **Dano:** mágico · **Espera:** 3 rodada(s) na mão
- **Ataque:** 🎯 Longe: o inimigo mais próximo até 4 casas à frente na fileira
- **Ao chegar (Incomum):** ⚔ 5 de ataque · ❤ 8 de vida
- **Habilidades:**
  - 🎯 Longo Alcance: Ataca o inimigo mais próximo até 4 casas à frente na sua fileira (inclusive o Comandante). Não avança quando consegue atacar.
  - 🧪 Veneno: O alvo fica envenenado: perde 1 de vida no fim de cada turno dele por 3 turnos (2 de vida por turno a partir do Épico). Não acumula; um novo golpe renova.
- **História:** Sapo gordo que cospe ácido venenoso de longe.
- **Aparência:** Sapo enorme verde-limão com manchas roxas, bochechas inchadas, baba ácida.

<details><summary>Ataque e vida em cada degrau</summary>

| Raridade | Base | + | ++ |
|---|---|---|---|
| Incomum | ⚔ 5 · ❤ 8 | ⚔ 6 · ❤ 9 | ⚔ 7 · ❤ 11 |
| Raro | ⚔ 8 · ❤ 13 | ⚔ 9 · ❤ 15 | ⚔ 11 · ❤ 18 |
| Épico | ⚔ 12 · ❤ 21 | ⚔ 14 · ❤ 24 | ⚔ 17 · ❤ 28 |

</details>

#### Skarr Escorpião-de-Areia
- **Grupo:** 💀 Assassino · **Raridade:** Incomum → até Épico++ · **Dano:** físico · **Espera:** 3 rodada(s) na mão
- **Ataque:** 👊 Frente: corpo a corpo, o inimigo logo à frente · 🔙 Costas: o inimigo mais recuado até 2 casas
- **Ao chegar (Incomum):** ⚔ 6 de ataque · ❤ 6 de vida
- **Habilidades:**
  - 🗡️ Emboscada: Ataca o inimigo mais distante da sua fileira até 2 casas à frente, ignorando parte da resistência.
  - 🧪 Veneno: O alvo fica envenenado: perde 1 de vida no fim de cada turno dele por 3 turnos (2 de vida por turno a partir do Épico). Não acumula; um novo golpe renova.
- **História:** Escorpião gigante que alcança com o ferrão os inimigos do fundo.
- **Aparência:** Escorpião bege-areia do tamanho de um cavalo, ferrão roxo pingando veneno.

<details><summary>Ataque e vida em cada degrau</summary>

| Raridade | Base | + | ++ |
|---|---|---|---|
| Incomum | ⚔ 6 · ❤ 6 | ⚔ 7 · ❤ 7 | ⚔ 9 · ❤ 9 |
| Raro | ⚔ 10 · ❤ 10 | ⚔ 12 · ❤ 12 | ⚔ 14 · ❤ 14 |
| Épico | ⚔ 16 · ❤ 16 | ⚔ 19 · ❤ 19 | ⚔ 22 · ❤ 22 |

</details>

#### Trokk Chifre-Partido
- **Grupo:** ⚔️ DPS · **Raridade:** Incomum → até Épico++ · **Dano:** físico · **Espera:** 3 rodada(s) na mão
- **Ataque:** 👊 Frente: corpo a corpo, o inimigo logo à frente · ↗ Diagonal: também corta a diagonal à frente
- **Ao chegar (Incomum):** ⚔ 5 de ataque · ❤ 11 de vida
- **Habilidades:**
  - ↗ Corte Diagonal: Também ataca o inimigo na diagonal logo à frente (outra fileira, 1 coluna adiante).
  - 💢 Ombrada: Ao acertar um inimigo corpo a corpo de frente, empurra o alvo 1 casa para trás (se a casa estiver livre).
- **História:** Minotauro jovem que derruba quem estiver na frente e nos lados.
- **Aparência:** Minotauro marrom com um chifre quebrado, machado curto, colete de couro.

<details><summary>Ataque e vida em cada degrau</summary>

| Raridade | Base | + | ++ |
|---|---|---|---|
| Incomum | ⚔ 5 · ❤ 11 | ⚔ 6 · ❤ 13 | ⚔ 7 · ❤ 15 |
| Raro | ⚔ 8 · ❤ 18 | ⚔ 9 · ❤ 21 | ⚔ 11 · ❤ 25 |
| Épico | ⚔ 12 · ❤ 29 | ⚔ 14 · ❤ 34 | ⚔ 17 · ❤ 39 |

</details>

#### Fenra Loba-Uivante
- **Grupo:** ➕ Suporte · **Raridade:** Raro → até Lendário++ · **Dano:** físico · **Espera:** 3 rodada(s) na mão
- **Ataque:** 👊 Frente: corpo a corpo, o inimigo logo à frente
- **Ao chegar (Raro):** ⚔ 5 de ataque · ❤ 18 de vida
- **Habilidades:**
  - 📯 Grito de Guerra: Enquanto estiver vivo, todos os aliados da MESMA FILEIRA ganham +1 de ataque (não soma com o Tambor de Guerra; teto de bônus 2).
  - 💗 Regeneração: No fim de cada turno, recupera 1 de vida (2 a partir do Épico).
- **História:** Loba alfa cujo uivo dá coragem a toda a matilha.
- **Aparência:** Loba cinza enorme com crina prateada, uivando para cima, marcas tribais azuis.

<details><summary>Ataque e vida em cada degrau</summary>

| Raridade | Base | + | ++ |
|---|---|---|---|
| Raro | ⚔ 5 · ❤ 18 | ⚔ 6 · ❤ 21 | ⚔ 7 · ❤ 25 |
| Épico | ⚔ 8 · ❤ 29 | ⚔ 10 · ❤ 34 | ⚔ 11 · ❤ 39 |
| Lendário | ⚔ 13 · ❤ 46 | ⚔ 15 · ❤ 54 | ⚔ 18 · ❤ 63 |

</details>

#### Ghul Devora-Ossos
- **Grupo:** ⚔️ DPS · **Raridade:** Raro → até Lendário++ · **Dano:** físico · **Espera:** 3 rodada(s) na mão
- **Ataque:** 👊 Frente: corpo a corpo, o inimigo logo à frente
- **Ao chegar (Raro):** ⚔ 8 de ataque · ❤ 18 de vida
- **Habilidades:**
  - 🧛 Vampirismo: Cura a si mesmo em 25% do dano que causa (30% no Raro, 35% no Lendário).
  - 📈 Fúria: Ganha +1 de ataque a cada inimigo derrotado (por qualquer aliado), até +3.
- **História:** Carniceiro das cavernas que se cura mordendo.
- **Aparência:** Criatura curvada de pele cinza, boca enorme de dentes, ossos pendurados como enfeite.

<details><summary>Ataque e vida em cada degrau</summary>

| Raridade | Base | + | ++ |
|---|---|---|---|
| Raro | ⚔ 8 · ❤ 18 | ⚔ 9 · ❤ 21 | ⚔ 11 · ❤ 25 |
| Épico | ⚔ 12 · ❤ 29 | ⚔ 14 · ❤ 34 | ⚔ 17 · ❤ 39 |
| Lendário | ⚔ 20 · ❤ 46 | ⚔ 23 · ❤ 54 | ⚔ 27 · ❤ 63 |

</details>

#### Mag'ra Colosso-de-Lava
- **Grupo:** 🛡️ Tanque · **Raridade:** Raro → até Lendário++ · **Dano:** físico · **Espera:** 4 rodada(s) na mão
- **Ataque:** 👊 Frente: corpo a corpo, o inimigo logo à frente
- **Ao chegar (Raro):** ⚔ 5 de ataque · ❤ 28 de vida
- **Habilidades:**
  - 💥 Explosão: Ao morrer, causa 2 de dano (3 a partir do Épico) em todos os inimigos vizinhos.
  - 🗯️ Provocar: Os inimigos vizinhos são obrigados a atacá-lo, se puderem.
  - 🛡 Postura de Guarda: Resistência física: reduz o dano de cada golpe físico (v0.17.0: a resistência é habilidade, não status de toda carta).
- **História:** Gigante de rocha derretida que explode quando cai.
- **Aparência:** Colosso de pedra preta com rachaduras de lava laranja, vapor saindo.

<details><summary>Ataque e vida em cada degrau</summary>

| Raridade | Base | + | ++ |
|---|---|---|---|
| Raro | ⚔ 5 · ❤ 28 | ⚔ 6 · ❤ 33 | ⚔ 7 · ❤ 39 |
| Épico | ⚔ 8 · ❤ 45 | ⚔ 10 · ❤ 53 | ⚔ 11 · ❤ 62 |
| Lendário | ⚔ 13 · ❤ 72 | ⚔ 15 · ❤ 85 | ⚔ 18 · ❤ 99 |

</details>

#### Spindra Aranha-Tecelã
- **Grupo:** 🏹 Arqueiro · **Raridade:** Raro → até Lendário++ · **Dano:** físico · **Espera:** 4 rodada(s) na mão
- **Ataque:** 🎯 Longe: o inimigo mais próximo até 4 casas à frente na fileira
- **Ao chegar (Raro):** ⚔ 8 de ataque · ❤ 13 de vida
- **Habilidades:**
  - 🎯 Longo Alcance: Ataca o inimigo mais próximo até 4 casas à frente na sua fileira (inclusive o Comandante). Não avança quando consegue atacar.
  - 🐌 Lentidão: O alvo fica lento por 2 turnos: anda só 1 casa e perde o ataque no primeiro desses turnos.
  - 🧪 Veneno: O alvo fica envenenado: perde 1 de vida no fim de cada turno dele por 3 turnos (2 de vida por turno a partir do Épico). Não acumula; um novo golpe renova.
- **História:** Aranha gigante que atira teias venenosas de longe.
- **Aparência:** Aranha roxa e preta de oito olhos vermelhos, teias brilhantes, abdômen listrado.

<details><summary>Ataque e vida em cada degrau</summary>

| Raridade | Base | + | ++ |
|---|---|---|---|
| Raro | ⚔ 8 · ❤ 13 | ⚔ 9 · ❤ 15 | ⚔ 11 · ❤ 18 |
| Épico | ⚔ 12 · ❤ 21 | ⚔ 14 · ❤ 24 | ⚔ 17 · ❤ 28 |
| Lendário | ⚔ 20 · ❤ 33 | ⚔ 23 · ❤ 38 | ⚔ 27 · ❤ 45 |

</details>

#### Borgo Tronco-Antigo
- **Grupo:** 🛡️ Tanque · **Raridade:** Épico → até Mítico++ · **Dano:** físico · **Espera:** 4 rodada(s) na mão
- **Ataque:** 👊 Frente: corpo a corpo, o inimigo logo à frente
- **Ao chegar (Épico):** ⚔ 8 de ataque · ❤ 49 de vida
- **Habilidades:**
  - 💗 Regeneração: No fim de cada turno, recupera 1 de vida (2 a partir do Épico).
  - 🌵 Couraça de Espinhos: Quem o ataca corpo a corpo de frente sofre dano fixo de volta (se ele sobreviver ao golpe). Couraça: resistência física 1.
  - 🗯️ Provocar: Os inimigos vizinhos são obrigados a atacá-lo, se puderem.
- **História:** Árvore viva de mil anos coberta de espinhos.
- **Aparência:** Ent de madeira escura com casca espinhosa, musgo nos ombros, olhos de seiva dourada.

<details><summary>Ataque e vida em cada degrau</summary>

| Raridade | Base | + | ++ |
|---|---|---|---|
| Épico | ⚔ 8 · ❤ 49 | ⚔ 10 · ❤ 58 | ⚔ 11 · ❤ 67 |
| Lendário | ⚔ 13 · ❤ 79 | ⚔ 15 · ❤ 92 | ⚔ 18 · ❤ 108 |
| Mítico | ⚔ 21 · ❤ 126 | ⚔ 25 · ❤ 148 | ⚔ 29 · ❤ 173 |

</details>

#### Krag Javali-de-Guerra
- **Grupo:** ⚔️ DPS · **Raridade:** Épico → até Mítico++ · **Dano:** físico · **Espera:** 4 rodada(s) na mão
- **Ataque:** 👊 Frente: corpo a corpo, o inimigo logo à frente
- **Ao chegar (Épico):** ⚔ 12 de ataque · ❤ 29 de vida
- **Habilidades:**
  - 🐎 Investida: Na primeira ação depois de entrar em campo, anda 2 casas a mais e o primeiro golpe causa +1 de dano.
  - 💢 Ombrada: Ao acertar um inimigo corpo a corpo de frente, empurra o alvo 1 casa para trás (se a casa estiver livre).
  - 🎯 Golpe Crítico: 25% de chance de causar o dobro de dano (30% no Lendário e no Mítico).
- **História:** Javali blindado que já entra no campo atropelando.
- **Aparência:** Javali gigante marrom com armadura de placas, presas de metal, olhos em brasa.

<details><summary>Ataque e vida em cada degrau</summary>

| Raridade | Base | + | ++ |
|---|---|---|---|
| Épico | ⚔ 12 · ❤ 29 | ⚔ 14 · ❤ 34 | ⚔ 17 · ❤ 39 |
| Lendário | ⚔ 20 · ❤ 46 | ⚔ 23 · ❤ 54 | ⚔ 27 · ❤ 63 |
| Mítico | ⚔ 32 · ❤ 74 | ⚔ 37 · ❤ 86 | ⚔ 43 · ❤ 101 |

</details>

#### Ysmera Serpente-Abissal
- **Grupo:** 💀 Assassino · **Raridade:** Épico → até Mítico++ · **Dano:** físico · **Espera:** 4 rodada(s) na mão
- **Ataque:** 👊 Frente: corpo a corpo, o inimigo logo à frente · 🔙 Costas: quem já passou por ele na fileira
- **Ao chegar (Épico):** ⚔ 16 de ataque · ❤ 21 de vida
- **Habilidades:**
  - 🔙 Golpe pelas Costas: Ataca primeiro o inimigo que já passou por ele na mesma fileira (atrás dele), com +1 de dano nesse golpe; se não houver, ataca à frente.
  - 🧪 Veneno: O alvo fica envenenado: perde 1 de vida no fim de cada turno dele por 3 turnos (2 de vida por turno a partir do Épico). Não acumula; um novo golpe renova.
- **História:** Serpente que desliza por trás das linhas e morde com veneno.
- **Aparência:** Serpente verde-escura com escamas douradas, capuz de naja, olhos verdes brilhantes.

<details><summary>Ataque e vida em cada degrau</summary>

| Raridade | Base | + | ++ |
|---|---|---|---|
| Épico | ⚔ 16 · ❤ 21 | ⚔ 19 · ❤ 24 | ⚔ 22 · ❤ 28 |
| Lendário | ⚔ 26 · ❤ 33 | ⚔ 31 · ❤ 38 | ⚔ 36 · ❤ 45 |
| Mítico | ⚔ 42 · ❤ 53 | ⚔ 49 · ❤ 62 | ⚔ 58 · ❤ 72 |

</details>

#### Grendar Pai-da-Ninhada
- **Grupo:** 🛡️ Tanque · **Raridade:** Lendário → até Mítico++ · **Dano:** físico · **Espera:** 5 rodada(s) na mão
- **Ataque:** 👊 Frente: corpo a corpo, o inimigo logo à frente
- **Ao chegar (Lendário):** ⚔ 13 de ataque · ❤ 79 de vida
- **Habilidades:**
  - 🗯️ Provocar: Os inimigos vizinhos são obrigados a atacá-lo, se puderem.
  - 🛡️ Protetor: Recebe no lugar dos aliados vizinhos 30% do dano que eles sofreriam (40% a partir do Épico). É sempre um personagem de muita vida e pouco ataque.
  - 💥 Explosão: Ao morrer, causa 2 de dano (3 a partir do Épico) em todos os inimigos vizinhos.
  - 🛡 Postura de Guarda: Resistência física: reduz o dano de cada golpe físico (v0.17.0: a resistência é habilidade, não status de toda carta).
- **História:** Monstro ancestral que protege os filhotes e explode ao cair.
- **Aparência:** Besta enorme de couro verde-oliva, ovos brilhando nas costas, braços como troncos.

<details><summary>Ataque e vida em cada degrau</summary>

| Raridade | Base | + | ++ |
|---|---|---|---|
| Lendário | ⚔ 13 · ❤ 79 | ⚔ 15 · ❤ 92 | ⚔ 18 · ❤ 108 |
| Mítico | ⚔ 21 · ❤ 126 | ⚔ 25 · ❤ 148 | ⚔ 29 · ❤ 173 |

</details>

#### Oculus Olho-Medonho
- **Grupo:** 🪄 Mago · **Raridade:** Lendário → até Mítico++ · **Dano:** mágico · **Espera:** 5 rodada(s) na mão
- **Ataque:** 🎯 Longe: o inimigo mais próximo até 4 casas à frente na fileira
- **Ao chegar (Lendário):** ⚔ 20 de ataque · ❤ 33 de vida
- **Habilidades:**
  - 🎯 Longo Alcance: Ataca o inimigo mais próximo até 4 casas à frente na sua fileira (inclusive o Comandante). Não avança quando consegue atacar.
  - 🕯️ Maldição: O alvo recebe +25% de dano de todas as fontes por 2 turnos.
  - 🐌 Lentidão: O alvo fica lento por 2 turnos: anda só 1 casa e perde o ataque no primeiro desses turnos.
- **História:** Olho flutuante que amaldiçoa e paralisa com o olhar.
- **Aparência:** Olho gigante flutuante com tentáculos, íris roxa, aura de névoa escura.

<details><summary>Ataque e vida em cada degrau</summary>

| Raridade | Base | + | ++ |
|---|---|---|---|
| Lendário | ⚔ 20 · ❤ 33 | ⚔ 23 · ❤ 38 | ⚔ 27 · ❤ 45 |
| Mítico | ⚔ 32 · ❤ 53 | ⚔ 37 · ❤ 62 | ⚔ 43 · ❤ 72 |

</details>

#### Rhazor Rei-das-Feras
- **Grupo:** ⚔️ DPS · **Raridade:** Lendário → até Mítico++ · **Dano:** físico · **Espera:** 5 rodada(s) na mão
- **Ataque:** 👊 Frente: corpo a corpo, o inimigo logo à frente
- **Ao chegar (Lendário):** ⚔ 20 de ataque · ❤ 46 de vida
- **Habilidades:**
  - 📈 Fúria: Ganha +1 de ataque a cada inimigo derrotado (por qualquer aliado), até +3.
  - 🩸 Sangramento: Golpes físicos abrem feridas: o alvo perde 1 de vida por turno por 3 turnos, e mais 1 em cada turno em que andar.
  - 🎯 Golpe Crítico: 25% de chance de causar o dobro de dano (30% no Lendário e no Mítico).
- **História:** Leão-rei que fica mais feroz a cada presa derrubada.
- **Aparência:** Leão humanoide de juba vermelha, garras douradas, cicatrizes, coroa de ossos.

<details><summary>Ataque e vida em cada degrau</summary>

| Raridade | Base | + | ++ |
|---|---|---|---|
| Lendário | ⚔ 20 · ❤ 46 | ⚔ 23 · ❤ 54 | ⚔ 27 · ❤ 63 |
| Mítico | ⚔ 32 · ❤ 74 | ⚔ 37 · ❤ 86 | ⚔ 43 · ❤ 101 |

</details>

#### Kolossus Couraça-Viva
- **Grupo:** 🛡️ Tanque · **Raridade:** Mítico → até Mítico++ · **Dano:** físico · **Espera:** 6 rodada(s) na mão
- **Ataque:** 👊 Frente: corpo a corpo, o inimigo logo à frente
- **Ao chegar (Mítico):** ⚔ 21 de ataque · ❤ 105 de vida
- **Habilidades:**
  - 🛡️ Couraça Adaptativa *(única)*: Começa com resistência física 1. Cada golpe físico recebido cura 1 de vida e soma +1 de resistência física (até 3).
  - 🗯️ Provocar: Os inimigos vizinhos são obrigados a atacá-lo, se puderem.
- **História:** Titã cuja carapaça endurece a cada golpe que recebe.
- **Aparência:** Titã de carapaça de besouro preta e dourada, placas se fechando, olhos verdes.

<details><summary>Ataque e vida em cada degrau</summary>

| Raridade | Base | + | ++ |
|---|---|---|---|
| Mítico | ⚔ 21 · ❤ 105 | ⚔ 25 · ❤ 123 | ⚔ 29 · ❤ 144 |

</details>

#### Vharga Ceifadora-Voraz
- **Grupo:** 💀 Assassino · **Raridade:** Mítico → até Mítico++ · **Dano:** físico · **Espera:** 6 rodada(s) na mão
- **Ataque:** 👊 Frente: corpo a corpo, o inimigo logo à frente · 🩸 Escolhe o inimigo com menos vida até 2 casas
- **Ao chegar (Mítico):** ⚔ 42 de ataque · ❤ 42 de vida
- **Habilidades:**
  - ☠️ Execução *(única)*: Derrota na hora o inimigo atingido (não o Comandante) se ele ficar com 25% da vida ou menos.
  - 🩸 Instinto Predador: Ataca o inimigo com menos vida da sua fileira até 2 casas à frente. Causa dano extra em alvos com metade da vida ou menos.
- **História:** Fera alada que termina com qualquer inimigo ferido.
- **Aparência:** Criatura alada de pele vermelho-escura, foices no lugar dos braços, asas rasgadas.

<details><summary>Ataque e vida em cada degrau</summary>

| Raridade | Base | + | ++ |
|---|---|---|---|
| Mítico | ⚔ 42 · ❤ 42 | ⚔ 49 · ❤ 49 | ⚔ 58 · ❤ 58 |

</details>

## 🔮 Mago Arcano

> Sábios e conjuradores que moldam os elementos e o éter.

| Carta | Grupo | Raridade | Ataque | ⚔ / ❤ ao chegar | Habilidades |
|---|---|---|---|---|---|
| Kael Chama-Rubra *(já no jogo)* | 🪄 Mago | Comum | mágico | 3 / 4 | 🎯 Longo Alcance, 💥 Explosão de Brasas |
| Sora Brisa-Serena *(já no jogo)* | ➕ Suporte | Comum | mágico | 1 / 5 | 🎯 Longo Alcance, 🍃 Sopro Restaurador |
| Bram Guardião-do-Tomo | 🛡️ Tanque | Comum | físico | 2 / 9 | 🔰 Barreira Arcana, 🗯️ Provocar |
| Fen Aprendiz-das-Brasas | 🪄 Mago | Comum | mágico | 3 / 4 | 🎯 Longo Alcance, 🔥 Queimadura |
| Lyra Olho-de-Falcão *(já no jogo)* | 🪄 Mago | Incomum | mágico | 5 / 6 | 🎯 Longo Alcance, ⇶ Feixe Perfurante, 🔰 Barreira Arcana |
| Mei Lótus-Celeste *(já no jogo)* | ➕ Suporte | Incomum | mágico | 3 / 8 | 🎯 Longo Alcance, ✚ Bênção do Lótus, 👼 Anjo da Guarda |
| Isel Bruma-Cortante | ⚔️ DPS | Incomum | mágico | 5 / 10 | ↗ Corte Diagonal, 🕯️ Maldição |
| Odo Sombra-de-Papel | 💀 Assassino | Incomum | mágico | 6 / 6 | 🗡️ Emboscada, 🐌 Lentidão |
| Celina Geada-Eterna | 🪄 Mago | Raro | mágico | 8 / 10 | 🎯 Longo Alcance, ❄️ Congelamento |
| Nalia Arco-Rúnico | 🏹 Arqueiro | Raro | físico | 8 / 13 | 🎯 Longo Alcance, 🦅 Olho de Águia |
| Tiberius Runa-Viva | ➕ Suporte | Raro | mágico | 5 / 15 | 🎯 Longo Alcance, 🌿 Purificar, 🔰 Escudo de Entrada |
| Varo Golem-de-Cristal | 🛡️ Tanque | Raro | físico | 5 / 28 | 🔰 Barreira Arcana, 💥 Explosão |
| Dorian Pena-Encantada | ➕ Suporte | Épico | mágico | 8 / 25 | 🎯 Longo Alcance, 🍃 Sopro Restaurador, 📯 Grito de Guerra |
| Kaela Lâmina-Espectral | 💀 Assassino | Épico | mágico | 16 / 16 | 🔙 Golpe pelas Costas, 🕯️ Maldição |
| Selene Lua-Arcana | 🪄 Mago | Épico | mágico | 12 / 16 | 🎯 Longo Alcance, 🔥 Queimadura, 🗡️ Perfurar |
| Corvin Lâmina-das-Runas | ⚔️ DPS | Lendário | mágico | 20 / 46 | ↙ Golpe Reverso, 📈 Fúria, 🗡️ Perfurar |
| Eldrin Arquimago-Solar | 🪄 Mago | Lendário | mágico | 20 / 26 | 🎯 Longo Alcance, 🔥 Queimadura, 🎯 Golpe Crítico |
| Morgause Espelho-Duplo | 🪄 Mago | Lendário | mágico | 20 / 26 | 🎯 Longo Alcance, 👥 Clone |
| Vesna Senhora-do-Inverno | ➕ Suporte | Lendário | mágico | 13 / 39 | 🎯 Longo Alcance, ❄️ Congelamento, 🐌 Lentidão |
| Aethra Tecelã-do-Trovão | 🪄 Mago | Mítico | mágico | 32 / 42 | 🎯 Longo Alcance, ⚡ Raio em Cadeia |

### Fichas

#### Kael Chama-Rubra *(já no jogo)*
- **Grupo:** 🪄 Mago · **Raridade:** Comum → até Épico++ · **Dano:** mágico · **Espera:** 3 rodada(s) na mão
- **Ataque:** 🎯 Longe: o inimigo mais próximo até 4 casas à frente na fileira
- **Ao chegar (Comum):** ⚔ 3 de ataque · ❤ 4 de vida
- **Habilidades:**
  - 🎯 Longo Alcance: Ataca o inimigo mais próximo até 4 casas à frente na sua fileira (inclusive o Comandante). Não avança quando consegue atacar.
  - 💥 Explosão de Brasas: Ao acertar uma unidade, a explosão também atinge com dano mágico o inimigo da mesma coluna na outra fileira.
- **História:** Mago pirocinético marcado pela chama ancestral: suas esferas de fogo explodem em brasas que saltam para a fileira vizinha.
- **Aparência:** Já tem arte no jogo.

<details><summary>Ataque e vida em cada degrau</summary>

| Raridade | Base | + | ++ |
|---|---|---|---|
| Comum | ⚔ 3 · ❤ 4 | ⚔ 4 · ❤ 5 | ⚔ 4 · ❤ 5 |
| Incomum | ⚔ 5 · ❤ 6 | ⚔ 6 · ❤ 7 | ⚔ 7 · ❤ 9 |
| Raro | ⚔ 8 · ❤ 10 | ⚔ 9 · ❤ 12 | ⚔ 11 · ❤ 14 |
| Épico | ⚔ 12 · ❤ 16 | ⚔ 14 · ❤ 19 | ⚔ 17 · ❤ 22 |

</details>

#### Sora Brisa-Serena *(já no jogo)*
- **Grupo:** ➕ Suporte · **Raridade:** Comum → até Épico++ · **Dano:** mágico · **Espera:** 2 rodada(s) na mão
- **Ataque:** 🎯 Longe: o inimigo mais próximo até 4 casas à frente na fileira
- **Ao chegar (Comum):** ⚔ 1 de ataque · ❤ 5 de vida
- **Habilidades:**
  - 🎯 Longo Alcance: Ataca o inimigo mais próximo até 4 casas à frente na sua fileira (inclusive o Comandante). Não avança quando consegue atacar.
  - 🍃 Sopro Restaurador: No início da sua ação, cura o aliado mais ferido da própria fileira (qualquer distância).
- **História:** Conjuradora dos picos de bambu: seu leque de jade sopra o Ki da montanha até o aliado mais ferido da fileira.
- **Aparência:** Já tem arte no jogo.

<details><summary>Ataque e vida em cada degrau</summary>

| Raridade | Base | + | ++ |
|---|---|---|---|
| Comum | ⚔ 1 · ❤ 5 | ⚔ 1 · ❤ 6 | ⚔ 1 · ❤ 7 |
| Incomum | ⚔ 2 · ❤ 8 | ⚔ 2 · ❤ 9 | ⚔ 2 · ❤ 11 |
| Raro | ⚔ 3 · ❤ 13 | ⚔ 3 · ❤ 15 | ⚔ 4 · ❤ 18 |
| Épico | ⚔ 4 · ❤ 21 | ⚔ 5 · ❤ 24 | ⚔ 6 · ❤ 28 |

</details>

#### Bram Guardião-do-Tomo
- **Grupo:** 🛡️ Tanque · **Raridade:** Comum → até Épico++ · **Dano:** físico · **Espera:** 3 rodada(s) na mão
- **Ataque:** 👊 Frente: corpo a corpo, o inimigo logo à frente
- **Ao chegar (Comum):** ⚔ 2 de ataque · ❤ 9 de vida
- **Habilidades:**
  - 🔰 Barreira Arcana: Resistência mágica: reduz o dano de cada golpe mágico.
  - 🗯️ Provocar: Os inimigos vizinhos são obrigados a atacá-lo, se puderem.
- **História:** Bibliotecário robusto que usa um livro gigante como escudo.
- **Aparência:** Homem barrigudo de óculos, túnica marrom, livro enorme com tranca de ferro.

<details><summary>Ataque e vida em cada degrau</summary>

| Raridade | Base | + | ++ |
|---|---|---|---|
| Comum | ⚔ 2 · ❤ 9 | ⚔ 2 · ❤ 11 | ⚔ 3 · ❤ 12 |
| Incomum | ⚔ 3 · ❤ 14 | ⚔ 4 · ❤ 17 | ⚔ 4 · ❤ 20 |
| Raro | ⚔ 5 · ❤ 23 | ⚔ 6 · ❤ 27 | ⚔ 7 · ❤ 32 |
| Épico | ⚔ 8 · ❤ 37 | ⚔ 10 · ❤ 43 | ⚔ 11 · ❤ 51 |

</details>

#### Fen Aprendiz-das-Brasas
- **Grupo:** 🪄 Mago · **Raridade:** Comum → até Épico++ · **Dano:** mágico · **Espera:** 2 rodada(s) na mão
- **Ataque:** 🎯 Longe: o inimigo mais próximo até 4 casas à frente na fileira
- **Ao chegar (Comum):** ⚔ 3 de ataque · ❤ 4 de vida
- **Habilidades:**
  - 🎯 Longo Alcance: Ataca o inimigo mais próximo até 4 casas à frente na sua fileira (inclusive o Comandante). Não avança quando consegue atacar.
  - 🔥 Queimadura: O alvo pega fogo: sofre 1 de dano mágico no fim de cada turno por 2 turnos (3 turnos a partir do Épico). Acumula até 2 queimaduras.
- **História:** Aprendiz desastrado que ainda queima tudo o que acerta.
- **Aparência:** Garoto de chapéu de mago grande demais, manto vermelho chamuscado, chama na mão.

<details><summary>Ataque e vida em cada degrau</summary>

| Raridade | Base | + | ++ |
|---|---|---|---|
| Comum | ⚔ 3 · ❤ 4 | ⚔ 4 · ❤ 5 | ⚔ 4 · ❤ 5 |
| Incomum | ⚔ 5 · ❤ 6 | ⚔ 6 · ❤ 7 | ⚔ 7 · ❤ 9 |
| Raro | ⚔ 8 · ❤ 10 | ⚔ 9 · ❤ 12 | ⚔ 11 · ❤ 14 |
| Épico | ⚔ 12 · ❤ 16 | ⚔ 14 · ❤ 19 | ⚔ 17 · ❤ 22 |

</details>

#### Lyra Olho-de-Falcão *(já no jogo)*
- **Grupo:** 🪄 Mago · **Raridade:** Incomum → até Épico++ · **Dano:** mágico · **Espera:** 3 rodada(s) na mão
- **Ataque:** 🎯 Longe: o inimigo mais próximo até 4 casas à frente na fileira · ➡ Atravessa a fileira
- **Ao chegar (Incomum):** ⚔ 5 de ataque · ❤ 6 de vida
- **Habilidades:**
  - 🎯 Longo Alcance: Ataca o inimigo mais próximo até 4 casas à frente na sua fileira (inclusive o Comandante). Não avança quando consegue atacar.
  - ⇶ Feixe Perfurante: O feixe atravessa a fileira: acerta o inimigo mais próximo e também os que estão atrás dele no alcance (só na própria fileira).
  - 🔰 Barreira Arcana: Resistência mágica: reduz o dano de cada golpe mágico.
- **História:** Arquimaga do observatório astral: seu cajado focaliza um feixe arcano que atravessa a fileira inteira.
- **Aparência:** Já tem arte no jogo.

<details><summary>Ataque e vida em cada degrau</summary>

| Raridade | Base | + | ++ |
|---|---|---|---|
| Incomum | ⚔ 5 · ❤ 6 | ⚔ 6 · ❤ 7 | ⚔ 7 · ❤ 9 |
| Raro | ⚔ 8 · ❤ 10 | ⚔ 9 · ❤ 12 | ⚔ 11 · ❤ 14 |
| Épico | ⚔ 12 · ❤ 16 | ⚔ 14 · ❤ 19 | ⚔ 17 · ❤ 22 |

</details>

#### Mei Lótus-Celeste *(já no jogo)*
- **Grupo:** ➕ Suporte · **Raridade:** Incomum → até Épico++ · **Dano:** mágico · **Espera:** 3 rodada(s) na mão
- **Ataque:** 🎯 Longe: o inimigo mais próximo até 4 casas à frente na fileira
- **Ao chegar (Incomum):** ⚔ 3 de ataque · ❤ 8 de vida
- **Habilidades:**
  - 🎯 Longo Alcance: Ataca o inimigo mais próximo até 4 casas à frente na sua fileira (inclusive o Comandante). Não avança quando consegue atacar.
  - ✚ Bênção do Lótus *(única)*: No início da sua ação, cura os 2 aliados vizinhos mais feridos (inclusive diagonais e a outra fileira).
  - 👼 Anjo da Guarda *(única)*: Uma vez por partida, quando ela ou um aliado vizinho (inclusive diagonais) cairia, o golpe deixa o aliado com 1 de vida.
- **História:** Sacerdotisa arcana que canaliza o Ki sagrado da flor de lótus para restaurar a vida dos aliados ao redor.
- **Aparência:** Já tem arte no jogo.

<details><summary>Ataque e vida em cada degrau</summary>

| Raridade | Base | + | ++ |
|---|---|---|---|
| Incomum | ⚔ 3 · ❤ 8 | ⚔ 4 · ❤ 9 | ⚔ 4 · ❤ 11 |
| Raro | ⚔ 5 · ❤ 13 | ⚔ 6 · ❤ 15 | ⚔ 7 · ❤ 18 |
| Épico | ⚔ 8 · ❤ 21 | ⚔ 10 · ❤ 24 | ⚔ 11 · ❤ 28 |

</details>

#### Isel Bruma-Cortante
- **Grupo:** ⚔️ DPS · **Raridade:** Incomum → até Épico++ · **Dano:** mágico · **Espera:** 3 rodada(s) na mão
- **Ataque:** 👊 Frente: corpo a corpo, o inimigo logo à frente · ↗ Diagonal: também corta a diagonal à frente
- **Ao chegar (Incomum):** ⚔ 5 de ataque · ❤ 10 de vida
- **Habilidades:**
  - ↗ Corte Diagonal: Também ataca o inimigo na diagonal logo à frente (outra fileira, 1 coluna adiante).
  - 🕯️ Maldição: O alvo recebe +25% de dano de todas as fontes por 2 turnos.
- **História:** Espadachim arcana com lâmina de névoa que amaldiçoa ao cortar.
- **Aparência:** Mulher de cabelo branco, roupa cinza-azulada, espada feita de névoa roxa.

<details><summary>Ataque e vida em cada degrau</summary>

| Raridade | Base | + | ++ |
|---|---|---|---|
| Incomum | ⚔ 5 · ❤ 10 | ⚔ 6 · ❤ 11 | ⚔ 7 · ❤ 13 |
| Raro | ⚔ 8 · ❤ 15 | ⚔ 9 · ❤ 18 | ⚔ 11 · ❤ 21 |
| Épico | ⚔ 12 · ❤ 25 | ⚔ 14 · ❤ 29 | ⚔ 17 · ❤ 34 |

</details>

#### Odo Sombra-de-Papel
- **Grupo:** 💀 Assassino · **Raridade:** Incomum → até Épico++ · **Dano:** mágico · **Espera:** 3 rodada(s) na mão
- **Ataque:** 👊 Frente: corpo a corpo, o inimigo logo à frente · 🔙 Costas: o inimigo mais recuado até 2 casas
- **Ao chegar (Incomum):** ⚔ 6 de ataque · ❤ 6 de vida
- **Habilidades:**
  - 🗡️ Emboscada: Ataca o inimigo mais distante da sua fileira até 2 casas à frente, ignorando parte da resistência.
  - 🐌 Lentidão: O alvo fica lento por 2 turnos: anda só 1 casa e perde o ataque no primeiro desses turnos.
- **História:** Ilusionista que vira papel e atinge os inimigos do fundo.
- **Aparência:** Figura magra de máscara de papel branca, roupa preta, tiras de papel encantado girando.

<details><summary>Ataque e vida em cada degrau</summary>

| Raridade | Base | + | ++ |
|---|---|---|---|
| Incomum | ⚔ 6 · ❤ 6 | ⚔ 7 · ❤ 7 | ⚔ 9 · ❤ 9 |
| Raro | ⚔ 10 · ❤ 10 | ⚔ 12 · ❤ 12 | ⚔ 14 · ❤ 14 |
| Épico | ⚔ 16 · ❤ 16 | ⚔ 19 · ❤ 19 | ⚔ 22 · ❤ 22 |

</details>

#### Celina Geada-Eterna
- **Grupo:** 🪄 Mago · **Raridade:** Raro → até Lendário++ · **Dano:** mágico · **Espera:** 4 rodada(s) na mão
- **Ataque:** 🎯 Longe: o inimigo mais próximo até 4 casas à frente na fileira
- **Ao chegar (Raro):** ⚔ 8 de ataque · ❤ 10 de vida
- **Habilidades:**
  - 🎯 Longo Alcance: Ataca o inimigo mais próximo até 4 casas à frente na sua fileira (inclusive o Comandante). Não avança quando consegue atacar.
  - ❄️ Congelamento: Ao acertar, 50% de chance de congelar o alvo: ele não ataca no próximo turno (ainda pode andar). Não congela o mesmo alvo duas vezes seguidas.
- **História:** Feiticeira do norte que transforma o campo em gelo.
- **Aparência:** Mulher de vestido azul-gelo, cabelo azul longo, cajado de cristal de gelo.

<details><summary>Ataque e vida em cada degrau</summary>

| Raridade | Base | + | ++ |
|---|---|---|---|
| Raro | ⚔ 8 · ❤ 10 | ⚔ 9 · ❤ 12 | ⚔ 11 · ❤ 14 |
| Épico | ⚔ 12 · ❤ 16 | ⚔ 14 · ❤ 19 | ⚔ 17 · ❤ 22 |
| Lendário | ⚔ 20 · ❤ 26 | ⚔ 23 · ❤ 31 | ⚔ 27 · ❤ 36 |

</details>

#### Nalia Arco-Rúnico
- **Grupo:** 🏹 Arqueiro · **Raridade:** Raro → até Lendário++ · **Dano:** físico · **Espera:** 4 rodada(s) na mão
- **Ataque:** 🎯 Longe: o inimigo mais próximo até 4 casas à frente na fileira
- **Ao chegar (Raro):** ⚔ 8 de ataque · ❤ 13 de vida
- **Habilidades:**
  - 🎯 Longo Alcance: Ataca o inimigo mais próximo até 4 casas à frente na sua fileira (inclusive o Comandante). Não avança quando consegue atacar.
  - 🦅 Olho de Águia: Causa dano extra em unidades a 2 ou mais casas de distância (quanto mais longe, mais certeiro).
- **História:** Arqueira encantada cujas flechas mágicas acertam mais longe.
- **Aparência:** Elfa de capa verde-musgo, arco de madeira com runas azuis, flechas de luz.

<details><summary>Ataque e vida em cada degrau</summary>

| Raridade | Base | + | ++ |
|---|---|---|---|
| Raro | ⚔ 8 · ❤ 13 | ⚔ 9 · ❤ 15 | ⚔ 11 · ❤ 18 |
| Épico | ⚔ 12 · ❤ 21 | ⚔ 14 · ❤ 24 | ⚔ 17 · ❤ 28 |
| Lendário | ⚔ 20 · ❤ 33 | ⚔ 23 · ❤ 38 | ⚔ 27 · ❤ 45 |

</details>

#### Tiberius Runa-Viva
- **Grupo:** ➕ Suporte · **Raridade:** Raro → até Lendário++ · **Dano:** mágico · **Espera:** 4 rodada(s) na mão
- **Ataque:** 🎯 Longe: o inimigo mais próximo até 4 casas à frente na fileira
- **Ao chegar (Raro):** ⚔ 5 de ataque · ❤ 15 de vida
- **Habilidades:**
  - 🎯 Longo Alcance: Ataca o inimigo mais próximo até 4 casas à frente na sua fileira (inclusive o Comandante). Não avança quando consegue atacar.
  - 🌿 Purificar: No início da sua ação, tira um efeito ruim (veneno, queimadura, sangramento, congelamento, atordoamento, lentidão ou maldição) do aliado vizinho mais afetado.
  - 🔰 Escudo de Entrada: Entra em campo com um escudo que absorve 3 de dano (5 a partir do Épico).
- **História:** Escriba de runas que protege e limpa os aliados.
- **Aparência:** Velho de barba trançada, túnica verde com runas douradas, pena flutuante.

<details><summary>Ataque e vida em cada degrau</summary>

| Raridade | Base | + | ++ |
|---|---|---|---|
| Raro | ⚔ 5 · ❤ 15 | ⚔ 6 · ❤ 18 | ⚔ 7 · ❤ 21 |
| Épico | ⚔ 8 · ❤ 25 | ⚔ 10 · ❤ 29 | ⚔ 11 · ❤ 34 |
| Lendário | ⚔ 13 · ❤ 39 | ⚔ 15 · ❤ 46 | ⚔ 18 · ❤ 54 |

</details>

#### Varo Golem-de-Cristal
- **Grupo:** 🛡️ Tanque · **Raridade:** Raro → até Lendário++ · **Dano:** físico · **Espera:** 4 rodada(s) na mão
- **Ataque:** 👊 Frente: corpo a corpo, o inimigo logo à frente
- **Ao chegar (Raro):** ⚔ 5 de ataque · ❤ 28 de vida
- **Habilidades:**
  - 🔰 Barreira Arcana: Resistência mágica: reduz o dano de cada golpe mágico.
  - 💥 Explosão: Ao morrer, causa 2 de dano (3 a partir do Épico) em todos os inimigos vizinhos.
- **História:** Golem criado por magos; ao quebrar, espalha cacos afiados.
- **Aparência:** Golem de cristal rosa e lilás, núcleo brilhante no peito, rachaduras de luz.

<details><summary>Ataque e vida em cada degrau</summary>

| Raridade | Base | + | ++ |
|---|---|---|---|
| Raro | ⚔ 5 · ❤ 28 | ⚔ 6 · ❤ 33 | ⚔ 7 · ❤ 39 |
| Épico | ⚔ 8 · ❤ 45 | ⚔ 10 · ❤ 53 | ⚔ 11 · ❤ 62 |
| Lendário | ⚔ 13 · ❤ 72 | ⚔ 15 · ❤ 85 | ⚔ 18 · ❤ 99 |

</details>

#### Dorian Pena-Encantada
- **Grupo:** ➕ Suporte · **Raridade:** Épico → até Mítico++ · **Dano:** mágico · **Espera:** 4 rodada(s) na mão
- **Ataque:** 🎯 Longe: o inimigo mais próximo até 4 casas à frente na fileira
- **Ao chegar (Épico):** ⚔ 8 de ataque · ❤ 25 de vida
- **Habilidades:**
  - 🎯 Longo Alcance: Ataca o inimigo mais próximo até 4 casas à frente na sua fileira (inclusive o Comandante). Não avança quando consegue atacar.
  - 🍃 Sopro Restaurador: No início da sua ação, cura o aliado mais ferido da própria fileira (qualquer distância).
  - 📯 Grito de Guerra: Enquanto estiver vivo, todos os aliados da MESMA FILEIRA ganham +1 de ataque (não soma com o Tambor de Guerra; teto de bônus 2).
- **História:** Bardo arcano cuja canção cura e inflama a fileira.
- **Aparência:** Bardo de chapéu com pena longa, roupa vinho, alaúde mágico com notas flutuando.

<details><summary>Ataque e vida em cada degrau</summary>

| Raridade | Base | + | ++ |
|---|---|---|---|
| Épico | ⚔ 8 · ❤ 25 | ⚔ 10 · ❤ 29 | ⚔ 11 · ❤ 34 |
| Lendário | ⚔ 13 · ❤ 39 | ⚔ 15 · ❤ 46 | ⚔ 18 · ❤ 54 |
| Mítico | ⚔ 21 · ❤ 63 | ⚔ 25 · ❤ 74 | ⚔ 29 · ❤ 87 |

</details>

#### Kaela Lâmina-Espectral
- **Grupo:** 💀 Assassino · **Raridade:** Épico → até Mítico++ · **Dano:** mágico · **Espera:** 4 rodada(s) na mão
- **Ataque:** 👊 Frente: corpo a corpo, o inimigo logo à frente · 🔙 Costas: quem já passou por ele na fileira
- **Ao chegar (Épico):** ⚔ 16 de ataque · ❤ 16 de vida
- **Habilidades:**
  - 🔙 Golpe pelas Costas: Ataca primeiro o inimigo que já passou por ele na mesma fileira (atrás dele), com +1 de dano nesse golpe; se não houver, ataca à frente.
  - 🕯️ Maldição: O alvo recebe +25% de dano de todas as fontes por 2 turnos.
- **História:** Assassina feita de feitiço que surge atrás dos alvos amaldiçoados.
- **Aparência:** Mulher de capuz roxo, corpo meio transparente, adaga espectral verde.

<details><summary>Ataque e vida em cada degrau</summary>

| Raridade | Base | + | ++ |
|---|---|---|---|
| Épico | ⚔ 16 · ❤ 16 | ⚔ 19 · ❤ 19 | ⚔ 22 · ❤ 22 |
| Lendário | ⚔ 26 · ❤ 26 | ⚔ 31 · ❤ 31 | ⚔ 36 · ❤ 36 |
| Mítico | ⚔ 42 · ❤ 42 | ⚔ 49 · ❤ 49 | ⚔ 58 · ❤ 58 |

</details>

#### Selene Lua-Arcana
- **Grupo:** 🪄 Mago · **Raridade:** Épico → até Mítico++ · **Dano:** mágico · **Espera:** 4 rodada(s) na mão
- **Ataque:** 🎯 Longe: o inimigo mais próximo até 4 casas à frente na fileira
- **Ao chegar (Épico):** ⚔ 12 de ataque · ❤ 16 de vida
- **Habilidades:**
  - 🎯 Longo Alcance: Ataca o inimigo mais próximo até 4 casas à frente na sua fileira (inclusive o Comandante). Não avança quando consegue atacar.
  - 🔥 Queimadura: O alvo pega fogo: sofre 1 de dano mágico no fim de cada turno por 2 turnos (3 turnos a partir do Épico). Acumula até 2 queimaduras.
  - 🗡️ Perfurar: O ataque ignora escudos e TODA a resistência do alvo.
- **História:** Maga da lua cujo fogo prateado atravessa qualquer proteção.
- **Aparência:** Mulher de vestido azul-noite com estrelas, coroa de lua crescente, chamas prateadas.

<details><summary>Ataque e vida em cada degrau</summary>

| Raridade | Base | + | ++ |
|---|---|---|---|
| Épico | ⚔ 12 · ❤ 16 | ⚔ 14 · ❤ 19 | ⚔ 17 · ❤ 22 |
| Lendário | ⚔ 20 · ❤ 26 | ⚔ 23 · ❤ 31 | ⚔ 27 · ❤ 36 |
| Mítico | ⚔ 32 · ❤ 42 | ⚔ 37 · ❤ 49 | ⚔ 43 · ❤ 58 |

</details>

#### Corvin Lâmina-das-Runas
- **Grupo:** ⚔️ DPS · **Raridade:** Lendário → até Mítico++ · **Dano:** mágico · **Espera:** 5 rodada(s) na mão
- **Ataque:** 👊 Frente: corpo a corpo, o inimigo logo à frente · ↘ Diagonal: prioriza a diagonal logo atrás
- **Ao chegar (Lendário):** ⚔ 20 de ataque · ❤ 46 de vida
- **Habilidades:**
  - ↙ Golpe Reverso: Prioriza o inimigo na diagonal logo atrás (pega quem passou por ele na outra fileira).
  - 📈 Fúria: Ganha +1 de ataque a cada inimigo derrotado (por qualquer aliado), até +3.
  - 🗡️ Perfurar: O ataque ignora escudos e TODA a resistência do alvo.
- **História:** Cavaleiro rúnico que corta pelas diagonais e cresce a cada inimigo caído.
- **Aparência:** Cavaleiro de armadura escura com runas azuis brilhando, espada larga rúnica, corvo no ombro.

<details><summary>Ataque e vida em cada degrau</summary>

| Raridade | Base | + | ++ |
|---|---|---|---|
| Lendário | ⚔ 20 · ❤ 46 | ⚔ 23 · ❤ 54 | ⚔ 27 · ❤ 63 |
| Mítico | ⚔ 32 · ❤ 74 | ⚔ 37 · ❤ 86 | ⚔ 43 · ❤ 101 |

</details>

#### Eldrin Arquimago-Solar
- **Grupo:** 🪄 Mago · **Raridade:** Lendário → até Mítico++ · **Dano:** mágico · **Espera:** 5 rodada(s) na mão
- **Ataque:** 🎯 Longe: o inimigo mais próximo até 4 casas à frente na fileira
- **Ao chegar (Lendário):** ⚔ 20 de ataque · ❤ 26 de vida
- **Habilidades:**
  - 🎯 Longo Alcance: Ataca o inimigo mais próximo até 4 casas à frente na sua fileira (inclusive o Comandante). Não avança quando consegue atacar.
  - 🔥 Queimadura: O alvo pega fogo: sofre 1 de dano mágico no fim de cada turno por 2 turnos (3 turnos a partir do Épico). Acumula até 2 queimaduras.
  - 🎯 Golpe Crítico: 25% de chance de causar o dobro de dano (30% no Lendário e no Mítico).
- **História:** Arquimago do sol cujos raios às vezes caem com o dobro de força.
- **Aparência:** Velho alto de manto branco e dourado, cajado com sol na ponta, barba dourada.

<details><summary>Ataque e vida em cada degrau</summary>

| Raridade | Base | + | ++ |
|---|---|---|---|
| Lendário | ⚔ 20 · ❤ 26 | ⚔ 23 · ❤ 31 | ⚔ 27 · ❤ 36 |
| Mítico | ⚔ 32 · ❤ 42 | ⚔ 37 · ❤ 49 | ⚔ 43 · ❤ 58 |

</details>

#### Morgause Espelho-Duplo
- **Grupo:** 🪄 Mago · **Raridade:** Lendário → até Mítico++ · **Dano:** mágico · **Espera:** 5 rodada(s) na mão
- **Ataque:** 🎯 Longe: o inimigo mais próximo até 4 casas à frente na fileira
- **Ao chegar (Lendário):** ⚔ 20 de ataque · ❤ 26 de vida
- **Habilidades:**
  - 🎯 Longo Alcance: Ataca o inimigo mais próximo até 4 casas à frente na sua fileira (inclusive o Comandante). Não avança quando consegue atacar.
  - 👥 Clone *(única)*: Ao entrar em campo, cria uma cópia com metade da vida e do ataque na casa livre vizinha. A cópia não tem habilidades.
- **História:** Feiticeira dos espelhos que nunca luta sozinha: sempre traz o próprio reflexo.
- **Aparência:** Feiticeira de vestido preto e prata, espelho de mão, reflexo dela saindo do espelho.

<details><summary>Ataque e vida em cada degrau</summary>

| Raridade | Base | + | ++ |
|---|---|---|---|
| Lendário | ⚔ 20 · ❤ 26 | ⚔ 23 · ❤ 31 | ⚔ 27 · ❤ 36 |
| Mítico | ⚔ 32 · ❤ 42 | ⚔ 37 · ❤ 49 | ⚔ 43 · ❤ 58 |

</details>

#### Vesna Senhora-do-Inverno
- **Grupo:** ➕ Suporte · **Raridade:** Lendário → até Mítico++ · **Dano:** mágico · **Espera:** 5 rodada(s) na mão
- **Ataque:** 🎯 Longe: o inimigo mais próximo até 4 casas à frente na fileira
- **Ao chegar (Lendário):** ⚔ 13 de ataque · ❤ 39 de vida
- **Habilidades:**
  - 🎯 Longo Alcance: Ataca o inimigo mais próximo até 4 casas à frente na sua fileira (inclusive o Comandante). Não avança quando consegue atacar.
  - ❄️ Congelamento: Ao acertar, 50% de chance de congelar o alvo: ele não ataca no próximo turno (ainda pode andar). Não congela o mesmo alvo duas vezes seguidas.
  - 🐌 Lentidão: O alvo fica lento por 2 turnos: anda só 1 casa e perde o ataque no primeiro desses turnos.
- **História:** Rainha do inverno que deixa os inimigos lentos e gelados.
- **Aparência:** Rainha de manto branco com pele, coroa de gelo azul, cetro de floco de neve.

<details><summary>Ataque e vida em cada degrau</summary>

| Raridade | Base | + | ++ |
|---|---|---|---|
| Lendário | ⚔ 13 · ❤ 39 | ⚔ 15 · ❤ 46 | ⚔ 18 · ❤ 54 |
| Mítico | ⚔ 21 · ❤ 63 | ⚔ 25 · ❤ 74 | ⚔ 29 · ❤ 87 |

</details>

#### Aethra Tecelã-do-Trovão
- **Grupo:** 🪄 Mago · **Raridade:** Mítico → até Mítico++ · **Dano:** mágico · **Espera:** 6 rodada(s) na mão
- **Ataque:** 🎯 Longe: o inimigo mais próximo até 4 casas à frente na fileira · ⚡ O raio salta para até 2 vizinhos
- **Ao chegar (Mítico):** ⚔ 32 de ataque · ❤ 42 de vida
- **Habilidades:**
  - 🎯 Longo Alcance: Ataca o inimigo mais próximo até 4 casas à frente na sua fileira (inclusive o Comandante). Não avança quando consegue atacar.
  - ⚡ Raio em Cadeia *(única)*: O ataque salta para até mais 2 inimigos vizinhos do alvo, com 60% e 30% do dano.
- **História:** Deusa menor do trovão: um raio dela pula de inimigo em inimigo.
- **Aparência:** Mulher de cabelo branco esvoaçante, olhos elétricos, vestido azul-tempestade, raios nas mãos.

<details><summary>Ataque e vida em cada degrau</summary>

| Raridade | Base | + | ++ |
|---|---|---|---|
| Mítico | ⚔ 32 · ❤ 42 | ⚔ 37 · ❤ 49 | ⚔ 43 · ❤ 58 |

</details>

## 🤖 Androide

> Unidades cibernéticas com reatores de energia e armas de plasma.

| Carta | Grupo | Raridade | Ataque | ⚔ / ❤ ao chegar | Habilidades |
|---|---|---|---|---|---|
| Jin Arco-Trovão *(já no jogo)* | 🏹 Arqueiro | Comum | físico | 3 / 5 | 🎯 Longo Alcance, 🦅 Olho de Águia, 👁 Vigia |
| Toru Sombra-Reversa *(já no jogo)* | 🛡️ Tanque | Comum | físico | 2 / 11 | ↙ Golpe Reverso, 🛡 Postura de Guarda |
| Bolt-12 Rebite-Veloz | ⚔️ DPS | Comum | físico | 3 / 6 | 🎯 Golpe Crítico |
| Medi-3 Faísca-Azul | ➕ Suporte | Comum | mágico | 1 / 5 | 🎯 Longo Alcance, 🍃 Sopro Restaurador |
| Bastion-2 Placa-Pesada | 🛡️ Tanque | Incomum | físico | 3 / 16 | 🛡 Postura de Guarda, 💥 Explosão |
| Cryo-6 Bobina-Gélida | 🪄 Mago | Incomum | mágico | 5 / 6 | 🎯 Longo Alcance, ❄️ Congelamento |
| Kraz-9 Serra-Dupla | ⚔️ DPS | Incomum | físico | 5 / 10 | ↗ Corte Diagonal, 🩸 Sangramento |
| Vex-4 Caçador-Furtivo | 💀 Assassino | Incomum | físico | 6 / 6 | 🗡️ Emboscada, 🐌 Lentidão |
| Echo-5 Mira-Laser | 🏹 Arqueiro | Raro | físico | 8 / 13 | 🎯 Longo Alcance, 🗡️ Perfurar |
| Halo-8 Reparadora | ➕ Suporte | Raro | mágico | 5 / 15 | 🎯 Longo Alcance, 🌿 Purificar, 💗 Regeneração |
| Phase-3 Salto-Quântico | 💀 Assassino | Raro | físico | 10 / 10 | 🌀 Teleporte, 🔙 Golpe pelas Costas |
| Spike-11 Punho-Pistão | ⚔️ DPS | Raro | físico | 8 / 15 | 💢 Ombrada, 🎯 Golpe Crítico |
| Nyx-07 *(já no jogo)* | ➕ Suporte | Épico | mágico | 8 / 25 | 🎯 Longo Alcance, 🌀 Sifão de Energia, 🪞 Reflexo de Magia |
| Pulse-7 Tempestade-Elétrica | 🪄 Mago | Épico | mágico | 12 / 16 | 🎯 Longo Alcance, 💫 Atordoamento |
| Titan-X Núcleo-de-Aço | 🛡️ Tanque | Épico | físico | 8 / 49 | 🗯️ Provocar, ⛰ Inabalável |
| Omega-9 Domínio | 🪄 Mago | Lendário | mágico | 13 / 33 | 🎯 Longo Alcance, 🌀 Domínio Enfraquecedor |
| Razor-V Lâmina-Fantasma | ⚔️ DPS | Lendário | físico | 20 / 39 | ↙ Golpe Reverso, 🩸 Sangramento, 🎯 Golpe Crítico |
| Sentinel-0 Guardião-Prime | 🛡️ Tanque | Lendário | físico | 13 / 79 | 🛡️ Protetor, 🔰 Escudo de Entrada, 🛡 Postura de Guarda |
| Aegis-Ω Protocolo-Final | 🛡️ Tanque | Mítico | físico | 21 / 95 | ⚖️ Protocolo de Retaliação, 🛡 Postura de Guarda |
| Mímesis Copiadora | ⚔️ DPS | Mítico | físico | 32 / 53 | 🪞 Copiador, 🐎 Investida |

### Fichas

#### Jin Arco-Trovão *(já no jogo)*
- **Grupo:** 🏹 Arqueiro · **Raridade:** Comum → até Épico++ · **Dano:** físico · **Espera:** 3 rodada(s) na mão
- **Ataque:** 🎯 Longe: o inimigo mais próximo até 4 casas à frente na fileira
- **Ao chegar (Comum):** ⚔ 3 de ataque · ❤ 5 de vida
- **Habilidades:**
  - 🎯 Longo Alcance: Ataca o inimigo mais próximo até 4 casas à frente na sua fileira (inclusive o Comandante). Não avança quando consegue atacar.
  - 🦅 Olho de Águia: Causa dano extra em unidades a 2 ou mais casas de distância (quanto mais longe, mais certeiro).
  - 👁 Vigia: Em alerta: age antes de todas as outras unidades do lado, de trás para frente (o Vigia mais recuado primeiro).
- **História:** Atirador cibernético com visor de cálculo balístico: seus disparos eletromagnéticos aceleram quanto mais longe voam.
- **Aparência:** Já tem arte no jogo.

<details><summary>Ataque e vida em cada degrau</summary>

| Raridade | Base | + | ++ |
|---|---|---|---|
| Comum | ⚔ 3 · ❤ 5 | ⚔ 4 · ❤ 6 | ⚔ 4 · ❤ 7 |
| Incomum | ⚔ 5 · ❤ 8 | ⚔ 6 · ❤ 9 | ⚔ 7 · ❤ 11 |
| Raro | ⚔ 8 · ❤ 13 | ⚔ 9 · ❤ 15 | ⚔ 11 · ❤ 18 |
| Épico | ⚔ 12 · ❤ 21 | ⚔ 14 · ❤ 24 | ⚔ 17 · ❤ 28 |

</details>

#### Toru Sombra-Reversa *(já no jogo)*
- **Grupo:** 🛡️ Tanque · **Raridade:** Comum → até Épico++ · **Dano:** físico · **Espera:** 3 rodada(s) na mão
- **Ataque:** 👊 Frente: corpo a corpo, o inimigo logo à frente · ↘ Diagonal: prioriza a diagonal logo atrás
- **Ao chegar (Comum):** ⚔ 2 de ataque · ❤ 11 de vida
- **Habilidades:**
  - ↙ Golpe Reverso: Prioriza o inimigo na diagonal logo atrás (pega quem passou por ele na outra fileira).
  - 🛡 Postura de Guarda: Resistência física: reduz o dano de cada golpe físico (v0.17.0: a resistência é habilidade, não status de toda carta).
- **História:** Ciborgue guardião equipado com sensores traseiros e lâminas térmicas nos antebraços para punir quem passa por ele.
- **Aparência:** Já tem arte no jogo.

<details><summary>Ataque e vida em cada degrau</summary>

| Raridade | Base | + | ++ |
|---|---|---|---|
| Comum | ⚔ 2 · ❤ 11 | ⚔ 2 · ❤ 13 | ⚔ 3 · ❤ 15 |
| Incomum | ⚔ 3 · ❤ 18 | ⚔ 4 · ❤ 21 | ⚔ 4 · ❤ 24 |
| Raro | ⚔ 5 · ❤ 28 | ⚔ 6 · ❤ 33 | ⚔ 7 · ❤ 39 |
| Épico | ⚔ 8 · ❤ 45 | ⚔ 10 · ❤ 53 | ⚔ 11 · ❤ 62 |

</details>

#### Bolt-12 Rebite-Veloz
- **Grupo:** ⚔️ DPS · **Raridade:** Comum → até Épico++ · **Dano:** físico · **Espera:** 2 rodada(s) na mão
- **Ataque:** 👊 Frente: corpo a corpo, o inimigo logo à frente
- **Ao chegar (Comum):** ⚔ 3 de ataque · ❤ 6 de vida
- **Habilidades:**
  - 🎯 Golpe Crítico: 25% de chance de causar o dobro de dano (30% no Lendário e no Mítico).
- **História:** Robô de linha de montagem que aprendeu a lutar com rebites.
- **Aparência:** Robô baixo e amarelo-industrial, braço de rebitadeira, olho único verde.

<details><summary>Ataque e vida em cada degrau</summary>

| Raridade | Base | + | ++ |
|---|---|---|---|
| Comum | ⚔ 3 · ❤ 6 | ⚔ 4 · ❤ 7 | ⚔ 4 · ❤ 8 |
| Incomum | ⚔ 5 · ❤ 10 | ⚔ 6 · ❤ 11 | ⚔ 7 · ❤ 13 |
| Raro | ⚔ 8 · ❤ 15 | ⚔ 9 · ❤ 18 | ⚔ 11 · ❤ 21 |
| Épico | ⚔ 12 · ❤ 25 | ⚔ 14 · ❤ 29 | ⚔ 17 · ❤ 34 |

</details>

#### Medi-3 Faísca-Azul
- **Grupo:** ➕ Suporte · **Raridade:** Comum → até Épico++ · **Dano:** mágico · **Espera:** 2 rodada(s) na mão
- **Ataque:** 🎯 Longe: o inimigo mais próximo até 4 casas à frente na fileira
- **Ao chegar (Comum):** ⚔ 1 de ataque · ❤ 5 de vida
- **Habilidades:**
  - 🎯 Longo Alcance: Ataca o inimigo mais próximo até 4 casas à frente na sua fileira (inclusive o Comandante). Não avança quando consegue atacar.
  - 🍃 Sopro Restaurador: No início da sua ação, cura o aliado mais ferido da própria fileira (qualquer distância).
- **História:** Drone médico que conserta aliados com raios de reparo.
- **Aparência:** Drone flutuante branco com cruz azul, braços finos de solda, luz azul.

<details><summary>Ataque e vida em cada degrau</summary>

| Raridade | Base | + | ++ |
|---|---|---|---|
| Comum | ⚔ 1 · ❤ 5 | ⚔ 1 · ❤ 6 | ⚔ 1 · ❤ 7 |
| Incomum | ⚔ 2 · ❤ 8 | ⚔ 2 · ❤ 9 | ⚔ 2 · ❤ 11 |
| Raro | ⚔ 3 · ❤ 13 | ⚔ 3 · ❤ 15 | ⚔ 4 · ❤ 18 |
| Épico | ⚔ 4 · ❤ 21 | ⚔ 5 · ❤ 24 | ⚔ 6 · ❤ 28 |

</details>

#### Bastion-2 Placa-Pesada
- **Grupo:** 🛡️ Tanque · **Raridade:** Incomum → até Épico++ · **Dano:** físico · **Espera:** 3 rodada(s) na mão
- **Ataque:** 👊 Frente: corpo a corpo, o inimigo logo à frente
- **Ao chegar (Incomum):** ⚔ 3 de ataque · ❤ 16 de vida
- **Habilidades:**
  - 🛡 Postura de Guarda: Resistência física: reduz o dano de cada golpe físico (v0.17.0: a resistência é habilidade, não status de toda carta).
  - 💥 Explosão: Ao morrer, causa 2 de dano (3 a partir do Épico) em todos os inimigos vizinhos.
- **História:** Robô-escudo cujo reator explode quando ele cai.
- **Aparência:** Robô largo cinza com placas grossas, escudo de torre, reator laranja no peito.

<details><summary>Ataque e vida em cada degrau</summary>

| Raridade | Base | + | ++ |
|---|---|---|---|
| Incomum | ⚔ 3 · ❤ 16 | ⚔ 4 · ❤ 19 | ⚔ 4 · ❤ 22 |
| Raro | ⚔ 5 · ❤ 26 | ⚔ 6 · ❤ 30 | ⚔ 7 · ❤ 35 |
| Épico | ⚔ 8 · ❤ 41 | ⚔ 10 · ❤ 48 | ⚔ 11 · ❤ 56 |

</details>

#### Cryo-6 Bobina-Gélida
- **Grupo:** 🪄 Mago · **Raridade:** Incomum → até Épico++ · **Dano:** mágico · **Espera:** 3 rodada(s) na mão
- **Ataque:** 🎯 Longe: o inimigo mais próximo até 4 casas à frente na fileira
- **Ao chegar (Incomum):** ⚔ 5 de ataque · ❤ 6 de vida
- **Habilidades:**
  - 🎯 Longo Alcance: Ataca o inimigo mais próximo até 4 casas à frente na sua fileira (inclusive o Comandante). Não avança quando consegue atacar.
  - ❄️ Congelamento: Ao acertar, 50% de chance de congelar o alvo: ele não ataca no próximo turno (ainda pode andar). Não congela o mesmo alvo duas vezes seguidas.
- **História:** Gerador de frio que dispara rajadas criogênicas.
- **Aparência:** Robô cilíndrico azul-gelo com bobinas nos ombros, vapor frio saindo.

<details><summary>Ataque e vida em cada degrau</summary>

| Raridade | Base | + | ++ |
|---|---|---|---|
| Incomum | ⚔ 5 · ❤ 6 | ⚔ 6 · ❤ 7 | ⚔ 7 · ❤ 9 |
| Raro | ⚔ 8 · ❤ 10 | ⚔ 9 · ❤ 12 | ⚔ 11 · ❤ 14 |
| Épico | ⚔ 12 · ❤ 16 | ⚔ 14 · ❤ 19 | ⚔ 17 · ❤ 22 |

</details>

#### Kraz-9 Serra-Dupla
- **Grupo:** ⚔️ DPS · **Raridade:** Incomum → até Épico++ · **Dano:** físico · **Espera:** 3 rodada(s) na mão
- **Ataque:** 👊 Frente: corpo a corpo, o inimigo logo à frente · ↗ Diagonal: também corta a diagonal à frente
- **Ao chegar (Incomum):** ⚔ 5 de ataque · ❤ 10 de vida
- **Habilidades:**
  - ↗ Corte Diagonal: Também ataca o inimigo na diagonal logo à frente (outra fileira, 1 coluna adiante).
  - 🩸 Sangramento: Golpes físicos abrem feridas: o alvo perde 1 de vida por turno por 3 turnos, e mais 1 em cada turno em que andar.
- **História:** Robô de demolição com duas serras circulares nos braços.
- **Aparência:** Robô vermelho e preto, serras circulares no lugar das mãos, faíscas.

<details><summary>Ataque e vida em cada degrau</summary>

| Raridade | Base | + | ++ |
|---|---|---|---|
| Incomum | ⚔ 5 · ❤ 10 | ⚔ 6 · ❤ 11 | ⚔ 7 · ❤ 13 |
| Raro | ⚔ 8 · ❤ 15 | ⚔ 9 · ❤ 18 | ⚔ 11 · ❤ 21 |
| Épico | ⚔ 12 · ❤ 25 | ⚔ 14 · ❤ 29 | ⚔ 17 · ❤ 34 |

</details>

#### Vex-4 Caçador-Furtivo
- **Grupo:** 💀 Assassino · **Raridade:** Incomum → até Épico++ · **Dano:** físico · **Espera:** 3 rodada(s) na mão
- **Ataque:** 👊 Frente: corpo a corpo, o inimigo logo à frente · 🔙 Costas: o inimigo mais recuado até 2 casas
- **Ao chegar (Incomum):** ⚔ 6 de ataque · ❤ 6 de vida
- **Habilidades:**
  - 🗡️ Emboscada: Ataca o inimigo mais distante da sua fileira até 2 casas à frente, ignorando parte da resistência.
  - 🐌 Lentidão: O alvo fica lento por 2 turnos: anda só 1 casa e perde o ataque no primeiro desses turnos.
- **História:** Unidade de infiltração que atira nos alvos mais recuados.
- **Aparência:** Androide magro preto-fosco, camuflagem ótica parcial, olho vermelho em fenda.

<details><summary>Ataque e vida em cada degrau</summary>

| Raridade | Base | + | ++ |
|---|---|---|---|
| Incomum | ⚔ 6 · ❤ 6 | ⚔ 7 · ❤ 7 | ⚔ 9 · ❤ 9 |
| Raro | ⚔ 10 · ❤ 10 | ⚔ 12 · ❤ 12 | ⚔ 14 · ❤ 14 |
| Épico | ⚔ 16 · ❤ 16 | ⚔ 19 · ❤ 19 | ⚔ 22 · ❤ 22 |

</details>

#### Echo-5 Mira-Laser
- **Grupo:** 🏹 Arqueiro · **Raridade:** Raro → até Lendário++ · **Dano:** físico · **Espera:** 4 rodada(s) na mão
- **Ataque:** 🎯 Longe: o inimigo mais próximo até 4 casas à frente na fileira
- **Ao chegar (Raro):** ⚔ 8 de ataque · ❤ 13 de vida
- **Habilidades:**
  - 🎯 Longo Alcance: Ataca o inimigo mais próximo até 4 casas à frente na sua fileira (inclusive o Comandante). Não avança quando consegue atacar.
  - 🗡️ Perfurar: O ataque ignora escudos e TODA a resistência do alvo.
- **História:** Atirador de precisão cujo laser ignora qualquer blindagem.
- **Aparência:** Androide esguio branco e azul, rifle laser longo, visor de mira no rosto.

<details><summary>Ataque e vida em cada degrau</summary>

| Raridade | Base | + | ++ |
|---|---|---|---|
| Raro | ⚔ 8 · ❤ 13 | ⚔ 9 · ❤ 15 | ⚔ 11 · ❤ 18 |
| Épico | ⚔ 12 · ❤ 21 | ⚔ 14 · ❤ 24 | ⚔ 17 · ❤ 28 |
| Lendário | ⚔ 20 · ❤ 33 | ⚔ 23 · ❤ 38 | ⚔ 27 · ❤ 45 |

</details>

#### Halo-8 Reparadora
- **Grupo:** ➕ Suporte · **Raridade:** Raro → até Lendário++ · **Dano:** mágico · **Espera:** 4 rodada(s) na mão
- **Ataque:** 🎯 Longe: o inimigo mais próximo até 4 casas à frente na fileira
- **Ao chegar (Raro):** ⚔ 5 de ataque · ❤ 15 de vida
- **Habilidades:**
  - 🎯 Longo Alcance: Ataca o inimigo mais próximo até 4 casas à frente na sua fileira (inclusive o Comandante). Não avança quando consegue atacar.
  - 🌿 Purificar: No início da sua ação, tira um efeito ruim (veneno, queimadura, sangramento, congelamento, atordoamento, lentidão ou maldição) do aliado vizinho mais afetado.
  - 💗 Regeneração: No fim de cada turno, recupera 1 de vida (2 a partir do Épico).
- **História:** Unidade de manutenção que limpa vírus e defeitos dos aliados.
- **Aparência:** Androide feminina com halo de luz verde-água na cabeça, kit de ferramentas flutuando.

<details><summary>Ataque e vida em cada degrau</summary>

| Raridade | Base | + | ++ |
|---|---|---|---|
| Raro | ⚔ 5 · ❤ 15 | ⚔ 6 · ❤ 18 | ⚔ 7 · ❤ 21 |
| Épico | ⚔ 8 · ❤ 25 | ⚔ 10 · ❤ 29 | ⚔ 11 · ❤ 34 |
| Lendário | ⚔ 13 · ❤ 39 | ⚔ 15 · ❤ 46 | ⚔ 18 · ❤ 54 |

</details>

#### Phase-3 Salto-Quântico
- **Grupo:** 💀 Assassino · **Raridade:** Raro → até Lendário++ · **Dano:** físico · **Espera:** 4 rodada(s) na mão
- **Ataque:** 👊 Frente: corpo a corpo, o inimigo logo à frente · 🔙 Costas: quem já passou por ele na fileira · 🌀 Costas: 1× por partida aparece atrás do inimigo mais avançado
- **Ao chegar (Raro):** ⚔ 10 de ataque · ❤ 10 de vida
- **Habilidades:**
  - 🌀 Teleporte: Uma vez por partida, no início da ação, pula para a casa livre logo atrás do inimigo mais avançado da fileira e o ataca pelas costas (+1 de dano).
  - 🔙 Golpe pelas Costas: Ataca primeiro o inimigo que já passou por ele na mesma fileira (atrás dele), com +1 de dano nesse golpe; se não houver, ataca à frente.
- **História:** Protótipo que se desmonta em partículas e reaparece atrás do alvo.
- **Aparência:** Androide roxo-metálico com partes do corpo se desfazendo em pixels, lâminas nos antebraços.

<details><summary>Ataque e vida em cada degrau</summary>

| Raridade | Base | + | ++ |
|---|---|---|---|
| Raro | ⚔ 10 · ❤ 10 | ⚔ 12 · ❤ 12 | ⚔ 14 · ❤ 14 |
| Épico | ⚔ 16 · ❤ 16 | ⚔ 19 · ❤ 19 | ⚔ 22 · ❤ 22 |
| Lendário | ⚔ 26 · ❤ 26 | ⚔ 31 · ❤ 31 | ⚔ 36 · ❤ 36 |

</details>

#### Spike-11 Punho-Pistão
- **Grupo:** ⚔️ DPS · **Raridade:** Raro → até Lendário++ · **Dano:** físico · **Espera:** 3 rodada(s) na mão
- **Ataque:** 👊 Frente: corpo a corpo, o inimigo logo à frente
- **Ao chegar (Raro):** ⚔ 8 de ataque · ❤ 15 de vida
- **Habilidades:**
  - 💢 Ombrada: Ao acertar um inimigo corpo a corpo de frente, empurra o alvo 1 casa para trás (se a casa estiver livre).
  - 🎯 Golpe Crítico: 25% de chance de causar o dobro de dano (30% no Lendário e no Mítico).
- **História:** Lutador de arena com pistões nos braços que arremessam inimigos.
- **Aparência:** Robô atarracado laranja com pistões hidráulicos nos punhos, número 11 no peito.

<details><summary>Ataque e vida em cada degrau</summary>

| Raridade | Base | + | ++ |
|---|---|---|---|
| Raro | ⚔ 8 · ❤ 15 | ⚔ 9 · ❤ 18 | ⚔ 11 · ❤ 21 |
| Épico | ⚔ 12 · ❤ 25 | ⚔ 14 · ❤ 29 | ⚔ 17 · ❤ 34 |
| Lendário | ⚔ 20 · ❤ 39 | ⚔ 23 · ❤ 46 | ⚔ 27 · ❤ 54 |

</details>

#### Nyx-07 *(já no jogo)*
- **Grupo:** ➕ Suporte · **Raridade:** Épico → até Mítico++ · **Dano:** mágico · **Espera:** 5 rodada(s) na mão
- **Ataque:** 🎯 Longe: o inimigo mais próximo até 4 casas à frente na fileira
- **Ao chegar (Épico):** ⚔ 8 de ataque · ❤ 25 de vida
- **Habilidades:**
  - 🎯 Longo Alcance: Ataca o inimigo mais próximo até 4 casas à frente na sua fileira (inclusive o Comandante). Não avança quando consegue atacar.
  - 🌀 Sifão de Energia *(única)*: Enquanto estiver em campo, todos os inimigos perdem ataque (redução total máxima de 2, ataque mínimo 1).
  - 🪞 Reflexo de Magia *(única)*: Dano mágico recebido (ataques e feitiços) é reduzido e a parte refletida volta para quem atacou (feitiço: para o Comandante de quem lançou).
- **História:** Androide experimental de geração 07 cujo reator quântico drena continuamente a energia de ataque dos inimigos.
- **Aparência:** Já tem arte no jogo.

<details><summary>Ataque e vida em cada degrau</summary>

| Raridade | Base | + | ++ |
|---|---|---|---|
| Épico | ⚔ 8 · ❤ 25 | ⚔ 10 · ❤ 29 | ⚔ 11 · ❤ 34 |
| Lendário | ⚔ 13 · ❤ 39 | ⚔ 15 · ❤ 46 | ⚔ 18 · ❤ 54 |
| Mítico | ⚔ 21 · ❤ 63 | ⚔ 25 · ❤ 74 | ⚔ 29 · ❤ 87 |

</details>

#### Pulse-7 Tempestade-Elétrica
- **Grupo:** 🪄 Mago · **Raridade:** Épico → até Mítico++ · **Dano:** mágico · **Espera:** 4 rodada(s) na mão
- **Ataque:** 🎯 Longe: o inimigo mais próximo até 4 casas à frente na fileira
- **Ao chegar (Épico):** ⚔ 12 de ataque · ❤ 16 de vida
- **Habilidades:**
  - 🎯 Longo Alcance: Ataca o inimigo mais próximo até 4 casas à frente na sua fileira (inclusive o Comandante). Não avança quando consegue atacar.
  - 💫 Atordoamento: Ao acertar, 50% de chance de atordoar o alvo: no próximo turno ele não age (não anda, não ataca, não usa habilidade). Não atordoa o mesmo alvo duas vezes seguidas.
- **História:** Torre móvel que dá choques capazes de travar qualquer um.
- **Aparência:** Androide de bobinas de Tesla nas costas, raios amarelos, olhos brancos brilhantes.

<details><summary>Ataque e vida em cada degrau</summary>

| Raridade | Base | + | ++ |
|---|---|---|---|
| Épico | ⚔ 12 · ❤ 16 | ⚔ 14 · ❤ 19 | ⚔ 17 · ❤ 22 |
| Lendário | ⚔ 20 · ❤ 26 | ⚔ 23 · ❤ 31 | ⚔ 27 · ❤ 36 |
| Mítico | ⚔ 32 · ❤ 42 | ⚔ 37 · ❤ 49 | ⚔ 43 · ❤ 58 |

</details>

#### Titan-X Núcleo-de-Aço
- **Grupo:** 🛡️ Tanque · **Raridade:** Épico → até Mítico++ · **Dano:** físico · **Espera:** 4 rodada(s) na mão
- **Ataque:** 👊 Frente: corpo a corpo, o inimigo logo à frente
- **Ao chegar (Épico):** ⚔ 8 de ataque · ❤ 49 de vida
- **Habilidades:**
  - 🗯️ Provocar: Os inimigos vizinhos são obrigados a atacá-lo, se puderem.
  - ⛰ Inabalável: Não pode ser empurrado. Resistência física (e mágica no Épico).
- **História:** Máquina de cerco que chama todos os golpes para si.
- **Aparência:** Robô gigante cinza-chumbo com alto-falantes no peito, pernas de esteira, punhos enormes.

<details><summary>Ataque e vida em cada degrau</summary>

| Raridade | Base | + | ++ |
|---|---|---|---|
| Épico | ⚔ 8 · ❤ 49 | ⚔ 10 · ❤ 58 | ⚔ 11 · ❤ 67 |
| Lendário | ⚔ 13 · ❤ 79 | ⚔ 15 · ❤ 92 | ⚔ 18 · ❤ 108 |
| Mítico | ⚔ 21 · ❤ 126 | ⚔ 25 · ❤ 148 | ⚔ 29 · ❤ 173 |

</details>

#### Omega-9 Domínio
- **Grupo:** 🪄 Mago · **Raridade:** Lendário → até Mítico++ · **Dano:** mágico · **Espera:** 5 rodada(s) na mão
- **Ataque:** 🎯 Longe: o inimigo mais próximo até 4 casas à frente na fileira
- **Ao chegar (Lendário):** ⚔ 13 de ataque · ❤ 33 de vida
- **Habilidades:**
  - 🎯 Longo Alcance: Ataca o inimigo mais próximo até 4 casas à frente na sua fileira (inclusive o Comandante). Não avança quando consegue atacar.
  - 🌀 Domínio Enfraquecedor *(única)*: Ao entrar em campo, todos os inimigos perdem 1 de ataque enquanto ele estiver vivo (soma com o Sifão de Energia até o teto de −2). Cada ataque dele tira mais 1 de ataque do alvo (até −3 por alvo; ataque mínimo 1). Ataca de longe.
- **História:** Inteligência central que drena a força de todos os inimigos à vista.
- **Aparência:** Androide flutuante de manto metálico preto e dourado, anel de dados girando, olho central roxo.

<details><summary>Ataque e vida em cada degrau</summary>

| Raridade | Base | + | ++ |
|---|---|---|---|
| Lendário | ⚔ 13 · ❤ 33 | ⚔ 15 · ❤ 38 | ⚔ 18 · ❤ 45 |
| Mítico | ⚔ 21 · ❤ 53 | ⚔ 25 · ❤ 62 | ⚔ 29 · ❤ 72 |

</details>

#### Razor-V Lâmina-Fantasma
- **Grupo:** ⚔️ DPS · **Raridade:** Lendário → até Mítico++ · **Dano:** físico · **Espera:** 5 rodada(s) na mão
- **Ataque:** 👊 Frente: corpo a corpo, o inimigo logo à frente · ↘ Diagonal: prioriza a diagonal logo atrás
- **Ao chegar (Lendário):** ⚔ 20 de ataque · ❤ 39 de vida
- **Habilidades:**
  - ↙ Golpe Reverso: Prioriza o inimigo na diagonal logo atrás (pega quem passou por ele na outra fileira).
  - 🩸 Sangramento: Golpes físicos abrem feridas: o alvo perde 1 de vida por turno por 3 turnos, e mais 1 em cada turno em que andar.
  - 🎯 Golpe Crítico: 25% de chance de causar o dobro de dano (30% no Lendário e no Mítico).
- **História:** Androide samurai que corta quem tenta escapar pelas diagonais.
- **Aparência:** Androide samurai preto e vermelho, katana de plasma, cachecol digital voando.

<details><summary>Ataque e vida em cada degrau</summary>

| Raridade | Base | + | ++ |
|---|---|---|---|
| Lendário | ⚔ 20 · ❤ 39 | ⚔ 23 · ❤ 46 | ⚔ 27 · ❤ 54 |
| Mítico | ⚔ 32 · ❤ 63 | ⚔ 37 · ❤ 74 | ⚔ 43 · ❤ 87 |

</details>

#### Sentinel-0 Guardião-Prime
- **Grupo:** 🛡️ Tanque · **Raridade:** Lendário → até Mítico++ · **Dano:** físico · **Espera:** 5 rodada(s) na mão
- **Ataque:** 👊 Frente: corpo a corpo, o inimigo logo à frente
- **Ao chegar (Lendário):** ⚔ 13 de ataque · ❤ 79 de vida
- **Habilidades:**
  - 🛡️ Protetor: Recebe no lugar dos aliados vizinhos 30% do dano que eles sofreriam (40% a partir do Épico). É sempre um personagem de muita vida e pouco ataque.
  - 🔰 Escudo de Entrada: Entra em campo com um escudo que absorve 3 de dano (5 a partir do Épico).
  - 🛡 Postura de Guarda: Resistência física: reduz o dano de cada golpe físico (v0.17.0: a resistência é habilidade, não status de toda carta).
- **História:** Primeiro guardião da fábrica: entra em campo já com o escudo ligado.
- **Aparência:** Robô cavaleiro branco e azul, escudo de energia hexagonal, capa curta.

<details><summary>Ataque e vida em cada degrau</summary>

| Raridade | Base | + | ++ |
|---|---|---|---|
| Lendário | ⚔ 13 · ❤ 79 | ⚔ 15 · ❤ 92 | ⚔ 18 · ❤ 108 |
| Mítico | ⚔ 21 · ❤ 126 | ⚔ 25 · ❤ 148 | ⚔ 29 · ❤ 173 |

</details>

#### Aegis-Ω Protocolo-Final
- **Grupo:** 🛡️ Tanque · **Raridade:** Mítico → até Mítico++ · **Dano:** físico · **Espera:** 6 rodada(s) na mão
- **Ataque:** 👊 Frente: corpo a corpo, o inimigo logo à frente
- **Ao chegar (Mítico):** ⚔ 21 de ataque · ❤ 95 de vida
- **Habilidades:**
  - ⚖️ Protocolo de Retaliação *(única)*: Enquanto estiver em campo, quando o seu Comandante sofrer dano, o inimigo mais próximo dele sofre o mesmo dano (até 5 por vez).
  - 🛡 Postura de Guarda: Resistência física: reduz o dano de cada golpe físico (v0.17.0: a resistência é habilidade, não status de toda carta).
- **História:** Guardião do Comandante: quem fere o líder recebe o mesmo golpe de volta.
- **Aparência:** Robô dourado e branco com símbolo Ω no peito, escudo de balança, olhos azuis.

<details><summary>Ataque e vida em cada degrau</summary>

| Raridade | Base | + | ++ |
|---|---|---|---|
| Mítico | ⚔ 21 · ❤ 95 | ⚔ 25 · ❤ 111 | ⚔ 29 · ❤ 130 |

</details>

#### Mímesis Copiadora
- **Grupo:** ⚔️ DPS · **Raridade:** Mítico → até Mítico++ · **Dano:** físico · **Espera:** 6 rodada(s) na mão
- **Ataque:** 👊 Frente: corpo a corpo, o inimigo logo à frente
- **Ao chegar (Mítico):** ⚔ 32 de ataque · ❤ 53 de vida
- **Habilidades:**
  - 🪞 Copiador *(única)*: No primeiro ataque, copia a primeira habilidade do inimigo atingido e fica com ela até o fim da partida (não copia habilidades únicas de cartas Míticas).
  - 🐎 Investida: Na primeira ação depois de entrar em campo, anda 2 casas a mais e o primeiro golpe causa +1 de dano.
- **História:** Androide de metal líquido que imita a técnica de quem toca.
- **Aparência:** Androide de metal líquido prateado espelhado, rosto sem traços, braço mudando de forma.

<details><summary>Ataque e vida em cada degrau</summary>

| Raridade | Base | + | ++ |
|---|---|---|---|
| Mítico | ⚔ 32 · ❤ 53 | ⚔ 37 · ❤ 62 | ⚔ 43 · ❤ 72 |

</details>

## ☠️ Necromante

> Senhores abissais que manipulam sombras, almas e proles.

| Carta | Grupo | Raridade | Ataque | ⚔ / ❤ ao chegar | Habilidades |
|---|---|---|---|---|---|
| Grav Coveiro-Robusto | 🛡️ Tanque | Comum | físico | 2 / 10 | 🛡 Postura de Guarda, 💥 Explosão |
| Mira Sussurro-Frio | ➕ Suporte | Comum | mágico | 1 / 5 | 🎯 Longo Alcance, 🐌 Lentidão |
| Ossian Esqueleto-Lanceiro | ⚔️ DPS | Comum | físico | 3 / 5 | ↗ Corte Diagonal |
| Pira Vela-Fúnebre | 🪄 Mago | Comum | mágico | 3 / 4 | 🎯 Longo Alcance, 🔥 Queimadura |
| Brunna Carniçal-Faminta | ⚔️ DPS | Incomum | físico | 5 / 10 | 🧛 Vampirismo |
| Cador Arqueiro-Ossudo | 🏹 Arqueiro | Incomum | físico | 5 / 8 | 🎯 Longo Alcance, 🧪 Veneno |
| Lethe Sombra-Rastejante | 💀 Assassino | Incomum | físico | 6 / 6 | 🔙 Golpe pelas Costas, 🩸 Sangramento |
| Wex Bruxo-do-Pântano | 🪄 Mago | Incomum | mágico | 5 / 6 | 🎯 Longo Alcance, 🕯️ Maldição |
| Yume Caçadora *(já no jogo)* | 💀 Assassino | Raro | físico | 10 / 10 | 🩸 Instinto Predador |
| Ivra Fiandeira-de-Almas | ➕ Suporte | Raro | mágico | 5 / 15 | 🎯 Longo Alcance, 🍃 Sopro Restaurador, 🌿 Purificar |
| Morrigan Lâmina-Cinzenta | ⚔️ DPS | Raro | físico | 8 / 15 | ↙ Golpe Reverso, 🧛 Vampirismo |
| Thane Cavaleiro-Caído | 🛡️ Tanque | Raro | físico | 5 / 28 | 🗯️ Provocar, 🌵 Couraça de Espinhos |
| Ghor Abominação-Costurada | 🛡️ Tanque | Épico | físico | 8 / 49 | 💥 Explosão, 💗 Regeneração, 🗯️ Provocar, 🛡 Postura de Guarda |
| Nocturna Bruxa-Pestilenta | 🪄 Mago | Épico | mágico | 12 / 16 | 🎯 Longo Alcance, 🧪 Veneno, 🕯️ Maldição |
| Sabbath Ceifador-Pálido | 💀 Assassino | Épico | físico | 16 / 16 | 🗡️ Emboscada, 🎯 Golpe Crítico, 🩸 Sangramento |
| Vorax *(já no jogo)* | 🪄 Mago | Lendário | mágico | 20 / 39 | 🎯 Longo Alcance, 🥚 Prole Sombria, ⚰️ Chamado da Necropolis |
| Drakon Lorde-dos-Ossos | ⚔️ DPS | Lendário | físico | 20 / 46 | 📈 Fúria, 🧛 Vampirismo, ↗ Corte Diagonal |
| Lamenta Viúva-Vingativa | 🪄 Mago | Lendário | mágico | 20 / 26 | 🎯 Longo Alcance, 🕯️ Vingança |
| Elegia Arauta-do-Retorno | ➕ Suporte | Mítico | mágico | 21 / 53 | 🎯 Longo Alcance, ✨ Ressurreição |
| Sanguis Sede-Eterna | ⚔️ DPS | Mítico | físico | 32 / 53 | 🧛 Sede Eterna |

### Fichas

#### Grav Coveiro-Robusto
- **Grupo:** 🛡️ Tanque · **Raridade:** Comum → até Épico++ · **Dano:** físico · **Espera:** 3 rodada(s) na mão
- **Ataque:** 👊 Frente: corpo a corpo, o inimigo logo à frente
- **Ao chegar (Comum):** ⚔ 2 de ataque · ❤ 10 de vida
- **Habilidades:**
  - 🛡 Postura de Guarda: Resistência física: reduz o dano de cada golpe físico (v0.17.0: a resistência é habilidade, não status de toda carta).
  - 💥 Explosão: Ao morrer, causa 2 de dano (3 a partir do Épico) em todos os inimigos vizinhos.
- **História:** Coveiro morto-vivo que carrega pólvora no casaco.
- **Aparência:** Morto-vivo grandão de casaco remendado, pá enorme, chapéu de coveiro.

<details><summary>Ataque e vida em cada degrau</summary>

| Raridade | Base | + | ++ |
|---|---|---|---|
| Comum | ⚔ 2 · ❤ 10 | ⚔ 2 · ❤ 12 | ⚔ 3 · ❤ 14 |
| Incomum | ⚔ 3 · ❤ 16 | ⚔ 4 · ❤ 19 | ⚔ 4 · ❤ 22 |
| Raro | ⚔ 5 · ❤ 26 | ⚔ 6 · ❤ 30 | ⚔ 7 · ❤ 35 |
| Épico | ⚔ 8 · ❤ 41 | ⚔ 10 · ❤ 48 | ⚔ 11 · ❤ 56 |

</details>

#### Mira Sussurro-Frio
- **Grupo:** ➕ Suporte · **Raridade:** Comum → até Épico++ · **Dano:** mágico · **Espera:** 2 rodada(s) na mão
- **Ataque:** 🎯 Longe: o inimigo mais próximo até 4 casas à frente na fileira
- **Ao chegar (Comum):** ⚔ 1 de ataque · ❤ 5 de vida
- **Habilidades:**
  - 🎯 Longo Alcance: Ataca o inimigo mais próximo até 4 casas à frente na sua fileira (inclusive o Comandante). Não avança quando consegue atacar.
  - 🐌 Lentidão: O alvo fica lento por 2 turnos: anda só 1 casa e perde o ataque no primeiro desses turnos.
- **História:** Fantasma de menina que sussurra e deixa os inimigos pesados.
- **Aparência:** Fantasma de menina pálida, vestido branco antigo, cabelo longo flutuando.

<details><summary>Ataque e vida em cada degrau</summary>

| Raridade | Base | + | ++ |
|---|---|---|---|
| Comum | ⚔ 1 · ❤ 5 | ⚔ 1 · ❤ 6 | ⚔ 1 · ❤ 7 |
| Incomum | ⚔ 2 · ❤ 8 | ⚔ 2 · ❤ 9 | ⚔ 2 · ❤ 11 |
| Raro | ⚔ 3 · ❤ 13 | ⚔ 3 · ❤ 15 | ⚔ 4 · ❤ 18 |
| Épico | ⚔ 4 · ❤ 21 | ⚔ 5 · ❤ 24 | ⚔ 6 · ❤ 28 |

</details>

#### Ossian Esqueleto-Lanceiro
- **Grupo:** ⚔️ DPS · **Raridade:** Comum → até Épico++ · **Dano:** físico · **Espera:** 2 rodada(s) na mão
- **Ataque:** 👊 Frente: corpo a corpo, o inimigo logo à frente · ↗ Diagonal: também corta a diagonal à frente
- **Ao chegar (Comum):** ⚔ 3 de ataque · ❤ 5 de vida
- **Habilidades:**
  - ↗ Corte Diagonal: Também ataca o inimigo na diagonal logo à frente (outra fileira, 1 coluna adiante).
- **História:** Soldado esqueleto que ainda segue a formação de lança.
- **Aparência:** Esqueleto com elmo enferrujado, lança longa, escudo quebrado, olhos de fogo verde.

<details><summary>Ataque e vida em cada degrau</summary>

| Raridade | Base | + | ++ |
|---|---|---|---|
| Comum | ⚔ 3 · ❤ 5 | ⚔ 4 · ❤ 6 | ⚔ 4 · ❤ 7 |
| Incomum | ⚔ 5 · ❤ 8 | ⚔ 6 · ❤ 9 | ⚔ 7 · ❤ 11 |
| Raro | ⚔ 8 · ❤ 13 | ⚔ 9 · ❤ 15 | ⚔ 11 · ❤ 18 |
| Épico | ⚔ 12 · ❤ 21 | ⚔ 14 · ❤ 24 | ⚔ 17 · ❤ 28 |

</details>

#### Pira Vela-Fúnebre
- **Grupo:** 🪄 Mago · **Raridade:** Comum → até Épico++ · **Dano:** mágico · **Espera:** 2 rodada(s) na mão
- **Ataque:** 🎯 Longe: o inimigo mais próximo até 4 casas à frente na fileira
- **Ao chegar (Comum):** ⚔ 3 de ataque · ❤ 4 de vida
- **Habilidades:**
  - 🎯 Longo Alcance: Ataca o inimigo mais próximo até 4 casas à frente na sua fileira (inclusive o Comandante). Não avança quando consegue atacar.
  - 🔥 Queimadura: O alvo pega fogo: sofre 1 de dano mágico no fim de cada turno por 2 turnos (3 turnos a partir do Épico). Acumula até 2 queimaduras.
- **História:** Espírito de vela que acende fogo verde nos inimigos.
- **Aparência:** Espírito pequeno em forma de vela derretida, chama verde na cabeça, olhos ocos.

<details><summary>Ataque e vida em cada degrau</summary>

| Raridade | Base | + | ++ |
|---|---|---|---|
| Comum | ⚔ 3 · ❤ 4 | ⚔ 4 · ❤ 5 | ⚔ 4 · ❤ 5 |
| Incomum | ⚔ 5 · ❤ 6 | ⚔ 6 · ❤ 7 | ⚔ 7 · ❤ 9 |
| Raro | ⚔ 8 · ❤ 10 | ⚔ 9 · ❤ 12 | ⚔ 11 · ❤ 14 |
| Épico | ⚔ 12 · ❤ 16 | ⚔ 14 · ❤ 19 | ⚔ 17 · ❤ 22 |

</details>

#### Brunna Carniçal-Faminta
- **Grupo:** ⚔️ DPS · **Raridade:** Incomum → até Épico++ · **Dano:** físico · **Espera:** 3 rodada(s) na mão
- **Ataque:** 👊 Frente: corpo a corpo, o inimigo logo à frente
- **Ao chegar (Incomum):** ⚔ 5 de ataque · ❤ 10 de vida
- **Habilidades:**
  - 🧛 Vampirismo: Cura a si mesmo em 25% do dano que causa (30% no Raro, 35% no Lendário).
- **História:** Carniçal que se cura a cada mordida.
- **Aparência:** Mulher morta-viva de pele azul-acinzentada, dentes afiados, roupas de camponesa rasgadas.

<details><summary>Ataque e vida em cada degrau</summary>

| Raridade | Base | + | ++ |
|---|---|---|---|
| Incomum | ⚔ 5 · ❤ 10 | ⚔ 6 · ❤ 11 | ⚔ 7 · ❤ 13 |
| Raro | ⚔ 8 · ❤ 15 | ⚔ 9 · ❤ 18 | ⚔ 11 · ❤ 21 |
| Épico | ⚔ 12 · ❤ 25 | ⚔ 14 · ❤ 29 | ⚔ 17 · ❤ 34 |

</details>

#### Cador Arqueiro-Ossudo
- **Grupo:** 🏹 Arqueiro · **Raridade:** Incomum → até Épico++ · **Dano:** físico · **Espera:** 3 rodada(s) na mão
- **Ataque:** 🎯 Longe: o inimigo mais próximo até 4 casas à frente na fileira
- **Ao chegar (Incomum):** ⚔ 5 de ataque · ❤ 8 de vida
- **Habilidades:**
  - 🎯 Longo Alcance: Ataca o inimigo mais próximo até 4 casas à frente na sua fileira (inclusive o Comandante). Não avança quando consegue atacar.
  - 🧪 Veneno: O alvo fica envenenado: perde 1 de vida no fim de cada turno dele por 3 turnos (2 de vida por turno a partir do Épico). Não acumula; um novo golpe renova.
- **História:** Arqueiro esqueleto de flechas embebidas em peste.
- **Aparência:** Esqueleto com capuz verde rasgado, arco de osso, flechas com fumaça verde.

<details><summary>Ataque e vida em cada degrau</summary>

| Raridade | Base | + | ++ |
|---|---|---|---|
| Incomum | ⚔ 5 · ❤ 8 | ⚔ 6 · ❤ 9 | ⚔ 7 · ❤ 11 |
| Raro | ⚔ 8 · ❤ 13 | ⚔ 9 · ❤ 15 | ⚔ 11 · ❤ 18 |
| Épico | ⚔ 12 · ❤ 21 | ⚔ 14 · ❤ 24 | ⚔ 17 · ❤ 28 |

</details>

#### Lethe Sombra-Rastejante
- **Grupo:** 💀 Assassino · **Raridade:** Incomum → até Épico++ · **Dano:** físico · **Espera:** 3 rodada(s) na mão
- **Ataque:** 👊 Frente: corpo a corpo, o inimigo logo à frente · 🔙 Costas: quem já passou por ele na fileira
- **Ao chegar (Incomum):** ⚔ 6 de ataque · ❤ 6 de vida
- **Habilidades:**
  - 🔙 Golpe pelas Costas: Ataca primeiro o inimigo que já passou por ele na mesma fileira (atrás dele), com +1 de dano nesse golpe; se não houver, ataca à frente.
  - 🩸 Sangramento: Golpes físicos abrem feridas: o alvo perde 1 de vida por turno por 3 turnos, e mais 1 em cada turno em que andar.
- **História:** Sombra que passa pelo chão e corta por trás.
- **Aparência:** Silhueta preta com olhos brancos, garras longas, corpo saindo de uma poça de sombra.

<details><summary>Ataque e vida em cada degrau</summary>

| Raridade | Base | + | ++ |
|---|---|---|---|
| Incomum | ⚔ 6 · ❤ 6 | ⚔ 7 · ❤ 7 | ⚔ 9 · ❤ 9 |
| Raro | ⚔ 10 · ❤ 10 | ⚔ 12 · ❤ 12 | ⚔ 14 · ❤ 14 |
| Épico | ⚔ 16 · ❤ 16 | ⚔ 19 · ❤ 19 | ⚔ 22 · ❤ 22 |

</details>

#### Wex Bruxo-do-Pântano
- **Grupo:** 🪄 Mago · **Raridade:** Incomum → até Épico++ · **Dano:** mágico · **Espera:** 3 rodada(s) na mão
- **Ataque:** 🎯 Longe: o inimigo mais próximo até 4 casas à frente na fileira
- **Ao chegar (Incomum):** ⚔ 5 de ataque · ❤ 6 de vida
- **Habilidades:**
  - 🎯 Longo Alcance: Ataca o inimigo mais próximo até 4 casas à frente na sua fileira (inclusive o Comandante). Não avança quando consegue atacar.
  - 🕯️ Maldição: O alvo recebe +25% de dano de todas as fontes por 2 turnos.
- **História:** Bruxo que amaldiçoa com bonecos de palha.
- **Aparência:** Velho corcunda de manto verde-musgo, boneco de palha na mão, cajado torto.

<details><summary>Ataque e vida em cada degrau</summary>

| Raridade | Base | + | ++ |
|---|---|---|---|
| Incomum | ⚔ 5 · ❤ 6 | ⚔ 6 · ❤ 7 | ⚔ 7 · ❤ 9 |
| Raro | ⚔ 8 · ❤ 10 | ⚔ 9 · ❤ 12 | ⚔ 11 · ❤ 14 |
| Épico | ⚔ 12 · ❤ 16 | ⚔ 14 · ❤ 19 | ⚔ 17 · ❤ 22 |

</details>

#### Yume Caçadora *(já no jogo)*
- **Grupo:** 💀 Assassino · **Raridade:** Raro → até Lendário++ · **Dano:** físico · **Espera:** 3 rodada(s) na mão
- **Ataque:** 👊 Frente: corpo a corpo, o inimigo logo à frente · 🩸 Escolhe o inimigo com menos vida até 2 casas
- **Ao chegar (Raro):** ⚔ 10 de ataque · ❤ 10 de vida
- **Habilidades:**
  - 🩸 Instinto Predador: Ataca o inimigo com menos vida da sua fileira até 2 casas à frente. Causa dano extra em alvos com metade da vida ou menos.
- **História:** Ceifadora necromante que fareja a energia vital enfraquecida e ceifa quem está por um fio com sua foice espectral.
- **Aparência:** Já tem arte no jogo.

<details><summary>Ataque e vida em cada degrau</summary>

| Raridade | Base | + | ++ |
|---|---|---|---|
| Raro | ⚔ 10 · ❤ 10 | ⚔ 12 · ❤ 12 | ⚔ 14 · ❤ 14 |
| Épico | ⚔ 16 · ❤ 16 | ⚔ 19 · ❤ 19 | ⚔ 22 · ❤ 22 |
| Lendário | ⚔ 26 · ❤ 26 | ⚔ 31 · ❤ 31 | ⚔ 36 · ❤ 36 |

</details>

#### Ivra Fiandeira-de-Almas
- **Grupo:** ➕ Suporte · **Raridade:** Raro → até Lendário++ · **Dano:** mágico · **Espera:** 4 rodada(s) na mão
- **Ataque:** 🎯 Longe: o inimigo mais próximo até 4 casas à frente na fileira
- **Ao chegar (Raro):** ⚔ 5 de ataque · ❤ 15 de vida
- **Habilidades:**
  - 🎯 Longo Alcance: Ataca o inimigo mais próximo até 4 casas à frente na sua fileira (inclusive o Comandante). Não avança quando consegue atacar.
  - 🍃 Sopro Restaurador: No início da sua ação, cura o aliado mais ferido da própria fileira (qualquer distância).
  - 🌿 Purificar: No início da sua ação, tira um efeito ruim (veneno, queimadura, sangramento, congelamento, atordoamento, lentidão ou maldição) do aliado vizinho mais afetado.
- **História:** Fiandeira que costura almas e fecha feridas dos aliados.
- **Aparência:** Mulher pálida de vestido roxo, fios de alma brilhando entre os dedos, roca flutuante.

<details><summary>Ataque e vida em cada degrau</summary>

| Raridade | Base | + | ++ |
|---|---|---|---|
| Raro | ⚔ 5 · ❤ 15 | ⚔ 6 · ❤ 18 | ⚔ 7 · ❤ 21 |
| Épico | ⚔ 8 · ❤ 25 | ⚔ 10 · ❤ 29 | ⚔ 11 · ❤ 34 |
| Lendário | ⚔ 13 · ❤ 39 | ⚔ 15 · ❤ 46 | ⚔ 18 · ❤ 54 |

</details>

#### Morrigan Lâmina-Cinzenta
- **Grupo:** ⚔️ DPS · **Raridade:** Raro → até Lendário++ · **Dano:** físico · **Espera:** 3 rodada(s) na mão
- **Ataque:** 👊 Frente: corpo a corpo, o inimigo logo à frente · ↘ Diagonal: prioriza a diagonal logo atrás
- **Ao chegar (Raro):** ⚔ 8 de ataque · ❤ 15 de vida
- **Habilidades:**
  - ↙ Golpe Reverso: Prioriza o inimigo na diagonal logo atrás (pega quem passou por ele na outra fileira).
  - 🧛 Vampirismo: Cura a si mesmo em 25% do dano que causa (30% no Raro, 35% no Lendário).
- **História:** Cavaleira caída que bebe a vida de quem tenta fugir pela diagonal.
- **Aparência:** Cavaleira de armadura cinza rachada, espada que pinga sangue escuro, cabelo preto.

<details><summary>Ataque e vida em cada degrau</summary>

| Raridade | Base | + | ++ |
|---|---|---|---|
| Raro | ⚔ 8 · ❤ 15 | ⚔ 9 · ❤ 18 | ⚔ 11 · ❤ 21 |
| Épico | ⚔ 12 · ❤ 25 | ⚔ 14 · ❤ 29 | ⚔ 17 · ❤ 34 |
| Lendário | ⚔ 20 · ❤ 39 | ⚔ 23 · ❤ 46 | ⚔ 27 · ❤ 54 |

</details>

#### Thane Cavaleiro-Caído
- **Grupo:** 🛡️ Tanque · **Raridade:** Raro → até Lendário++ · **Dano:** físico · **Espera:** 4 rodada(s) na mão
- **Ataque:** 👊 Frente: corpo a corpo, o inimigo logo à frente
- **Ao chegar (Raro):** ⚔ 5 de ataque · ❤ 28 de vida
- **Habilidades:**
  - 🗯️ Provocar: Os inimigos vizinhos são obrigados a atacá-lo, se puderem.
  - 🌵 Couraça de Espinhos: Quem o ataca corpo a corpo de frente sofre dano fixo de volta (se ele sobreviver ao golpe). Couraça: resistência física 1.
- **História:** Paladino amaldiçoado preso numa armadura cheia de espinhos.
- **Aparência:** Cavaleiro de armadura negra espinhosa, elmo fechado com brilho verde, escudo de caveira.

<details><summary>Ataque e vida em cada degrau</summary>

| Raridade | Base | + | ++ |
|---|---|---|---|
| Raro | ⚔ 5 · ❤ 28 | ⚔ 6 · ❤ 33 | ⚔ 7 · ❤ 39 |
| Épico | ⚔ 8 · ❤ 45 | ⚔ 10 · ❤ 53 | ⚔ 11 · ❤ 62 |
| Lendário | ⚔ 13 · ❤ 72 | ⚔ 15 · ❤ 85 | ⚔ 18 · ❤ 99 |

</details>

#### Ghor Abominação-Costurada
- **Grupo:** 🛡️ Tanque · **Raridade:** Épico → até Mítico++ · **Dano:** físico · **Espera:** 4 rodada(s) na mão
- **Ataque:** 👊 Frente: corpo a corpo, o inimigo logo à frente
- **Ao chegar (Épico):** ⚔ 8 de ataque · ❤ 49 de vida
- **Habilidades:**
  - 💥 Explosão: Ao morrer, causa 2 de dano (3 a partir do Épico) em todos os inimigos vizinhos.
  - 💗 Regeneração: No fim de cada turno, recupera 1 de vida (2 a partir do Épico).
  - 🗯️ Provocar: Os inimigos vizinhos são obrigados a atacá-lo, se puderem.
  - 🛡 Postura de Guarda: Resistência física: reduz o dano de cada golpe físico (v0.17.0: a resistência é habilidade, não status de toda carta).
- **História:** Monstro costurado de muitos corpos que estoura ao cair.
- **Aparência:** Gigante costurado de pele de várias cores, pontos grossos, gancho na mão, barriga inchada.

<details><summary>Ataque e vida em cada degrau</summary>

| Raridade | Base | + | ++ |
|---|---|---|---|
| Épico | ⚔ 8 · ❤ 49 | ⚔ 10 · ❤ 58 | ⚔ 11 · ❤ 67 |
| Lendário | ⚔ 13 · ❤ 79 | ⚔ 15 · ❤ 92 | ⚔ 18 · ❤ 108 |
| Mítico | ⚔ 21 · ❤ 126 | ⚔ 25 · ❤ 148 | ⚔ 29 · ❤ 173 |

</details>

#### Nocturna Bruxa-Pestilenta
- **Grupo:** 🪄 Mago · **Raridade:** Épico → até Mítico++ · **Dano:** mágico · **Espera:** 4 rodada(s) na mão
- **Ataque:** 🎯 Longe: o inimigo mais próximo até 4 casas à frente na fileira
- **Ao chegar (Épico):** ⚔ 12 de ataque · ❤ 16 de vida
- **Habilidades:**
  - 🎯 Longo Alcance: Ataca o inimigo mais próximo até 4 casas à frente na sua fileira (inclusive o Comandante). Não avança quando consegue atacar.
  - 🧪 Veneno: O alvo fica envenenado: perde 1 de vida no fim de cada turno dele por 3 turnos (2 de vida por turno a partir do Épico). Não acumula; um novo golpe renova.
  - 🕯️ Maldição: O alvo recebe +25% de dano de todas as fontes por 2 turnos.
- **História:** Bruxa da peste que envenena e amaldiçoa de uma vez.
- **Aparência:** Bruxa de chapéu pontudo verde-escuro, caldeirão fumegante, corvos em volta.

<details><summary>Ataque e vida em cada degrau</summary>

| Raridade | Base | + | ++ |
|---|---|---|---|
| Épico | ⚔ 12 · ❤ 16 | ⚔ 14 · ❤ 19 | ⚔ 17 · ❤ 22 |
| Lendário | ⚔ 20 · ❤ 26 | ⚔ 23 · ❤ 31 | ⚔ 27 · ❤ 36 |
| Mítico | ⚔ 32 · ❤ 42 | ⚔ 37 · ❤ 49 | ⚔ 43 · ❤ 58 |

</details>

#### Sabbath Ceifador-Pálido
- **Grupo:** 💀 Assassino · **Raridade:** Épico → até Mítico++ · **Dano:** físico · **Espera:** 4 rodada(s) na mão
- **Ataque:** 👊 Frente: corpo a corpo, o inimigo logo à frente · 🔙 Costas: o inimigo mais recuado até 2 casas
- **Ao chegar (Épico):** ⚔ 16 de ataque · ❤ 16 de vida
- **Habilidades:**
  - 🗡️ Emboscada: Ataca o inimigo mais distante da sua fileira até 2 casas à frente, ignorando parte da resistência.
  - 🎯 Golpe Crítico: 25% de chance de causar o dobro de dano (30% no Lendário e no Mítico).
  - 🩸 Sangramento: Golpes físicos abrem feridas: o alvo perde 1 de vida por turno por 3 turnos, e mais 1 em cada turno em que andar.
- **História:** Ceifador que colhe primeiro os inimigos mais recuados.
- **Aparência:** Figura encapuzada branca e preta, foice longa, máscara de osso.

<details><summary>Ataque e vida em cada degrau</summary>

| Raridade | Base | + | ++ |
|---|---|---|---|
| Épico | ⚔ 16 · ❤ 16 | ⚔ 19 · ❤ 19 | ⚔ 22 · ❤ 22 |
| Lendário | ⚔ 26 · ❤ 26 | ⚔ 31 · ❤ 31 | ⚔ 36 · ❤ 36 |
| Mítico | ⚔ 42 · ❤ 42 | ⚔ 49 · ❤ 49 | ⚔ 58 · ❤ 58 |

</details>

#### Vorax *(já no jogo)*
- **Grupo:** 🪄 Mago · **Raridade:** Lendário → até Mítico++ · **Dano:** mágico · **Espera:** 6 rodada(s) na mão
- **Ataque:** 🎯 Longe: o inimigo mais próximo até 4 casas à frente na fileira
- **Ao chegar (Lendário):** ⚔ 20 de ataque · ❤ 39 de vida
- **Habilidades:**
  - 🎯 Longo Alcance: Ataca o inimigo mais próximo até 4 casas à frente na sua fileira (inclusive o Comandante). Não avança quando consegue atacar.
  - 🥚 Prole Sombria *(única)*: Ao derrotar um inimigo, uma Cria Sombria (maga frágil com ataque mágico até 2 casas à frente) surge no campo. Crias que derrotam alguém também geram novas crias. Máximo de 3 crias por lado.
  - ⚰️ Chamado da Necropolis *(única)*: Ao entrar em campo, traz de volta da Necropolis a última carta aliada derrotada: ela volta para a mão já pronta (ou para o baralho, com a mão cheia).
- **História:** Soberano necromante do abismo: cada vítima derrotada ergue-se como um ninho de onde brotam Crias Sombrias famintas.
- **Aparência:** Já tem arte no jogo.

<details><summary>Ataque e vida em cada degrau</summary>

| Raridade | Base | + | ++ |
|---|---|---|---|
| Lendário | ⚔ 20 · ❤ 39 | ⚔ 23 · ❤ 46 | ⚔ 27 · ❤ 54 |
| Mítico | ⚔ 32 · ❤ 63 | ⚔ 37 · ❤ 74 | ⚔ 43 · ❤ 87 |

</details>

#### Drakon Lorde-dos-Ossos
- **Grupo:** ⚔️ DPS · **Raridade:** Lendário → até Mítico++ · **Dano:** físico · **Espera:** 5 rodada(s) na mão
- **Ataque:** 👊 Frente: corpo a corpo, o inimigo logo à frente · ↗ Diagonal: também corta a diagonal à frente
- **Ao chegar (Lendário):** ⚔ 20 de ataque · ❤ 46 de vida
- **Habilidades:**
  - 📈 Fúria: Ganha +1 de ataque a cada inimigo derrotado (por qualquer aliado), até +3.
  - 🧛 Vampirismo: Cura a si mesmo em 25% do dano que causa (30% no Raro, 35% no Lendário).
  - ↗ Corte Diagonal: Também ataca o inimigo na diagonal logo à frente (outra fileira, 1 coluna adiante).
- **História:** Lorde esqueleto que se fortalece e se cura no meio da batalha.
- **Aparência:** Esqueleto alto de armadura de ossos de dragão, coroa, espada de osso enorme, olhos verdes.

<details><summary>Ataque e vida em cada degrau</summary>

| Raridade | Base | + | ++ |
|---|---|---|---|
| Lendário | ⚔ 20 · ❤ 46 | ⚔ 23 · ❤ 54 | ⚔ 27 · ❤ 63 |
| Mítico | ⚔ 32 · ❤ 74 | ⚔ 37 · ❤ 86 | ⚔ 43 · ❤ 101 |

</details>

#### Lamenta Viúva-Vingativa
- **Grupo:** 🪄 Mago · **Raridade:** Lendário → até Mítico++ · **Dano:** mágico · **Espera:** 5 rodada(s) na mão
- **Ataque:** 🎯 Longe: o inimigo mais próximo até 4 casas à frente na fileira
- **Ao chegar (Lendário):** ⚔ 20 de ataque · ❤ 26 de vida
- **Habilidades:**
  - 🎯 Longo Alcance: Ataca o inimigo mais próximo até 4 casas à frente na sua fileira (inclusive o Comandante). Não avança quando consegue atacar.
  - 🕯️ Vingança *(única)*: Ganha +1 de ataque a cada ALIADO derrotado, até +4. Ataca de longe.
- **História:** Viúva espectral que fica mais forte a cada aliado que cai.
- **Aparência:** Fantasma de viúva com véu negro, lágrimas de luz roxa, buquê de flores mortas.

<details><summary>Ataque e vida em cada degrau</summary>

| Raridade | Base | + | ++ |
|---|---|---|---|
| Lendário | ⚔ 20 · ❤ 26 | ⚔ 23 · ❤ 31 | ⚔ 27 · ❤ 36 |
| Mítico | ⚔ 32 · ❤ 42 | ⚔ 37 · ❤ 49 | ⚔ 43 · ❤ 58 |

</details>

#### Elegia Arauta-do-Retorno
- **Grupo:** ➕ Suporte · **Raridade:** Mítico → até Mítico++ · **Dano:** mágico · **Espera:** 6 rodada(s) na mão
- **Ataque:** 🎯 Longe: o inimigo mais próximo até 4 casas à frente na fileira
- **Ao chegar (Mítico):** ⚔ 21 de ataque · ❤ 53 de vida
- **Habilidades:**
  - 🎯 Longo Alcance: Ataca o inimigo mais próximo até 4 casas à frente na sua fileira (inclusive o Comandante). Não avança quando consegue atacar.
  - ✨ Ressurreição *(única)*: Traz de volta ao campo, na casa livre mais próxima, um aliado derrotado com 50% da vida. Pode usar 1 vez a cada 10 rodadas (a primeira já na rodada 3).
- **História:** Arauta que canta para os mortos e os traz de volta ao campo.
- **Aparência:** Mulher de vestido branco e preto, sino de prata, asas de corvo, aura de almas subindo.

<details><summary>Ataque e vida em cada degrau</summary>

| Raridade | Base | + | ++ |
|---|---|---|---|
| Mítico | ⚔ 21 · ❤ 53 | ⚔ 25 · ❤ 62 | ⚔ 29 · ❤ 72 |

</details>

#### Sanguis Sede-Eterna
- **Grupo:** ⚔️ DPS · **Raridade:** Mítico → até Mítico++ · **Dano:** físico · **Espera:** 6 rodada(s) na mão
- **Ataque:** 👊 Frente: corpo a corpo, o inimigo logo à frente
- **Ao chegar (Mítico):** ⚔ 32 de ataque · ❤ 53 de vida
- **Habilidades:**
  - 🧛 Sede Eterna *(única)*: Cada ataque tira 2 de vida EXTRA do alvo (3 no Mítico++) e cura ele mesmo nessa quantidade. Ao derrotar um inimigo, passa a "Marca da Sede" para o aliado mais próximo: esse aliado também tira 1 de vida extra por ataque e se cura com ela, mas não passa a marca adiante.
- **História:** Vampiro primordial: quem bebe da batalha ao lado dele também sente a sede.
- **Aparência:** Vampiro nobre de capa vermelho-sangue, cabelo branco, olhos vermelhos, garras longas.

<details><summary>Ataque e vida em cada degrau</summary>

| Raridade | Base | + | ++ |
|---|---|---|---|
| Mítico | ⚔ 32 · ❤ 53 | ⚔ 37 · ❤ 62 | ⚔ 43 · ❤ 72 |

</details>

## Habilidades

**Simples** podem aparecer em vários personagens · **média** em poucos · **forte** é **única** (só 1 personagem).

### As 31 habilidades pedidas

| # | Pedido | Ficou como | Observação |
|---|---|---|---|
| 1 | Vampirismo (tira parte no ataque e enche a vida) | 🧛 Vampirismo | nova |
| 2 | Espinho (devolve parte do dano físico) | 🌵 Couraça de Espinhos | já existe: Couraça de Espinhos |
| 3 | Veneno (dano por alguns turnos) | 🧪 Veneno | existia só em feitiço |
| 4 | Cura (aliado em linha por turno) | 🍃 Sopro Restaurador | já existe: Sopro Restaurador |
| 5 | Protetor (absorve dano dos vizinhos) | 🛡️ Protetor | nova |
| 6 | Lendária: inimigos perdem ataque + cada ataque tira 1, de longe | 🌀 Domínio Enfraquecedor | nova |
| 7 | Congelamento (50%, não ataca 1 turno) | ❄️ Congelamento | nova |
| 8 | Queimadura (dano de fogo por turnos) | 🔥 Queimadura | nova |
| 9 | Evasão (desvia de ataques de longe) | 💨 Evasão | nova |
| 10 | Atordoamento (50%, não age 1 turno) | 💫 Atordoamento | nova |
| 11 | Sangramento (dano por turnos) | 🩸 Sangramento | nova |
| 12 | Vampirismo mítico (passa para aliado ao matar) | 🧛 Sede Eterna | nova |
| 13 | Copiador | 🪞 Copiador | nova |
| 14 | Tira a habilidade do adversário (físico) | 🚫 Selo do Vazio | nova |
| 15 | Ganha ataque a cada inimigo morto | 📈 Fúria | nova |
| 16 | Lendária de longe: ganha ataque a cada aliado morto | 🕯️ Vingança | nova |
| 17 | Ressuscita aliado (1× a cada 10 rodadas) | ✨ Ressurreição | nova |
| 18 | Escudo físico que cura e fica mais resistente | 🛡️ Couraça Adaptativa | nova |
| 19 | Imune ao receber golpe fatal até o fim do turno inimigo | ⏳ Vontade Inquebrável | nova |
| 20 | Inimigo sofre o mesmo dano do nosso Comandante | ⚖️ Protocolo de Retaliação | nova |
| 21 | Explosão ao morrer | 💥 Explosão | nova |
| 22 | Provocar | 🗯️ Provocar | nova |
| 23 | Golpe Crítico | 🎯 Golpe Crítico | nova |
| 24 | Perfurar | 🗡️ Perfurar | nova |
| 25 | Raio em Cadeia | ⚡ Raio em Cadeia | nova |
| 26 | Lentidão | 🐌 Lentidão | nova |
| 27 | Grito de Guerra | 📯 Grito de Guerra | parecido com o Tambor de Guerra: vale para a fileira inteira |
| 28 | Teleporte | 🌀 Teleporte | nova |
| 29 | Clone | 👥 Clone | nova |
| 30 | Maldição | 🕯️ Maldição | nova |
| 31 | Purificar | 🌿 Purificar | nova |

### Novas

| Habilidade | Força | O que faz | Quem tem |
|---|---|---|---|
| 🎯 Golpe Crítico | simples | 25% de chance de causar o dobro de dano (30% no Lendário e no Mítico). | Shin, Masao, Ryuji, Rin, Kaito, Kryx, Zynna, Bolt-12, Spike-11, Razor-V, Eldrin, Krag, Rhazor, Sabbath |
| 🗯️ Provocar | simples | Os inimigos vizinhos são obrigados a atacá-lo, se puderem. | Taro, Tetsuo, Brakk, Titan-X, Bram, Mag'ra, Borgo, Grendar, Kolossus, Thane, Ghor |
| 🩸 Sangramento | simples | Golpes físicos abrem feridas: o alvo perde 1 de vida por turno por 3 turnos, e mais 1 em cada turno em que andar. *Diferença do Veneno: é físico e piora quando o alvo se move.* | Akemi, Velka, Vexar, Kraz-9, Razor-V, Grub, Rhazor, Lethe, Sabbath |
| 🐌 Lentidão | simples | O alvo fica lento por 2 turnos: anda só 1 casa e perde o ataque no primeiro desses turnos. | Daisuke, Thessa, Lunaris, Vex-4, Odo, Vesna, Spindra, Oculus, Mira |
| 🧪 Veneno | simples | O alvo fica envenenado: perde 1 de vida no fim de cada turno dele por 3 turnos (2 de vida por turno a partir do Épico). Não acumula; um novo golpe renova. *Hoje o veneno existe só no feitiço Flecha Envenenada; aqui vira habilidade de personagem.* | Sayuri, Skarr, Bufo, Spindra, Ysmera, Cador, Nocturna |
| 🕯️ Maldição | media | O alvo recebe +25% de dano de todas as fontes por 2 turnos. | Emi, Ilun, Isel, Kaela, Oculus, Wex, Nocturna |
| 🌿 Purificar | simples | No início da sua ação, tira um efeito ruim (veneno, queimadura, sangramento, congelamento, atordoamento, lentidão ou maldição) do aliado vizinho mais afetado. | Yuna, Pip, Sylith, Halo-8, Tiberius, Ivra |
| 📈 Fúria | simples | Ganha +1 de ataque a cada inimigo derrotado (por qualquer aliado), até +3. | Ryuji, Vexar, Corvin, Ghul, Rhazor, Drakon |
| 💥 Explosão | simples | Ao morrer, causa 2 de dano (3 a partir do Épico) em todos os inimigos vizinhos. | Bastion-2, Varo, Mag'ra, Grendar, Grav, Ghor |
| ❄️ Congelamento | media | Ao acertar, 50% de chance de congelar o alvo: ele não ataca no próximo turno (ainda pode andar). Não congela o mesmo alvo duas vezes seguidas. | Orun, Morv, Cryo-6, Celina, Vesna |
| 📯 Grito de Guerra | media | Enquanto estiver vivo, todos os aliados da MESMA FILEIRA ganham +1 de ataque (não soma com o Tambor de Guerra; teto de bônus 2). *O Tambor de Guerra do Tobi ajuda os vizinhos; o Grito ajuda a fileira inteira.* | Kaori, Sylith, Dorian, Fenra |
| 🛡️ Protetor | media | Recebe no lugar dos aliados vizinhos 30% do dano que eles sofreriam (40% a partir do Épico). É sempre um personagem de muita vida e pouco ataque. | Tetsuo, Gorm, Sentinel-0, Grendar |
| 🗡️ Perfurar | media | O ataque ignora escudos e TODA a resistência do alvo. *Diferente do Feixe Perfurante (que atravessa a fileira) e do Tiro Certeiro (que ignora só parte da resistência física).* | Rin, Echo-5, Selene, Corvin |
| 🔥 Queimadura | simples | O alvo pega fogo: sofre 1 de dano mágico no fim de cada turno por 2 turnos (3 turnos a partir do Épico). Acumula até 2 queimaduras. *Diferença do Veneno: o fogo é dano mágico e acumula.* | Fen, Selene, Eldrin, Pira |
| 🧛 Vampirismo | simples | Cura a si mesmo em 25% do dano que causa (30% no Raro, 35% no Lendário). | Ghul, Brunna, Morrigan, Drakon |
| 💫 Atordoamento | media | Ao acertar, 50% de chance de atordoar o alvo: no próximo turno ele não age (não anda, não ataca, não usa habilidade). Não atordoa o mesmo alvo duas vezes seguidas. *Diferença do Congelamento: congelado ainda anda; atordoado fica parado.* | Hayato, Pulse-7 |
| 🌀 Teleporte | media | Uma vez por partida, no início da ação, pula para a casa livre logo atrás do inimigo mais avançado da fileira e o ataca pelas costas (+1 de dano). | Zynna, Phase-3 |
| 🚫 Selo do Vazio | **forte (única)** | Cada golpe físico tira TODAS as habilidades do alvo até o fim da partida (ele vira uma unidade sem habilidades). Não afeta Comandantes. Personagem de ataque físico. | Kaito |
| ⏳ Vontade Inquebrável | **forte (única)** | Na primeira vez que receberia um golpe fatal, fica com 1 de vida e imune a todo dano até o fim do turno inimigo. | Aya |
| 💨 Evasão | **forte (única)** | Desvia de TODOS os ataques à distância (longo alcance, flechas e feitiços de 1 alvo). Se estiver congelado, atordoado ou lento, é atingido normalmente. | Nhyra |
| 🌀 Domínio Enfraquecedor | **forte (única)** | Ao entrar em campo, todos os inimigos perdem 1 de ataque enquanto ele estiver vivo (soma com o Sifão de Energia até o teto de −2). Cada ataque dele tira mais 1 de ataque do alvo (até −3 por alvo; ataque mínimo 1). Ataca de longe. *Pedido como carta Lendária. A parte da aura lembra o Sifão de Energia da Nyx-07; o enfraquecimento a cada golpe é novo.* | Omega-9 |
| 🪞 Copiador | **forte (única)** | No primeiro ataque, copia a primeira habilidade do inimigo atingido e fica com ela até o fim da partida (não copia habilidades únicas de cartas Míticas). | Mímesis |
| ⚖️ Protocolo de Retaliação | **forte (única)** | Enquanto estiver em campo, quando o seu Comandante sofrer dano, o inimigo mais próximo dele sofre o mesmo dano (até 5 por vez). | Aegis-Ω |
| 👥 Clone | **forte (única)** | Ao entrar em campo, cria uma cópia com metade da vida e do ataque na casa livre vizinha. A cópia não tem habilidades. | Morgause |
| ⚡ Raio em Cadeia | **forte (única)** | O ataque salta para até mais 2 inimigos vizinhos do alvo, com 60% e 30% do dano. | Aethra |
| 🛡️ Couraça Adaptativa | **forte (única)** | Começa com resistência física 1. Cada golpe físico recebido cura 1 de vida e soma +1 de resistência física (até 3). | Kolossus |
| 🕯️ Vingança | **forte (única)** | Ganha +1 de ataque a cada ALIADO derrotado, até +4. Ataca de longe. *Pedido como carta Lendária de ataque de longe.* | Lamenta |
| 🧛 Sede Eterna | **forte (única)** | Cada ataque tira 2 de vida EXTRA do alvo (3 no Mítico++) e cura ele mesmo nessa quantidade. Ao derrotar um inimigo, passa a "Marca da Sede" para o aliado mais próximo: esse aliado também tira 1 de vida extra por ataque e se cura com ela, mas não passa a marca adiante. *Vampirismo mítico pedido pelo jogador.* | Sanguis |
| ✨ Ressurreição | **forte (única)** | Traz de volta ao campo, na casa livre mais próxima, um aliado derrotado com 50% da vida. Pode usar 1 vez a cada 10 rodadas (a primeira já na rodada 3). *Diferente do Chamado da Necropolis (que devolve a carta para a mão) e do Renascer (que só vale para si).* | Elegia |

### Sugeridas (comuns nesse tipo de jogo)

| Habilidade | Força | O que faz | Quem tem |
|---|---|---|---|
| 🔙 Golpe pelas Costas | simples | Ataca primeiro o inimigo que já passou por ele na mesma fileira (atrás dele), com +1 de dano nesse golpe; se não houver, ataca à frente. | Shin, Velka, Nhyra, Phase-3, Kaela, Ysmera, Lethe |
| 💗 Regeneração | simples | No fim de cada turno, recupera 1 de vida (2 a partir do Épico). | Quorr, Gorm, Halo-8, Fenra, Borgo, Ghor |
| 🔰 Escudo de Entrada | simples | Entra em campo com um escudo que absorve 3 de dano (5 a partir do Épico). | Aurel, Sylith, Sentinel-0, Tiberius |
| 🐎 Investida | simples | Na primeira ação depois de entrar em campo, anda 2 casas a mais e o primeiro golpe causa +1 de dano. | Aya, Mímesis, Krag |
| ☠️ Execução | **forte (única)** | Derrota na hora o inimigo atingido (não o Comandante) se ele ficar com 25% da vida ou menos. | Vharga |

### Que já existem no jogo

| Habilidade | Força | O que faz | Quem tem |
|---|---|---|---|
| ↗ Corte Diagonal | simples | Também ataca o inimigo na diagonal logo à frente (outra fileira, 1 coluna adiante). | Nara, Akemi, Hayato, Kryx, Vexar, Kraz-9, Isel, Trokk, Ossian, Drakon |
| ↙ Golpe Reverso | simples | Prioriza o inimigo na diagonal logo atrás (pega quem passou por ele na outra fileira). | Toru, Masao, Thessa, Razor-V, Corvin, Grub, Morrigan |
| 🛡 Postura de Guarda | simples | Resistência física: reduz o dano de cada golpe físico (v0.17.0: a resistência é habilidade, não status de toda carta). | Toru, Taro, Goro, Tetsuo, Quorr, Bastion-2, Sentinel-0, Aegis-Ω, Mag'ra, Grendar, Grav, Ghor |
| ⤴ Salto Vendaval | **forte (única)** | Move-se sempre saltando para a 3ª casa à frente, por cima de aliados ou inimigos (2ª ou 1ª se a de cima estiver ocupada). Salta também por cima do inimigo da frente. Ao cair, ataca com bônus. | Riku |
| 🎯 Longo Alcance | simples | Ataca o inimigo mais próximo até 4 casas à frente na sua fileira (inclusive o Comandante). Não avança quando consegue atacar. | Aiko, Lyra, Mei, Nyx-07, Vorax, Sora, Kael, Suri, Hana, Jin, Yuna, Daisuke, Emi, Rin, Pip, Orun, Ilun, Morv, Aurel, Lunaris, Medi-3, Cryo-6, Echo-5, Halo-8, Pulse-7, Omega-9, Fen, Celina, Tiberius, Nalia, Selene, Dorian, Morgause, Eldrin, Vesna, Aethra, Bufo, Spindra, Oculus, Mira, Pira, Cador, Wex, Ivra, Nocturna, Lamenta, Elegia |
| ➶ Flecha Dupla | media | Dispara uma segunda flecha no mesmo alvo. | Aiko |
| ⇶ Feixe Perfurante | media | O feixe atravessa a fileira: acerta o inimigo mais próximo e também os que estão atrás dele no alcance (só na própria fileira). | Lyra |
| 🗡️ Emboscada | simples | Ataca o inimigo mais distante da sua fileira até 2 casas à frente, ignorando parte da resistência. | Zarek, Sayuri, Vex-4, Odo, Skarr, Sabbath |
| 🩸 Instinto Predador | media | Ataca o inimigo com menos vida da sua fileira até 2 casas à frente. Causa dano extra em alvos com metade da vida ou menos. | Yume, Vharga |
| 🥚 Prole Sombria | **forte (única)** | Ao derrotar um inimigo, uma Cria Sombria (maga frágil com ataque mágico até 2 casas à frente) surge no campo. Crias que derrotam alguém também geram novas crias. Máximo de 3 crias por lado. | Vorax |
| 🔁 Punho Espelhado | **forte (única)** | Ao sofrer ataque físico corpo a corpo de frente, contra-ataca com ataque multiplicado e empurra o agressor 1 casa para trás. | Kenji |
| 🌀 Sifão de Energia | **forte (única)** | Enquanto estiver em campo, todos os inimigos perdem ataque (redução total máxima de 2, ataque mínimo 1). | Nyx-07 |
| ✚ Bênção do Lótus | **forte (única)** | No início da sua ação, cura os 2 aliados vizinhos mais feridos (inclusive diagonais e a outra fileira). | Mei |
| ⛰ Inabalável | simples | Não pode ser empurrado. Resistência física (e mágica no Épico). | Gorath, Gorm, Titan-X |
| 🌑 Disparo Sombrio | simples | Ataque mágico no inimigo mais próximo até 2 casas à frente na sua fileira (inclusive o Comandante). Não avança quando consegue atacar. | — |
| 🌵 Couraça de Espinhos | simples | Quem o ataca corpo a corpo de frente sofre dano fixo de volta (se ele sobreviver ao golpe). Couraça: resistência física 1. | Daichi, Brakk, Borgo, Thane |
| 🍃 Sopro Restaurador | simples | No início da sua ação, cura o aliado mais ferido da própria fileira (qualquer distância). | Sora, Yuna, Kaori, Aurel, Medi-3, Dorian, Ivra |
| 🥁 Tambor de Guerra | media | Enquanto estiver em campo, os aliados vizinhos (inclusive diagonais e a outra fileira) ganham ataque. Vários tambores não se somam. | Tobi |
| 💥 Explosão de Brasas | media | Ao acertar uma unidade, a explosão também atinge com dano mágico o inimigo da mesma coluna na outra fileira. | Kael |
| 🌊 Maré Implacável | simples | Causa dano extra ao atacar o Comandante inimigo. | Suri |
| ➹ Tiro Certeiro | simples | A flecha ignora parte da resistência física do alvo. | Hana |
| 🦅 Olho de Águia | simples | Causa dano extra em unidades a 2 ou mais casas de distância (quanto mais longe, mais certeiro). | Jin, Lunaris, Nalia |
| 🪓 Caça-Conjuradores | simples | Prioriza unidades de longo alcance (magos, arqueiros e suportes à distância) da sua fileira até 2 casas à frente. | Ren |
| 🐾 Ataque Surpresa | media | Mira o inimigo de maior ataque da sua fileira até 2 casas à frente e causa dano extra em quem ainda está com a vida cheia. | Kuro |
| 👁 Vigia | media | Em alerta: age antes de todas as outras unidades do lado, de trás para frente (o Vigia mais recuado primeiro). | Jin |
| ♻ Renascer | **forte (única)** | Na primeira vez que cai, renasce na mesma casa com parte da vida (uma vez por partida). Não vai para a Necropolis. | Zarek |
| 👼 Anjo da Guarda | **forte (única)** | Uma vez por partida, quando ela ou um aliado vizinho (inclusive diagonais) cairia, o golpe deixa o aliado com 1 de vida. | Mei |
| 🪞 Reflexo de Magia | **forte (única)** | Dano mágico recebido (ataques e feitiços) é reduzido e a parte refletida volta para quem atacou (feitiço: para o Comandante de quem lançou). | Nyx-07 |
| 💢 Ombrada | simples | Ao acertar um inimigo corpo a corpo de frente, empurra o alvo 1 casa para trás (se a casa estiver livre). | Gorath, Goro, Spike-11, Trokk, Krag |
| ⚰️ Chamado da Necropolis | **forte (única)** | Ao entrar em campo, traz de volta da Necropolis a última carta aliada derrotada: ela volta para a mão já pronta (ou para o baralho, com a mão cheia). | Vorax |
| 🔰 Barreira Arcana | simples | Resistência mágica: reduz o dano de cada golpe mágico. | Lyra, Morv, Bram, Varo |
| 🩸 Marca da Sede | simples | Recebida da Sede Eterna: cada ataque tira 1 de vida extra do alvo e cura quem ataca. | — |
