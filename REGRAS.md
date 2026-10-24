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
- **Botão Auto (`Auto: OFF` / `Auto: ON`):** com o Auto ligado, o jogo **invoca suas cartas sozinho** (com a mesma lógica de invocação da IA) e toca **LUTAR** a cada turno, até a batalha acabar ou você desligar. Ele desliga sozinho ao fim da batalha ou ao sair (cancelar a saída não desliga).
- **Contador `Em campo (N)`:** mostra quantas unidades suas estão vivas na arena.
- **Selecionar carta da mão:** tocar seleciona (e mostra as informações no painel); **tocar de novo na mesma carta tira a seleção**.
- **Inspecionar carta em batalha:** **segurar** a carta da mão (~0,5 s), ou tocar em **🔍 Detalhes** / **🔍 Ver Carta** (no painel de informações de uma carta da mão ou de uma unidade, aliada ou inimiga), abre a janela de detalhes da carta, no estilo do jogo. Ao fechar a janela, a carta **não fica selecionada**.
- **Janela de detalhes no celular:** cabe na tela e **rola por dentro**; o **✕** fica sempre visível no canto. Tocar fora da janela também fecha.
- **Painel de informações:** quando a unidade mostrada no painel é **derrotada**, o painel volta ao texto inicial.
- **HUD no celular:** o nome do inimigo diminui e quebra em 2 linhas em vez de ser cortado.
- **Sair (✕):** abre a confirmação do jogo. **Cancelar** volta à luta sem mudar nada (o **Auto continua** como estava). **Sair** interrompe na hora as animações e turnos em andamento; a luta abandonada não dá recompensa nem derrota.

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

## 10. Cores (tiers) e o degrau "+" — sem estrelas
Desde a v0.10 **não há mais estrelas**: a **cor da carta é o tier** do personagem, e o nome da cor é a raridade.

| Cor | Tier / raridade |
|---|---|
| cinza | **Comum** |
| verde | **Incomum** |
| azul | **Raro** |
| roxo | **Épico** |
| laranja | **Lendário** |
| vermelho | **Mítico** |

- **O nome na carta sempre bate com a cor** (ex.: carta azul = "Raro"). A antiga raridade fixa de cada personagem (que podia não bater com a cor) deixou de existir.
- **Cada cor tem 2 degraus: base e "+".** A escada é Comum → Comum+ → Incomum → Incomum+ → Raro → Raro+ → Épico → Épico+ → Lendário → Lendário+ → Mítico → Mítico+.
- **A cor máxima do personagem também tem "+"**, como último degrau (ex.: quem vai até Épico termina em **Épico+**).
- O "+" aparece **ao lado do nome da cor** (ex.: **Raro+**), na barra do topo da carta e nas telas. É a única mudança visual do "+".
- **Faixa de cores** (cor inicial → cor máxima; mesma faixa das antigas estrelas: 1★ = Comum, 2★ = Incomum, 3★ = Raro, 4★ = Épico, 5★ = Lendário, 6★ = Mítico):

| Começa | Máximo (último degrau) | Personagens |
|---|---|---|
| Comum | Épico+ | Riku, Nara, Toru, Daichi, Sora, Tobi, Kael, Suri, Hana, Jin, Ren, Kuro (os 12 iniciais) |
| Incomum | Épico+ | Aiko, Lyra, Gorath, Mei |
| Raro | Lendário+ | Yume, Zarek |
| Épico | Mítico+ | Nyx-07 |
| Lendário (único) | Mítico+ | Kenji, Vorax — **bloqueados por enquanto** ("em breve") |

### O degrau "+"
- O "+" **não muda habilidades** nem o visual (roupa, aura, físico e cenário do retrato).
- Ele dá só um **pequeno bônus de status: +10% (mínimo +1)** em **vida** ou em **ataque**, conforme o personagem:
  - **vida:** tanques (Toru, Gorath, Daichi), suportes (Mei, Sora, Tobi, Nyx-07) e Suri;
  - **ataque:** DPS (Riku, Nara, Kenji), assassinos (Yume, Zarek, Ren, Kuro), arqueiros (Aiko, Hana, Jin) e os magos Lyra, Kael e Vorax.
