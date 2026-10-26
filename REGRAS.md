# Regras do Ki-Clash: Dragon Legacy

> Documento oficial com **todas** as regras atuais do jogo. Toda mudança de regra deve atualizar este arquivo e o [CHANGELOG.md](CHANGELOG.md).
> As mudanças **planejadas** (ainda não feitas) ficam em [MELHORIAS.md](MELHORIAS.md).

## 1. Objetivo
Zerar a vida do **Comandante inimigo** antes que o inimigo zere a sua. Comandante do jogador: **20** de vida no nível 1, até **110** no nível 10 (ver seção 15). Comandante inimigo: de **12** (fase 1) a **75** (fase 10).

## 2. Arena e Lutadores Interativos
- **2 fileiras × 12 colunas (v0.16.0; antes 2 × 7).** Você fica à esquerda, o inimigo à direita. As casas ficam menores para caber as 12 colunas: deitado no celular (915 × 412) cada casa tem ~52 px; no computador (1366 × 768) ~80 px; em pé (412 × 915) ~25 px, sem as coordenadas das casas e com a placa `ATQ | VIDA` mais enxuta.
- Cada Comandante aparece em **corpo inteiro** logo **depois da última coluna** do seu lado (com barra de vida no topo da tela e nos pés). Ele conta como uma unidade parada numa **coluna virtual** após o fim da arena, alcançável pelas **duas fileiras**.
- **Zona de invocação:** as **3 primeiras colunas** do seu lado (colunas 1–3). A IA usa as 3 do lado dela (colunas 10–12). Entre as duas zonas ficam **6 colunas livres**.
- **Unidades na Arena:** cada carta invocada entra em campo como um **lutador anime de corpo inteiro** sobre um círculo tático de invocação, exibindo `ATQ | VIDA` nos pés e animando cada ação:
  - **Caminhada (`MOVE` / `JUMP`):** pernas articuladas andando/correndo pelas casas com nuvens de poeira e seta indicadora `MOVE`.
  - **Ataque corpo a corpo (`HIT!`):** investida com golpe de arma/punho, onda de corte crescente e impacto `HIT!`.
  - **Ataque à distância / Feixe de Ki:** postura de disparo com **feixe de Ki contínuo** (estilo Kamehameha) para ataques mágicos ou projéteis velozes para arqueiros.
  - **Dano e Derrota (`Necropolis`):** animação de recuo ao sofrer dano com números flutuantes e ida para a **Necropolis (Derrotadas)** ao cair.

## 3. Turnos, contagem de rodadas e modo Auto
**v0.16.0: a energia acabou.** Cada carta na mão tem uma **contagem de rodadas ⏳**, mostrada na **gota** da carta (no canto superior esquerdo):
- Ao entrar na mão, a carta espera **2 × custo − 1** rodadas: custo 2 → **3**, custo 3 → **5**, custo 4 → **7**, custo 5 → **9**, custo 6 → **11**. Fora da batalha (Coleção, detalhes) a gota mostra essa espera cheia; na mão, quantas rodadas **faltam**.
- No **início de cada turno seu**, a contagem das cartas que já estavam na mão cai **1**. A carta só pode ser invocada quando chega a **0** (fica colorida; as que ainda esperam ficam apagadas, não acendem casas e não podem ser arrastadas para o campo).
- **A mão inicial começa 2 rodadas adiantada:** as cartas de custo 2 já ficam prontas no turno 1, as de custo 3 no turno 3, e assim por diante.
- Não há limite por turno: dá para invocar **todas as cartas prontas** no mesmo turno, se houver casa livre. Uma carta pronta que você não joga continua pronta.
- No lugar do antigo orbe de energia, o orbe **⏳** mostra quantas cartas da mão estão prontas.
- A IA do inimigo (e o modo Auto) segue a mesma regra: invoca todas as suas cartas prontas, as de maior custo primeiro.
- **Por que 2 × custo − 1:** na simulação das 10 fases, espera = custo deixava cartas caras baratas demais (enxurrada de unidades fortes) e as fases 4–6 e 10 ficavam muito mais difíceis (vitória ao chegar 13–25%). Ver a seção 15.

1. No início do seu turno a contagem das cartas da mão anda 1 rodada.
2. Você compra **as cartas que faltarem para a mão voltar a ter 6** (jogou 3, compra 3; com a mão cheia, não compra — ver seção 4). Cada carta comprada entra com a espera cheia.
3. Invoca as cartas prontas (contagem 0) que quiser, em casas livres da sua zona.
4. Ao tocar **LUTAR** (ou ativar o botão **Auto**), suas unidades agem sozinhas, da mais avançada para a mais recuada. Depois o inimigo compra, invoca e age.

### Tela de batalha
- **HUD superior VS:** no topo da tela, as barras de vida do seu Comandante (**Você**) e do Comandante inimigo (com o nome da fase), frente a frente, e o **turno atual** (T) no centro.
- **Botão Auto (`Auto: OFF` / `Auto: ON`):** com o Auto ligado, o jogo **invoca suas cartas sozinho** (com a mesma lógica de invocação da IA) e toca **LUTAR** a cada turno, até a batalha acabar ou você desligar. Ele desliga sozinho ao fim da batalha ou ao sair (cancelar a saída não desliga).
- **Contador `Em campo (N)`:** mostra quantas unidades suas estão vivas na arena.
- **Selecionar carta da mão:** tocar seleciona (e mostra as informações no painel); **tocar de novo na mesma carta tira a seleção**.
- **Arrastar para invocar (v0.14.4):** além de tocar na carta e depois na casa, dá para **segurar a carta da mão e arrastá-la até uma casa** (dedo ou mouse). Enquanto arrasta, a carta segue o dedo, a carta na mão fica apagada e as **casas livres da sua zona ficam destacadas** (a casa embaixo do dedo brilha mais). **Soltar numa casa destacada invoca** a carta, com as mesmas regras do toque (carta pronta, sua zona, casa livre); soltar em outra casa ou fora do campo **cancela** e a carta volta para a mão. Um toque curto continua só selecionando, e segurar parado (~0,5 s) continua abrindo os detalhes. Com o celular em pé, arrastar para o lado continua rolando a mão; para invocar, arraste para cima, em direção ao campo. A carta que segue o dedo só se move (sem redesenhar a tela), mantendo ~60 FPS.
- **Inspecionar carta em batalha:** **segurar** a carta da mão (~0,5 s), ou tocar em **🔍 Detalhes** / **🔍 Ver Carta** (no painel de informações de uma carta da mão ou de uma unidade, aliada ou inimiga), abre a janela de detalhes da carta, no estilo do jogo. Ao fechar a janela, a carta **não fica selecionada**.
- **Janela de detalhes no celular:** cabe na tela e **rola por dentro**; o **✕** fica sempre visível no canto. Tocar fora da janela também fecha.
- **Painel de informações:** quando a unidade mostrada no painel é **derrotada**, o painel volta ao texto inicial.
- **HUD no celular:** o nome do inimigo diminui e quebra em 2 linhas em vez de ser cortado.
- **Sair (✕):** abre a confirmação do jogo. **Cancelar** volta à luta sem mudar nada (o **Auto continua** como estava). **Sair** interrompe na hora as animações e turnos em andamento; a luta abandonada não dá recompensa nem derrota.

### Layout da batalha deitada (paisagem) — v0.11.0
- **Quando:** sempre que a tela está **mais larga que alta** (celular deitado, tablet ou computador). Só a tela de batalha muda; os menus continuam pensados para o celular em pé e também funcionam deitados.
- **Sem rolagem:** a batalha ocupa exatamente a altura visível (`100dvh`, acompanha a barra de endereço do Chrome) e respeita os recortes da tela (safe-area). Nenhuma parte da tela rola.
- **Topo:** HUD VS fino (vida dos dois Comandantes, turno), com **Sair**, **Auto**, velocidade, **Em campo (N)** e **📜** (registro) à direita.
- **Centro:** a arena (2 × 12 desde a v0.16.0) fica **o maior possível**, com as colunas dos Comandantes visíveis nas pontas.
- **Embaixo, numa linha só:** **Baralho** à esquerda, as **6 cartas da mão inteiras** no meio, **Necropolis (Derrotadas)**, o orbe **⏳ de cartas prontas** (antes a energia) e o botão **LUTAR** na ponta direita.
- **Painel de informações:** vira uma **janela sobreposta** sobre a metade inimiga da arena (com **✕** para fechar). Ela abre ao selecionar uma carta/unidade e **fecha sozinha ao tocar LUTAR** (não cobre a luta). Se o texto for longo, rola só por dentro da janela.
- **Registro da batalha:** fica escondido; o botão **📜** abre/fecha uma gaveta lateral.
- **Janela de detalhes da carta:** cabe na altura da tela deitada, rola por dentro, ✕ sempre visível.
- **Celular em pé na batalha:** aparece o aviso do jogo **"Gire o celular para jogar deitado"** (ícone de girar). **⟳ Tela cheia deitada** tenta entrar em tela cheia e travar a tela deitada; **Jogar em pé** fecha o aviso (até fechar o jogo) e usa o layout em pé de sempre. Girar o celular também resolve.
- **Tela cheia e trava de orientação:** ao entrar numa batalha pelo toque, no celular (tela de toque) o jogo **tenta** abrir em tela cheia e travar deitado (`screen.orientation.lock`). Se o navegador não permitir, nada quebra e o jogo segue normal. Ao sair da batalha (vitória, derrota ou Sair), a tela é destravada e sai da tela cheia (se foi o jogo que entrou). No computador não entra em tela cheia.
- **App na tela inicial:** o jogo tem um manifesto (nome, ícones, `display: fullscreen`) para **"Adicionar à tela inicial"** abrir como app em tela cheia. A orientação **não** é forçada no manifesto (menus em pé continuam valendo).
- **Proporção na arena (v0.11.1, como na referência):** os **Comandantes são as maiores figuras da arena** — corpo inteiro com cerca de **2 fileiras de altura**, em pé na sua ponta, com a barra de vida logo abaixo. As **unidades invocadas cabem dentro da própria casa** (não invadem as casas vizinhas), com a placa ATQ | VIDA e a barra de vida legíveis. No celular em pé a coluna do Comandante também ficou maior.
- **Comandante Aliado (v0.12.0):** o seu Comandante, na coluna da esquerda, é o **bárbaro** (cabelo e barba pretos, machado de duas lâminas, saiote de pele): arte animada própria com **respiração em loop**, de pé sobre o piso da coluna, com cerca de 2 fileiras de altura e a barra de vida logo abaixo. Vale deitado e em pé. Ao levar dano, a coluna treme como antes. 
- **Comandante Adversário (v0.12.1):** o Comandante da direita é o **minotauro** (pelo marrom, chifres, machado de pedra com runas laranja), também animado com respiração. Fica sem espelhar: o machado já aponta para a arena. Os textos "Comandante Aliado"/"Comandante Inimigo" saíram: as figuras ocupam a altura toda da coluna, de pé no piso, com a barra e os números de vida embaixo. Atrás de cada Comandante há uma **aura fixa**: azul/ciano do seu lado, rosa/magenta do adversário.
- **Altura dos Comandantes (v0.12.2):** o minotauro agora segura o machado apoiado no ombro (pose estreita, sem espelhar). As duas colunas voltaram a ter a **mesma largura**, e os dois Comandantes têm a **altura da arena**: dos pés à cabeça, a figura mede o mesmo que as 2 fileiras. Barra e números de vida embaixo, aura e piso brilhante mantidos.
- **Desempenho:** o layout deitado não adiciona animações contínuas; a batalha continua a 60 FPS.

