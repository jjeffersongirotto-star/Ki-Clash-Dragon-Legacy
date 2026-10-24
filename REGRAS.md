# Regras do Ki-Clash: Dragon Legacy

> Documento oficial com **todas** as regras atuais do jogo. Toda mudança de regra deve atualizar este arquivo e o [CHANGELOG.md](CHANGELOG.md).

## 1. Objetivo
Zerar a vida do **herói inimigo** antes que o inimigo zere a sua. Herói do jogador: **20** de vida. Herói inimigo: de 12 (fase 1) a 30 (fase 10).

## 2. Arena e Lutadores Interativos
- **2 fileiras × 7 colunas.** Você fica à esquerda, o inimigo à direita.
- Cada Líder (Herói) aparece em **corpo inteiro** logo **depois da última coluna** do seu lado (com barra de vida no topo da tela e nos pés). Ele conta como uma unidade parada numa **coluna virtual** após o fim da arena, alcançável pelas **duas fileiras**.
- **Zona de invocação:** as **3 primeiras colunas** do seu lado (colunas 1–3). A IA usa as 3 do lado dela (colunas 5–7).
- **Unidades na Arena:** cada carta invocada entra em campo como um **lutador anime de corpo inteiro** sobre um círculo tático de invocação, exibindo `ATQ | VIDA` nos pés e animando cada ação:
  - **Caminhada (`MOVE` / `JUMP`):** pernas articuladas andando/correndo pelas casas com nuvens de poeira e seta indicadora `MOVE`.
  - **Ataque corpo a corpo (`HIT!`):** investida com golpe de arma/punho, onda de corte crescente e impacto `HIT!`.
  - **Ataque à distância / Feixe de Ki:** postura de disparo com **feixe de Ki contínuo** (estilo Kamehameha) para ataques mágicos ou projéteis velozes para arqueiros.
  - **Dano e Derrota (`Necropolis`):** animação de recuo ao sofrer dano com números flutuantes e ida para a **Necropolis (Derrotadas)** ao cair.

## 3. Turnos, energia e modo Auto
1. No início do seu turno você recebe **energia ⚡** = 2 + número do turno (3 no 1º turno), máximo **10**. A energia não acumula.
2. Você compra **as cartas que faltarem para a mão voltar a ter 6** (jogou 3, compra 3; com a mão cheia, não compra — ver seção 4).
3. Invoca quantas cartas a energia permitir (cada carta tem um custo), em casas livres da sua zona.
4. Ao tocar **LUTAR** (ou ativar o botão **Auto**), suas unidades agem sozinhas, da mais avançada para a mais recuada. Depois o inimigo compra, invoca e age.

### Tela de batalha
- **HUD superior VS:** no topo da tela, as barras de vida do seu Líder (**Você**) e do Líder inimigo (com o nome da fase), frente a frente, e o **turno atual** (T) no centro.
- **Botão Auto (`Auto: OFF` / `Auto: ON`):** com o Auto ligado, o jogo **invoca suas cartas sozinho** (com a mesma lógica de invocação da IA) e toca **LUTAR** a cada turno, até a batalha acabar ou você desligar. Ele desliga sozinho ao fim da batalha ou ao sair.
- **Contador `Em campo (N)`:** mostra quantas unidades suas estão vivas na arena.
- **Inspecionar carta em batalha:** tocar de novo numa carta já selecionada da mão, ou em **🔍 Detalhes** / **🔍 Ver Carta** (no painel de informações de uma carta da mão ou de uma unidade, aliada ou inimiga), abre a janela de detalhes da carta, no estilo do jogo.

## 4. Mão e baralho
### Baralho de 40 cartas
- A **equipe é o baralho**: **10 cartas diferentes × 4 cópias = 40 cartas**. A IA também joga com 10 cartas × 4.
- **Mínimo obrigatório:** só dá para entrar na batalha com **exatamente 10 personagens diferentes** na equipe. Não há mais preenchimento com cartas repetidas. Com menos de 10, tocar em **Lutar** abre a janela do jogo **Equipe incompleta**, que mostra quantos faltam e oferece **Ir para a equipe** (nunca um alerta do navegador).
- **Equipe da IA:** cada fase tem **10 personagens diferentes** (ver seção 14).
- Na batalha, o **Baralho** fica à esquerda da mão (com quantas cartas ainda podem ser compradas) e a **Necropolis (Derrotadas)** à direita (com quantas cópias já caíram).

