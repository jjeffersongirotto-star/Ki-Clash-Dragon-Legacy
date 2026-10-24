# Regras do Ki-Clash: Dragon Legacy

> Documento oficial com **todas** as regras atuais do jogo. Toda mudança de regra deve atualizar este arquivo e o [CHANGELOG.md](CHANGELOG.md).

## 1. Objetivo
Zerar a vida do **herói inimigo** antes que o inimigo zere a sua. Herói do jogador: **20** de vida. Herói inimigo: de 12 (fase 1) a 30 (fase 10).

## 2. Arena
- **2 fileiras × 7 colunas.** Você fica à esquerda, o inimigo à direita.
- Cada herói fica logo **depois da última coluna** do seu lado. Ele conta como uma unidade parada numa **coluna virtual** após o fim da arena, alcançável pelas **duas fileiras**.
- **Zona de invocação:** as **3 primeiras colunas** do seu lado (colunas 1–3). A IA usa as 3 do lado dela (colunas 5–7).

## 3. Turnos e energia
1. No início do seu turno você recebe **energia ⚡** = 2 + número do turno (3 no 1º turno), máximo **10**. A energia não acumula.
2. Você compra **exatamente 1 carta**.
3. Invoca quantas cartas a energia permitir (cada carta tem um custo), em casas livres da sua zona.
4. Ao tocar **LUTAR**, suas unidades agem sozinhas, da mais avançada para a mais recuada. Depois o inimigo compra, invoca e age.

## 4. Mão e baralho
- Equipe de **3 a 6** personagens. A partida começa com **4 cartas** na mão (máximo **6**).
- Cartas não usadas **ficam na mão**.
- Toda carta usada **volta na hora para o fim do baralho** e pode ser comprada de novo depois de algumas rodadas, mesmo com o personagem ainda em campo. O **mesmo personagem pode estar em campo mais de uma vez**.
- Se a mão estiver cheia (6), a compra da rodada é pulada.

## 5. Ação de cada unidade
1. **Cura** (só Mei): cura os aliados vizinhos.
2. Se houver **alvo no alcance**, ataca e **não anda**.
3. Senão, **anda até 2 casas** para frente (parando assim que um alvo entra no alcance) e ataca se puder.
4. **Bloqueio:** ninguém atravessa uma unidade (aliada ou inimiga) sem derrotá-la, exceto quem tem **Salto** (pula 1 unidade, avançando 2 casas).
5. **Passo da vitória:** ao **derrotar um inimigo**, a unidade **avança 1 casa** se ela estiver livre (no máximo 1 passo por ação).

## 6. Alcance e alvos
- **Só a própria fileira:** ninguém ataca unidades da outra fileira, exceto as habilidades **diagonais** (Corte Diagonal e Golpe Reverso).
- **Corpo a corpo (alcance 1):** só a casa **logo à frente**.
- **Longo alcance (alcance 3):** o inimigo **mais próximo** até **3 casas à frente**. Não avança quando pode atacar.
- **Miras especiais** (sempre na própria fileira):
  - **Emboscada (Zarek):** o inimigo **mais distante** até 2 casas.
  - **Instinto Predador (Yume):** o inimigo com **menos vida** até 2 casas.
  - **Feixe Perfurante (Lyra):** o mais próximo e também **os que estão atrás dele** no alcance 3.
  - **Corte Diagonal (Nara):** a casa diagonal logo à frente, se não houver ninguém em frente.
  - **Golpe Reverso (Toru):** prioriza a casa diagonal logo atrás.
- **Herói:** se não houver unidade inimiga válida, a unidade ataca o herói com seu alcance normal:
  - corpo a corpo: da **última coluna**;
  - Zarek e Yume (mira 2): da **penúltima**;
  - longo alcance (3): a partir da **antepenúltima**.
- Unidades inimigas no alcance sempre têm **prioridade** sobre o herói.

## 7. Dano
- **Físico 👊** é reduzido pela **resistência física**; **Mágico ✨** pela **resistência mágica**. Exemplo: 3 de dano físico contra resistência física 1 = 2.
- **Dano mínimo: 1** por golpe.
- O herói não tem resistência.