## 4. Mão e baralho
### Baralho (v0.17.0: até 3 cópias e limite pelo nível de perfil)
- **v0.17.0 (decisão 6):** cada carta (personagem **ou feitiço**) entra no baralho com **1 a 3 cópias** (antes eram sempre 4). O baralho precisa ter **de 20 cartas até o máximo do seu nível de perfil** e **pelo menos 1 personagem**. Detalhes na seção 16.
- **Máximo = 28 + 2 × nível de perfil, até 40:** nível 1 = 30 · nível 2 = 32 · … · nível 6 ou mais = 40. **Nível de perfil (por enquanto) = 1 + fases vencidas** (máx. 11; a fase 3 do plano traz o nível de perfil completo).
- A IA joga com os 10 personagens da fase × **3 cópias = 30** e, **desde a v0.18.0**, os feitiços da fase com 2 cópias cada (fases 3 e 5 em diante; ver seção 17).
- *Histórico (v0.8–v0.16): equipe de exatamente 10 cartas diferentes × 4 cópias = 40.*
- Com o baralho inválido, tocar em **Lutar** abre a janela do jogo **Baralho inválido**, com o motivo e **Ir para o baralho** (nunca um alerta do navegador).
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
- Uma carta com **todas as cópias derrotadas sai do rodízio** (v0.17.0: até 3 cópias). Exceções da v0.17.0: **Renascer**, **Anjo da Guarda**, **Necromancia** e o feitiço **Chamado da Necropolis** (seção 16). Crias Sombrias não vêm de cartas e não vão para as Derrotadas.

### Compra semi-aleatória (fila de cada carta)
- **Toda compra conta**, inclusive a mão inicial (que é a compra 0). A contagem começa **na compra**, não quando a carta é jogada: ficar parada na mão **não pausa** a fila.
- **v0.17.0:** os números abaixo são para um baralho com **10 cartas diferentes**. Com N cartas diferentes: liberada a partir da compra **N − 3**, garantida na **N** (mão inicial: liberada na **N − 5**, garantida na **N − 2**). Com 10 fica exatamente como antes.
- Depois de comprada, a carta fica **bloqueada nas 6 compras seguintes**.
- Na **7ª, 8ª e 9ª** compra depois dela, ela **pode vir no sorteio** (entre todas as cartas liberadas).
- Se não veio até a 9ª, vem **garantida na 10ª**.
- **Exceção do começo:** as 6 cartas da mão inicial podem voltar no sorteio a partir da **5ª compra** (as compras 1 a 4 trazem as 4 cartas que ficaram fora da mão). Elas ficam **garantidas a partir da 8ª compra**. Depois disso vale a regra normal (7ª–9ª sorteio, 10ª garantida).
- **Garantias em fila:** se várias cartas vencem ao mesmo tempo, elas saem na ordem em que foram compradas (10ª, 11ª, 12ª...). Como cada compra traz quantas cartas faltam na mão, **uma compra de 2 cartas atende 2 garantias, uma de 3 atende 3**, e assim por diante; as que sobrarem continuam na fila para a próxima compra.
- **Ordem de escolha numa compra:** 1) garantias vencidas, em fila; 2) sorteio entre as cartas liberadas; 3) se ainda faltarem cartas para completar 6 e nenhuma outra estiver liberada, vem a que está **mais perto de liberar** — completar a mão tem prioridade sobre o bloqueio. Isso só acontece quando você joga muitas cartas de uma vez (ex.: no começo, as 4 que ficaram fora da mão inicial acabam e as 6 iniciais só liberam na 5ª compra).
- Uma carta só pode vir se tiver **cópia no Baralho**. Se todas as cópias vivas estão na mão ou em campo, ela espera; se for uma garantia, sai assim que tiver cópia disponível.
- **Efeito prático (aleatoriedade):** como a quantidade comprada por rodada varia com o número de cartas que você jogou, o número de cartas por compra muda a cada turno e a ordem **não fica presa num ciclo fixo** (na v0.7, com 1 carta por rodada, cada carta voltava sempre na 10ª compra). Agora uma carta pode voltar na 7ª, 8ª, 9ª ou 10ª compra de verdade, e partidas diferentes têm sequências diferentes. Quando você joga só 1 carta por rodada, o comportamento é o mesmo da v0.7.

## 5. Ação de cada unidade
1. **Cura** (Mei: os 2 aliados vizinhos mais feridos; Sora: o aliado mais ferido da própria fileira).
2. Se houver **alvo no alcance**, ataca e **não anda**.
3. Senão, **anda até 2 casas** para frente (parando assim que um alvo entra no alcance) e ataca se puder. O alcance é conferido a cada **casa livre** onde a unidade pode parar; passar por cima de um aliado não conta como parar ali.
4. **Atravessar aliados (v0.15.0):** a unidade **passa pelos aliados** durante o movimento (dentro dos seus 2 passos), mas **só para em casa livre**: ninguém termina numa casa ocupada. Se as casas que ela alcança à frente estiverem ocupadas por aliados, ela fica na **última casa livre antes deles** (às vezes, parada). Exemplo: um arqueiro ataca e fica parado; o tanque atrás dele passa por ele e para na frente.
5. **Inimigos bloqueiam:** ninguém atravessa um inimigo, exceto o **Riku**, que se move saltando (item 6).
6. **Salto Vendaval (Riku) — v0.15.4: o movimento dele é sempre um salto** (não anda antes nem depois):
   - **Pouso:** salta para a **3ª casa à frente**, por cima de quem estiver nas casas 1–2 (aliado ou inimigo). Se a 3ª estiver ocupada ou fora do campo, cai na **2ª**; se a 2ª também, cai na **1ª**; se as três estiverem ocupadas (ou fora), **fica parado**. Nunca vai além da 3ª casa, em nenhuma cor ou nível.
   - **Sem alvo:** salta (seta **JUMP**) e, se ao cair houver alvo no alcance, ataca **com o bônus de investida** (inclusive o Comandante).
   - **Inimigo logo à frente** (ele é corpo a corpo, só a casa da frente conta como alvo): se houver casa de pouso livre (3ª, senão 2ª), salta por cima dele em vez de atacá-lo e, ao cair, ataca com investida quem estiver à frente. Sem casa de pouso, ataca o inimigo da frente normalmente, sem investida.
   - **Na última coluna:** ataca o Comandante normalmente.
   - A investida vale em todo ataque feito logo depois de um salto.
7. **Sem passo da vitória (v0.15.0):** quem **derrota um inimigo fica onde está** (antes avançava 1 casa).
8. **Ordem de ação:** as unidades agem da **mais avançada para a mais recuada**. **v0.17.0 — Vigia 👁 (Jin):** quem tem Vigia age **antes de todos** do seu lado (vários Vigias: do mais recuado para o mais avançado). **Atordoado 💫** perde a ação. **Desempate (v0.16.0, confirmado):** na **mesma coluna, a fileira de cima age primeiro** — vale para os dois lados.

## 6. Alcance e alvos
- **Só a própria fileira:** ninguém ataca unidades da outra fileira, exceto as habilidades **diagonais** (Corte Diagonal e Golpe Reverso) e a **lateral** Explosão de Brasas (Kael), que atinge a casa da mesma coluna na outra fileira.
- **Corpo a corpo (alcance 1):** só a casa **logo à frente** (regra confirmada na v0.16.0; atacar a 2 casas fica só para habilidades).
- **Longo alcance (alcance 4, v0.16.0; antes 3):** magos, arqueiros e suportes à distância atingem o inimigo **mais próximo** até **4 casas à frente**. Não avança quando pode atacar. A Cria Sombria (alcance 2) e as miras especiais de 2 casas não mudaram.
- **Miras especiais** (sempre na própria fileira):
  - **Emboscada (Zarek):** o inimigo **mais distante** até 2 casas.
  - **Instinto Predador (Yume):** o inimigo com **menos vida** até 2 casas.
  - **Caça-Conjuradores (Ren):** prioriza inimigos de **longo alcance** (magos, arqueiros, suportes à distância) até 2 casas; sem eles, ataca normalmente.
  - **Ataque Surpresa (Kuro):** o inimigo de **maior ataque** até 2 casas.
  - **Feixe Perfurante (Lyra):** o mais próximo e também **os que estão atrás dele** no alcance 4.
  - **Corte Diagonal (Nara):** a casa diagonal logo à frente, se não houver ninguém em frente.
  - **Golpe Reverso (Toru):** prioriza a casa diagonal logo atrás.
- **Comandante:** se não houver unidade inimiga válida, a unidade ataca o Comandante com seu alcance normal:
  - corpo a corpo: da **última coluna**;
  - Zarek, Yume, Ren e Kuro (mira 2) e a Cria Sombria (alcance 2): da **penúltima**;
  - longo alcance (4): a partir da **4ª coluna contando do fim** (coluna 9 de 12).
- Unidades inimigas no alcance sempre têm **prioridade** sobre o Comandante.

## 7. Dano
- **Físico 👊** é reduzido pela **resistência física**; **Mágico ✨** pela **resistência mágica**. Exemplo: 3 de dano físico contra resistência física 1 = 2.
- **Dano mínimo: 1** por golpe.
- O Comandante não tem resistência.
- **v0.17.0 — resistência só por habilidade (decisão 14):** nenhum personagem tem mais resistência de atributo. Quem tem: **Toru** (Postura de Guarda, física 1/1/2/3), **Gorath** (Inabalável, física 2/3 e mágica 1 no Épico), **Daichi** (Couraça de Espinhos, física 1), **Lyra** (Barreira Arcana, mágica 1/2). Teto de resistência: 3. Kenji perdeu a física 1 e os magos a mágica 1.
- **Ordem do dano (v0.17.0):** 1) Reflexo de Magia (só dano mágico ou de feitiço); 2) escudo temporário 🛡 absorve; 3) o resto sai da vida; 4) se chegou a 0: Anjo da Guarda (feitiço, depois a habilidade de um vizinho), Renascer, senão a unidade cai.

## 8. Fúria de batalha 🔥
A partir do **turno 8**, todas as unidades dos dois lados ganham **+1 de ataque**, e mais +1 a cada **3 turnos** (turno 8: +1, 11: +2, 14: +3…). Isso evita lutas travadas. No **turno 40**, vence quem tiver mais vida (em %) no Comandante; se for igual, empate.