- O "+" também libera **+5 níveis máximos** (ver seção 11).
- **Habilidades só melhoram quando a cor muda** (a escala de cada habilidade é por cor, ver seção 12).

### Visual das cartas (estilo Anime TCG)
Todas as cartas (mão, coleção, equipe, treino, troca de equipe, detalhes e recompensas) seguem o padrão Anime TCG:
- **Moldura metálica chanfrada** na cor do tier.
- **Topo:** medalhão de **Custo** de energia à esquerda, barra escura chanfrada com o **nome do tier** (ex.: **RARO+**) ao centro e orbe da **Categoria** à direita (a raça aparece ao passar o mouse e no texto da carta). Não há mais estrelas na carta.
- **Medalhão de nível** (dourado, à esquerda da arte).
- **Arte vertical anime:** cenário evolutivo do personagem ao fundo, com raios de velocidade e esferas estelares, **aura de Ki** na cor do personagem e o personagem em **pose de ação com sua arma/poder**.
- **Barra inferior:** emblema explosivo de **Ataque** à esquerda, **placa metálica chanfrada com o Nome** no centro e **gota rubra de Vida** à direita — visíveis inclusive na mão de batalha.
- Nas cartas grandes, abaixo da barra: ataque (👊 físico / ✨ mágico), vida, ícones das habilidades e a linha **raça · tier · categoria**.
- Quanto mais alta a cor, mais brilho: Raro reflexo de luz passando; Épico aura pulsando com raios girando; **Lendário e Mítico premium** com borda dourada, brilho pulsante e faíscas; Mítico ainda com metal em movimento e raios mais rápidos.
- **Nomes:** cartas grandes (detalhes da coleção, treino e janela de inspeção em batalha) mostram o **nome completo**, quebrando em 2 linhas se precisar. Só as cartas pequenas (mão no celular, equipe) mostram o primeiro nome. Cartas bloqueadas ficam cinza e sem animação.
- **Detalhes da carta (Coleção):** mostra a carta, o **visual do lutador na arena** e um **seletor de cor** com as cores da faixa do personagem (da inicial à máxima), para ver a evolução de roupa, armadura, armas e poder em cada cor. A cor atual fica marcada como "(atual)" (com "+" se você já tiver). Só visualiza — não muda a carta. (Antes era o seletor de estrelas da v0.9.)
- **Filtro por raça (Coleção & Equipe):** botões **🌟 Todos** e um por raça; filtra tanto os personagens obtidos quanto os "Ainda não obtidos".

### Desempenho e efeitos por cor (v0.10.1)
O jogo mira **60 quadros por segundo** em todas as telas. Para isso, os efeitos das cores têm regras de onde animam — **a carta parada é idêntica** em qualquer lugar:
- **Carta em foco** (detalhes da Coleção, carta grande do Treinar, mão da batalha, janela de inspeção e Despertar): **todos os efeitos** da cor — reflexo (Raro+), aura pulsando com raios girando (Épico+), brilho premium pulsante e faíscas (Lendário/Mítico) e metal em movimento (Mítico).
- **Cartas em grade** (Coleção, Equipe, lista do Treinar, janela de troca) — **v0.10.2:** são um **quadro congelado** do visual atual: fundo, aura de Ki, raios (Épico+) e personagem com sombra são desenhados **uma única vez** numa imagem pronta (por personagem, cor e bloqueado/obtido, no tamanho certo para a tela), e as faíscas Lendário/Mítico aparecem acesas e paradas. Nenhuma animação, filtro ou mistura de cores roda na grade, então **rolar a Coleção não redesenha nenhuma carta**. Toque na carta para ver tudo animado nos detalhes.
- **Cartas "Ainda não obtidos" (v0.10.3):** aparecem em cinza escurecido como antes, mas o cinza vem pronto (arte em bitmap e moldura/medalhões em tons cinza), sem filtro de imagem — entrar na tela não custa nada ao rolar.
- **Cartas apagadas da mão** (sem energia para invocar) ficam com os efeitos parados até voltarem a ficar disponíveis.
- **Atrás de janelas** (detalhes, troca, avisos, fim de luta, inspeção, Despertar) as animações ficam pausadas; voltam ao fechar a janela.
- **Fundo da página:** é uma camada fixa pintada uma vez (antes era redesenhado a cada passo da rolagem). No celular, a carta não "levanta" ao ser tocada durante a rolagem.
- O fundo atrás das janelas fica **escurecido, sem desfoque** (o desfoque era refeito a cada quadro e derrubava o FPS pela metade).
- Com **"reduzir movimento"** ativado no aparelho, as cartas e os lutadores ficam sem animações decorativas.