### Mão
- A **mão tem 6 cartas**. A partida começa com **6 cartas diferentes** sorteadas.
- No início de cada turno você **compra o que faltar para a mão voltar a ter 6** (jogou 1, compra 1; jogou 4, compra 4). Todas as cartas dessa rodada fazem parte da **mesma compra** na fila (a compra conta 1 vez, não 1 por carta).
- Se a mão estiver **cheia (6)**, a rodada **não compra** — e, como não houve compra, a fila de nenhuma carta anda.
- Cartas não usadas **ficam na mão**.
- A mão pode ficar vazia se você jogar tudo, mas no turno seguinte ela volta a 6 enquanto houver cartas no Baralho (se o Baralho tiver menos cartas que o necessário, vem o que houver).

### Cópias em campo e derrotadas (Necropolis)
- A carta jogada sai da mão e vira **unidade em campo**. Enquanto a unidade está viva, aquela cópia não está no Baralho.
- Quando a unidade **morre**, aquela cópia vai para a **Necropolis (Derrotadas) e nunca volta**. A carta fica com 3 cópias no ciclo, depois 2, e assim por diante.
- Uma carta com as **4 cópias derrotadas sai do rodízio**. Crias Sombrias não vêm de cartas e não vão para as Derrotadas.

### Compra semi-aleatória (fila de cada carta)
- **Toda compra conta**, inclusive a mão inicial (que é a compra 0). A contagem começa **na compra**, não quando a carta é jogada: ficar parada na mão **não pausa** a fila.
- Depois de comprada, a carta fica **bloqueada nas 6 compras seguintes**.
- Na **7ª, 8ª e 9ª** compra depois dela, ela **pode vir no sorteio** (entre todas as cartas liberadas).
- Se não veio até a 9ª, vem **garantida na 10ª**.
- **Exceção do começo:** as 6 cartas da mão inicial podem voltar no sorteio a partir da **5ª compra** (as compras 1 a 4 trazem as 4 cartas que ficaram fora da mão). Elas ficam **garantidas a partir da 8ª compra**. Depois disso vale a regra normal (7ª–9ª sorteio, 10ª garantida).
- **Garantias em fila:** se várias cartas vencem ao mesmo tempo, elas saem na ordem em que foram compradas (10ª, 11ª, 12ª...). Como cada compra traz quantas cartas faltam na mão, **uma compra de 2 cartas atende 2 garantias, uma de 3 atende 3**, e assim por diante; as que sobrarem continuam na fila para a próxima compra.
- **Ordem de escolha numa compra:** 1) garantias vencidas, em fila; 2) sorteio entre as cartas liberadas; 3) se ainda faltarem cartas para completar 6 e nenhuma outra estiver liberada, vem a que está **mais perto de liberar** — completar a mão tem prioridade sobre o bloqueio. Isso só acontece quando você joga muitas cartas de uma vez (ex.: no começo, as 4 que ficaram fora da mão inicial acabam e as 6 iniciais só liberam na 5ª compra).
- Uma carta só pode vir se tiver **cópia no Baralho**. Se todas as cópias vivas estão na mão ou em campo, ela espera; se for uma garantia, sai assim que tiver cópia disponível.
- **Efeito prático (aleatoriedade):** como a quantidade comprada por rodada varia com o número de cartas que você jogou, o número de cartas por compra muda a cada turno e a ordem **não fica presa num ciclo fixo** (na v0.7, com 1 carta por rodada, cada carta voltava sempre na 10ª compra). Agora uma carta pode voltar na 7ª, 8ª, 9ª ou 10ª compra de verdade, e partidas diferentes têm sequências diferentes. Quando você joga só 1 carta por rodada, o comportamento é o mesmo da v0.7.