## 9. Categorias e Raças/Origens
### Categorias de combate (ícone no canto superior direito da carta)
| Ícone | Categoria | Papel |
|---|---|---|
| 🛡️ | Tanque | Muita vida e resistência, pouco ataque. Segura a linha. |
| ➕ | Suporte | Cura aliados ou enfraquece inimigos. |
| ⚔️ | DPS | Dano físico corpo a corpo. |
| 🪄 | Mago | Dano mágico à distância (alcance 4), pouca vida. |
| 🏹 | Arqueiro | Dano físico à distância (alcance 4), pouca vida. |
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

### Visual das cartas — padrão v0.14 (acabamento v0.14.2)
Todas as cartas (mão, coleção, equipe, treino, troca de equipe, detalhes, inspeção em batalha e recompensas) seguem o mesmo padrão:
- **Moldura metálica** na cor do tier (Comum prata/cinza, Incomum verde, Raro azul, Épico roxo, Lendário laranja, Mítico vermelho).
- **Topo esquerdo:** grande **gota azul com a contagem de rodadas** (v0.16.0: antes o custo de energia), passando por cima do canto da moldura. O número tem **contorno preto grosso**, sombra forte e um leve **brilho azul neon**.
- **Topo, no centro:** pílula escura só com o **⚡Poder**. A largura acompanha o número (47, 100, 1000, 10000…) e ela fica sempre centralizada, sem encostar na gota nem na estrela.
- **Topo direito:** **estrela dourada metálica com asinhas** mostrando o **nível** ("Nv." em cima do número), passando por cima do canto da moldura como a gota. Nas cartas pequenas (até 104 px) só o número aparece, maior, para continuar legível.
- **Centro:** a arte grande do personagem (fundo, aura e personagem). Nas cartas com habilidades a arte é mais alta e o personagem fica um pouco mais para cima (peito e colar aparecem acima da faixa). O personagem fica **preso na janela da arte**: nada sai da carta (ex.: a lâmina reversa do Toru).
- **Faixa do nome:** degradê vertical (mais escura embaixo) com **borda prata fina e brilhante** e cantos ornamentados; nome em branco, serifado, negrito, até 2 linhas, um pouco acima da **gema** para não encostar nela. Nomes com hífen não quebram no hífen; nomes com uma palavra muito comprida (ex.: "Tambor-de-Guerra", "Muralha-de-Ferro") ficam com a letra um pouco menor para caber inteiros.
- **Palavra da cor** (ex.: "Comum", "Raro+") em branco/prata, logo abaixo da gema, sem encostar nela.
- **Painel escuro de baixo** (de cima para baixo, no centro): palavra da cor → **cápsula com o ícone da raça e o da categoria** (ícones um pouco menores) → **linha fina com pontinhos brilhantes** → **fileira de habilidades** (bolinhas separadas por pontinhos brilhantes). Nada encosta na borda prata de baixo.
- **Ataque** (esquerda) e **Vida** (direita) ficam nas laterais do painel escuro, **centralizados na altura do painel**, podendo passar um pouco da borda lateral. Os números têm contorno preto grosso e sombra forte; o coração tem um brilho vermelho suave.
- **Emblema de ataque por categoria** — todos no mesmo estilo: base com **fundo laranja liso**, **aro dourado** e **contorno preto grosso**, **sem explosão de pontas**; as **armas da categoria cruzadas na frente da base**, com os cabos à mostra por cima dela; o número por cima de tudo:

| Categoria | Base | Armas cruzadas (na frente) |
|---|---|---|
| ⚔️ DPS | medalhão redondo | duas espadas inteiras, as duas pontas à mostra |
| 🪄 Mago | círculo de runas | dois cajados com orbe roxo |
| 🏹 Arqueiro | alvo | arco e flecha |
| 💀 Assassino | losango | duas adagas escuras |
| 🛡️ Tanque | placa octogonal rebitada | dois martelos de guerra |
| ➕ Suporte | cristal/flor de seis pontas | dois cetros com cristal azul |

- **Ícones de habilidade:** a **Resistência Física (Postura de Guarda)** usa um **peitoral de armadura** (desenho próprio) no lugar do 🛡 — na carta e na lista de habilidades. O 🛡️ continua sendo o ícone da categoria Tanque.
- **Onde aparece a fileira de habilidades:** em **todas as cartas**. Na carta grande (detalhes da Coleção, Treinar, inspeção em batalha, carta nova na troca) e nas cartas da grade "Seus personagens" ela fica abaixo da cápsula raça/categoria, depois da linha com pontinhos. **Nas cartas pequenas (v0.14.3)** — mão da batalha, equipe na Coleção, lista do Treinar, troca rápida e carta de personagem novo — ela ocupa o **espaço entre o ataque e a vida**, no lugar da cápsula raça/categoria (que continua na carta grande e na inspeção), com os mesmos ícones e pontinhos da carta grande e sem deixar a carta mais alta (a mão continua com a mesma altura). Com 3 ou mais habilidades as bolinhas ficam menores em vez de alguma sumir.
- **Removidos:** o medalhão de categoria, a linha "👊 ataque ❤ vida + ícones", a linha "RAÇA · COR · CATEGORIA" e a pílula "Nv | ⚡Poder" (o nível foi para a estrela). Não há estrelas de raridade.
- **Cartas pequenas** (equipe na Coleção, lista do Treinar, mão da batalha, troca rápida):
  - arte na proporção antiga (mais baixa), para a mão da batalha continuar com a mesma altura;
  - mostram só o primeiro nome, em 1 linha, sem a gema e sem a palavra da cor;
  - entre o ataque e a vida fica a fileira de habilidades (a cápsula raça/categoria fica só nas cartas grandes);
  - ataque, vida e estrela um pouco menores, dentro da carta.
- **Desempenho:** gota, coração, estrela, peitoral e os 6 emblemas são imagens SVG estáticas, decodificadas uma vez e reaproveitadas por todas as cartas. Contornos e brilhos são feitos com contorno de texto, sombra de texto e degradês (sem `filter` nem animação novos). Nas cartas bloqueadas esses elementos ficam apagados (só opacidade).
- Quanto mais alta a cor, mais brilho: Raro reflexo de luz passando; Épico aura pulsando com raios girando; **Lendário e Mítico premium** com borda dourada, brilho pulsante e faíscas; Mítico ainda com metal em movimento e raios mais rápidos.
- **Nomes:** cartas grandes (detalhes da coleção, treino e janela de inspeção em batalha) mostram o **nome completo**, quebrando em 2 linhas se precisar. Só as cartas pequenas (mão no celular, equipe) mostram o primeiro nome. Cartas bloqueadas ficam cinza e sem animação.
- **Detalhes da carta (Coleção):** mostra a carta, o **visual do lutador na arena** e um **seletor de cor** com as cores da faixa do personagem (da inicial à máxima), para ver a evolução de roupa, armadura, armas e poder em cada cor. A cor atual fica marcada como "(atual)" (com "+" se você já tiver). Só visualiza — não muda a carta. (Antes era o seletor de estrelas da v0.9.)
- **Filtro por raça (Coleção & Equipe):** botões **🌟 Todos** e um por raça; filtra tanto os personagens obtidos quanto os "Ainda não obtidos".

### Desempenho e efeitos por cor (v0.10.1)
O jogo mira **60 quadros por segundo** em todas as telas. Para isso, os efeitos das cores têm regras de onde animam — **a carta parada é idêntica** em qualquer lugar:
- **Carta em foco** (detalhes da Coleção, carta grande do Treinar, mão da batalha, janela de inspeção e Despertar): **todos os efeitos** da cor — reflexo (Raro+), aura pulsando com raios girando (Épico+), brilho premium pulsante e faíscas (Lendário/Mítico) e metal em movimento (Mítico).
- **Cartas em grade** (Coleção, Equipe, lista do Treinar, janela de troca) — **v0.10.2:** são um **quadro congelado** do visual atual: fundo, aura de Ki, raios (Épico+) e personagem com sombra são desenhados **uma única vez** numa imagem pronta (por personagem, cor e bloqueado/obtido, no tamanho certo para a tela), e as faíscas Lendário/Mítico aparecem acesas e paradas. Nenhuma animação, filtro ou mistura de cores roda na grade, então **rolar a Coleção não redesenha nenhuma carta**. Toque na carta para ver tudo animado nos detalhes.
- **Cartas "Ainda não obtidos" (v0.10.3):** aparecem em cinza escurecido como antes, mas o cinza vem pronto (arte em bitmap e moldura/medalhões em tons cinza), sem filtro de imagem — entrar na tela não custa nada ao rolar.
- **Cartas apagadas da mão** (ainda na contagem de rodadas) ficam com os efeitos parados até voltarem a ficar disponíveis.
- **Atrás de janelas** (detalhes, troca, avisos, fim de luta, inspeção, Despertar) as animações ficam pausadas; voltam ao fechar a janela.
- **Fundo da página:** é uma camada fixa pintada uma vez (antes era redesenhado a cada passo da rolagem). No celular, a carta não "levanta" ao ser tocada durante a rolagem.
- O fundo atrás das janelas fica **escurecido, sem desfoque** (o desfoque era refeito a cada quadro e derrubava o FPS pela metade).
- Com **"reduzir movimento"** ativado no aparelho, as cartas e os lutadores ficam sem animações decorativas.

### Evolução visual por cor (Carta e Lutador na Arena)
Cada **mudança de cor** muda o visual do personagem tanto na carta quanto no lutador de corpo inteiro na arena (o degrau "+" não muda o visual):
- **Comum:** roupa simples de aprendiz/recruta, arma/postura inicial, sem aura.
- **Incomum:** aura fraca, faixa de batalha cruzada e acabamento no traje.
- **Raro:** ombreiras metálicas, manoplas, aura mais forte e golpe de Ki maior.
- **Épico:** peitoral com gema de poder, capa esvoaçante, olhos brilhando na cor da aura.
- **Lendário:** armadura e espinhos dourados, diadema/coroa real, cabelo energizado com brilho, partículas de Ki.
- **Mítico:** forma suprema — cabelo radiante, halo dourado, raios e aura dupla.
- O físico cresce a cada cor (ombros mais largos).
- **Cabelo preso à cabeça (v0.11.2):** o cabelo tem o **mesmo tamanho em todas as cores** e é desenhado sobre o crânio: cobre o alto da cabeça, a franja fica na testa e as mechas descem rente às têmporas, sem vão nem "peruca" de cabeça maior. A cor mostra a evolução pelo brilho (Lendário) e pelo cabelo radiante (Mítico), não pelo tamanho. Vale para a carta, o lutador da arena, os Comandantes, a Base e a janela de detalhes. Na arena o cabelo faz parte do grupo da cabeça e se move junto com ela.
- **Mesmo rosto na carta e na arena (v0.11.3):** cada personagem tem **um rosto só**, usado pela carta e pelo lutador da arena: mesmo formato de olho, cor da íris (que muda em Épico+), sobrancelhas, boca/presas, barba, marcas da raça e do personagem (pintura, cicatrizes, tiara, óculos, lenço, orelhas, chama na testa) e acessórios do rosto (máscara do Toru a partir de Incomum, visor do Zarek). Na arena só a íris fica um pouco maior para ler no tamanho pequeno, e o visor da Nyx não pisca (sem animação nova). Vale para todas as cores e para a Cria Sombria. Os Comandantes não têm carta e seguem com o próprio rosto.
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