### Evolução visual por cor (Carta e Lutador na Arena)
Cada **mudança de cor** muda o visual do personagem tanto na carta quanto no lutador de corpo inteiro na arena (o degrau "+" não muda o visual):
- **Comum:** roupa simples de aprendiz/recruta, arma/postura inicial, sem aura.
- **Incomum:** aura fraca, faixa de batalha cruzada e acabamento no traje.
- **Raro:** ombreiras metálicas, manoplas, aura mais forte, cabelo e golpe de Ki maiores.
- **Épico:** peitoral com gema de poder, capa esvoaçante, olhos brilhando na cor da aura.
- **Lendário:** armadura e espinhos dourados, diadema/coroa real, cabelo energizado com brilho, partículas de Ki.
- **Mítico:** forma suprema — cabelo radiante, halo dourado, raios e aura dupla.
- O físico cresce a cada cor (ombros mais largos e cabelo maior).
- Ao Despertar, uma animação mostra o visual antigo virando o novo (**DESPERTAR!**).

### Cenário de fundo de cada personagem
Cada retrato tem um cenário próprio, que também fica mais rico a cada cor (mais camadas, luz, partículas e cores); o "+" não muda o cenário. A borda colorida da carta mostra a cor.

| Personagem | Cenário | O que aparece nas cores mais altas |
|---|---|---|
| Riku | Vento e céu aberto | mais rajadas de vento a cada cor, colinas (Incomum), nuvens (Raro), folhas ao vento (Épico) |
| Nara | Noite de luar | lua maior e mais estrelas a cada cor, montanhas (Raro), halo da lua (Lendário), estrelas cadentes (Mítico) |
| Toru | Templo das sombras (portal) | lanterna (Incomum), santuário (Raro), névoa e 2 lanternas (Épico), brasas (Lendário), fogo roxo (Mítico) |
| Aiko | Acima das nuvens | mais nuvens a cada cor, céu lilás (Raro), arco-íris (Épico), pôr do sol (Lendário), raios de sol (Mítico) |
| Lyra | Campo de estrelas | nebulosa (Raro), constelações (Épico), segunda nebulosa (Lendário), galáxia (Mítico) |
| Gorath | Fortaleza de ferro | muralha mais alta a cada cor, ameias (Raro), tochas (Épico), céu em brasa (Mítico) |
| Mei | Lago de lótus | mais lótus a cada cor, reflexos (Raro), céu rosado (Épico), vaga-lumes (Lendário), brilho celestial (Mítico) |
| Yume | Caçada na floresta | lua entre as árvores (Raro), olhos vermelhos na mata (Épico), luar forte (Lendário), pétalas (Mítico) |
| Zarek | Eclipse | coroa do eclipse cresce a cada cor, horizonte (Raro), raios do eclipse (Épico), labaredas (Mítico) |
| Kenji | Dojô | pergaminho (Raro), luz dourada (Lendário), tochas e 2º pergaminho (Mítico) |
| Nyx-07 | Laboratório tecnológico | telas (Raro), plataforma holográfica (Lendário), fluxo de dados (Mítico) |
| Vorax e Cria | Abismo sombrio | mais tentáculos e olhos a cada cor, fenda de energia (Lendário), vórtice (Mítico) |
| Daichi | Pedreira na montanha | mais pedras a cada cor, chão escuro (Incomum), estalagmites (Raro), lava e brasas (Épico) |
| Sora | Picos de bambu na névoa | mais bambus a cada cor, névoa (Incomum), folhas ao vento (Raro), sol e brisa (Épico) |
| Tobi | Acampamento de guerra | mais tendas a cada cor, fogueira (Incomum), 2ª fogueira e estandartes (Raro), faíscas e mastros (Épico) |
| Kael | Vulcão em erupção | mais brasas a cada cor, rios de lava (Incomum), cratera brilhando (Raro), labaredas (Épico) |
| Suri | Maré gelada | mais ondas a cada cor, icebergs (Incomum), estrelas (Raro), lua gelada e espuma (Épico) |
| Hana | Clareira da floresta | mais árvores a cada cor, raios de sol (Raro), vaga-lumes (Épico) |
| Jin | Tempestade nos penhascos | mais nuvens a cada cor, raio (Incomum), 2º raio e clarão (Raro), chuva (Épico) |
| Ren | Vielas da cidade à noite | mais janelas acesas a cada cor, varal de lanternas (Incomum), poste (Raro), garoa (Épico) |
| Kuro | Telhados sob a lua roxa | lua maior a cada cor, halo da lua (Incomum), olhos de gato e estrelas (Raro), marcas de garra (Épico) |