## 8. Fúria de batalha 🔥
A partir do **turno 8**, todas as unidades dos dois lados ganham **+1 de ataque**, e mais +1 a cada **3 turnos** (turno 8: +1, 11: +2, 14: +3…). Isso evita lutas travadas. No **turno 40**, vence quem tiver mais vida (em %) no herói; se for igual, empate.

## 9. Categorias (ícone no canto da carta)
| Ícone | Categoria | Papel |
|---|---|---|
| 🛡️ | Tanque | Muita vida e resistência, pouco ataque. Segura a linha. |
| ➕ | Suporte | Cura aliados ou enfraquece inimigos. |
| ⚔️ | DPS | Dano físico corpo a corpo. |
| 🪄 | Mago | Dano mágico à distância (alcance 3), pouca vida. |
| 🏹 | Arqueiro | Dano físico à distância (alcance 3), pouca vida. |
| 💀 | Assassino | Frágil, mas escolhe o alvo dentro da fileira. |

## 10. Estrelas, cores e raridade
- Estrelas de **1★ a 6★**. A **cor da carta segue as estrelas**: 1★ cinza · 2★ verde · 3★ azul · 4★ roxo · 5★ laranja · 6★ vermelho.
- A raridade (Comum, Incomum, Raro, Épico, Lendário, Mítico) aparece como texto na carta.
- Personagens fracos chegam a 4★ (alguns 5★). Lendários e Míticos começam em 4★ e alguns chegam a 6★.

## 11. Evolução
- **Status:** ataque e vida = base × (1 + 0,08 × (nível − 1)) × (1 + 0,15 × (estrelas − 1)), arredondado.
- **XP:** Pergaminho de Ki +100, Cristal de Ki +400, Orbe do Dragão Ancestral +1500. Subir do nível N exige 80 × 1,12^(N−1) XP (cada nível pede mais). Ao chegar em 100% da barra, o nível sobe.
- **Nível máximo** = 10 × estrelas. No nível máximo, **Despertar** (+1★) custa 4 × estrelas atuais em **Essências ✴**.
- **Habilidades evoluem** com estrelas (e algumas com nível), sempre com teto:
  - resistência máxima **3** (física e mágica);
  - redução de ataque por Sifão: no máximo **2** no total, mesmo com vários Nyx;
  - no máximo **3 Crias** por lado;
  - dano mínimo sempre **1**.

## 12. Personagens
Ataque/vida mostrados em 1★ nível 1 (base) e, entre parênteses, na estrela mínima do personagem.