| Personagem | Raça | Categoria | Cores | "+" melhora | Custo (espera = 2 × custo − 1) | Ataque / Vida | Dano | Alcance (à distância: 4 desde a v0.16.0) | Resist. fís./mág. de atributo (0 desde a v0.17.0: agora só por habilidade) | Habilidade e evolução |
|---|---|---|---|---|---|---|---|---|---|---|
| Riku Vendaval | 🌍 Humano | ⚔️ DPS | Comum → Épico+ | ataque | 2 | 3 / 6 (3 / 6 em Comum) | Físico | 1 | 0/0 | Salto Vendaval — Move-se sempre saltando até a 3ª casa (fixo, não aumenta com cor nem nível) · Bônus de investida (ao atacar logo depois do salto): +1 em Raro, +2 em Épico, +1 extra no nível 30 (máx. +3). |
| Nara Lâmina-Lunar | 🪐 Extraterrestre | ⚔️ DPS | Comum → Épico+ | ataque | 2 | 3 / 6 (3 / 6 em Comum) | Físico | 1 | 0/0 | Corte Diagonal — Raro em diante: ao bater em frente, também corta a diagonal com 50% do dano (máx.). |
| Toru Sombra-Reversa | 🤖 Androide | 🛡️ Tanque | Comum → Épico+ | vida | 3 | 2 / 11 (2 / 11 em Comum) | Físico | 1 | 0/0 | Golpe Reverso<br>Postura de Guarda — Raro: +1 de resistência física · Épico: +2 (máx.). · Postura de Guarda agora dá a resistência física toda: 1 / 1 / 2 / 3 (Comum → Épico). |
| Aiko Flecha-Celeste | 🪐 Extraterrestre | 🏹 Arqueiro | Incomum → Épico+ | ataque | 3 | 3 / 5 (3 / 6 em Incomum) | Físico | 3 | 0/0 | Flecha Dupla — Incomum: 2ª flecha de 1 · Raro: 2 · Épico: 3 (máx. 3); +1 no nível 25. |
| Lyra Olho-de-Falcão | 🔮 Mago Arcano | 🪄 Mago | Incomum → Épico+ | ataque | 3 | 3 / 4 (3 / 5 em Incomum) | Mágico | 3 | 0/0 | Feixe Perfurante — Dano nos de trás: 50% (Incomum) · 75% (Raro em diante, máx.). · 🔰 **Barreira Arcana** (v0.17.0): resistência mágica 1 (Incomum–Raro) / 2 (Épico). |
| Gorath Muralha-de-Ferro | 👹 Monstro | 🛡️ Tanque | Incomum → Épico+ | vida | 4 | 2 / 12 (2 / 14 em Incomum) | Físico | 1 | 0/0 | Inabalável — Raro: +1 de resistência física · Épico: também +1 de resistência mágica. · 💢 **Ombrada** (v0.17.0): ao acertar de frente corpo a corpo, empurra o alvo 1 casa. |
| Mei Lótus-Celeste | 🔮 Mago Arcano | ➕ Suporte | Incomum → Épico+ | vida | 3 | 2 / 5 (2 / 6 em Incomum) | Mágico | 3 | 0/0 | Bênção do Lótus — Cura 2 (Incomum–Raro) · 3 (Épico); +1 no nível 20 (máx. 4). · 👼 **Anjo da Guarda** (v0.17.0): 1 vez por batalha salva um aliado vizinho (ou ela mesma) com 1 de vida. |
| Yume Caçadora | ☠️ Necromante | 💀 Assassino | Raro → Lendário+ | ataque | 3 | 4 / 4 (5 / 5 em Raro) | Físico | 1 | 0/0 | Instinto Predador — Execução: +1 em Raro, +2 em Épico, +3 em Lendário; +1 no nível 25 (máx. +3). |
| Zarek do Eclipse | 🪐 Extraterrestre | 💀 Assassino | Raro → Lendário+ | ataque | 4 | 4 / 5 (5 / 7 em Raro) | Físico | 1 | 0/0 | Emboscada — Perfura 1 de resistência em Raro, 2 em Épico, 3 em Lendário; +1 no nível 25 (máx. 3). · ♻ **Renascer** (v0.17.0): volta 1 vez com 30% (Raro) / 40% (Épico) / 50% (Lendário) da vida. |
| Kenji Punho-Espelhado ✦ | 🌍 Humano | ⚔️ DPS | Lendário → Mítico+ | ataque | 5 | 3 / 7 (5 / 11 em Lendário) | Físico | 1 | 0/0 | Punho Espelhado — Multiplicador: ×2 (Lendário) · ×2,25 (Mítico, máx.). · (v0.17.0: perdeu a resistência física 1 de atributo.) |
| Nyx-07 | 🤖 Androide | ➕ Suporte | Épico → Mítico+ | vida | 5 | 2 / 6 (3 / 9 em Épico) | Mágico | 3 | 0/0 | Sifão de Energia — −1 de ataque (Épico–Lendário) · −2 (Mítico). · 🪞 **Reflexo de Magia** (v0.17.0): reduz o dano mágico/feitiço recebido em 30% (Épico) / 40% (Lendário) / 50% (Mítico) e devolve essa parte. |
| Vorax ✦ | ☠️ Necromante | 🪄 Mago | Lendário → Mítico+ | ataque | 6 | 3 / 6 (5 / 10 em Lendário) | Mágico | 3 | 0/0 | Prole Sombria — Cria: ataque 2 e vida 1 (Lendário) · ataque 3 e vida 2 (Mítico). · ⚰️ **Necromancia** (v0.17.0): ao entrar em campo, traz da Necropolis a última carta aliada derrotada. |
| Daichi Punho-de-Rocha | 👹 Monstro | 🛡️ Tanque | Comum → Épico+ | vida | 3 | 2 / 9 | Físico | 1 | 0/0 | Couraça de Espinhos — devolve 1 (Comum–Incomum) · 2 (Raro) · 3 (Épico). |
| Sora Brisa-Serena | 🔮 Mago Arcano | ➕ Suporte | Comum → Épico+ | vida | 2 | 1 / 5 | Mágico | 3 | 0/0 | Sopro Restaurador — cura 1 (Comum–Incomum) · 2 (Raro) · 3 (Épico). |
| Tobi Tambor-de-Guerra | 👹 Monstro | ➕ Suporte | Comum → Épico+ | vida | 3 | 2 / 7 | Físico | 1 | 0/0 | Tambor de Guerra — vizinhos +1 de ataque (Comum–Raro) · +2 (Épico). |
| Kael Chama-Rubra | 🔮 Mago Arcano | 🪄 Mago | Comum → Épico+ | ataque | 3 | 3 / 4 | Mágico | 3 | 0/0 | Explosão de Brasas — explosão de 1 (Comum–Incomum) · 2 (Raro–Épico). |
| Suri Maré-Gélida | 🪐 Extraterrestre | 🪄 Mago | Comum → Épico+ | vida | 2 | 2 / 5 | Mágico | 3 | 0/0 | Maré Implacável — +1 no Comandante (Comum–Incomum) · +2 (Raro) · +3 (Épico). |
| Hana Pena-Veloz | 🌍 Humano | 🏹 Arqueiro | Comum → Épico+ | ataque | 2 | 2 / 5 | Físico | 3 | 0/0 | Tiro Certeiro — ignora 1 de resistência física (Comum–Incomum) · 2 (Raro–Épico). |
| Jin Arco-Trovão | 🤖 Androide | 🏹 Arqueiro | Comum → Épico+ | ataque | 3 | 3 / 5 | Físico | 3 | 0/0 | Olho de Águia — +1 de dano a 2–4 casas (Comum–Incomum) · +2 (Raro–Épico). · 👁 **Vigia** (v0.17.0): age antes das outras unidades. |
| Ren Presa-Oculta | 🌍 Humano | 💀 Assassino | Comum → Épico+ | ataque | 2 | 3 / 5 | Físico | 1 (mira 2) | 0/0 | Caça-Conjuradores — +1 de dano em quem ataca de longe (Comum–Incomum) · +2 (Raro–Épico). |
| Kuro Garra-Noturna | 👹 Monstro | 💀 Assassino | Comum → Épico+ | ataque | 3 | 3 / 5 | Físico | 1 (mira 2) | 0/0 | Ataque Surpresa — +1 em alvo com vida cheia (Comum–Incomum) · +2 (Raro–Épico). |
| *Cria Sombria* (invocada) | ☠️ Necromante | 🪄 Mago | — | — | — | 2 ou 3 / 1 ou 2 | Mágico | 2 | 0/0 | Disparo Sombrio (alcance 2) e Prole Sombria. |

✦ = **personagem único**: muito forte, já nasce em Lendário e só chega a Mítico+.

Habilidades em detalhe:
- **Salto Vendaval:** o movimento do Riku é sempre um salto até a **3ª casa** (2ª ou 1ª se a de cima estiver ocupada; fixo em todas as cores e níveis), por cima de aliados ou inimigos. Ao atacar logo depois de saltar, soma o bônus de investida (+1 Raro, +2 Épico, +1 no nível 30, máx. +3).
- **Corte Diagonal:** ataca a diagonal logo à frente quando não há ninguém em frente. A partir de Raro, ao bater em frente também corta a diagonal com **50%** do dano (teto, v0.15.1).
- **Golpe Reverso:** prioriza o inimigo na diagonal logo atrás.
- **Postura de Guarda:** resistência física extra por cor.
- **Flecha Dupla:** segunda flecha de dano fixo no mesmo alvo.
- **Feixe Perfurante:** atravessa a fileira, ferindo também quem está atrás do alvo (dentro do alcance 4) com 50% (Incomum) ou **75% (Raro em diante, teto, v0.15.1)**.
- **Inabalável:** não pode ser empurrado; ganha resistência em Raro/Épico.
- **Bênção do Lótus:** no início da ação, cura **só os 2 aliados vizinhos mais feridos** (inclusive diagonais e a outra fileira; v0.15.1). Mais ferido = mais vida perdida; empate: quem tem menos vida, depois quem entrou em campo antes.
- **Instinto Predador:** menor vida da fileira até 2 casas; dano extra em alvos com metade da vida ou menos.
- **Emboscada:** mais distante da fileira até 2 casas; ignora parte da resistência.
- **Punho Espelhado:** ao sofrer golpe físico corpo a corpo de frente, contra-ataca com ataque multiplicado e empurra o agressor 1 casa para trás.
- **Sifão de Energia:** enquanto em campo, todos os inimigos perdem ataque (ataque mínimo 1).
- **Prole Sombria:** ao derrotar, surge uma **Cria Sombria** na casa do derrotado ou na antiga casa de Vorax. Crias também geram crias (máx. 3 por lado). A cria tem **ataque 2** com Vorax em **Lendário** e **ataque 3** com Vorax em **Mítico**; vida 1 (Lendário) ou 2 (Mítico); o "+" do Vorax não muda a Cria. Uma cria gerada por outra cria herda as mesmas estrelas.
- **Couraça de Espinhos (Daichi):** quem o ataca **corpo a corpo de frente** (golpe principal) sofre dano fixo de volta, se Daichi sobreviver ao golpe. Ataques à distância e golpes secundários não ativam.
- **Sopro Restaurador (Sora):** no início da ação, cura o aliado **mais ferido da própria fileira**, a qualquer distância. Sora ataca à distância (alcance 4, mágico).
- **Tambor de Guerra (Tobi):** enquanto Tobi estiver em campo, os aliados nos **8 vizinhos** (inclusive a outra fileira) ganham ataque. Vários tambores **não se somam** (vale o maior); bônus de aliados tem teto de **+2**. Crias não recebem.
- **Explosão de Brasas (Kael):** ao acertar uma unidade, a explosão causa dano mágico fixo no inimigo da **mesma coluna na outra fileira** (habilidade lateral).
- **Maré Implacável (Suri):** dano extra quando ataca o **Comandante** inimigo.
- **Tiro Certeiro (Hana):** ignora parte da **resistência física** do alvo.
- **Olho de Águia (Jin):** dano extra em unidades a **2 casas ou mais** (até o alcance 4; colado, só o dano normal).
- **Caça-Conjuradores (Ren):** prioriza inimigos de longo alcance da fileira até 2 casas e causa dano extra neles.
- **Ataque Surpresa (Kuro):** mira o inimigo de maior ataque da fileira até 2 casas; dano extra se o alvo estiver com a **vida cheia**.
- **Disparo Sombrio (Cria):** ataque **mágico** no inimigo **mais próximo até 2 casas à frente** na própria fileira (como as unidades de longo alcance, mas com alcance 2), inclusive o Comandante a partir da penúltima coluna. Não avança quando pode atacar.