### Marcas próprias dos personagens iniciais
Cada um dos 9 novos tem um detalhe que o identifica desde Comum, além da evolução normal por cor: Daichi (faixa de pedra com chifre, cicatriz e ombreiras de rocha), Sora (presilha de folha e fitas ao vento), Tobi (faixa na cabeça, pintura de guerra e baquetas), Kael (marca de chama na testa e brasas), Suri (tiara de gelo), Hana (pena no cabelo e pintura de caçadora), Jin (óculos de atirador e raio), Ren (lenço cobrindo o rosto) e Kuro (orelhas de gato e cicatrizes de garra). O chifre, as fitas, as baquetas, a tiara, a pena, o raio e as orelhas crescem a cada cor.

## 11. Evolução (nível, XP e Despertar)
- **Status:** ataque e vida = base × (1 + 0,08 × (nível − 1)) × (1 + 0,15 × (cor − 1)), arredondado (cor: Comum = 1 … Mítico = 6). No degrau "+", soma **+10% (mín. +1)** no status do "+" do personagem (vida ou ataque).
- **Itens de XP:** Pergaminho de Ki +100, Cristal de Ki +400, Orbe do Dragão Ancestral +1500. Ao chegar em 100% da barra, o nível sobe; cada nível pede mais XP que o anterior.
- **Nível máximo por degrau:** cor base = **10 × cor** (igual ao antigo 10 × estrelas); o "+" libera **mais 5 níveis**. Comum 10 · Comum+ 15 · Incomum 20 · Incomum+ 25 · Raro 30 · Raro+ 35 · Épico 40 · Épico+ 45 · Lendário 50 · Lendário+ 55 · Mítico 60 · Mítico+ 65.
- **Despertar** (no nível máximo do degrau, pagando **Essências ✴**): o 1º leva da cor para o **"+"** (ex.: Raro → Raro+); o 2º leva do "+" para a **próxima cor** (Raro+ → Épico). O nível continua o mesmo; só o teto sobe.
- **Mais difícil (v0.10): do "+" para a próxima cor custa 50% A MAIS** que da cor para o "+", **tanto em Essências quanto em XP**:
  - **Essências:** cor → cor+ = **4 × cor**; cor+ → próxima cor = **6 × cor** (+50%).
  - **XP do degrau:** a cor base custa o mesmo XP que **uma cor inteira** custava na v0.9 (curva 80 × 1,12^(nível−1) somada pelos 10 níveis da antiga faixa); o "+" custa **1,5 ×** isso. O XP de cada nível segue o mesmo formato da curva (cada nível pede mais), escalado para o degrau fechar nesse total. Comum (cor base) é exatamente igual à v0.9.