## 5. Ação de cada unidade
1. **Cura** (Mei: aliados vizinhos; Sora: o aliado mais ferido da própria fileira).
2. Se houver **alvo no alcance**, ataca e **não anda**.
3. Senão, **anda até 2 casas** para frente (parando assim que um alvo entra no alcance) e ataca se puder.
4. **Bloqueio:** ninguém atravessa uma unidade (aliada ou inimiga) sem derrotá-la, exceto quem tem **Salto** (pula 1 unidade, avançando 2 casas).
5. **Passo da vitória:** ao **derrotar um inimigo**, a unidade **avança 1 casa** se ela estiver livre (no máximo 1 passo por ação).

## 6. Alcance e alvos
- **Só a própria fileira:** ninguém ataca unidades da outra fileira, exceto as habilidades **diagonais** (Corte Diagonal e Golpe Reverso) e a **lateral** Explosão de Brasas (Kael), que atinge a casa da mesma coluna na outra fileira.
- **Corpo a corpo (alcance 1):** só a casa **logo à frente**.
- **Longo alcance (alcance 3):** o inimigo **mais próximo** até **3 casas à frente**. Não avança quando pode atacar.
- **Miras especiais** (sempre na própria fileira):
  - **Emboscada (Zarek):** o inimigo **mais distante** até 2 casas.
  - **Instinto Predador (Yume):** o inimigo com **menos vida** até 2 casas.
  - **Caça-Conjuradores (Ren):** prioriza inimigos de **longo alcance** (magos, arqueiros, suportes à distância) até 2 casas; sem eles, ataca normalmente.
  - **Ataque Surpresa (Kuro):** o inimigo de **maior ataque** até 2 casas.
  - **Feixe Perfurante (Lyra):** o mais próximo e também **os que estão atrás dele** no alcance 3.
  - **Corte Diagonal (Nara):** a casa diagonal logo à frente, se não houver ninguém em frente.
  - **Golpe Reverso (Toru):** prioriza a casa diagonal logo atrás.
- **Herói:** se não houver unidade inimiga válida, a unidade ataca o herói com seu alcance normal:
  - corpo a corpo: da **última coluna**;
  - Zarek, Yume, Ren e Kuro (mira 2) e a Cria Sombria (alcance 2): da **penúltima**;
  - longo alcance (3): a partir da **antepenúltima**.
- Unidades inimigas no alcance sempre têm **prioridade** sobre o herói.

## 7. Dano
- **Físico 👊** é reduzido pela **resistência física**; **Mágico ✨** pela **resistência mágica**. Exemplo: 3 de dano físico contra resistência física 1 = 2.
- **Dano mínimo: 1** por golpe.
- O herói não tem resistência.

## 8. Fúria de batalha 🔥
A partir do **turno 8**, todas as unidades dos dois lados ganham **+1 de ataque**, e mais +1 a cada **3 turnos** (turno 8: +1, 11: +2, 14: +3…). Isso evita lutas travadas. No **turno 40**, vence quem tiver mais vida (em %) no herói; se for igual, empate.

## 9. Categorias e Raças/Origens
### Categorias de combate (ícone no canto superior direito da carta)
| Ícone | Categoria | Papel |
|---|---|---|
| 🛡️ | Tanque | Muita vida e resistência, pouco ataque. Segura a linha. |
| ➕ | Suporte | Cura aliados ou enfraquece inimigos. |
| ⚔️ | DPS | Dano físico corpo a corpo. |
| 🪄 | Mago | Dano mágico à distância (alcance 3), pouca vida. |
| 🏹 | Arqueiro | Dano físico à distância (alcance 3), pouca vida. |
| 💀 | Assassino | Frágil, mas escolhe o alvo dentro da fileira. |

