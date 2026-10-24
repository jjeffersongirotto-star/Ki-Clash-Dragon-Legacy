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
- **Faixa de estrelas** (estrela inicial → máxima):
  - começa em **1★ ou 2★** → vai até **4★**;
  - começa em **3★** → vai até **5★**;
  - começa em **4★ ou 5★** → vai até **6★**;
  - **personagens únicos** (muito fortes): começam em **5★** e vão até **6★** — hoje **Kenji** e **Vorax**.

| Começa | Máximo | Personagens |
|---|---|---|
| 1★ | 4★ | Riku, Nara, Toru |
| 2★ | 4★ | Aiko, Lyra, Gorath, Mei |
| 3★ | 5★ | Yume, Zarek |
| 4★ | 6★ | Nyx-07 |
| 5★ (único) | 6★ | Kenji, Vorax |

### Evolução visual por estrela
Cada Despertar muda o visual do personagem em todas as telas (coleção, treino, mão e batalha). Os efeitos se acumulam:
- **1★:** roupa simples, sem aura.
- **2★:** aura fraca, acabamento e faixa no peito.
- **3★:** ombreiras de metal, aura mais forte, cabelo maior.
- **4★:** peitoral com gema, capa, olhos brilhando na cor da aura.
- **5★:** tudo em ouro, diadema/coroa, ombreiras com espinhos, cabelo energizado com brilho, partículas de ki.
- **6★:** forma suprema — cabelo radiante, halo dourado, raios e aura dupla.
- O físico cresce a cada estrela (ombros mais largos e cabelo maior).
- Ao Despertar, uma animação mostra o visual antigo virando o novo (**DESPERTAR!**).

### Cenário de fundo de cada personagem
Cada retrato tem um cenário próprio, que também fica mais rico a cada estrela (mais camadas, luz, partículas e cores). A borda colorida da carta continua mostrando as estrelas.

| Personagem | Cenário | O que aparece nas estrelas mais altas |
|---|---|---|
| Riku | Vento e céu aberto | nuvens (3★), folhas ao vento (4★), redemoinhos (5★), sol brilhante (6★) |
| Nara | Noite de luar | lua maior e mais estrelas a cada ★, montanhas (3★), halo da lua (5★), estrelas cadentes (6★) |
| Toru | Templo das sombras | lanterna (2★), portão do templo (3★), névoa e 2 lanternas (4★), brasas (5★), fogo roxo (6★) |
| Aiko | Acima das nuvens | mais nuvens a cada ★, céu lilás (3★), arco-íris (4★), pôr do sol (5★), raios de sol (6★) |
| Lyra | Campo de estrelas | nebulosa (3★), constelações (4★), segunda nebulosa (5★), galáxia (6★) |
| Gorath | Fortaleza de ferro | muralha mais alta a cada ★, ameias (3★), tochas (4★), céu em brasa (6★) |
| Mei | Lago de lótus | mais lótus a cada ★, reflexos (3★), céu rosado (4★), vaga-lumes (5★), brilho celestial (6★) |
| Yume | Caçada na floresta | lua entre as árvores (3★), olhos vermelhos na mata (4★), luar forte (5★), pétalas (6★) |
| Zarek | Eclipse | coroa do eclipse cresce a cada ★, horizonte (3★), raios do eclipse (4★), labaredas (6★) |
| Kenji | Dojô | pergaminho (3★), luz dourada (5★), tochas e 2º pergaminho (6★) |
| Nyx-07 | Laboratório tecnológico | telas (3★), plataforma holográfica (5★), fluxo de dados (6★) |
| Vorax e Cria | Abismo sombrio | mais tentáculos e olhos a cada ★, fenda de energia (5★), vórtice (6★) |

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
| Toru Sombra-Reversa | 🛡️ Tanque | Incomum | 1–4★ | 3 | 2 / 11 (2 / 11 em 1★) | Físico | 1 | 1/0 | Golpe Reverso<br>Postura de Guarda — 3★: +1 de resistência física · 4★: +2 (máx.). |
| Aiko Flecha-Celeste | 🏹 Arqueiro | Raro | 2–4★ | 3 | 3 / 5 (3 / 6 em 2★) | Físico | 3 | 0/0 | Flecha Dupla — 2★: 2ª flecha de 1 · 3★: 2 · 4★: 3 (máx. 3); +1 no nível 25. |
| Lyra Olho-de-Falcão | 🪄 Mago | Raro | 2–4★ | 3 | 3 / 4 (3 / 5 em 2★) | Mágico | 3 | 0/1 | Feixe Perfurante — Dano nos de trás: 50% (2★) · 75% (3★) · 100% (4★). |
| Gorath Muralha-de-Ferro | 🛡️ Tanque | Raro | 2–4★ | 4 | 2 / 12 (2 / 14 em 2★) | Físico | 1 | 2/0 | Inabalável — 3★: +1 de resistência física · 4★: também +1 de resistência mágica. |
| Mei Lótus-Celeste | ➕ Suporte | Raro | 2–4★ | 3 | 2 / 5 (2 / 6 em 2★) | Mágico | 3 | 0/1 | Bênção do Lótus — Cura 2 (2–3★) · 3 (4★); +1 no nível 20 (máx. 4). |
| Yume Caçadora | 💀 Assassino | Épico | 3–5★ | 3 | 4 / 4 (5 / 5 em 3★) | Físico | 1 | 0/0 | Instinto Predador — Execução: +1 em 3★, +2 em 4★, +3 em 5★; +1 no nível 25 (máx. +3). |
| Zarek do Eclipse | 💀 Assassino | Épico | 3–5★ | 4 | 4 / 5 (5 / 7 em 3★) | Físico | 1 | 0/0 | Emboscada — Perfura 1 de resistência em 3★, 2 em 4★, 3 em 5★; +1 no nível 25 (máx. 3). |
| Kenji Punho-Espelhado ✦ | ⚔️ DPS | Lendário | 5–6★ | 5 | 3 / 7 (5 / 11 em 5★) | Físico | 1 | 1/0 | Punho Espelhado — Multiplicador: ×2 (5★) · ×2,25 (6★, máx.). |
| Nyx-07 | ➕ Suporte | Lendário | 4–6★ | 5 | 2 / 6 (3 / 9 em 4★) | Mágico | 3 | 0/1 | Sifão de Energia — −1 de ataque (4–5★) · −2 (6★). |
| Vorax ✦ | 🪄 Mago | Mítico | 5–6★ | 6 | 3 / 6 (5 / 10 em 5★) | Mágico | 3 | 0/1 | Prole Sombria — Vida da cria: 1 (5★) · 2 (6★). Ataque: 2, +1 a cada 15 níveis (máx. 4). |