| Degrau | Nível máx. | XP do degrau | Despertar para o próximo |
|---|---|---|---|
| Comum | 10 | 1.182 | ✴ 4 → Comum+ |
| Comum+ | 15 | 1.773 (+50%) | ✴ 6 → Incomum |
| Incomum | 20 | 3.892 | ✴ 8 → Incomum+ |
| Incomum+ | 25 | 5.838 (+50%) | ✴ 12 → Raro |
| Raro | 30 | 12.091 | ✴ 12 → Raro+ |
| Raro+ | 35 | 18.137 (+50%) | ✴ 18 → Épico |
| Épico | 40 | 37.554 | ✴ 16 → Épico+ |
| Épico+ | 45 | 56.331 (+50%) | ✴ 24 → Lendário (se a faixa permitir) |
| Lendário | 50 | 116.635 | ✴ 20 → Lendário+ |
| Lendário+ | 55 | 174.953 (+50%) | ✴ 30 → Mítico |
| Mítico | 60 | 362.259 | ✴ 24 → Mítico+ |
| Mítico+ | 65 | 543.389 (+50%) | — (topo) |

- Comparado à v0.9, cada cor completa (cor + "+") pede **2,5 ×** o XP e **2,5 ×** as Essências que a mesma cor pedia antes.
- Na tela **Treinar**, a **Escada de Despertar** mostra todos os degraus do personagem com nível máximo, XP do degrau e o custo em Essências; o botão diz o próximo degrau e o custo (ex.: "Despertar para Raro+ (✴ 12)").
- **Animação:** ao mudar de **cor**, o visual antigo vira o novo (**DESPERTAR!**). No **"+"** o visual é o mesmo: a tela mostra "DESPERTAR +", o selo Raro → Raro+ e o bônus de status.
- **Habilidades evoluem só com a cor** (e algumas com nível), nunca com o "+", sempre com teto:
  - resistência máxima **3** (física e mágica);
  - redução de ataque por Sifão: no máximo **2** no total, mesmo com vários Nyx;
  - no máximo **3 Crias** por lado;
  - bônus de ataque vindo de aliados (Tambor de Guerra): no máximo **+2**, sem somar tambores;
  - dano mínimo sempre **1**.

## 12. Personagens
Ataque/vida mostrados em Comum nível 1 (base) e, entre parênteses, na cor inicial do personagem. A coluna **"+" melhora** diz qual status o degrau "+" aumenta. A antiga coluna de raridade saiu: a raridade agora é a cor.