### Raças e Origens Anime
| Ícone | Raça / Origem | Personagens |
|---|---|---|
| 🌍 | Humano | Riku Vendaval, Kenji Punho-Espelhado, Hana Pena-Veloz, Ren Presa-Oculta |
| 🪐 | Extraterrestre | Nara Lâmina-Lunar, Aiko Flecha-Celeste, Zarek do Eclipse, Suri Maré-Gélida |
| 👹 | Monstro | Gorath Muralha-de-Ferro, Daichi Punho-de-Rocha, Tobi Tambor-de-Guerra, Kuro Garra-Noturna |
| 🔮 | Mago Arcano | Lyra Olho-de-Falcão, Mei Lótus-Celeste, Kael Chama-Rubra, Sora Brisa-Serena |
| 🤖 | Androide | Nyx-07, Jin Arco-Trovão, Toru Sombra-Reversa |
| ☠️ | Necromante | Vorax, Yume Caçadora, Cria Sombria |

## 10. Estrelas, cores e raridade
- Estrelas de **1★ a 6★**. A **cor da carta segue as estrelas**: 1★ cinza · 2★ verde · 3★ azul · 4★ roxo · 5★ laranja · 6★ vermelho.
- A raridade (Comum, Incomum, Raro, Épico, Lendário, Mítico) e a Raça aparecem como texto na carta.
- **Faixa de estrelas** (estrela inicial → máxima):
  - começa em **1★ ou 2★** → vai até **4★**;
  - começa em **3★** → vai até **5★**;
  - começa em **4★ ou 5★** → vai até **6★**;
  - **personagens únicos** (muito fortes): começam em **5★** e vão até **6★** — hoje **Kenji** e **Vorax**.

| Começa | Máximo | Personagens |
|---|---|---|
| 1★ | 4★ | Riku, Nara, Toru, Daichi, Sora, Tobi, Kael, Suri, Hana, Jin, Ren, Kuro (os 12 iniciais) |
| 2★ | 4★ | Aiko, Lyra, Gorath, Mei |
| 3★ | 5★ | Yume, Zarek |
| 4★ | 6★ | Nyx-07 |
| 5★ (único) | 6★ | Kenji, Vorax — **bloqueados por enquanto** ("em breve") |

### Visual das cartas (estilo Anime TCG)
Todas as cartas (mão, coleção, equipe, treino, troca de equipe, detalhes e recompensas) seguem o padrão Anime TCG:
- **Moldura metálica chanfrada** na cor das estrelas.
- **Topo:** medalhão de **Custo** de energia à esquerda, barra escura chanfrada com as **Estrelas** ao centro e orbe da **Categoria** à direita (a raça aparece ao passar o mouse e no texto da carta).
- **Medalhão de nível** (dourado, à esquerda da arte).
- **Arte vertical anime:** cenário evolutivo do personagem ao fundo, com raios de velocidade e esferas estelares, **aura de Ki** na cor do personagem e o personagem em **pose de ação com sua arma/poder**.
- **Barra inferior:** emblema explosivo de **Ataque** à esquerda, **placa metálica chanfrada com o Nome** no centro e **gota rubra de Vida** à direita — visíveis inclusive na mão de batalha.
- Nas cartas grandes, abaixo da barra: ataque (👊 físico / ✨ mágico), vida, ícones das habilidades e a linha **raça · raridade · categoria**.
- Quanto mais estrelas, mais brilho: 3★ reflexo de luz passando; 4★ aura pulsando com raios girando; **5★ e 6★ premium** com borda dourada, brilho pulsante e faíscas; 6★ ainda com metal em movimento e raios mais rápidos.
- Cartas pequenas (mão no celular) mostram só o primeiro nome; cartas bloqueadas ficam cinza e sem animação.
- **Detalhes da carta (Coleção):** mostra a carta, o **visual do lutador na arena** e um **seletor de estrelas** com as estrelas da faixa do personagem (da mínima à máxima), para ver a evolução de roupa, armadura, armas e poder em cada estrela. A estrela atual fica marcada como "(atual)". Só visualiza — não muda a carta.
- **Filtro por raça (Coleção & Equipe):** botões **🌟 Todos** e um por raça; filtra tanto os personagens obtidos quanto os "Ainda não obtidos".

