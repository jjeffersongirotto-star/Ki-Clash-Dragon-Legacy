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
2. Você compra **1 carta** (se a mão de 6 estiver cheia, não compra — ver seção 4).
3. Invoca quantas cartas a energia permitir (cada carta tem um custo), em casas livres da sua zona.
4. Ao tocar **LUTAR**, suas unidades agem sozinhas, da mais avançada para a mais recuada. Depois o inimigo compra, invoca e age.

## 4. Mão e baralho
### Baralho de 40 cartas
- A **equipe é o baralho**: **10 cartas diferentes × 4 cópias = 40 cartas**. A IA também joga com 10 cartas × 4.
- **Equipe com menos de 10 personagens** (de 3 a 9): as vagas que faltam **repetem as cartas da equipe em ordem** (a 1ª carta ganha um 2º grupo de 4 cópias, depois a 2ª, e assim por diante). Cada grupo tem a sua própria fila de compra. O baralho continua com 40 cartas. Exemplo: com os 9 personagens iniciais, a 1ª carta da equipe fica com 8 cópias.
- **Equipe da IA:** cada fase tem o seu conjunto de personagens; ele é repetido em ordem até formar 10 grupos (ex.: fase 1 = Riku, Nara, Riku, Nara… → 5 grupos de cada).
- Na batalha, o **Baralho** fica à esquerda da mão (com quantas cartas ainda podem ser compradas) e as **Derrotadas** à direita (com quantas cópias já caíram).

### Mão
- A **mão tem 6 cartas**. A partida começa com **6 cartas diferentes** sorteadas.
- Compra de **1 carta por rodada**, no início do turno. Se a mão estiver **cheia (6)**, a rodada **não compra** — e, como não houve compra, a fila de nenhuma carta anda.
- Cartas não usadas **ficam na mão**.
- A mão pode ficar vazia se você jogar tudo, mas no turno seguinte sempre há compra enquanto restar alguma carta no Baralho.

### Cópias em campo e derrotadas
- A carta jogada sai da mão e vira **unidade em campo**. Enquanto a unidade está viva, aquela cópia não está no Baralho.
- Quando a unidade **morre**, aquela cópia vai para as **Derrotadas e nunca volta**. A carta fica com 3 cópias no ciclo, depois 2, e assim por diante.
- Uma carta com as **4 cópias derrotadas sai do rodízio**. Crias Sombrias não vêm de cartas e não vão para as Derrotadas.

### Compra semi-aleatória (fila de cada carta)
- **Toda compra conta**, inclusive a mão inicial (que é a compra 0). A contagem começa **na compra**, não quando a carta é jogada: ficar parada na mão **não pausa** a fila.
- Depois de comprada, a carta fica **bloqueada nas 6 compras seguintes**.
- Na **7ª, 8ª e 9ª** compra depois dela, ela **pode vir no sorteio** (entre todas as cartas liberadas).
- Se não veio até a 9ª, vem **garantida na 10ª**.
- **Exceção do começo:** as 6 cartas da mão inicial podem voltar no sorteio a partir da **5ª compra** (as compras 1 a 4 trazem as 4 cartas que ficaram fora da mão). Elas ficam **garantidas a partir da 8ª compra**. Depois disso vale a regra normal (7ª–9ª sorteio, 10ª garantida).
- **Garantias em fila:** se várias cartas vencem ao mesmo tempo, sai **uma por compra**, na ordem em que foram compradas (10ª, 11ª, 12ª...). Uma compra que traga 2 cartas atende 2 garantias de uma vez.
- **Ordem de escolha numa compra:** 1) garantias vencidas, em fila; 2) sorteio entre as cartas liberadas; 3) se nenhuma estiver liberada, vem a que está **mais perto de liberar**, para a compra nunca falhar.
- Uma carta só pode vir se tiver **cópia no Baralho**. Se todas as cópias vivas estão na mão ou em campo, ela espera; se for uma garantia, sai assim que tiver cópia disponível.
- **Efeito prático:** com as 10 cartas no rodízio e 1 compra por rodada, a regra deixa um intervalo de exatamente 10 compras entre duas vindas da mesma carta. A partida começa com uma ordem sorteada, e essa ordem tende a se repetir. O sorteio volta a variar quando cartas saem do rodízio (4 cópias derrotadas) ou ficam sem cópia disponível no Baralho.

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
  - Zarek e Yume (mira 2) e a Cria Sombria (alcance 2): da **penúltima**;
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