| Personagem | Raça | Categoria | Cores | "+" melhora | Custo | Ataque / Vida | Dano | Alcance | Resist. fís./mág. | Habilidade e evolução |
|---|---|---|---|---|---|---|---|---|---|---|
| Riku Vendaval | 🌍 Humano | ⚔️ DPS | Comum → Épico+ | ataque | 2 | 3 / 6 (3 / 6 em Comum) | Físico | 1 | 0/0 | Salto Vendaval — Bônus de investida: +1 em Raro, +2 em Épico, +1 extra no nível 30 (máx. +3). |
| Nara Lâmina-Lunar | 🪐 Extraterrestre | ⚔️ DPS | Comum → Épico+ | ataque | 2 | 3 / 6 (3 / 6 em Comum) | Físico | 1 | 0/0 | Corte Diagonal — Raro: ao bater em frente, também corta a diagonal com 50% do dano · Épico: 100%. |
| Toru Sombra-Reversa | 🤖 Androide | 🛡️ Tanque | Comum → Épico+ | vida | 3 | 2 / 11 (2 / 11 em Comum) | Físico | 1 | 1/0 | Golpe Reverso<br>Postura de Guarda — Raro: +1 de resistência física · Épico: +2 (máx.). |
| Aiko Flecha-Celeste | 🪐 Extraterrestre | 🏹 Arqueiro | Incomum → Épico+ | ataque | 3 | 3 / 5 (3 / 6 em Incomum) | Físico | 3 | 0/0 | Flecha Dupla — Incomum: 2ª flecha de 1 · Raro: 2 · Épico: 3 (máx. 3); +1 no nível 25. |
| Lyra Olho-de-Falcão | 🔮 Mago Arcano | 🪄 Mago | Incomum → Épico+ | ataque | 3 | 3 / 4 (3 / 5 em Incomum) | Mágico | 3 | 0/1 | Feixe Perfurante — Dano nos de trás: 50% (Incomum) · 75% (Raro) · 100% (Épico). |
| Gorath Muralha-de-Ferro | 👹 Monstro | 🛡️ Tanque | Incomum → Épico+ | vida | 4 | 2 / 12 (2 / 14 em Incomum) | Físico | 1 | 2/0 | Inabalável — Raro: +1 de resistência física · Épico: também +1 de resistência mágica. |
| Mei Lótus-Celeste | 🔮 Mago Arcano | ➕ Suporte | Incomum → Épico+ | vida | 3 | 2 / 5 (2 / 6 em Incomum) | Mágico | 3 | 0/1 | Bênção do Lótus — Cura 2 (Incomum–Raro) · 3 (Épico); +1 no nível 20 (máx. 4). |
| Yume Caçadora | ☠️ Necromante | 💀 Assassino | Raro → Lendário+ | ataque | 3 | 4 / 4 (5 / 5 em Raro) | Físico | 1 | 0/0 | Instinto Predador — Execução: +1 em Raro, +2 em Épico, +3 em Lendário; +1 no nível 25 (máx. +3). |
| Zarek do Eclipse | 🪐 Extraterrestre | 💀 Assassino | Raro → Lendário+ | ataque | 4 | 4 / 5 (5 / 7 em Raro) | Físico | 1 | 0/0 | Emboscada — Perfura 1 de resistência em Raro, 2 em Épico, 3 em Lendário; +1 no nível 25 (máx. 3). |
| Kenji Punho-Espelhado ✦ | 🌍 Humano | ⚔️ DPS | Lendário → Mítico+ | ataque | 5 | 3 / 7 (5 / 11 em Lendário) | Físico | 1 | 1/0 | Punho Espelhado — Multiplicador: ×2 (Lendário) · ×2,25 (Mítico, máx.). |
| Nyx-07 | 🤖 Androide | ➕ Suporte | Épico → Mítico+ | vida | 5 | 2 / 6 (3 / 9 em Épico) | Mágico | 3 | 0/1 | Sifão de Energia — −1 de ataque (Épico–Lendário) · −2 (Mítico). |
| Vorax ✦ | ☠️ Necromante | 🪄 Mago | Lendário → Mítico+ | ataque | 6 | 3 / 6 (5 / 10 em Lendário) | Mágico | 3 | 0/1 | Prole Sombria — Cria: ataque 2 e vida 1 (Lendário) · ataque 3 e vida 2 (Mítico). |
| Daichi Punho-de-Rocha | 👹 Monstro | 🛡️ Tanque | Comum → Épico+ | vida | 3 | 2 / 9 | Físico | 1 | 1/0 | Couraça de Espinhos — devolve 1 (Comum–Incomum) · 2 (Raro) · 3 (Épico). |
| Sora Brisa-Serena | 🔮 Mago Arcano | ➕ Suporte | Comum → Épico+ | vida | 2 | 1 / 5 | Mágico | 3 | 0/1 | Sopro Restaurador — cura 1 (Comum–Incomum) · 2 (Raro) · 3 (Épico). |
| Tobi Tambor-de-Guerra | 👹 Monstro | ➕ Suporte | Comum → Épico+ | vida | 3 | 2 / 7 | Físico | 1 | 0/0 | Tambor de Guerra — vizinhos +1 de ataque (Comum–Raro) · +2 (Épico). |
| Kael Chama-Rubra | 🔮 Mago Arcano | 🪄 Mago | Comum → Épico+ | ataque | 3 | 3 / 4 | Mágico | 3 | 0/1 | Explosão de Brasas — explosão de 1 (Comum–Incomum) · 2 (Raro–Épico). |
| Suri Maré-Gélida | 🪐 Extraterrestre | 🪄 Mago | Comum → Épico+ | vida | 2 | 2 / 5 | Mágico | 3 | 0/1 | Maré Implacável — +1 no herói (Comum–Incomum) · +2 (Raro) · +3 (Épico). |
| Hana Pena-Veloz | 🌍 Humano | 🏹 Arqueiro | Comum → Épico+ | ataque | 2 | 2 / 5 | Físico | 3 | 0/0 | Tiro Certeiro — ignora 1 de resistência física (Comum–Incomum) · 2 (Raro–Épico). |
| Jin Arco-Trovão | 🤖 Androide | 🏹 Arqueiro | Comum → Épico+ | ataque | 3 | 3 / 5 | Físico | 3 | 0/0 | Olho de Águia — +1 de dano a 2–3 casas (Comum–Incomum) · +2 (Raro–Épico). |
| Ren Presa-Oculta | 🌍 Humano | 💀 Assassino | Comum → Épico+ | ataque | 2 | 3 / 5 | Físico | 1 (mira 2) | 0/0 | Caça-Conjuradores — +1 de dano em quem ataca de longe (Comum–Incomum) · +2 (Raro–Épico). |
| Kuro Garra-Noturna | 👹 Monstro | 💀 Assassino | Comum → Épico+ | ataque | 3 | 3 / 5 | Físico | 1 (mira 2) | 0/0 | Ataque Surpresa — +1 em alvo com vida cheia (Comum–Incomum) · +2 (Raro–Épico). |
| *Cria Sombria* (invocada) | ☠️ Necromante | 🪄 Mago | — | — | — | 2 ou 3 / 1 ou 2 | Mágico | 2 | 0/0 | Disparo Sombrio (alcance 2) e Prole Sombria. |