### Evolução visual por estrela (Carta e Lutador na Arena)
Cada Despertar muda o visual do personagem tanto na carta quanto no lutador de corpo inteiro na arena:
- **1★:** roupa simples de aprendiz/recruta, arma/postura inicial, sem aura.
- **2★:** aura fraca, faixa de batalha cruzada e acabamento no traje.
- **3★:** ombreiras metálicas, manoplas, aura mais forte, cabelo e golpe de Ki maiores.
- **4★:** peitoral com gema de poder, capa esvoaçante, olhos brilhando na cor da aura.
- **5★:** armadura e espinhos dourados, diadema/coroa real, cabelo energizado com brilho, partículas de Ki.
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
| Daichi | Pedreira na montanha | mais pedras a cada ★, chão escuro (2★), estalagmites (3★), lava e brasas (4★) |
| Sora | Picos de bambu na névoa | mais bambus a cada ★, névoa (2★), folhas ao vento (3★), sol e brisa (4★) |
| Tobi | Acampamento de guerra | mais tendas a cada ★, fogueira (2★), 2ª fogueira e estandartes (3★), faíscas e mastros (4★) |
| Kael | Vulcão em erupção | mais brasas a cada ★, rios de lava (2★), cratera brilhando (3★), labaredas (4★) |
| Suri | Maré gelada | mais ondas a cada ★, icebergs (2★), estrelas (3★), lua gelada e espuma (4★) |
| Hana | Clareira da floresta | mais árvores a cada ★, raios de sol (3★), vaga-lumes (4★) |
| Jin | Tempestade nos penhascos | mais nuvens a cada ★, raio (2★), 2º raio e clarão (3★), chuva (4★) |
| Ren | Vielas da cidade à noite | mais janelas acesas a cada ★, varal de lanternas (2★), poste (3★), garoa (4★) |
| Kuro | Telhados sob a lua roxa | lua maior a cada ★, halo da lua (2★), olhos de gato e estrelas (3★), marcas de garra (4★) |

### Marcas próprias dos personagens iniciais
Cada um dos 9 novos tem um detalhe que o identifica desde 1★, além da evolução normal por estrela: Daichi (faixa de pedra com chifre, cicatriz e ombreiras de rocha), Sora (presilha de folha e fitas ao vento), Tobi (faixa na cabeça, pintura de guerra e baquetas), Kael (marca de chama na testa e brasas), Suri (tiara de gelo), Hana (pena no cabelo e pintura de caçadora), Jin (óculos de atirador e raio), Ren (lenço cobrindo o rosto) e Kuro (orelhas de gato e cicatrizes de garra). O chifre, as fitas, as baquetas, a tiara, a pena, o raio e as orelhas crescem a cada estrela.

## 11. Evolução
- **Status:** ataque e vida = base × (1 + 0,08 × (nível − 1)) × (1 + 0,15 × (estrelas − 1)), arredondado.
- **XP:** Pergaminho de Ki +100, Cristal de Ki +400, Orbe do Dragão Ancestral +1500. Subir do nível N exige 80 × 1,12^(N−1) XP (cada nível pede mais). Ao chegar em 100% da barra, o nível sobe.
- **Nível máximo** = 10 × estrelas. No nível máximo, **Despertar** (+1★) custa 4 × estrelas atuais em **Essências ✴**.
- **Habilidades evoluem** com estrelas (e algumas com nível), sempre com teto:
  - resistência máxima **3** (física e mágica);
  - redução de ataque por Sifão: no máximo **2** no total, mesmo com vários Nyx;
  - no máximo **3 Crias** por lado;
  - bônus de ataque vindo de aliados (Tambor de Guerra): no máximo **+2**, sem somar tambores;
  - dano mínimo sempre **1**.

## 12. Personagens
Ataque/vida mostrados em 1★ nível 1 (base) e, entre parênteses, na estrela mínima do personagem.