## 13. Equipe e janelas do jogo
- **v0.17.0:** a tela **Coleção & Baralho** mostra o baralho com **N/máximo**, cada carta com os botões **− ×N +** de cópias, e uma seção **✦ Feitiços**. **Colocar no baralho** põe a carta com o máximo de cópias que couber (até 3); com o baralho cheio aparece a janela **Baralho cheio** (não há mais janela de troca). Tirar uma carta que deixa o baralho inválido mostra um aviso. As regras abaixo sobre "10 personagens" e "troca" valem até a v0.16.
- *(até a v0.16)* A equipe é o seu baralho e precisa ter **exatamente 10 personagens diferentes** para lutar (cada um vale 4 cópias). Dá para tirar alguém e ficar com menos de 10 enquanto monta a equipe, mas aí a batalha fica bloqueada: o jogo avisa ao tirar, a tela de Coleção mostra "faltam N" em vermelho, a Aventura mostra um aviso com **Completar equipe**, e **Lutar** abre a janela **Equipe incompleta** com **Ir para a equipe**.
- **Novo jogo:** você começa **só com personagens Comuns** — os **12 iniciais** (2 de cada categoria). A equipe começa com 10 deles; os outros 2 ficam na coleção para trocar. Ao desbloquear um personagem, ele **entra direto na equipe** se houver vaga.
- **Saves antigos (migração da v0.8, uma única vez):** você **mantém todos os personagens, níveis, cores, itens e fases** que já tinha — inclusive **Kenji e Vorax**, se já tinham sido obtidos (ninguém perde progresso). Todo save também ganha os **9 novos personagens Comuns**. Se a equipe tiver menos de 10, ela é completada com os seus personagens mais fortes que estavam fora dela.
- **Saves antigos (migração da v0.10, uma única vez):** as estrelas viram a cor de mesmo número (1★ Comum, 2★ Incomum, 3★ Raro, 4★ Épico, 5★ Lendário, 6★ Mítico), sempre na **cor base** (sem "+"). Cada personagem mantém a cor que já tinha, o nível e o XP (o nível máximo da cor base é o mesmo do antigo nível máximo).
- Com a equipe cheia, **Colocar na equipe** abre a janela de **troca**: todas as cartas da equipe começam marcadas; toque nas que vão **sair** (ficam cinza com ✖). **Trocar** só libera quando o número certo estiver desmarcado; **Cancelar** não muda nada.
- **Saves antigos (migração da v0.13):** todo save ganha o **Comandante Bárbaro no nível 1** (20 de vida, como antes). Cartas, itens e fases não mudam.
- Todas as confirmações e avisos (sair da batalha, apagar progresso, equipe incompleta, evoluir o Comandante, conta) usam janelas do próprio jogo, no tema escuro/dourado.

## 13.2 Contas locais e conta de teste ADM (v0.16.0)
- No **canto superior esquerdo da Base** fica o botão **👤 Entrar / Criar conta**. Ele abre a janela **Conta** com **Nome** e **Senha** e os botões **Entrar** e **Criar conta** (erros aparecem na própria janela: nome já existe, conta não encontrada, senha incorreta, senha curta).
- **Nome:** até 16 caracteres (letras, números, espaço, ponto, hífen ou _), sem diferenciar maiúsculas. **Senha:** pelo menos 3 caracteres.
- Conectado, o canto mostra **👤 Nome** e o botão **Sair**. A conta continua conectada ao recarregar a página.
- **Cada conta guarda o próprio progresso neste aparelho** (cartas, níveis, itens, fases, Comandante). Sem conta, o jogo usa o progresso de antes (quem já jogava não perde nada). **Apagar progresso** apaga só o da conta atual.
- **Conta de teste ADM** (senha **12345**), já criada: perfil no **máximo** — todos os personagens (inclusive Kenji e Vorax) na **cor máxima com "+"** e **nível máximo**, equipe com os 10 de maior Poder (v0.17.0: **baralho de 40** = os 10 de maior Poder × 3 + **10 cartas de feitiço**; nível de perfil 11), **as 10 fases concluídas**, Comandante no **nível máximo** e itens de sobra. Se o progresso da ADM for apagado, ele volta ao máximo na próxima vez que a conta for aberta.
- ⚠ **Não é segurança de verdade:** não há servidor; tudo fica no armazenamento do navegador deste aparelho, a senha da ADM está no código e a senha das contas é guardada só com um embaralhamento simples. Serve para separar o progresso de quem divide o aparelho e para testes. A janela avisa isso.

## 13.1 Progressão de personagens
- **Começo:** só personagens de **Comum** (os 12 iniciais).
- **Incomum, Raro e Épico:** desbloqueados pela **progressão normal**, na **primeira vitória** de cada fase (ver seção 14).
- **Lendário e Mítico (Kenji e Vorax):** **bloqueados por enquanto**, sem forma de obter no jogo (nem missão especial). Aparecem na coleção, em "Ainda não obtidos", **apagados com cadeado** e a etiqueta **"🔒 Em breve"**. A forma de desbloquear será decidida numa atualização futura. Eles continuam aparecendo como **inimigos** nas fases finais.

## 14. Aventura
- 10 fases; vencer libera a próxima. **v0.20.0:** as fases ficam num **mapa** e existem em **3 dificuldades** (Fácil, Normal e Difícil); toda vitória e todo **Repetir** dão a **recompensa inteira**, com limite de **5 por dia em cada fase** (detalhes na seção 19). Antes: primeira vitória completa, repetir 50%.
- **Desbloqueios (primeira vitória):** fase 1 → **Aiko** (Incomum) · fase 2 → **Mei** (Incomum) · fase 3 → **Lyra** (Incomum) · fase 4 → **Gorath** (Incomum) · fase 5 → **Yume** (Raro) · fase 6 → **Zarek** (Raro) · fase 8 → **Nyx-07** (Épico). Kenji e Vorax: em breve.
- **Baralho da IA:** toda fase tem **10 personagens diferentes**. Fases 1 e 2 usam só personagens Comuns (a fase 1 sem tanques); a partir da 3 entram os de Incomum, Raro e Épico; Kenji (fases 8 e 9) e Vorax (fase 10) só aparecem como inimigos.
- **Nível dos inimigos (v0.18.0):** fase 1 a 10 = **1, 4, 4, 5, 6, 6, 11, 14, 17, 12** (cada carta limitada ao nível máximo da cor dela; na fase 10 as cartas estão **uma cor acima**, por isso o nível é menor). Antes: 1, 2 e depois 1 + 1,5 × (fase − 1) → 1, 2, 4, 6, 7, 9, 10, 12, 13, 15. Ver seção 17.
- **Vida do Comandante inimigo (v0.13):** 12 + 7 × (fase − 1) → 12, 19, 26, 33, 40, 47, 54, 61, 68, 75. Antes era 12 + 2 × (fase − 1); os +5 por fase a mais são **metade** do acréscimo de vida do seu Comandante no nível esperado daquela fase (ver seção 15).
- Derrota dá 1 Pergaminho de Ki de consolo.
- Progresso salvo no navegador (localStorage). O **nível de perfil** conta as fases vencidas no **Fácil**.

## 15. Poder ⚡ e Comandante 👑 (v0.13)
### Poder da carta
- **Poder = arredondar( 10 × peso da habilidade × √(ataque × vida) )**, com o ataque e a vida **atuais** da carta (nível, cor e "+" já aplicados). Por isso o Poder **sobe a cada nível, no "+" e a cada cor**.
- **Peso da habilidade** = valor de combate medido de cada personagem (média 1,00). Ele inclui o efeito das **habilidades** e do **custo** de energia:

| Personagem | Peso | Personagem | Peso | Personagem | Peso |
|---|---|---|---|---|---|
| Kenji | 1,39 | Aiko | 1,06 | Nyx-07 | 0,95 |
| Daichi | 1,17 | Riku | 1,04 | Gorath | 0,92 |
| Sora | 1,16 | Toru | 1,00 | Kuro | 0,92 |
| Lyra | 1,09 | Yume | 1,00 | Nara | 0,91 |
| Tobi | 1,08 | Suri | 1,00 | Hana | 0,90 |
| Vorax | 0,98 | Kael | 0,97 | Zarek | 0,89 |
| Jin | 0,96 | Mei | 0,86 | Ren | 0,78 |

- **Como foi calibrado** (`scripts/balance/calibrate.ts`): 30 000 batalhas IA × IA (a mesma IA do Auto) entre baralhos aleatórios de 10 personagens, com cor, "+" e nível sorteados, nas duas ordens (quem começa). Uma regressão logística mediu quanto cada personagem soma para vencer, por unidade de √(ataque × vida). Formatos testados: ataque^a × vida^(1−a) com a = 0,4 / 0,5 / 0,6 e divisão por custo^g com g = 0 / 0,25 / 0,5. Todos acertaram ~71,5% dos vencedores (log-loss 0,552–0,553); ficou o mais simples (a = 0,5, g = 0; o custo já entra no peso de cada personagem).
- **Validação:** só a razão de Poder entre os dois baralhos já prevê o vencedor:

| Poder do seu baralho ÷ do adversário | < 0,80 | 0,80–0,90 | 0,90–0,97 | 0,97–1,03 | 1,03–1,10 | 1,10–1,25 | > 1,25 |
|---|---|---|---|---|---|---|---|
| Vitória de quem começa | 27% | 44% | 56% | 64% | 73% | 82% | 91% |

- Exemplos: Riku Comum Nv.1 = ⚡44 · Toru Comum Nv.1 = ⚡47 · equipe inicial = **⚡377**.
- O Poder aparece na **pílula do topo direito de toda carta** ("Nv N | ⚡Poder", v0.14) e na linha de status da janela de detalhes. É texto por cima do quadro congelado da carta (não muda o bitmap).

### Poder do baralho
- **Soma do Poder das 10 cartas da equipe**, em destaque em **Coleção & Equipe** (painel do Comandante e título da equipe) e na **Aventura**.
- Baralhos da IA: fase 1 ⚡346 · 2 ⚡388 · 3 ⚡461 · 4 ⚡567 · 5 ⚡558 · 6 ⚡703 · 7 ⚡713 · 8 ⚡925 · 9 ⚡936 · 10 ⚡1134.

### Nível do Comandante
- Painel do Comandante em **Coleção & Equipe**: arte animada, nível, vida máxima, Poder do baralho, barra até o próximo requisito e o botão **⬆ Evoluir**. O botão abre uma janela do jogo com nível, vida e Poder (atual / necessário). Sem Poder suficiente, a janela mostra quanto falta.
- **Evoluir é grátis** e sobe **1 nível por vez**: a única trava é o **Poder do baralho ≥ requisito do próximo nível**, conferido **só na hora de evoluir**.
- **O Comandante nunca perde nível.** Depois de evoluir você pode trocar cartas à vontade, mesmo ficando abaixo do requisito.
- Cada nível dá **+10 de vida máxima**. A batalha começa com o Comandante na vida máxima do nível atual.

| Nível do Comandante | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
|---|---|---|---|---|---|---|---|---|---|---|
| Poder do baralho necessário | — | 480 | 510 | 560 | 610 | 660 | 760 | 840 | 930 | 980 |
| Vida máxima | 20 | 30 | 40 | 50 | 60 | 70 | 80 | 90 | 100 | 110 |

- Os requisitos são o **Poder típico com que o jogador chega à fase de mesmo número** (mediana do simulador): o Comandante chega ao nível N por volta da fase N.
- **Aparência por faixa de nível (regra futura):** como no jogo de referência, o Comandante **muda levemente de aparência a cada 10 níveis** — nova aparência ao chegar aos níveis **11, 21, 31…** (níveis 1–10 = 1ª aparência, 11–20 = 2ª, e assim por diante). Hoje o nível máximo é **10**, então todos usam a aparência atual; as novas artes entram quando o nível máximo passar de 10.
- **Vários Comandantes no futuro:** os Comandantes são uma lista (id, categoria, arte, curva de vida, requisitos, habilidades). Haverá 1 por categoria, cada um com habilidades especiais que também evoluem. Por enquanto só o **Bárbaro** está disponível (sem tela de escolha). Cada Comandante guarda o próprio nível.

### Por que +10 por nível (simulação)
- `scripts/balance/schedules.ts` e `final.ts`: 30–40 jogadores simulados começam um save novo e seguem a campanha. Antes de cada tentativa gastam todo o XP na equipe (menor nível primeiro), despertam quem está no teto, usam as 10 cartas de maior Poder e evoluem o Comandante quando podem. Se perdem, ganham +1 Pergaminho, repetem a última fase vencida (50%) e tentam de novo. Em cada fase, 40 batalhas medem a vitória **no momento em que chegam** e o maior dano que o Comandante leva num único turno inimigo (sem cortar em 0).
- **One-shot** = um turno inimigo tirar **100% ou mais** da vida máxima do Comandante.

| Curva (Comandante inimigo +metade do acréscimo) | Maior turno ÷ vida (pior fase) | Fases com risco de one-shot | Turnos ≥ 50% da vida na fase 10 | Vitória ao chegar: fase 6 / 8 / 10 |
|---|---|---|---|---|
| Hoje (20 fixo, inimigo 12 + 2·i) | 190% | 3 a 10 | 63% | 32% / 30% / 27% |
| A: +5 por nível (20 → 65) | 123% | 3 a 8 e 10 | 21% | 32% / 27% / 26% |
| C: +3, +5, +10 (20 → 74) | 128% | 3 a 8 e 10 | 21% | 28% / 31% / 27% |
| **B: +10 por nível (20 → 110)** | **97%** | **nenhuma** | **6%** | **31% / 29% / 25%** |

- Só a **B** tira o one-shot em todas as fases. A **A** e a **C** ainda deixam um turno inimigo derrubar o Comandante de vida cheia.
- **Comandante inimigo:** testado sem mudar (12 + 2·i), com **metade** do acréscimo e com o acréscimo **inteiro**. Com a B e o inimigo sem mudar, as fases ficavam mais fáceis (fase 9: 52% → 68%). Com o acréscimo inteiro ficavam mais difíceis que hoje (fase 10: 27% → 21%). **Metade** (12 + 7·i) mantém a dificuldade de hoje.

### Resultado por fase (v0.13, 40 jogadores simulados)
| Fase | Poder ao chegar | Nível do Comandante ao chegar | Vida do Comandante | Comandante inimigo | Vitória ao chegar (antes → agora) | Tentativas até vencer | Maior turno ÷ vida (antes → agora) | Maior ataque de uma unidade inimiga |
|---|---|---|---|---|---|---|---|---|
| 1 | 447 | 1 | 20 | 12 | 99% → 100% | 1,0 | 60% → 45% | 3 |
| 2 | 485 | 2 | 30 | 19 | 97% → 97% | 1,0 | 90% → 60% | 3 |
| 3 | 515 | 3 | 40 | 26 | 94% → 94% | 1,1 | 140% → 88% | 4 |
| 4 | 568 | 4 | 50 | 33 | 57% → 56% | 1,5 | 150% → 96% | 5 |
| 5 | 611 | 5 | 60 | 40 | 74% → 78% | 1,2 | 145% → 82% | 5 |
| 6 | 669 | 6 | 70 | 47 | 32% → 31% | 2,3 | 170% → 97% | 9 |
| 7 | 751 | 6 | 70 | 54 | 76% → 74% | 1,4 | 150% → 87% | 9 |
| 8 | 821 | 7 | 80 | 61 | 30% → 29% | 2,4 | 165% → 79% | 10 |
| 9 | 922 | 8 | 90 | 68 | 52% → 55% | 1,9 | 155% → 74% | 10 |
| 10 | 976 | 9 | 100 | 75 | 27% → 25% | 3,0 | 190% → 78% | 12 |

- O ataque máximo inclui a Fúria de batalha. Exemplo do risco antigo: na fase 10 o pior turno inimigo tirava 190% da vida (38 de dano contra 20 de vida). Agora tira no máximo 78% (78 de 100).

### v0.15.0 — nova regra de movimento (100 jogadores simulados, `scripts/balance/move15.ts`)
Atravessar aliados, sem passo da vitória e Riku com 3 casas fixas. Vitória ao chegar e maior turno inimigo (p95 ÷ vida do Comandante), antes → depois:

| Fase | Vitória ao chegar | Turno inimigo p95 ÷ vida | Turnos ≥ 50% da vida |
|---|---|---|---|
| 1 | 99% → 99% | 15% → 15% | 0% → 0% |
| 2 | 98% → 96% | 13% → 20% | 0% → 1% |
| 3 | 94% → 93% | 25% → 30% | 2% → 3% |
| 4 | 56% → 57% | 62% → 72% | 15% → 26% |
| 5 | 78% → 80% | 48% → 57% | 4% → 9% |
| 6 | 30% → 41% | 65% → 70% | 21% → 26% |
| 7 | 76% → 78% | 49% → 53% | 4% → 6% |
| 8 | 30% → 45% | 49% → 63% | 5% → 12% |
| 9 | 58% → 74% | 39% → 52% | 1% → 6% |
| 10 | 26% → 36% | 50% → 58% | 5% → 10% |

- As tropas chegam mais rápido à linha de frente (dos dois lados): as fases finais ficaram **mais fáceis** (+10 a +16 pontos nas fases 6, 8, 9 e 10), e os turnos inimigos fortes ficaram um pouco mais comuns. Nenhum valor de dificuldade foi mexido nesta versão.

### v0.15.1 — tetos de habilidade (100 jogadores simulados)
Feixe Perfurante máx. 75%, Corte Diagonal máx. 50%, Bênção do Lótus nos 2 mais feridos e investida só no salto de verdade. Vitória ao chegar, antes → depois: fase 1 99% → 99% · 2 96% → 95% · 3 93% → 93% · 4 57% → 59% · 5 80% → 80% · 6 41% → 42% · 7 78% → 79% · 8 45% → 47% · 9 74% → 74% · 10 36% → 36%. Praticamente sem mudança na campanha (diferenças dentro do ruído); o efeito aparece em cartas Épicas ou melhores dessas habilidades.

### v0.15.2 — Riku salta o inimigo da frente (100 jogadores simulados)
Vitória ao chegar, antes → depois: fase 1 99% → 99% · 2 95% → 95% · 3 93% → 93% · 4 59% → 59% · 5 80% → 81% · 6 42% → 43% · 7 79% → 78% · 8 47% → 47% · 9 74% → 76% · 10 36% → 37%. Sem efeito relevante na campanha (Riku é uma carta só, dos dois lados).

### v0.15.4 — Riku sempre se move saltando (100 jogadores simulados)
Vitória ao chegar, antes → depois: fase 1 99% → 98% · 2 95% → 94% · 3 93% → 92% · 4 59% → 61% · 5 80% → 81% · 6 42% → 45% · 7 78% → 81% · 8 46% → 49% · 9 75% → 75% · 10 37% → 37%. Diferenças de até 3 pontos (ruído).

### v0.16.0 — arena 2 × 12, contagem de rodadas e alcance 4 (300 jogadores simulados, `scripts/balance/move15.ts`)
Vitória ao chegar, v0.15.4 → v0.16.0 (mesma simulação, 300 jogadores cada):

| Fase | Vitória ao chegar | Turno inimigo p95 ÷ vida | Turnos ≥ 50% da vida |
|---|---|---|---|
| 1 | 98% → 92% | 15% → 45% | 0% → 4% |
| 2 | 95% → 98% | 20% → 10% | 0% → 1% |
| 3 | 92% → 76% | 25% → 53% | 2% → 6% |
| 4 | 61% → 76% | 70% → 48% | 19% → 5% |
| 5 | 82% → 80% | 55% → 45% | 8% → 3% |
| 6 | 45% → 47% | 68% → 52% | 20% → 7% |
| 7 | 80% → 81% | 50% → 40% | 5% → 2% |
| 8 | 49% → 86% | 59% → 30% | 9% → 1% |
| 9 | 76% → 87% | 51% → 34% | 6% → 1% |
| 10 | 38% → 66% | 57% → 47% | 10% → 4% |