✦ = **personagem único**: muito forte, já nasce em Lendário e só chega a Mítico+.

Habilidades em detalhe:
- **Salto Vendaval:** pula 1 unidade (2 casas). No turno em que salta, ataca com o bônus de investida.
- **Corte Diagonal:** ataca a diagonal logo à frente quando não há ninguém em frente. A partir de Raro, ao bater em frente também corta a diagonal (50%; 100% em Épico).
- **Golpe Reverso:** prioriza o inimigo na diagonal logo atrás.
- **Postura de Guarda:** resistência física extra por cor.
- **Flecha Dupla:** segunda flecha de dano fixo no mesmo alvo.
- **Feixe Perfurante:** atravessa a fileira, ferindo também quem está atrás do alvo (dentro do alcance 3).
- **Inabalável:** não pode ser empurrado; ganha resistência em Raro/Épico.
- **Bênção do Lótus:** cura os 8 vizinhos (inclusive a outra fileira) no início da ação.
- **Instinto Predador:** menor vida da fileira até 2 casas; dano extra em alvos com metade da vida ou menos.
- **Emboscada:** mais distante da fileira até 2 casas; ignora parte da resistência.
- **Punho Espelhado:** ao sofrer golpe físico corpo a corpo de frente, contra-ataca com ataque multiplicado e empurra o agressor 1 casa para trás.
- **Sifão de Energia:** enquanto em campo, todos os inimigos perdem ataque (ataque mínimo 1).
- **Prole Sombria:** ao derrotar, surge uma **Cria Sombria** na casa do derrotado ou na antiga casa de Vorax. Crias também geram crias (máx. 3 por lado). A cria tem **ataque 2** com Vorax em **Lendário** e **ataque 3** com Vorax em **Mítico**; vida 1 (Lendário) ou 2 (Mítico); o "+" do Vorax não muda a Cria. Uma cria gerada por outra cria herda as mesmas estrelas.
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
- **Novo jogo:** você começa **só com personagens Comuns** — os **12 iniciais** (2 de cada categoria). A equipe começa com 10 deles; os outros 2 ficam na coleção para trocar. Ao desbloquear um personagem, ele **entra direto na equipe** se houver vaga.
- **Saves antigos (migração da v0.8, uma única vez):** você **mantém todos os personagens, níveis, cores, itens e fases** que já tinha — inclusive **Kenji e Vorax**, se já tinham sido obtidos (ninguém perde progresso). Todo save também ganha os **9 novos personagens Comuns**. Se a equipe tiver menos de 10, ela é completada com os seus personagens mais fortes que estavam fora dela.
- **Saves antigos (migração da v0.10, uma única vez):** as estrelas viram a cor de mesmo número (1★ Comum, 2★ Incomum, 3★ Raro, 4★ Épico, 5★ Lendário, 6★ Mítico), sempre na **cor base** (sem "+"). Cada personagem mantém a cor que já tinha, o nível e o XP (o nível máximo da cor base é o mesmo do antigo nível máximo).
- Com a equipe cheia, **Colocar na equipe** abre a janela de **troca**: todas as cartas da equipe começam marcadas; toque nas que vão **sair** (ficam cinza com ✖). **Trocar** só libera quando o número certo estiver desmarcado; **Cancelar** não muda nada.
- Todas as confirmações e avisos (sair da batalha, apagar progresso, equipe incompleta) usam janelas do próprio jogo, no tema escuro/dourado.