| Personagem | Raça | Categoria | Raridade | Estrelas | Custo | Ataque / Vida | Dano | Alcance | Resist. fís./mág. | Habilidade e evolução |
|---|---|---|---|---|---|---|---|---|---|---|
| Riku Vendaval | 🌍 Humano | ⚔️ DPS | Comum | 1–4★ | 2 | 3 / 6 (3 / 6 em 1★) | Físico | 1 | 0/0 | Salto Vendaval — Bônus de investida: +1 em 3★, +2 em 4★, +1 extra no nível 30 (máx. +3). |
| Nara Lâmina-Lunar | 🪐 Extraterrestre | ⚔️ DPS | Incomum | 1–4★ | 2 | 3 / 6 (3 / 6 em 1★) | Físico | 1 | 0/0 | Corte Diagonal — 3★: ao bater em frente, também corta a diagonal com 50% do dano · 4★: 100%. |
| Toru Sombra-Reversa | 🤖 Androide | 🛡️ Tanque | Incomum | 1–4★ | 3 | 2 / 11 (2 / 11 em 1★) | Físico | 1 | 1/0 | Golpe Reverso<br>Postura de Guarda — 3★: +1 de resistência física · 4★: +2 (máx.). |
| Aiko Flecha-Celeste | 🪐 Extraterrestre | 🏹 Arqueiro | Raro | 2–4★ | 3 | 3 / 5 (3 / 6 em 2★) | Físico | 3 | 0/0 | Flecha Dupla — 2★: 2ª flecha de 1 · 3★: 2 · 4★: 3 (máx. 3); +1 no nível 25. |
| Lyra Olho-de-Falcão | 🔮 Mago Arcano | 🪄 Mago | Raro | 2–4★ | 3 | 3 / 4 (3 / 5 em 2★) | Mágico | 3 | 0/1 | Feixe Perfurante — Dano nos de trás: 50% (2★) · 75% (3★) · 100% (4★). |
| Gorath Muralha-de-Ferro | 👹 Monstro | 🛡️ Tanque | Raro | 2–4★ | 4 | 2 / 12 (2 / 14 em 2★) | Físico | 1 | 2/0 | Inabalável — 3★: +1 de resistência física · 4★: também +1 de resistência mágica. |
| Mei Lótus-Celeste | 🔮 Mago Arcano | ➕ Suporte | Raro | 2–4★ | 3 | 2 / 5 (2 / 6 em 2★) | Mágico | 3 | 0/1 | Bênção do Lótus — Cura 2 (2–3★) · 3 (4★); +1 no nível 20 (máx. 4). |
| Yume Caçadora | ☠️ Necromante | 💀 Assassino | Épico | 3–5★ | 3 | 4 / 4 (5 / 5 em 3★) | Físico | 1 | 0/0 | Instinto Predador — Execução: +1 em 3★, +2 em 4★, +3 em 5★; +1 no nível 25 (máx. +3). |
| Zarek do Eclipse | 🪐 Extraterrestre | 💀 Assassino | Épico | 3–5★ | 4 | 4 / 5 (5 / 7 em 3★) | Físico | 1 | 0/0 | Emboscada — Perfura 1 de resistência em 3★, 2 em 4★, 3 em 5★; +1 no nível 25 (máx. 3). |
| Kenji Punho-Espelhado ✦ | 🌍 Humano | ⚔️ DPS | Lendário | 5–6★ | 5 | 3 / 7 (5 / 11 em 5★) | Físico | 1 | 1/0 | Punho Espelhado — Multiplicador: ×2 (5★) · ×2,25 (6★, máx.). |
| Nyx-07 | 🤖 Androide | ➕ Suporte | Lendário | 4–6★ | 5 | 2 / 6 (3 / 9 em 4★) | Mágico | 3 | 0/1 | Sifão de Energia — −1 de ataque (4–5★) · −2 (6★). |
| Vorax ✦ | ☠️ Necromante | 🪄 Mago | Mítico | 5–6★ | 6 | 3 / 6 (5 / 10 em 5★) | Mágico | 3 | 0/1 | Prole Sombria — Cria: ataque 2 e vida 1 (5★) · ataque 3 e vida 2 (6★). |
| Daichi Punho-de-Rocha | 👹 Monstro | 🛡️ Tanque | Comum | 1–4★ | 3 | 2 / 9 | Físico | 1 | 1/0 | Couraça de Espinhos — devolve 1 (1–2★) · 2 (3★) · 3 (4★). |
| Sora Brisa-Serena | 🔮 Mago Arcano | ➕ Suporte | Comum | 1–4★ | 2 | 1 / 5 | Mágico | 3 | 0/1 | Sopro Restaurador — cura 1 (1–2★) · 2 (3★) · 3 (4★). |
| Tobi Tambor-de-Guerra | 👹 Monstro | ➕ Suporte | Incomum | 1–4★ | 3 | 2 / 7 | Físico | 1 | 0/0 | Tambor de Guerra — vizinhos +1 de ataque (1–3★) · +2 (4★). |
| Kael Chama-Rubra | 🔮 Mago Arcano | 🪄 Mago | Incomum | 1–4★ | 3 | 3 / 4 | Mágico | 3 | 0/1 | Explosão de Brasas — explosão de 1 (1–2★) · 2 (3–4★). |
| Suri Maré-Gélida | 🪐 Extraterrestre | 🪄 Mago | Comum | 1–4★ | 2 | 2 / 5 | Mágico | 3 | 0/1 | Maré Implacável — +1 no herói (1–2★) · +2 (3★) · +3 (4★). |
| Hana Pena-Veloz | 🌍 Humano | 🏹 Arqueiro | Comum | 1–4★ | 2 | 2 / 5 | Físico | 3 | 0/0 | Tiro Certeiro — ignora 1 de resistência física (1–2★) · 2 (3–4★). |
| Jin Arco-Trovão | 🤖 Androide | 🏹 Arqueiro | Incomum | 1–4★ | 3 | 3 / 5 | Físico | 3 | 0/0 | Olho de Águia — +1 de dano a 2–3 casas (1–2★) · +2 (3–4★). |
| Ren Presa-Oculta | 🌍 Humano | 💀 Assassino | Comum | 1–4★ | 2 | 3 / 5 | Físico | 1 (mira 2) | 0/0 | Caça-Conjuradores — +1 de dano em quem ataca de longe (1–2★) · +2 (3–4★). |
| Kuro Garra-Noturna | 👹 Monstro | 💀 Assassino | Incomum | 1–4★ | 3 | 3 / 5 | Físico | 1 (mira 2) | 0/0 | Ataque Surpresa — +1 em alvo com vida cheia (1–2★) · +2 (3–4★). |
| *Cria Sombria* (invocada) | ☠️ Necromante | 🪄 Mago | — | — | — | 2 ou 3 / 1 ou 2 | Mágico | 2 | 0/0 | Disparo Sombrio (alcance 2) e Prole Sombria. |

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
- **Couraça de Espinhos (Daichi):** quem o ataca **corpo a corpo de frente** (golpe principal) sofre dano fixo de volta, se Daichi sobreviver ao golpe. Ataques à distância e golpes secundários não ativam.
- **Sopro Restaurador (Sora):** no início da ação, cura o aliado **mais ferido da própria fileira**, a qualquer distância. Sora ataca à distância (alcance 3, mágico).
- **Tambor de Guerra (Tobi):** enquanto Tobi estiver em campo, os aliados nos **8 vizinhos** (inclusive a outra fileira) ganham ataque. Vários tambores **não se somam** (vale o maior); bônus de aliados tem teto de **+2**. Crias não recebem.
- **Explosão de Brasas (Kael):** ao acertar uma unidade, a explosão causa dano mágico fixo no inimigo da **mesma coluna na outra fileira** (habilidade lateral).
- **Maré Implacável (Suri):** dano extra quando ataca o **herói** inimigo.
- **Tiro Certeiro (Hana):** ignora parte da **resistência física** do alvo.
- **Olho de Águia (Jin):** dano extra em unidades a **2 ou 3 casas** (colado, só o dano normal).
- **Caça-Conjuradores (Ren):** prioriza inimigos de longo alcance da fileira até 2 casas e causa dano extra neles.
- **Ataque Surpresa (Kuro):** mira o inimigo de maior ataque da fileira até 2 casas; dano extra se o alvo estiver com a **vida cheia**.
- **Disparo Sombrio (Cria):** ataque **mágico** no inimigo **mais próximo até 2 casas à frente** na própria fileira (como as unidades de longo alcance, mas com alcance 2), inclusive o herói a partir da penúltima coluna. Não avança quando pode atacar.