- Esperas testadas (40 jogadores cada): **espera = custo** → fases 4–6 e 10 com 13–25% (muito difíceis); **2 × custo − 2** → 86/97/68/67/74/39/79/85/88/65; **2 × custo − 1 com a mão inicial 2 rodadas adiantada (escolhida)** → 90/98/75/76/80/46/80/88/87/65. Zona de invocação com 4 colunas e Fúria mais tarde não ajudaram.
- Resultado: o começo fica parecido (fase 3 um pouco mais difícil), os turnos inimigos muito fortes ficaram **mais raros**, e as fases 8–10 ficaram **mais fáceis** (+11 a +37 pontos). Nenhum Comandante, baralho inimigo, ataque ou vida foi mexido; se quiser as fases finais tão difíceis quanto antes, o próximo ajuste é a vida ou o nível dos inimigos dessas fases.

### v0.17.0 — fase 2: habilidades, efeitos, feitiços e baralho com cópias (300 jogadores simulados, `scripts/balance/move15.ts`)
Vitória ao chegar, v0.16.0 → v0.17.0. O jogador simulado usa os 10 mais fortes × 3 e, quando o nível de perfil abre espaço, **até 4 cartas de feitiço** que combinam com a equipe (`SIM_SPELLS=0` desliga):

| Fase | v0.16.0 | v0.17.0 com feitiços | v0.17.0 sem feitiços |
|---|---|---|---|
| 1 | 92% | 93% | 93% |
| 2 | 98% | 99% | 98% |
| 3 | 76% | 91% | 78% |
| 4 | 76% | 77% | 68% |
| 5 | 80% | 82% | 77% |
| 6 | 47% | 53% | 45% |
| 7 | 81% | 82% | 79% |
| 8 | 86% | 89% | 87% |
| 9 | 87% | 86% | 85% |
| 10 | 66% | 53% | 59% |

- Os inimigos também ganharam as habilidades novas (fase 10: Renascer, Reflexo, Anjo da Guarda, Necromancia, Ombrada e Vigia), por isso a fase 10 ficou mais difícil. Nenhum ataque, vida, Comandante ou baralho inimigo foi mexido; se quiser a fase 10 como antes, o próximo ajuste é a vida do Comandante inimigo dessa fase.
- **Feitiços no simulador:** com os valores iniciais (30–100% do ataque) qualquer feitiço piorava o baralho (−10 a −40 pontos). Com os valores atuais (100–250%), espera custo − 1 e a fila recomeçando no lançamento, os de área (Lâmina Giratória, Chuva de Flechas) ajudam e os outros ficam perto de neutros para a IA. Encher o baralho além de 30 dilui as melhores cartas: até uma 11ª carta de personagem piora a vitória em 3–7 pontos — baralho maior é escolha, não força.

## 16. Fase 2 do plano — habilidades, efeitos e feitiços (v0.17.0)
### Efeitos com duração (decisão 16)
- Aparecem como **selos pequenos e parados** no canto do lutador (sem animação contínua) e na janela de informações da unidade.
- **🧪 Veneno:** no **início do turno do dono do efeito**, a unidade perde a quantidade indicada, **ignorando resistência**; dura X rodadas (rodada = um turno do lado dela).
- **🔥 Queimadura:** igual ao veneno, mas o dano é **reduzido pela resistência mágica** (mínimo 1).
- **Não acumulam:** aplicar de novo mantém o **valor mais forte** e a **maior duração**.
- **💫 Atordoado:** a unidade **perde a próxima ação** (não cura, não anda, não ataca). O efeito acaba no fim do turno do lado dela.
- **🛡 Escudo temporário:** absorve dano **antes da vida** (escudos se somam, até 99) e some no fim da duração ou quando é gasto. **v0.17.1:** a duração conta os **turnos do adversário** (perde 1 rodada no fim de cada turno inimigo): a Muralha de 2 rodadas lançada no seu turno protege contra os **2 turnos inimigos seguintes** (antes perdia 1 rodada já no fim do seu próprio turno e só cobria 1 turno inimigo).
- **👼 Anjo da Guarda (efeito do feitiço):** **não expira com o tempo**: dura até ser usado (uma vez), mesmo que demore muitos turnos. O texto da carta diz isso (v0.17.1).
- Veneno e queimadura **não** ativam Reflexo, Espinhos nem contra-golpe. A queda por veneno/queimadura não dá Prole ao inimigo.

### Ícone de aura no beneficiado (decisão 17)
- **🥁** no aliado que está recebendo o **Tambor de Guerra** (bônus de ataque) e **🌀** no inimigo que está sendo drenado pelo **Sifão de Energia**. Os números de ataque continuam verde (bônus) e vermelho (redução).

### Salvar e trazer de volta (decisões 18 e 21)
- **♻ Renascer (Zarek):** na **primeira** vez que cairia, volta na mesma casa com **30% (Raro) / 40% (Épico) / 50% (Lendário)** da vida máxima, sem efeitos. Uma vez por partida; não vai para a Necropolis nessa vez.
- **👼 Anjo da Guarda (Mei):** **uma vez por batalha**, quando um aliado **vizinho** (8 casas em volta, inclusive a outra fileira) ou ela mesma cairia, fica com **1 de vida**.
- **Ordem quando uma unidade chega a 0:** 1) efeito Anjo da Guarda do feitiço; 2) habilidade Anjo da Guarda de um vizinho; 3) Renascer; 4) cai (vai para a Necropolis).
- **⚰️ Necromancia (Vorax):** ao **entrar em campo**, traz da Necropolis a **última carta aliada derrotada**: volta para a mão **já pronta** (contagem 0); com a mão cheia, volta para o Baralho. A cópia deixa de contar como derrotada.

### Mais habilidades (decisões 12, 19, 20 e 14)
- **👁 Vigia (Jin):** age **antes** de todas as outras unidades do lado (seção 5, item 8).
- **💢 Ombrada (Gorath):** ao acertar **corpo a corpo de frente**, **empurra o alvo 1 casa** para trás (se a casa estiver livre; Inabalável não é empurrado). O empurrão também está no contra-golpe do Kenji e nos feitiços Investida de Ki e Tremor.
- **🪞 Reflexo de Magia (Nyx-07):** reduz o **dano mágico** (ataques mágicos) e o **dano de feitiço** recebido em **30% (Épico) / 40% (Lendário) / 50% (Mítico)** e devolve essa parte: no atacante (ataques) ou no **Comandante de quem lançou** (feitiços).
- **🔰 Barreira Arcana (Lyra):** resistência mágica **1 (Incomum–Raro) / 2 (Épico)**.
- **Resistência só por habilidade:** ver seção 7.

### Feitiços (decisões 4, 20 e 22)
- São **cartas** que ocupam vagas do baralho (1 a 3 cópias), aparecem na mão e esperam **custo − 1 rodadas** (mínimo 1) — mais rápido que personagens.
- Para lançar é preciso ter **em campo um aliado de uma das categorias do feitiço**: ele é o **conjurador** (o de **maior ataque**, se houver vários). A força vem do **ataque atual do conjurador** (ou da vida, nas curas/escudo), então acompanha a evolução das cartas. Sem conjurador, a carta fica apagada na mão.
- **Como lançar:** toque no feitiço e depois numa casa **roxa** (ou arraste até ela). Alvo: 🎯 um inimigo (qualquer distância), 🤝 um aliado, ↔ uma fileira (toque em qualquer casa dela) ou ✦ sem alvo (toque na sua zona).
- Depois de lançado, o feitiço **volta para o Baralho**, com a fila recomeçando no lançamento (fica bloqueado como se tivesse acabado de ser comprado). Feitiço nunca vai para a Necropolis.
- Todos os 13 feitiços estão liberados para todos desde já (pacotes ficam para a fase 3); a conta ADM começa com 10 cartas de feitiço no baralho.

| Feitiço | Categorias | Espera | Alvo | Efeito |
|---|---|---|---|---|
| 💨 Investida de Ki | DPS | 2 | 1 inimigo | 250% do ataque (físico) e empurra 1 casa |
| 🌪 Lâmina Giratória | DPS **ou** Assassino | 2 | fileira | 120% (físico) em todos os inimigos da fileira |
| 🧱 Muralha | Tanque | 1 | 1 aliado | escudo de 80% da vida máxima do conjurador por 2 turnos inimigos |
| 🌋 Tremor | Tanque **ou** DPS | 2 | 1 inimigo | 100% (físico), atordoa e empurra 1 casa |
| 🏹 Chuva de Flechas | Arqueiro | 2 | fileira | 100% (físico) em todos os inimigos da fileira |
| 🧪 Flecha Envenenada | Arqueiro **ou** Assassino | 1 | 1 inimigo | 80% (físico) + veneno de 60% por 3 rodadas |
| ☄️ Bola de Fogo | Mago | 2 | 1 inimigo | 200% (mágico) + queimadura de 50% por 2 rodadas |
| ⚡ Raio Paralisante | Mago **ou** Suporte | 2 | 1 inimigo | 130% (mágico) e atordoa |
| ☠ Veneno Mortal | Assassino | 1 | 1 inimigo | veneno de 100% por 3 rodadas (ignora resistência) |
| 🗡️ Golpe nas Sombras | Assassino | 2 | 1 inimigo | 250% ignorando toda a resistência |
| 💖 Cura em Massa | Suporte | 1 | fileira | cura 50% da vida máxima de cada aliado da fileira |
| 👼 Anjo da Guarda | Suporte | 2 | 1 aliado | a próxima queda deixa o aliado com 1 de vida (dura até ser usado) |
| ⚰️ Chamado da Necropolis | Suporte **ou** Mago | 2 | sem alvo | traz a última carta derrotada (mão pronta, ou Baralho) |

- **IA:** depois de invocar, lança os feitiços prontos com uma escolha simples de alvo (o inimigo mais avançado/forte; para veneno, o de mais vida; a fileira com mais inimigos; Cura só se curar pelo menos 3; Anjo no aliado mais forte sem proteção). O modo **Auto** do jogador usa a mesma IA. **Desde a v0.18.0 os inimigos da Aventura também usam feitiços** (seção 17).

### Baralho com cópias e nível de perfil (decisão 6)
- Até **3 cópias** por carta; baralho de **20** até **min(40, 28 + 2 × nível de perfil)** cartas; pelo menos 1 personagem.
- **Nível de perfil (provisório):** 1 + fases vencidas (máx. 11). Ao vencer uma fase pela primeira vez e o máximo subir, a janela de vitória avisa.
- **Poder do baralho:** soma o Poder de **cada personagem uma vez** (cópias e feitiços não contam), como antes.
- **Migração de saves (v0.17.0):** cada carta da equipe antiga vira **3 cópias** (10 × 3 = 30, que cabe no nível 1). Se algum baralho passar do máximo, as últimas cartas perdem cópias (e, no limite, saem). A ADM já existente ganha uma vez o baralho de 40 com feitiços.