## 13.1 Progressão de personagens
- **Começo:** só personagens de **Comum** (os 12 iniciais).
- **Incomum, Raro e Épico:** desbloqueados pela **progressão normal**, na **primeira vitória** de cada fase (ver seção 14).
- **Lendário e Mítico (Kenji e Vorax):** **bloqueados por enquanto**, sem forma de obter no jogo (nem missão especial). Aparecem na coleção, em "Ainda não obtidos", **apagados com cadeado** e a etiqueta **"🔒 Em breve"**. A forma de desbloquear será decidida numa atualização futura. Eles continuam aparecendo como **inimigos** nas fases finais.

## 14. Aventura
- 10 fases; vencer libera a próxima. Primeira vitória dá a recompensa completa; repetir dá 50%.
- **Desbloqueios (primeira vitória):** fase 1 → **Aiko** (Incomum) · fase 2 → **Mei** (Incomum) · fase 3 → **Lyra** (Incomum) · fase 4 → **Gorath** (Incomum) · fase 5 → **Yume** (Raro) · fase 6 → **Zarek** (Raro) · fase 8 → **Nyx-07** (Épico). Kenji e Vorax: em breve.
- **Baralho da IA:** toda fase tem **10 personagens diferentes**. Fases 1 e 2 usam só personagens Comuns (a fase 1 sem tanques); a partir da 3 entram os de Incomum, Raro e Épico; Kenji (fases 8 e 9) e Vorax (fase 10) só aparecem como inimigos.
- **Nível dos inimigos:** fase 1 = nível 1, fase 2 = nível 2 e depois 1 + 1,5 × (fase − 1), arredondado (fase 10 = nível 15, com +Comum).
- Derrota dá 1 Pergaminho de Ki de consolo.
- Progresso salvo no navegador (localStorage).