| Personagem | Categoria | Raridade | Estrelas | Custo | Ataque / Vida | Dano | Alcance | Resist. fís./mág. | Habilidade e evolução |
|---|---|---|---|---|---|---|---|---|---|
| Riku Vendaval | ⚔️ DPS | Comum | 1–4★ | 2 | 3 / 6 (3 / 6 em 1★) | Físico | 1 | 0/0 | Salto Vendaval — Bônus de investida: +1 em 3★, +2 em 4★, +1 extra no nível 30 (máx. +3). |
| Nara Lâmina-Lunar | ⚔️ DPS | Incomum | 1–4★ | 2 | 3 / 6 (3 / 6 em 1★) | Físico | 1 | 0/0 | Corte Diagonal — 3★: ao bater em frente, também corta a diagonal com 50% do dano · 4★: 100%. |
| Toru Sombra-Reversa | 🛡️ Tanque | Incomum | 1–5★ | 3 | 2 / 10 (2 / 10 em 1★) | Físico | 1 | 1/0 | Golpe Reverso<br>Postura de Guarda — 3★: +1 de resistência física · 5★: +2 (máx.). |
| Aiko Flecha-Celeste | 🏹 Arqueiro | Raro | 2–5★ | 3 | 3 / 4 (3 / 5 em 2★) | Físico | 3 | 0/0 | Flecha Dupla — 3★: 2ª flecha de 1 · 4★: 2 · 5★: 3; +1 no nível 25 (máx. 3). |
| Lyra Olho-de-Falcão | 🪄 Mago | Raro | 2–5★ | 3 | 3 / 4 (3 / 5 em 2★) | Mágico | 3 | 0/1 | Feixe Perfurante — Dano nos de trás: 50% (2–3★) · 75% (4★) · 100% (5★). |
| Gorath Muralha-de-Ferro | 🛡️ Tanque | Raro | 2–5★ | 4 | 2 / 12 (2 / 14 em 2★) | Físico | 1 | 2/0 | Inabalável — 4★: +1 de resistência física · 5★: também +1 de resistência mágica. |
| Mei Lótus-Celeste | ➕ Suporte | Raro | 2–5★ | 3 | 2 / 5 (2 / 6 em 2★) | Mágico | 3 | 0/1 | Bênção do Lótus — Cura 2 (2–3★) · 3 (4–5★); +1 no nível 20 (máx. 4). |
| Yume Caçadora | 💀 Assassino | Épico | 3–5★ | 3 | 4 / 4 (5 / 5 em 3★) | Físico | 1 | 0/0 | Instinto Predador — Execução: +1 em 3★, +2 em 4★, +3 em 5★; +1 no nível 25 (máx. +3). |
| Zarek do Eclipse | 💀 Assassino | Épico | 3–5★ | 4 | 4 / 5 (5 / 7 em 3★) | Físico | 1 | 0/0 | Emboscada — Perfura 1 de resistência em 3★, 2 em 4★, 3 em 5★; +1 no nível 25 (máx. 3). |
| Kenji Punho-Espelhado | ⚔️ DPS | Lendário | 4–6★ | 5 | 4 / 8 (6 / 12 em 4★) | Físico | 1 | 1/0 | Punho Espelhado — Multiplicador: ×2 (4★) · ×2,25 (5★) · ×2,5 (6★, máx.). |
| Nyx-07 | ➕ Suporte | Lendário | 4–5★ | 5 | 2 / 7 (3 / 10 em 4★) | Mágico | 3 | 0/1 | Sifão de Energia — −1 de ataque (4★) · −2 (5★). |
| Vorax | 🪄 Mago | Mítico | 4–6★ | 6 | 4 / 6 (6 / 9 em 4★) | Mágico | 3 | 0/1 | Prole Sombria — Vida da cria: 1 (4★) · 2 (5★) · 3 (6★). Ataque: 2, +1 a cada 15 níveis (máx. 4). |

Habilidades em detalhe:
- **Salto Vendaval:** pula 1 unidade (2 casas). No turno em que salta, ataca com o bônus de investida.
- **Corte Diagonal:** ataca a diagonal logo à frente quando não há ninguém em frente. A partir de 3★, ao bater em frente também corta a diagonal (50%; 100% em 4★).
- **Golpe Reverso:** prioriza o inimigo na diagonal logo atrás.
- **Postura de Guarda:** resistência física extra por estrela.
- **Flecha Dupla:** segunda flecha de dano fixo no mesmo alvo.
- **Feixe Perfurante:** atravessa a fileira, ferindo também quem está atrás do alvo (dentro do alcance 3).
- **Inabalável:** não pode ser empurrado; ganha resistência em 4★/5★.
- **Bênção do Lótus:** cura os 8 vizinhos (inclusive a outra fileira) no início da ação.
- **Instinto Predador:** menor vida da fileira até 2 casas; dano extra em alvos com metade da vida ou menos.
- **Emboscada:** mais distante da fileira até 2 casas; ignora parte da resistência.
- **Punho Espelhado:** ao sofrer golpe físico corpo a corpo de frente, contra-ataca com ataque multiplicado e empurra o agressor 1 casa para trás.
- **Sifão de Energia:** enquanto em campo, todos os inimigos perdem ataque (ataque mínimo 1).
- **Prole Sombria:** ao derrotar, surge uma **Cria Sombria** (maga, alcance 3, ataque mágico) na casa do derrotado ou na antiga casa de Vorax. Crias também geram crias. Cria: ataque 2 (+1 a cada 15 níveis de quem a gerou, máx. 4); vida 1/2/3 conforme as estrelas.

## 13. Aventura
- 10 fases; vencer libera a próxima. Primeira vitória dá a recompensa completa; repetir dá 50%.
- Desbloqueios: **Kenji** (fase 3), **Nyx-07** (fase 5), **Vorax** (fase 8).
- Derrota dá 1 Pergaminho de Ki de consolo.
- Progresso salvo no navegador (localStorage).