✦ = **personagem único**: muito forte, já nasce em 5★ e só chega a 6★.

Habilidades em detalhe:
- **Salto Vendaval:** pula 1 unidade (2 casas). No turno em que salta, ataca com o bônus de investida.
- **Corte Diagonal:** ataca a diagonal logo à frente quando não há ninguém em frente. A partir de 3★, ao bater em frente também corta a diagonal (50%; 100% em 4★).
- **Golpe Reverso:** prioriza o inimigo na diagonal logo atrás.
- **Postura de Guarda:** resistência física extra por estrela.
- **Flecha Dupla:** segunda flecha de dano fixo no mesmo alvo.
- **Feixe Perfurante:** atravessa a fileira, ferindo também quem está atrás do alvo (dentro do alcance 3).
- **Inabalável:** não pode ser empurrado; ganha resistência em 3★/4★.
- **Bênção do Lótus:** cura os 8 vizinhos (inclusive a outra fileira) no início da ação.
- **Instinto Predador:** menor vida da fileira até 2 casas; dano extra em alvos com metade da vida ou menos.
- **Emboscada:** mais distante da fileira até 2 casas; ignora parte da resistência.
- **Punho Espelhado:** ao sofrer golpe físico corpo a corpo de frente, contra-ataca com ataque multiplicado e empurra o agressor 1 casa para trás.
- **Sifão de Energia:** enquanto em campo, todos os inimigos perdem ataque (ataque mínimo 1).
- **Prole Sombria:** ao derrotar, surge uma **Cria Sombria** (maga, alcance 3, ataque mágico) na casa do derrotado ou na antiga casa de Vorax. Crias também geram crias. Cria: ataque 2 (+1 a cada 15 níveis de quem a gerou, máx. 4); vida 1 (5★) ou 2 (6★).

## 13. Equipe e janelas do jogo
- A equipe tem de 3 a 6 personagens.
- Com a equipe cheia, **Colocar na equipe** abre a janela de **troca**: todas as cartas da equipe começam marcadas; toque nas que vão **sair** (ficam cinza com ✖). **Trocar** só libera quando o número certo estiver desmarcado; **Cancelar** não muda nada.
- Todas as confirmações e avisos (sair da batalha, apagar progresso, equipe mínima) usam janelas do próprio jogo, no tema escuro/dourado.

## 14. Aventura
- 10 fases; vencer libera a próxima. Primeira vitória dá a recompensa completa; repetir dá 50%.
- Desbloqueios: **Kenji** (fase 3), **Nyx-07** (fase 5), **Vorax** (fase 8).
- Derrota dá 1 Pergaminho de Ki de consolo.
- Progresso salvo no navegador (localStorage).