## 13. Equipe e janelas do jogo
- A equipe é o seu baralho e precisa ter **exatamente 10 personagens diferentes** para lutar (cada um vale 4 cópias). Dá para tirar alguém e ficar com menos de 10 enquanto monta a equipe, mas aí a batalha fica bloqueada: o jogo avisa ao tirar, a tela de Coleção mostra "faltam N" em vermelho, a Aventura mostra um aviso com **Completar equipe**, e **Lutar** abre a janela **Equipe incompleta** com **Ir para a equipe**.
- **Novo jogo:** você começa **só com personagens de 1★** — os **12 iniciais** (2 de cada categoria). A equipe começa com 10 deles; os outros 2 ficam na coleção para trocar. Ao desbloquear um personagem, ele **entra direto na equipe** se houver vaga.
- **Saves antigos (migração da v0.8, uma única vez):** você **mantém todos os personagens, níveis, estrelas, itens e fases** que já tinha — inclusive **Kenji e Vorax**, se já tinham sido obtidos (ninguém perde progresso). Todo save também ganha os **9 novos personagens de 1★**. Se a equipe tiver menos de 10, ela é completada com os seus personagens mais fortes que estavam fora dela.
- Com a equipe cheia, **Colocar na equipe** abre a janela de **troca**: todas as cartas da equipe começam marcadas; toque nas que vão **sair** (ficam cinza com ✖). **Trocar** só libera quando o número certo estiver desmarcado; **Cancelar** não muda nada.
- Todas as confirmações e avisos (sair da batalha, apagar progresso, equipe incompleta) usam janelas do próprio jogo, no tema escuro/dourado.