### Visual das cartas
Todas as cartas (mão, coleção, equipe, treino, troca de equipe, detalhes e recompensas) seguem o mesmo padrão:
- **Moldura metálica chanfrada** na cor das estrelas.
- **Cenário** do personagem ao fundo, com uma **aura de energia** na cor do personagem.
- O **personagem grande**, saindo um pouco pela borda de cima da moldura.
- **Medalhões em relevo:** custo de energia (azul, canto superior esquerdo), categoria (canto superior direito) e nível (dourado, à esquerda).
- **Estrelas** no topo e **faixa com o nome** embaixo; abaixo dela, ataque, vida, ícones das habilidades e raridade · categoria.
- Quanto mais estrelas, mais brilho: 3★ reflexo de luz passando; 4★ aura pulsando com raios girando; **5★ e 6★ premium** com borda dourada, brilho pulsante e faíscas; 6★ ainda com metal em movimento e raios mais rápidos.
- Cartas pequenas (mão no celular) mostram só o primeiro nome; cartas bloqueadas ficam cinza e sem animação.

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
| Riku | Vento e céu aberto | mais rajadas de vento a cada ★, colinas (2★), nuvens (3★), folhas ao vento (4★) |
| Nara | Noite de luar | lua maior e mais estrelas a cada ★, montanhas (3★), halo da lua (5★), estrelas cadentes (6★) |
| Toru | Templo das sombras (portal) | lanterna (2★), santuário (3★), névoa e 2 lanternas (4★), brasas (5★), fogo roxo (6★) |
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
| Vorax ✦ | 🪄 Mago | Mítico | 5–6★ | 6 | 3 / 6 (5 / 10 em 5★) | Mágico | 3 | 0/1 | Prole Sombria — Cria: ataque 2 e vida 1 (5★) · ataque 3 e vida 2 (6★). |
| *Cria Sombria* (invocada) | 🪄 Mago | — | — | — | 2 ou 3 / 1 ou 2 | Mágico | 2 | 0/0 | Disparo Sombrio (alcance 2) e Prole Sombria. |

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
- **Prole Sombria:** ao derrotar, surge uma **Cria Sombria** na casa do derrotado ou na antiga casa de Vorax. Crias também geram crias (máx. 3 por lado). A cria tem **ataque 2** com Vorax em **5★** e **ataque 3** com Vorax em **6★**; vida 1 (5★) ou 2 (6★). Uma cria gerada por outra cria herda as mesmas estrelas.
- **Disparo Sombrio (Cria):** ataque **mágico** no inimigo **mais próximo até 2 casas à frente** na própria fileira (como as unidades de longo alcance, mas com alcance 2), inclusive o herói a partir da penúltima coluna. Não avança quando pode atacar.

## 13. Equipe e janelas do jogo
- A equipe tem de **3 a 10** personagens e é o seu baralho (cada um vale 4 cópias; com menos de 10, os primeiros se repetem — ver seção 4).
- Novo jogo: a equipe começa com os **9 personagens iniciais**. Ao desbloquear um personagem, ele **entra direto na equipe** se houver vaga.
- Saves antigos (equipe de até 6) são completados automaticamente até 10 com os seus personagens mais fortes que estavam fora da equipe (uma única vez).
- Com a equipe cheia, **Colocar na equipe** abre a janela de **troca**: todas as cartas da equipe começam marcadas; toque nas que vão **sair** (ficam cinza com ✖). **Trocar** só libera quando o número certo estiver desmarcado; **Cancelar** não muda nada.
- Todas as confirmações e avisos (sair da batalha, apagar progresso, equipe mínima) usam janelas do próprio jogo, no tema escuro/dourado.

## 14. Aventura
- 10 fases; vencer libera a próxima. Primeira vitória dá a recompensa completa; repetir dá 50%.
- Desbloqueios: **Kenji** (fase 3), **Nyx-07** (fase 5), **Vorax** (fase 8).
- Derrota dá 1 Pergaminho de Ki de consolo.
- Progresso salvo no navegador (localStorage).