### Escolhas padrão desta versão (detalhes que o plano não definia)
- Duração contada em turnos do lado da unidade; DoT no começo, atordoar no fim. Escudo (v0.17.1): conta os turnos do adversário, no fim de cada um.
- Veneno ignora resistência; queimadura usa a resistência mágica; não acumulam (mais forte + maior duração).
- Anjo da Guarda da Mei: vizinhos nas 8 casas, 1 vez por batalha; Renascer 30/40/50%.
- Reflexo também vale contra feitiços; o reflexo de feitiço vai no Comandante de quem lançou.
- Conjurador obrigatório da categoria; força pelo ataque do conjurador; espera dos feitiços = custo − 1.
- Feitiço lançado volta ao Baralho com a fila recomeçando.
- Fila de compra proporcional ao número de cartas diferentes (igual à antiga com 10).
- Baralho mínimo 20, máximo 28 + 2 × nível (até 40), nível = 1 + fases vencidas.
- Inimigos com 3 cópias (v0.18.0: e feitiços a partir da fase 3, seção 17).
- Não adotado ainda (perguntas abertas da proposta): reformulação das habilidades em %, "Escudo" como reserva de pontos, bônus de nível, teto da Emboscada e a regra nova da Prole.

## 17. Dificuldade crescente, feitiços da IA e partidas verificáveis (v0.18.0)
### Feitiços da IA
- Na tela da Aventura, cada fase mostra os ícones ✦ dos feitiços inimigos e o **maior nível** das cartas inimigas.
- Os inimigos da Aventura agora também têm **feitiços no baralho** (2 cópias de cada, além dos 30 personagens) e os lançam com a mesma IA do Auto (seção 16). Todo feitiço da fase tem pelo menos um conjurador da categoria dele.

| Fase | Feitiços da IA |
|---|---|
| 1, 2 e 4 | nenhum |
| 3 e 5 | ⚡ Raio Paralisante |
| 6 | 🧪 Flecha Envenenada, ☄️ Bola de Fogo |
| 7 | 🌋 Tremor, 🧱 Muralha |
| 8 | ☠ Veneno Mortal, 🗡️ Golpe nas Sombras |
| 9 | ⚡ Raio Paralisante, 💖 Cura em Massa |
| 10 | ☄️ Bola de Fogo, 🌪 Lâmina Giratória, 👼 Anjo da Guarda |

### Dificuldade de fase em fase
- **Meta:** a chance de vencer ao chegar numa fase **cai de fase em fase** (antes a fase 2 era mais fácil que a 1, e as fases 6 e 10 eram muito mais difíceis que as vizinhas).
- **Ajuste:** o **nível das cartas da IA** por fase (seção 14) e os feitiços da tabela acima. A vida do Comandante inimigo não mudou: no simulador ela quase não mexe na vitória (quem perde, perde porque o próprio Comandante cai).
- **Simulação** (`scripts/balance/v18.ts`, 300 jogadores simulados que seguem a campanha com a IA do Auto, como na v0.17.0):

| Fase | v0.17.1 | v0.18.0 |
|---|---|---|
| 1 | 93% | 93% |
| 2 | 99% | 89% |
| 3 | 91% | 90% |
| 4 | 77% | 81% |
| 5 | 82% | 79% |
| 6 | 53% | 76% |
| 7 | 82% | 70% |
| 8 | 89% | 68% |
| 9 | 86% | 65% |
| 10 | 53% | 62% |

- As fases 2 e 3 ficaram praticamente iguais (diferença dentro do ruído da simulação). Tentativas médias por fase: 1,1 a 1,5.
- O jogador simulado é a IA do Auto; quem joga à mão costuma ir melhor, então a dificuldade real tende a ser um pouco menor.

### Partidas verificáveis (base para o modo online)
- A batalha é **determinística**: com os mesmos baralhos, vidas, semente inicial e jogadas do jogador, o resultado é sempre o mesmo (a IA inimiga e o Auto usam o sorteio da própria batalha).
- Toda partida agora **grava** a configuração (baralhos, vidas, semente inicial) e as **jogadas do jogador**: usar uma carta numa casa, Auto e LUTAR. Jogadas recusadas não são gravadas.
- `verifyMatch` (em `src/core/match.ts`) **refaz a partida** a partir da gravação e confere vencedor, turno e vida dos dois Comandantes. Recusa gravação com jogada inválida, jogada depois do fim, baralho trocado ou resultado diferente.
- Por enquanto não há servidor: o jogo continua dando as recompensas no aparelho. Quando o modo online vier, o servidor recebe a gravação, chama `verifyMatch`, confere se os baralhos da gravação batem com as cartas da conta e com a fase, e só então dá a recompensa.

## 18. App Android (v0.19.0)
- O jogo também roda como **app Android** (APK), baixado da página de **Releases** do GitHub (`Ki-Clash-<versão>.apk`). As regras são as mesmas do site: é o mesmo jogo.
- O app abre em **tela cheia** (as barras do sistema aparecem por um instante ao deslizar da borda). A orientação segue o celular, como no site: menus em pé e a batalha melhor deitada, com o mesmo aviso **"Gire o celular para jogar deitado"**.
- Funciona **sem internet**. O progresso (e as contas locais) fica guardado **no app**, separado do progresso do site no navegador.
- Toda versão do APK tem a **mesma assinatura**: instalar uma versão nova por cima mantém o progresso. Desinstalar o app apaga o progresso.
- Requer Android 7.0 ou mais novo.

### Botão ⟳ Procurar atualização
- Fica no **canto superior direito da Base**, redondo, com a **versão atual** ao lado (ex.: `v0.19.0`). Vale no app e no site.
- Ao tocar, ele gira enquanto procura e mostra uma janela do jogo:
  - **Já atualizado:** "Você já está na versão mais nova".
  - **Versão nova (app):** mostra a versão e o botão **Baixar**: o APK novo abre no navegador do celular; depois é só abrir o arquivo e instalar por cima. O progresso continua.
  - **Versão nova (site):** botão **Atualizar** recarrega a página com a versão nova. O progresso continua.
  - **Sem internet** ou **nenhuma versão publicada ainda:** avisa e nada muda.
- O app procura na página de **Releases** do GitHub; o site compara com o arquivo `version.json` publicado junto com ele. Nada é baixado sem você tocar em Baixar/Atualizar.

## 19. Aventura em mapa, dificuldades e limite diário; telas (v0.20.0)
### Mapa das fases
- A Aventura mostra as fases como **bolinhas ligadas por um caminho pontilhado**, da **fase 1 (embaixo)** à **fase 10 (em cima)**. A tela abre já mostrando a próxima fase; o mapa rola para cima e para baixo.
- Em cima de cada bolinha fica o **Comandante inimigo** da fase, **se movimentando** (respira, como na batalha).
- **Vencida:** bolinha **dourada** com ✓, caminho aceso até a próxima e o contador do dia (ex.: **"3/5 hoje"**).
- **Próxima:** bolinha **azul** com a etiqueta **PRÓXIMA**.
- **Bloqueada:** bolinha **escura** com 🔒, caminho apagado e Comandante em silhueta. Elas vão se acendendo conforme você vence.
- O texto que ficava em cima da lista (Comandante, Poder e baralho) saiu; ficam o **← Base** e os recursos.
- **Tocar numa fase** abre a janela dela: dificuldade, Comandante inimigo, nível inimigo, feitiços, recompensa e o limite do dia, com **⚔ Jogar** (em cima) e **⟲ Repetir** (embaixo, só em fase vencida). ✕ fecha. Fase bloqueada: avisa qual fase vencer antes.

### Dificuldades: 🟢 Fácil · 🟡 Normal · 🔴 Difícil
- Abas no **topo da tela, no centro**. A escolhida fica destacada e é lembrada.
- As **mesmas 10 fases**, mesmo Comandante, mesmos feitiços e a mesma recompensa. **Fácil** é a campanha de sempre (seção 14). **Normal:** cartas inimigas com **+3 níveis**; **Difícil:** **+6 níveis** (sempre limitado ao nível máximo da cor de cada carta). Cada dificuldade também aceita **trocar 1 ou 2 cartas** do inimigo por fase (nenhuma troca configurada ainda).
- **Valores provisórios:** o ajuste fino da dificuldade e da recompensa de cada uma fica para depois.
- **Progresso separado** por dificuldade. O **Normal** abre ao vencer a **fase 10 no Fácil**; o **Difícil**, a **fase 10 no Normal** (aba com 🔒 até lá). Dentro de cada uma, vencer uma fase libera a próxima.

### Jogar, Repetir e o limite de 5 por dia
- **⚔ Jogar:** joga a batalha da fase. **⟲ Repetir:** não joga; dá na hora a **recompensa inteira** da fase (inclusive 🔮), como se tivesse vencido.
- **Limite: 5 vezes por dia em cada fase**, contadas **separadas por dificuldade**. Gastam 1: cada **Repetir** e cada **vitória** numa fase **já vencida**.
- **Não gastam:** a **primeira vitória** da fase e as **derrotas** (nem sair da batalha).
- Quando as 5 acabam, a fase fica **bloqueada (Jogar e Repetir) até o dia seguinte**. O limite volta à **meia-noite (horário de Brasília)**.
- Toda vitória dá a **recompensa inteira** (antes, repetir dava 50%).

### Batalha
- **Comandantes maiores (deitado):** o Bárbaro e o minotauro ocupam a **altura do retângulo** das pontas (antes ficavam com a altura de 2 casas, que ficou pequena com a arena de 12 colunas). A imagem não distorce.
- **Tela deitada automática:** no **app (APK)** a batalha **sempre deita a tela sozinha** e o aviso "Gire o celular" não aparece; ao sair, a tela fica livre de novo. No **site**, o jogo continua tentando tela cheia deitada ao entrar na batalha (o navegador só deixa em tela cheia); quando o navegador não deixa, o aviso continua como plano B.

### Botões sem explicação
- Os botões mostram só a ação, sem texto explicativo: saiu "Suba nível e evolua de cor" do **🔥 Treinar & Despertar** e a janela da fase usa só **⚔ Jogar** / **⟲ Repetir**. (Informações como a próxima fase, a contagem de personagens e custos continuam; ver MELHORIAS.md.)

### Baixar o app (site)
- No **site**, o botão **⬇ Baixar** no **canto inferior direito da Base** baixa o **APK da última versão** (arquivo `Ki-Clash.apk` da página de Releases). Em celular pequeno ele fica no fim da Base, à direita, para não cobrir os outros botões. Dentro do app ele não aparece.

### Telas em qualquer tamanho (design responsivo)
- Conferido em 8 tamanhos: celular pequeno e grande em pé (360×640, 412×915), celular deitado (915×412), tablet em pé e deitado (768×1024, 1024×768), notebook (1366×768), Full HD (1920×1080) e 2K (2560×1440).
- **Telas grandes:** a partir de 1700×950 a interface (menus e batalha) cresce **1,3×**, e a partir de 2300×1300 cresce **1,75×**, para não ficar tudo pequeno no meio da tela.
- **Batalha em pé** (quando o jogador escolhe "Jogar em pé"): nada passa mais da largura da tela (antes a arena vazava para os lados no celular pequeno e no tablet).