## 13.1 Progressão de personagens
- **Começo:** só personagens de **1★** (os 12 iniciais).
- **2★, 3★ e 4★:** desbloqueados pela **progressão normal**, na **primeira vitória** de cada fase (ver seção 14).
- **5★ e 6★ (Kenji e Vorax):** **bloqueados por enquanto**, sem forma de obter no jogo (nem missão especial). Aparecem na coleção, em "Ainda não obtidos", **apagados com cadeado** e a etiqueta **"🔒 Em breve"**. A forma de desbloquear será decidida numa atualização futura. Eles continuam aparecendo como **inimigos** nas fases finais.

## 14. Aventura
- 10 fases; vencer libera a próxima. Primeira vitória dá a recompensa completa; repetir dá 50%.
- **Desbloqueios (primeira vitória):** fase 1 → **Aiko** (2★) · fase 2 → **Mei** (2★) · fase 3 → **Lyra** (2★) · fase 4 → **Gorath** (2★) · fase 5 → **Yume** (3★) · fase 6 → **Zarek** (3★) · fase 8 → **Nyx-07** (4★). Kenji e Vorax: em breve.
- **Baralho da IA:** toda fase tem **10 personagens diferentes**. Fases 1 e 2 usam só personagens de 1★ (a fase 1 sem tanques); a partir da 3 entram os de 2★, 3★ e 4★; Kenji (fases 8 e 9) e Vorax (fase 10) só aparecem como inimigos.
- **Nível dos inimigos:** fase 1 = nível 1, fase 2 = nível 2 e depois 1 + 1,5 × (fase − 1), arredondado (fase 10 = nível 15, com +1★).
- Derrota dá 1 Pergaminho de Ki de consolo.
- Progresso salvo no navegador (localStorage).
