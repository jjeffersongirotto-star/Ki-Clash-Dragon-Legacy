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
- **v0.17.0 (decisão 6):** cada carta (personagem **ou feitiço**) entra no baralho com **1 a 3 cópias** (antes eram sempre 4). O baralho precisa ter **de 20 cartas até o máximo do seu nível de perfil** e **pelo menos 1 personagem**. Detalhes na seção 16. (**v0.25.0:** o mínimo é **3 × personagens que você tem**, até 20 — ver seção 24.)
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

## 10. Raridades (tiers) e o degrau "+"
> **v0.23.0:** cada raridade agora tem **3 degraus** (base, **"+"** e **"++"**) e a carta **não tem mais nível**. O "+" não é mais um bônus de +10% num status só: cada degrau dá +17% de ataque e de vida. Veja a **seção 22**. O texto abaixo vale **até a v0.22.0**.

> **v0.21.0 — nome:** o jogo agora chama o tier da carta de **raridade** (Comum, Incomum, Raro, Épico, Lendário, Mítico) em todas as telas. Cada raridade continua sendo mostrada por uma **cor**. Nas seções escritas antes da v0.21.0, "cor da carta" quer dizer **raridade**.

Desde a v0.10 **não há mais estrelas de raridade**: a **raridade** é o tier do personagem, mostrada pela cor da carta (as ⭐ da v0.21.0 são outra coisa: estrelas das **fases**, seção 20).

| Cor | Raridade (tier) |
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
| Lendário (único) | Mítico+ | Kenji, Vorax — saem **só no 🎴 Banner** da Loja (v0.27.0; antes "em breve") |

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
- **Topo, no centro:** ~~pílula escura só com o **⚡Poder**~~ (v0.42.2: saiu; o topo fica livre e o Poder aparece ao lado do nome na janela de detalhes).
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
> **Até a v0.22.0.** Desde a v0.23.0 não existe nível: cada degrau tem só uma barra de XP e os status sobem só nos degraus (seção 22).

- **Status:** ataque e vida = base × (1 + 0,08 × (nível − 1)) × (1 + 0,15 × (cor − 1)), arredondado (cor: Comum = 1 … Mítico = 6). No degrau "+", soma **+10% (mín. +1)** no status do "+" do personagem (vida ou ataque).
- **Itens de XP (v0.22.0):** só **🔮 Orbes**, um por raridade: Comum +100, Incomum +250, Raro +400, Épico +800, Lendário +1.500, Mítico +3.000 (ver seção 21). Antes: Pergaminho de Ki +100, Cristal de Ki +400, Orbe do Dragão Ancestral +1500. Ao chegar em 100% da barra, o nível sobe; cada nível pede mais XP que o anterior.
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
- **Novo jogo (até a v0.24.0; desde a v0.25.0 o jogo novo começa pelo tutorial, seção 24):** você começa **só com personagens Comuns** — os **12 iniciais** (2 de cada categoria). A equipe começa com 10 deles; os outros 2 ficam na coleção para trocar. Ao desbloquear um personagem, ele **entra direto na equipe** se houver vaga.
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
- Derrota dá 1 **Orbe Comum** de consolo (antes, 1 Pergaminho de Ki).
- Progresso salvo no navegador (localStorage). O **nível de perfil** conta as fases vencidas no **Fácil**.

## 15. Poder ⚡ e Comandante 👑 (v0.13)
> **v0.23.0:** o Poder usa o ataque e a vida do **degrau** (sem nível) e os requisitos do Comandante mudaram (seção 22). Os números de nível desta seção valem **até a v0.22.0**.

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
- O Poder aparece **ao lado do nome do personagem na janela de detalhes** (v0.42.2; antes ficava numa pílula no topo de toda carta). É só visual: o valor e o cálculo não mudam, e o **Poder do baralho** continua na Coleção. É texto por cima do quadro congelado da carta (não muda o bitmap).

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
- **🪞 Reflexo de Magia (Nyx-07):** reduz o **dano mágico** (ataques mágicos) e o **dano de feitiço** recebido em **30% (Épico) / 40% (Lendário) / 50% (Mítico)** e devolve essa parte: no atacante (ataques) ou no **Comandante de quem lançou** (feitiços). **v0.20.1:** só devolve se a Nyx **continuar de pé** depois do golpe (salva pelo Anjo da Guarda ou pelo Renascer, devolve); derrotada, não devolve.
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
- Baralho mínimo 20 (v0.25.0: 3 × personagens que você tem, até 20), máximo 28 + 2 × nível (até 40), nível = 1 + fases vencidas.
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
- **Progresso separado** por dificuldade. **v0.28.0:** a **fase N do Normal** abre quando você venceu a **fase N no Fácil** e a **fase N−1 no Normal** (a fase 1 do Normal, só com a fase 1 do Fácil); o **Difícil** funciona igual em relação ao Normal. A aba fica com 🔒 até a fase 1 dela abrir. (Até a v0.27.0: o Normal abria só ao vencer a fase 10 no Fácil.)

### Jogar, Repetir e o limite de 5 por dia
- **⚔ Jogar:** joga a batalha da fase. **⟲ Repetir:** não joga; dá na hora a **recompensa inteira** da fase (inclusive 🔮), como se tivesse vencido. **v0.21.0:** o Repetir só fica liberado nas fases com **3 ⭐** naquela dificuldade (seção 20).
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

## 20. ⭐ Estrelas por fase (v0.21.0)
- Cada fase tem **3 ⭐**, uma por **objetivo**. Os objetivos podem ser cumpridos em **vitórias diferentes** (as estrelas somam e nunca se perdem):
  1. ⭐ **Vencer** a fase.
  2. e 3. ⭐ **Dois objetivos da fase** (v0.28.0, ver seção 27). Até a v0.27.0 eram iguais em todas as fases: Comandante com 50% ou mais da vida e vencer em até 15 turnos.
- As estrelas são **separadas por dificuldade** (a fase 3 pode ter 3 ⭐ no Fácil e 1 ⭐ no Normal).
- **Onde aparecem:** embaixo da bolinha de cada fase vencida no mapa (★ cheia = conquistada, ★ apagada = falta), na janela da fase (lista dos 3 objetivos, marcados) e na tela de vitória (as estrelas novas aparecem com **"nova!"**).
- **⟲ Repetir** só é liberado nas fases com **3 ⭐** (antes, em qualquer fase vencida). Sem as 3, a janela avisa: "Repetir libera com as 3 ⭐ desta fase". Jogar continua igual (com o limite de 5 por dia nas fases vencidas).
- **Saves antigos:** toda fase vencida antes desta versão começa com **1 ⭐** (a de vencer); as outras são conquistadas jogando. A conta **ADM** tem 3 ⭐ em todas as fases e dificuldades.
- **Saves antigos (v0.28.0):** as estrelas já ganhas continuam valendo, mesmo com os objetivos novos.

### "Raridade" no lugar de "cor"
- As telas chamam o tier da carta de **raridade** ("nova raridade", "evolução por raridade", "Raridades das cartas e Despertar"). As cores continuam no visual. Ver a nota no início da seção 10.

## 21. 🔮 Orbes por raridade e XP por jogar (v0.22.0)
### Orbes
- O **Orbe** é o único item de XP (substitui o 📜 Pergaminho de Ki e o 💎 Cristal de Ki). Existe nas **6 raridades**, mostradas pela cor da esfera:

| Orbe | XP |
|---|---|
| Comum (cinza) | 100 |
| Incomum (verde) | 250 |
| Raro (azul) | 400 |
| Épico (roxo) | 800 |
| Lendário (laranja) | 1.500 |
| Mítico (vermelho) | 3.000 |

- **Conversão dos saves (sem perder XP):** 📜 Pergaminho → **Orbe Comum**, 💎 Cristal → **Orbe Raro**, 🔮 Orbe do Dragão Ancestral → **Orbe Lendário**. Save novo começa com **10 Orbes Comuns e 3 Raros** (o mesmo XP de antes; desde a v0.25.0 eles vêm na recompensa do tutorial).
- Usados no **Treinar** (um botão por raridade). Nas barras de recursos aparecem só os Orbes que o jogador tem.

### Orbes nas fases (pela dificuldade)
- **Fácil:** Orbes **Comuns** e **Incomuns**, com o mesmo XP de antes (o antigo 📜 virou Comuns; o 💎 e o 🔮 viraram Incomuns).
- **Normal:** Orbes **Raros** (~60% do XP) e **Épicos** (~40%), com XP total parecido com o do Fácil.
- **Difícil:** Orbes **Épicos** com XP parecido e, a cada vitória ou Repetir, **10% de chance** de **1 Orbe Lendário** e **2% de chance** de **1 Orbe Mítico** (sorteios separados). A janela da fase mostra essas chances.
- As Essências ✴ são as mesmas nas três dificuldades.

### XP por jogar
- Ao **vencer jogando** uma fase, **todos os personagens do baralho** ganham **15 + 5 × fase** de XP (fase 1 = 20, fase 10 = 65). A tela de vitória mostra o XP ganho e quantos níveis subiram.
- **Primeira vitória** de cada fase (em cada dificuldade): esse XP vem **em dobro** (v0.24.1).
- **Derrota e Repetir não dão** esse XP. O XP principal continua sendo os Orbes.

### Simulação (300 jogadores simulados, sem usar o Repetir; `SIM_PLAYXP=0` desliga o XP por jogar)
Vitória ao chegar, fases 1 a 10:

| | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
|---|---|---|---|---|---|---|---|---|---|---|
| v0.21.0 | 93% | 89% | 90% | 81% | 79% | 76% | 70% | 68% | 65% | 62% |
| v0.22.0 | 93% | 91% | 96% | 84% | 85% | 79% | 86% | 82% | 79% | 73% |

- O XP por jogar deixa a campanha **um pouco mais fácil** (até +16 pontos nas fases finais). O ajuste fica para quando vierem os itens de ascensão e a energia (MELHORIAS.md).

## 22. Carta sem nível: degraus "+" e "++" (v0.23.0)
### Raridade e degrau
- A carta **não tem mais nível numerado** (acabou o "Nv." e o nível 60/65). Cada **raridade** tem **3 degraus**: **base → "+" → "++"** → próxima raridade. Ex.: Raro → Raro+ → Raro++ → Épico.
- O **topo** de cada personagem é a **raridade máxima "++"** (ex.: quem vai até Épico termina em **Épico++**).
- Na carta, a **estrela dourada** do canto (antes o nível) mostra o **degrau**: **"+"** ou **"++"**; no degrau base ela não aparece. O nome da raridade na carta também mostra o degrau (ex.: **Raro++**).

### Status
- **Ataque e vida = base × 1,17^(degrau na escada)**, arredondados (mínimo 1). O degrau na escada é **(raridade − 1) × 3 + degrau** (Comum = 0, Comum+ = 1, Comum++ = 2, Incomum = 3 … Mítico++ = 17).
- Cada degrau ("+", "++" e cada raridade nova) dá **+17%** de ataque **e** de vida. O Mítico fica **~10,5×** o Comum (o Mítico++ ~14×).
- **A barra de XP não aumenta os status.** Habilidades, roupa e visual continuam mudando só quando a **raridade** muda (algumas habilidades melhoram num degrau; ver abaixo).

### Barra de XP e Despertar
- Cada degrau tem só uma **barra de XP**, que aparece **apenas na tela de Treinar**. Ela enche com **Orbes 🔮** e com o **XP por jogar** (e, no futuro, com cópias repetidas). O XP que passa da barra cheia **se perde**; com a barra cheia os botões de Orbe ficam desligados.
- Com a barra cheia, o botão **✨ Subir para …** (Despertar) leva ao próximo degrau, pagando **Essências ✴**, e a barra volta a zero. Ainda **não existem itens de ascensão** (virão depois).
- **Tamanho das barras:** a barra do degrau base tem o XP do antigo degrau base; a barra do "++" (que leva à próxima raridade) tem o XP do antigo "+" (1,5×); a do "+" fica no meio (1,25×). _(v0.24.0: proporção 3 / 6 / 10, ver seção 23.)_
- **Essências:** base → "+" = **4 × raridade** · "+" → "++" = **5 × raridade** · "++" → próxima raridade = **6 × raridade**.

| Degrau | Status | Barra de XP | Despertar |
|---|---|---|---|
| Comum | 1,00× | 1.182 | ✴ 4 → Comum+ |
| Comum+ | 1,17× | 1.478 | ✴ 5 → Comum++ |
| Comum++ | 1,37× | 1.773 | ✴ 6 → Incomum |
| Incomum | 1,60× | 3.892 | ✴ 8 → Incomum+ |
| Incomum+ | 1,87× | 4.865 | ✴ 10 → Incomum++ |
| Incomum++ | 2,19× | 5.838 | ✴ 12 → Raro |
| Raro | 2,57× | 12.091 | ✴ 12 → Raro+ |
| Raro+ | 3,00× | 15.114 | ✴ 15 → Raro++ |
| Raro++ | 3,51× | 18.137 | ✴ 18 → Épico |
| Épico | 4,11× | 37.554 | ✴ 16 → Épico+ |
| Épico+ | 4,81× | 46.943 | ✴ 20 → Épico++ |
| Épico++ | 5,62× | 56.331 | ✴ 24 → Lendário (se a faixa permitir) |
| Lendário | 6,58× | 116.635 | ✴ 20 → Lendário+ |
| Lendário+ | 7,70× | 145.794 | ✴ 25 → Lendário++ |
| Lendário++ | 9,01× | 174.953 | ✴ 30 → Mítico |
| Mítico | 10,54× | 362.259 | ✴ 24 → Mítico+ |
| Mítico+ | 12,33× | 452.824 | ✴ 30 → Mítico++ |
| Mítico++ | 14,43× | — | — (topo) |

- **Treinar:** mostra a barra ("1.020 / 1.182 XP"), o botão do Despertar com o custo e a **Escada de Despertar** com a barra e o custo de cada degrau. A animação diz **DESPERTAR!** na nova raridade e **DESPERTAR +** / **DESPERTAR ++** nos degraus.
- **XP por jogar:** a tela de vitória mostra quantas barras ficaram cheias.

### Habilidades que melhoravam por nível
Cada uma melhora agora no **primeiro degrau em que aquele nível já era garantido** na escada antiga:

| Habilidade | Até a v0.22.0 | Desde a v0.23.0 |
|---|---|---|
| Bênção do Lótus (Mei) | +1 de cura no nível 20 | +1 a partir de **Incomum+** (Incomum 2 · Incomum+ a Raro 3 · Épico 4) |
| Flecha Dupla (Aiko) | +1 no nível 25 | junto com o **Raro** (Incomum 1 · Raro em diante 3) |
| Emboscada | +1 no nível 25 | junto com o **Raro** (Raro 2 · Épico em diante 3) |
| Execução | +1 no nível 25 | junto com o **Raro** (Raro +2 · Épico em diante +3) |
| Salto Vendaval (Riku) | +1 de investida no nível 30 | a partir de **Raro+** (Raro +1 · Raro+ e Raro++ +2 · Épico em diante +3) |

### Conversão dos saves
- Toda carta fica na **mesma raridade e no mesmo degrau** (o "+" antigo vira "+"). A barra do degrau fica cheia **na mesma proporção** do progresso que a carta tinha no degrau antigo (níveis já subidos nele + XP). Carta no nível máximo do degrau = barra cheia. **Nenhum personagem se perde.**
- A conta **ADM** fica com todos os personagens no **topo** (raridade máxima "++").

### Inimigos por degrau
- As cartas da IA usam **degraus** no lugar do nível: cada fase tem um **degrau na escada** (0 = Comum, 1 = Comum+ …), e cada personagem fica nesse degrau, **nunca abaixo do degrau base da raridade mínima dele** nem acima do topo. Valor quebrado mistura as cartas (0,5 = metade no degrau 0 e metade no 1).
- Degrau por fase (Fácil): **0 · 0,5 · 0 · 1 · 0,5 · 0 · 3 · 0 · 0,5 · 0,5** (até a v0.22.0: nível 1, 4, 4, 5, 6, 6, 11, 14, 17, 12). As fases 6, 8 e 10 têm degrau baixo porque já têm muitos personagens de raridade alta (Raro, Épico, Lendário) que, sem nível, ficam no mínimo no degrau base da raridade deles.
- **Fase 8 sem feitiços** (até a v0.22.0: Veneno e Sombras): mesmo no degrau 0 ela ficava difícil demais (59% de vitória ao chegar).
- **Normal = +1 degrau** e **Difícil = +2 degraus** em **todas** as cartas inimigas (limitado ao topo; provisório). A janela da fase mostra "Inimigos até" a raridade e o degrau mais altos.
- **Requisitos do Comandante** (o Poder mudou de escala): nível 2 a 10 = **420 · 440 · 470 · 520 · 590 · 670 · 690 · 800 · 820** (até a v0.22.0: 480 · 510 · 560 · 610 · 660 · 760 · 840 · 930 · 980).

### Simulação (300 jogadores simulados, `scripts/balance/v18.ts`; jogador sem Repetir, como nas simulações anteriores)
O jogador simulado agora enche **uma barra por vez** (o menor degrau primeiro) e sobe o degrau assim que a barra enche e há Essências.

| Vitória ao chegar | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
|---|---|---|---|---|---|---|---|---|---|---|
| v0.22.0 | 93% | 91% | 96% | 84% | 85% | 79% | 86% | 82% | 79% | 73% |
| v0.23.0 | 74% | 90% | 95% | 81% | 86% | 78% | 84% | 72% | 74% | 69% |
| Poder ao chegar (v0.23.0) | 394 | 435 | 456 | 485 | 537 | 626 | 695 | 707 | 829 | 840 |

- **Fase 1 ficou mais difícil (74%)** e não dá para baixar mais o inimigo (ele já está no degrau 0, Comum base). Antes, os Orbes do começo já davam alguns níveis (status) a todas as cartas; agora eles enchem ~1–2 barras e só uma ou duas cartas sobem para "+". Para voltar a ~90% seria preciso mudar o começo (mais Orbes/Essências iniciais ou uma fase 1 mais fraca) — a decidir.
- Sem nível, os personagens de raridade alta ficam mais fortes que antes no começo da faixa deles (ex.: um Lendário inimigo vale 6,6× o Comum, contra ~3× do Kenji nível 14 da v0.22.0). Por isso as fases 8–10 caíram um pouco, mesmo com degraus baixos.
- O XP por degrau agora soma **3,75 ×** a barra base por raridade (antes 2,5 ×) e as Essências **15 × raridade** (antes 10 ×): a evolução ficou mais lenta, e o XP é o limite (as Essências sobram).

## 23. 🎒 Itens de ascensão e barras 3 / 6 / 10 (v0.24.0)
O Despertar (subir um degrau) agora pede **barra de XP cheia + Essências ✴ + itens de ascensão**.

### Os 30 itens
Cada categoria de personagem tem o seu **conjunto de 5 itens**:

| Categoria | Itens |
|---|---|
| 🛡 Tanque | Elmo, Armadura, Escudo, Manoplas, Botas de ferro |
| ➕ Suporte | Tiara, Túnica, Amuleto, Bastão, Sandálias |
| ⚔ DPS | Bandana, Colete, Espada, Luvas, Botas |
| 🪄 Mago | Chapéu, Manto, Cajado, Cristal, Anel |
| 🏹 Arqueiro | Capuz, Jaqueta, Arco, Aljava, Botas leves |
| 💀 Assassino | Máscara, Capa, Adagas, Cinto, Diamante negro |

- Cada item existe em **5 raridades**, mostradas **só pela cor do fundo do ícone**: Comum (cinza), Incomum (verde), Raro (azul), Épico (roxo), Lendário (laranja). **Não existe item Mítico.**
- Os itens **não são de um personagem só**: servem para todos os personagens da categoria.

### Quanto cada degrau pede (1 de cada item)
| Degrau | Itens | Da raridade da carta | Da raridade **um acima** da carta |
|---|---|---|---|
| base → **"+"** | 3 | 2 | 1 |
| "+" → **"++"** | 4 | 2 | 2 |
| "++" → **nova raridade** (Despertar) | 5 (o conjunto todo) | 2 | 3 |

- Exemplo, carta **Comum**: "+" = 2 cinza + 1 verde · "++" = 2 cinza + 2 verde · nova raridade = 2 cinza + 3 verde. Carta **Raro**: azuis + roxos.
- **Cartas Lendárias e Míticas** pedem **só itens Lendários (laranja)**, nos mesmos números.
- **Quais itens** e **quais são os "de cima"**: fixos para cada personagem. O jogo sorteia uma ordem dos 5 itens da categoria para cada personagem (o1…o5): "+" = o1 (de cima), o2, o3 · "++" = o2, o3, o4 (de cima), o5 (de cima) · nova raridade = os 5 (de cima: o1, o4, o5). A ordem muda de um personagem para outro, para os 5 itens serem usados. O **Treinar** mostra os itens de cada degrau, com a cor certa, e os que faltam ficam apagados.
- Item de outra raridade não serve. As Essências do Despertar continuam as mesmas (seção 22).

### Barras de XP na proporção 3 / 6 / 10
- A barra que libera o **"+"** tem **30%** do XP da barra do **Despertar** (nova raridade), e a do **"++"** tem **60%** (ex.: 3 / 6 / 10). O status continua subindo **só nos degraus**.
- O XP **total** de cada raridade é o mesmo da v0.23.0 (3,75 × o custo da raridade base), só redistribuído. Ex.: Comum: 700 / 1.400 / 2.333 XP (antes 1.182 / 1.478 / 1.773).
- Saves da v0.23.0: cada carta fica com a **mesma fração** da barra (barra cheia continua cheia).

### De onde vêm
- **Cada fase dá sempre os mesmos 3 itens** (de 3 categorias diferentes) em **toda vitória e todo Repetir**. As 10 fases cobrem os 30 itens (1 vez cada):

| Fase | Itens |
|---|---|
| 1 | Elmo, Tiara, Bandana |
| 2 | Chapéu, Capuz, Máscara |
| 3 | Armadura, Túnica, Colete |
| 4 | Manto, Jaqueta, Capa |
| 5 | Escudo, Amuleto, Espada |
| 6 | Cajado, Arco, Adagas |
| 7 | Manoplas, Bastão, Luvas |
| 8 | Cristal, Aljava, Cinto |
| 9 | Botas de ferro, Sandálias, Botas |
| 10 | Anel, Botas leves, Diamante negro |

- A **raridade** de cada item é sorteada pela dificuldade: **Fácil** cinza 60% / verde 40% (v0.24.1; antes 80/20) · **Normal** azul 80% / roxo 20% · **Difícil** roxo 80% / laranja 20% (tabela `GEAR_DROP` em `src/core/gear.ts`).
- **Primeira vitória** de cada fase (em cada dificuldade): os 3 itens saem **2 vezes** (a recompensa normal + o bônus), cada um com a sua cor sorteada (v0.24.1). O XP de perfil da primeira vitória chega com a energia (etapa 4).
- A janela da fase mostra os 3 itens e as chances; a vitória e o Repetir mostram os itens ganhos. A mochila fica em **Treinar → 🎒 Itens de ascensão**.
- Saves antigos começam com a mochila **vazia**. A conta ADM tem 99 de cada item em cada raridade.

### Simulação (100 jogadores simulados, `scripts/balance/v20.ts`; Fácil)
| Vitória ao chegar | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
|---|---|---|---|---|---|---|---|---|---|---|
| v0.23.0 | 74% | 90% | 95% | 81% | 86% | 78% | 84% | 72% | 74% | 69% |
| barras 3 / 6 / 10, sem itens | 76% | 95% | 97% | 89% | 75% | 82% | 86% | 78% | 77% | 73% |
| **v0.24.0** (barras + itens), sem Repetir | 71% | 87% | 88% | 65% | 65% | 62% | 62% | 48% | 50% | 46% |
| v0.24.0 + 5 Repetir da última fase antes de cada fase nova | 71% | 87% | 88% | 66% | 66% | 64% | 67% | 55% | 45% | 48% |

- Os itens **seguram a evolução**: só sobe de degrau quem tem os itens certos, e o Fácil dá mais cinza (o verde, que todo degrau pede, sai em 40% desde a v0.24.1). Repetir a **mesma** fase ajuda pouco, porque ela dá sempre os mesmos 3 itens: o jogador precisa escolher **em quais fases** jogar.
- O reequilíbrio vem nas próximas etapas: **tutorial** (XP para começar) e **energia**. (`SIM_GEAR=0` desliga os itens no simulador, para comparar.)

## 24. 🎓 Tutorial e pacotes de personagens (v0.25.0)
- **Jogo novo começa pelo tutorial**, uma fase **só do tutorial**, antes da fase 1 (a fase 1 não mudou). A Base só abre depois dele.
  1. **Batalha 1:** você começa só com o **Riku Vendaval** e luta 1 contra 1 (um Kuro, Comandante inimigo com ❤6). Feita para você vencer.
  2. **Pacote grátis:** toque no 🎁 e ganhe a **Sora Brisa-Serena** (suporte que ataca de longe e cura) e a **Nara Lâmina-Lunar** (Corte Diagonal). Entram direto no baralho.
  3. **Batalha 2:** Riku, Sora e Nara contra **Daichi, Hana e Tobi** (Comandante inimigo com ❤10), para conhecer as habilidades.
- **Caixinhas de dica** aparecem por cima da batalha, uma por vez (objetivo, onde invocar, LUTAR, vida dos Comandantes, habilidades da Sora e da Nara, dos inimigos e o Auto). Dá para passar (**Próxima ›**) ou fechar (✕).
- Perdeu uma batalha do tutorial? É só tentar de novo. **Pular tutorial** dá os personagens e a recompensa do mesmo jeito. O botão **👤 Já tenho conta** fica na tela do tutorial.
- **Recompensa do tutorial:** **10 Orbes Comuns e 3 Raros** (o começo de antes, 2.200 XP: enche a barra do "+" dos 3), **✴12 Essências** (o Despertar do "+" dos 3) e os **itens do "+"** dos 3. Assim os 3 sobem para **Comum+** no Treinar.
- **Pacote da primeira vitória de cada fase** (no Fácil): o desbloqueio de sempre (Aiko, Mei, Lyra, Gorath, Yume, Zarek, Nyx) **e um personagem de Comum**:

| Fase | Pacote |
|---|---|
| 1 | Aiko, Daichi |
| 2 | Mei, Hana |
| 3 | Lyra, Tobi |
| 4 | Gorath, Kael |
| 5 | Yume, Toru |
| 6 | Zarek, Jin |
| 7 | Suri |
| 8 | Nyx, Ren |
| 9 | Kuro |
| 10 | — (só faltariam Kenji e Vorax, "em breve") |

- **Mínimo do baralho = 3 × personagens que você tem**, até 20 (com 3 personagens: 9 cartas; com 7 ou mais: 20). Na batalha, vale 3 × personagens do baralho.
- **Saves antigos** (de antes desta versão) **pulam o tutorial** e ficam com tudo o que tinham. A conta **ADM** também pula.

### Simulação (100 jogadores, `scripts/balance/move15.ts`; Fácil, sem Repetir; jogador que acabou o tutorial)
| Vitória ao chegar | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
|---|---|---|---|---|---|---|---|---|---|---|
| v0.24.1 (começo antigo: 12 de Comum) | 71% | 87% | 89% | 66% | 65% | 65% | 64% | 51% | 47% | 46% |
| **v0.25.0**, baralho só de personagens (como o do jogador novo) | 93% | 92% | 95% | 63% | 59% | 56% | 61% | 62% | 52% | 52% |
| v0.25.0 com 4 cartas de feitiço no baralho | 100% | 100% | 99% | 76% | 73% | 72% | 74% | 60% | 47% | 49% |

- Um baralho **pequeno e forte** (só os 3 personagens, já em Comum+) vence as primeiras fases: a **fase 1 fica em 93%**. Da fase 4 em diante a dificuldade volta (os itens seguram a evolução; o reequilíbrio continua com a energia). `SIM_OLD_START=1` simula o começo antigo.


## 25. ⚡ Energia, 👤 nível de perfil, Ouro de Dragão e 🏪 Loja (v0.26.0)
Lógica em `src/core/profile.ts` (perfil, energia, Ouro) e `src/core/shop.ts` (Loja).

### Energia
- **Jogar** ou **Repetir** uma fase gasta energia: **Fácil 1 · Normal 3 · Difícil 6**. Na batalha, a energia é gasta **ao começar** (a derrota também gasta). As batalhas do **tutorial são grátis**.
- **Máximo pelo nível de perfil**, em linha reta: nível 1 = **20** … nível 100 = **300** (`20 + 280 × (nível − 1) ÷ 99`, arredondado; ex.: nível 10 = 45, nível 50 = 159).
- **Recupera 1 a cada 6 minutos** até o máximo (240 por dia). Acima do máximo não recupera, só gasta.
- **Ao subir de nível de perfil**, ganha a **energia máxima do nível novo**, somada à que tem (pode passar do máximo).
- Sem energia suficiente, a janela avisa quanto falta e quando vem a próxima.
- O **limite de 5 por dia** em cada fase continua valendo.

### Nível de perfil
- Vai do **1 ao 100**. XP para passar de nível: **10 + 5 × (nível − 1)** (10, 15, 20, …); para chegar ao 100 são 25.245 XP.
- Ganha XP de perfil: **1 por energia gasta** e, a cada **vitória ou Repetir**, **(4 + fase) × custo de energia** (Fácil fase 1 = 5, Difícil fase 10 = 84). **Primeira vitória: em dobro.**
- O nível aumenta o **tamanho máximo do baralho** como antes: **28 + 2 × nível**, até 40 (nível 6 ou mais).
- A barra de nível fica na **Base**, ao lado da conta.

### 🪙 Ouro de Dragão
- Moeda **Ryo** dourada (redonda, com borda), com o **dragão 🐉 dourado-alaranjado em relevo** no lugar do furo do meio, **borda serrilhada**, anel de pontinhos, ouro metálico com sombreamento e brilho (v0.26.2; na v0.26.0 era um desenho oval próprio).
- Cada **vitória ou Repetir** dá **(10 + 5 × fase) × custo de energia** (Fácil fase 1 = 15, fase 10 = 60; Normal ×3; Difícil ×6). **Primeira vitória: em dobro.** Derrota não dá.

### 🏪 Loja
- Fica na **Base**. Compra com Ouro de Dragão:
  - **Itens de ascensão** (qualquer um dos 30, na raridade escolhida): **cinza 40 · verde 100 · azul 250 · roxo 600 · laranja 1.500**. A aba **⭐ Faltando no baralho** mostra os itens que faltam para o próximo degrau dos personagens do baralho.
  - **Orbes:** Comum 30 · Incomum 75 · Raro 120 · Épico 240 · Lendário 450 · Mítico 900 (~0,3 de Ouro por XP).
- **Não vende energia:** o Ouro vem de gastar energia, e vender energia viraria um ciclo sem fim.

### Saves
- Saves antigos começam no **mesmo nível de perfil que tinham** (1 + fases vencidas no Fácil, até 11), com a **energia cheia** desse nível e **0 de Ouro**; o baralho não perde espaço.
- A conta **ADM** fica no nível 100, com muita energia e muito Ouro.

### Simulação (100 jogadores, `scripts/balance/v26.ts`; Fácil, baralho só de personagens; `SIM_SHOP=0` desliga a Loja)
Política da Loja no simulador: quando um personagem está com a barra cheia e as Essências, mas faltam itens, compra os que faltam (o mais barato primeiro). A energia não entra no simulador (ele não tem relógio).

| Vitória ao chegar | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
|---|---|---|---|---|---|---|---|---|---|---|
| Sem Loja (como a v0.25.0) | 93% | 93% | 94% | 63% | 59% | 56% | 63% | 62% | 51% | 52% |
| **Com Loja**, sem Repetir | 93% | 92% | 95% | 64% | 62% | 62% | 54% | 59% | 60% | 58% |
| Com Loja + 5 Repetir antes de cada fase nova | 93% | 92% | 96% | 69% | 69% | 68% | 59% | 67% | 67% | 66% |

- A Loja **ajuda a destravar os itens** que faltam (+6 a +9 pontos nas fases 9 e 10) sem acabar com a dificuldade. Repetir dá mais Ouro e itens, e a energia limita quanto dá para repetir por dia.

## 26. 🎴 Banner de cartas e cópias repetidas (v0.27.0)
- O **Banner** fica na **🏪 Loja**, com paisagem e os personagens em destaque (**Kenji** e **Vorax**). Os banners são dados (`BANNERS` em `src/core/banner.ts`): cartas e fases futuras podem ganhar banners novos.
- **Preço:** 1 carta = **300** Ouro de Dragão · 10 cartas = **2.700** (10 pelo preço de 9). No pacote de 10, **pelo menos 1 carta Épica ou melhor** (v0.31.0; antes Rara).
- **Chance de cada carta:** Comum **40%** · Incomum **27%** · Raro **20%** · Épico **10%** · Lendário **3%**.
- **Que personagem sai:** sorteia a raridade e depois um personagem que pode ter essa raridade (raridade inicial ≤ sorteada ≤ raridade máxima dele). Ele vem **nessa raridade**, no degrau base. Ex.: um Raro pode ser a Yume (que começa em Raro) ou o Riku já em Raro.
- **Kenji e Vorax** só existem no Lendário e **só saem no Banner** (não vêm em fase nem em pacote). Numa carta Lendária, **metade das vezes** sai um deles (≈0,75% cada por carta); na outra metade, outro personagem que pode ser Lendário (Yume, Zarek ou Nyx).
- **Cópia repetida vira XP** (no Banner e nos pacotes de fase): o personagem que você já tem ganha o XP do **Orbe da raridade da carta repetida** (Comum 100 · Incomum 250 · Raro 400 · Épico 800 · Lendário 1.500 · Mítico 3.000), **+20% por "+"** da carta repetida, vezes a sorte: **12% ×2 · 5% ×5 · 1% ×10** (senão ×1).
  - A cópia **não sobe a raridade** do seu personagem, mesmo se vier mais rara: vira só XP (de acordo com a raridade dela).
  - O XP entra na barra do degrau como os Orbes. **v0.28.3:** do XP que passar da barra cheia, **25% volta como Orbes** na sua bolsa, convertido do Orbe maior para o menor (Mítico 3.000 … Comum 100); o resto abaixo de 100 XP é descartado (arredonda para baixo). A tela da carta mostra "XP que passou: +N Orbes".
  - Isso vale **só para cópias repetidas**. Os Orbes continuam não entrando com a barra cheia (o botão fica desligado) e o XP por jogar mantém a regra dele (o que passar da barra se perde).
- A tela de compra mostra as cartas aparecendo uma a uma (as Épicas e Lendárias brilham). Personagem novo entra direto no baralho se couber.

## 27. Campanha: equilíbrio, liberação, Comandantes e estrelas (v0.28.0)
### ⭐ Objetivos por fase
- A **1ª ⭐** é sempre **vencer**. A **2ª e a 3ª** são **2 objetivos fixos** de cada fase, em cada dificuldade, tirados desta lista:
  - ❤️ **Vida do Comandante:** vencer com 50% / 70% da vida, ou **sem levar dano** (100%).
  - 🃏 **Poucas cartas:** vencer usando no máximo 8 / 10 / 12 cartas (personagens e feitiços contam).
  - 🪄 **Feitiços:** vencer **sem usar feitiços**, ou usando **pelo menos 2**.
  - 💀 **Abates:** derrotar pelo menos 6 / 8 / 10 personagens inimigos (a Cria Sombria não conta) e vencer.
- O jogo conta, em cada partida, as cartas e os feitiços que você usou e os personagens inimigos derrotados.

| Fase | Fácil | Normal | Difícil |
|---|---|---|---|
| 1 | ❤️ 50% · 🃏 ≤12 | ❤️ 70% · 🃏 ≤10 | ❤️ sem dano · 🃏 ≤8 |
| 2 | ❤️ 70% · 🪄 sem feitiços | ❤️ sem dano · 🃏 ≤12 | ❤️ sem dano · 🃏 ≤10 |
| 3 | 💀 6 · ❤️ 70% | 💀 8 · 🪄 sem feitiços | 💀 10 · 🃏 ≤10 |
| 4 | 🃏 ≤12 · 🪄 sem feitiços | 🃏 ≤10 · ❤️ 70% | 🃏 ≤8 · ❤️ sem dano |
| 5 | 💀 8 · ❤️ 70% | 💀 10 · 🪄 2 feitiços | 💀 10 · ❤️ sem dano |
| 6 | 🪄 2 feitiços · ❤️ 50% | ❤️ 70% · 🃏 ≤12 | 🪄 2 feitiços · 🃏 ≤10 |
| 7 | 💀 8 · 🃏 ≤12 | 💀 10 · 🪄 sem feitiços | 💀 10 · ❤️ sem dano |
| 8 | ❤️ sem dano · 🪄 sem feitiços | ❤️ sem dano · 🃏 ≤10 | ❤️ sem dano · 🃏 ≤8 |
| 9 | 💀 6 · 🪄 2 feitiços | 💀 8 · ❤️ 70% | ❤️ sem dano · 🪄 2 feitiços |
| 10 | ❤️ sem dano · 🃏 ≤12 | 🪄 2 feitiços · 🃏 ≤10 | ❤️ sem dano · 🃏 ≤8 |

- **Todos são possíveis:** no simulador (`scripts/balance/stars28.ts`), um jogador 1 degrau acima dos inimigos cumpre cada objetivo em pelo menos ~33% das partidas no Auto (econômico para os de poucas cartas). Os mais difíceis são os de 🃏 ≤8 e 💀 10 no Difícil.

### 🔓 Liberação fase a fase
- Vencer a fase N no Fácil libera a **mesma fase no Normal** (se a fase N−1 do Normal já foi vencida), e o mesmo do Normal para o Difícil. A tela de vitória avisa: "Fase N liberada no Normal!".

### 👹 Comandante inimigo de cada fase
- Cada fase mostra o **seu** Comandante (no mapa, na janela da fase e na batalha): nas fases 1 a 9, o personagem **mais forte** do baralho da fase que ainda **não foi Comandante** de outra fase (nenhum se repete); a **fase 10** continua com o **minotauro**. O Comandante do jogador não muda. A vida do Comandante é a da fase.
- Hoje: 1 Riku · 2 Daichi · 3 Aiko · 4 Lyra · 5 Gorath · 6 Yume · 7 Zarek · 8 Kenji · 9 Nyx · 10 minotauro. No tutorial, o mais forte da batalha.

### ⚖ Reequilíbrio do Fácil
- Meta: vitória ao chegar **~90%** nas fases 1–3, **~75%** nas 4–7 e **~65%** nas 8–10, subindo a dificuldade aos poucos. Normal e Difícil continuam **+1 / +2 degraus**.
- Mudanças: degraus dos inimigos 0 · 0,5 · 0,5 · 0,5 · 0 · 0 · 1,5 · 0 · 0 · 0 (antes 0 · 0,5 · 0 · 1 · 0,5 · 0 · 3 · 0 · 0,5 · 0,5); vida do Comandante inimigo 12 · 20 · 26 · 30 · 33 · 44 · 47 · 52 · 62 · 70 (antes 12 + 7 × fase); a fase 6 ficou sem feitiços e a fase 10 sem a Lâmina Giratória.
- **Simulação** (100 jogadores no Fácil, vitória ao chegar; `scripts/balance/v28.ts`):

| Fase | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
|---|---|---|---|---|---|---|---|---|---|---|
| v0.27.0, só personagens | 93% | 92% | 94% | 63% | 62% | 61% | 55% | 57% | 59% | 57% |
| **v0.28.0, só personagens** | 93% | 92% | 90% | 79% | 74% | 77% | 71% | 68% | 66% | 67% |
| v0.28.0, com até 4 feitiços | 100% | 100% | 97% | 85% | 85% | 89% | 80% | 65% | 58% | 62% |

## 28. Organização do código (v0.28.1)
- **Nenhuma regra do jogo mudou.** Só a organização do código:
  - O `main.ts` (mais de 1.100 linhas) virou telas separadas em `src/app/` (Base, Aventura, Tutorial, Coleção, Treinar, Loja, Ajuda, estado e peças comuns).
  - A batalha (`battle.ts`) foi dividida em regras de combate, movimento e feitiços; os efeitos visuais da batalha na tela foram para `battleFx.ts`.
  - Os testes foram agrupados por assunto em pastas (`batalha`, `baralho`, `campanha`, `economia`, `progressao`, `visual`), com os mesmos testes de antes.
  - **ESLint** confere o código (`npm run lint`) e roda na CI antes dos testes.
- **v0.28.3:** a tela de batalha (`battleView.ts`, 913 linhas) também foi dividida: a mão do jogador (`battleHand.ts`), as janelas de detalhes de carta, unidade e feitiço (`battleModals.ts`), o desenho do tabuleiro (`battleRender.ts`) e a animação dos eventos (`battleEffects.ts`). O `battleView.ts` ficou com a montagem da tela, os botões e o fluxo dos turnos. Nada mudou no jogo.

## 29. Lista de melhorias (v0.28.2)
- O [MELHORIAS.md](MELHORIAS.md) guarda **só o que ainda não foi feito**. Quando algo entra no jogo, sai de lá e vai para o CHANGELOG e este arquivo. Itens novos só entram quando o jogador pedir.
- **Tipo do personagem (v0.28.4):** hoje o tipo (Humano, Extraterrestre, Monstro, Mago Arcano, Androide, Necromante) é só visual (desenho, cor, ícone) e filtro da Coleção; não muda a batalha. Ideias para dar função a ele estão no MELHORIAS.md.
- **Tela inicial no celular (v0.28.5):** em pé, a tela inicial cabe na altura da tela sem rolar (tamanhos calculados pela altura). A moeda da barra de recursos mostra o dragão dentro dela.
- **Botão ⟳ (v0.28.6):** ao procurar atualização, só o ícone gira no centro do botão.
- **Canto da carta (v0.28.7):** o canto direito de cima mostra o ícone colorido do **grupo** (Suporte ➕ verde, Tanque 🛡 azul, DPS ⚔ vermelho, Mago 🪄 roxo, Arqueiro 🏹 laranja, Assassino 💀 cinza). O degrau aparece só no texto da raridade ("Comum+", "Mítico++").
- **Cartas futuras (v0.28.8):** o [CARTAS.md](CARTAS.md) é o **projeto** das 120 cartas (20 por tipo), com habilidades e números. **Ainda não estão no jogo**: entram depois que as artes forem feitas.
- **Projeto das cartas (v0.28.9):** no CARTAS.md, todo tipo tem quem ataque atrás na mesma fileira (🔙 Golpe pelas Costas) e na diagonal de trás (↙ Golpe Reverso).

## 30. Artes ilustradas dos personagens (v0.29.0)
- Cada personagem com arte ilustrada (`src/assets/chars/<id>.webp`) usa essa imagem em todo o jogo: carta (fundo inteiro, sem camada separada do personagem), Coleção, Treinar/Despertar, tela inicial, Comandante da fase e unidade na batalha (retrato emoldurado na cor do lado: azul o seu, vermelho o inimigo). Quem não tem arte (Cria Sombria) continua com o desenho em SVG.
- As artes vêm das cartas desenhadas pelo jogador com outra IA no modelo antigo; só a ilustração é aproveitada (o script `scripts/art/build_cards.py` apaga a gota, a pílula ⚡ e a estrela "Nv." e recorta). Os números, a raridade e o grupo são sempre os do jogo.

## 31. As 120 cartas e as habilidades novas (v0.30.0)
- O jogo tem **120 personagens, 20 de cada tipo** (fichas completas no [CARTAS.md](CARTAS.md)). Os 99 novos saem **só no 🎴 Banner**; as fases, os pacotes de fase e o começo do jogo continuam com os 20 de antes.
- **Banner:** Comum 25% · Incomum 30% · Raro 25% · Épico 15% · Lendário 4% · **Mítico 1%** (v0.31.0; cartas que começam no Mítico só saem nessa raridade).
- **Efeitos novos** (ícone na unidade): 🩸 sangramento (1 por turno por 3 turnos, +1 quando anda) · 🐌 lento (anda 1 casa, perde o ataque no 1º turno lento) · ❄️ congelado (não ataca no próximo turno, ainda anda) · 💫 atordoado (perde a ação) · 🕯️ maldição (+25% de dano recebido por 2 turnos) · ⏳ imune (Vontade Inquebrável).
- **Ao acertar:** Veneno, Sangramento (golpe físico) e Queimadura (acumula até 2) também nos golpes secundários; Maldição, Lentidão, Congelamento (50%), Atordoamento (50%), Domínio (−1 de ataque, até −3), Copiador, Selo do Vazio, Sede Eterna e Execução só no golpe principal. Congelar/atordoar não pegam o mesmo alvo dois turnos seguidos.
- **Golpe Crítico:** 25% (30% no Lendário e Mítico) de dano dobrado no golpe principal. **Perfurar:** ignora escudo e toda a resistência. **Evasão:** desvia de ataques à distância e feitiços de 1 alvo, a não ser que esteja congelado, atordoado ou lento.
- **Mira:** Provocar obriga quem pode atingi-lo a atacá-lo; Golpe pelas Costas ataca primeiro o inimigo logo atrás na mesma fileira (+1).
- **Defesa:** Protetor recebe 30% (40% no Épico+) do dano dos aliados vizinhos; Couraça Adaptativa ganha +1 de resistência física e cura 1 a cada golpe físico (até 3); Escudo de Entrada (3, ou 5 no Épico+) dura até acabar; Vontade Inquebrável salva 1 vez com 1 de vida e imunidade até o fim do turno inimigo.
- **Ataque crescente:** Fúria +1 por inimigo derrotado (até +3); Vingança +1 por aliado derrotado (até +4); Grito de Guerra +1 para a fileira (não soma com o Tambor; teto 2).
- **No início da ação:** Purificar tira 1 efeito ruim do vizinho mais afetado; Ressurreição traz o último aliado derrotado com 50% da vida (rodada 3 em diante, 1 vez a cada 10 rodadas); Teleporte (1 vez) pula para trás do inimigo mais avançado da fileira e ataca (+1); Investida: na 1ª ação anda 2 casas a mais e bate com +1.
- **Outras:** Regeneração (1, ou 2 no Épico+, no fim do turno) · Explosão ao morrer (2, ou 3 no Épico+, nos inimigos vizinhos) · Raio em Cadeia (+2 inimigos vizinhos com 60% e 30%) · Clone (cópia sem habilidades com metade da vida e do ataque) · Protocolo de Retaliação (dano no seu Comandante volta no inimigo mais próximo dele, até 5) · Sede Eterna (drena 2, ou 3 no Mítico++, e passa a Marca da Sede, que drena 1).
- As cartas novas usam o peso de Poder neutro (1,0) até serem medidas no simulador.

## 32. Comandante adversário recortado (v0.30.1)
- Na batalha, o Comandante adversário de cada fase (e do tutorial) aparece **só como o personagem recortado**, sem a carta e sem o fundo, de pé no mesmo piso do nosso bárbaro, com uma **respiração** leve. Na fase 10 continua o **minotauro** animado.
- A **altura é proporcional ao nosso bárbaro** (1 = a altura dele na tela) e mostra o **tamanho aparente** do personagem: gigantes maiores, mulheres um pouco menores, e quem está agachado, ajoelhado, sentado ou flutuando fica mais baixo. Nunca é esticado para encher a coluna; quem passa de 1 fica limitado à altura da coluna. Desde a v0.34.0 todos os recortes vêm das artes novas **de corpo inteiro**:

| Personagem | Altura | Por quê |
|---|---|---|
| Gorath | 1,12 | minotauro gigante, em pé |
| Daichi | 1,10 | golem de pedra enorme |
| Vorax | 1,00 | necromante alto |
| Zarek | 0,98 | alienígena alto |
| Tobi, Toru | 0,90 | oni grande / androide grandão |
| Lyra | 0,88 | mulher em pé (chapéu) |
| Nyx, Aiko | 0,86 | mulheres em pé |
| Hana, Yume, Kael | 0,84 | em pé / avançando |
| Kenji, Suri | 0,82 | base baixa de kung fu / espírito flutuando |
| Sora | 0,80 | passo de dança |
| Riku, Nara, Jin, Kuro | 0,66 | salto encolhido / avanço baixo / ajoelhado / agachado |
| Mei | 0,62 | sentada no lótus |
| Ren | 0,60 | agachado |

- A tabela fica em `COMMANDER_LOOK` (`src/ui/art.ts`), junto com quem precisa ser espelhado para olhar para a arena. Os recortes vêm de `scripts/art/build_cutouts.py`.
- **Cria Sombria (v0.30.2):** a invocação do Vorax usa a arte ilustrada própria (carta, batalha e recorte), como os outros 120 personagens.

## 33. Carta, detalhes e banner (v0.31.0)
- **Carta:** saíram os raios de luz girando por cima da arte (Épico ou melhor). Ficam a aura, o reflexo que passa e a borda.
- **Janela de detalhes (Coleção):** ✕ no canto de cima à direita para fechar. **Colocar no baralho** (ou Tirar) e **Treinar** viram dois "cards" ao lado da carta (à esquerda); no celular em pé o "Visual na Arena" fica do outro lado e tudo cabe sem rolar.
- **Banner — chances por carta:** Comum 25% · Incomum 30% · Raro 25% · Épico 15% · Lendário 4% · Mítico 1%.
- **Pacote de 10:** pelo menos **1 Épica ou melhor**.
- **Lendária garantida:** a cada **80 cartas** compradas no banner (as de 1 e as de 10 contam carta por carta), a 80ª vem Lendária ou Mítica. O contador volta a 0 sempre que sai uma Lendária ou Mítica (por sorte ou garantida). O card do banner mostra **N/80**.
- **Depois de comprar:** o resultado mostra **Comprar 1** e **Comprar 10** (de novo, direto) e um **✕** embaixo, no meio, para sair.

## 34. Cópias, 🎒 Inventário e Desmanchar (v0.32.0)
- **Ganhar um personagem dá 1 cópia.** Para ter 3 dele no baralho, você precisa ter 3 cópias (o baralho só usa as que você tem, até 3 por personagem). Feitiços continuam até 3.
- **Repetido não vira mais XP sozinho:** cada personagem repetido (banner ou pacote) vira **+1 cópia guardada** no Inventário.
- **🎒 Inventário** (na Base), com duas abas: **Itens** (Essências, Orbes, XP guardado e itens de ascensão) e **Personagens repetidos** (as cópias de cada personagem, por raridade).
- **Desmanchar** (aba Personagens repetidos), dois modos:
  - **🎯 Direcionado:** a cópia vira XP do **próprio** personagem: Orbe da raridade da cópia (Comum 100 … Mítico 3.000), com a sorte de sempre (12% ×2 · 5% ×5 · 1% ×10). XP que passa da barra cheia: 25% volta em Orbes.
  - **♻ Geral:** a cópia vira **25%** desse XP, guardado como **Orbes** (para qualquer personagem). O que não fecha um Orbe inteiro fica guardado ("XP guardado") para a próxima.
  - Nunca dá para desmanchar a **última cópia** nem as cópias que o **baralho está usando**.
- **Mínimo do baralho:** 3 × personagens (até 20), mas nunca mais do que as cópias que você pode usar.
- **Saves antigos:** cada personagem que você já tinha ganha **3 cópias** (2 guardadas, na raridade inicial dele), então o baralho não perde nada. Os 3 personagens do tutorial também terminam com 3 cópias cada. A conta ADM tem 9 cópias guardadas de cada personagem.

## 35. 💠 Gemas de Invocação, começo da campanha e tutorial guiado (v0.33.0)
- **💠 Gemas de Invocação:** cada gema compra **1 carta** no 🎴 Banner. A Loja usa as gemas **antes** do Ouro (Comprar 1 com 1 gema; Comprar 10 com 10 gemas). Gemas aparecem no topo quando você tem alguma.
- **De onde vêm:** só na **primeira vitória** de cada dificuldade das fases: fases 3, 6 e 9 dão **1 gema**, a fase 10 dá **3 gemas**. O tutorial dá **2 gemas**. As fases **não dão mais pacotes** de cartas: personagens novos saem do Banner.
- **Inimigos das fases:** a fase 1 usa **3 personagens diferentes**, e cada fase seguinte usa **+1** (até 10). Fase 1: Hana, Daichi, Kuro · fase 2: Kuro, Ren, Hana, Tobi · fase 3: Daichi, Tobi, Ren, Suri, Jin; da fase 4 em diante, os últimos personagens do grupo antigo da fase.
- **Vida e força dos Comandantes inimigos** (fases 1–10): vida 16, 20, 18, 32, 22, 40, 47, 52, 56, 74; degraus de força 3,34 · 3,25 · 0,5 · 1,5 · 0 · 0 · 1,5 · 0 · 0 · 0. Simulação (100 jogadores, sem feitiços): vitória ao chegar na fase ≈ 98, 99, 87, 90, 72, 81, 77, 65, 64, 67%.
- **Baralho com poucas cópias:** a batalha aceita baralho com qualquer número de cartas (o mínimo é conferido na tela do baralho), porque quem só tem 1 cópia de cada personagem tem menos cartas.
- **Tutorial guiado:** as duas batalhas têm semente fixa e as cartas chegam prontas (sem espera). A tela escurece tudo menos o que deve ser tocado (carta, casa, LUTAR ou o aviso de girar a tela), com seta e texto do passo; o resto não responde ao toque. "Pular tutorial" sempre disponível.
- **Onde invocar no tutorial (v0.42.1):** na hora de colocar um personagem, as **6 casas da sua zona** ficam claras e destacadas juntas e **qualquer uma delas vale**. Na 1ª invocação da Batalha 1, primeiro só as 6 casas acendem (com o texto "qualquer um dos 6 quadrados destacados"); uns 3 segundos depois, uma casa ganha um **círculo** e a seta, com o pedido para colocar ali. Feitiços continuam apontando só o alvo certo.
- **Fim do tutorial:** +2 💠 Gemas e um passo guiado no 🎴 Banner (Comprar 1 → Comprar 1 de novo → ✕). Se o jogo fechar antes, o passo volta ao abrir a Base enquanto houver gemas.

## 36. Artes novas inteiras (v0.34.0)
- As **121 artes** (120 personagens + Cria Sombria) foram trocadas pelas ilustrações limpas novas, no padrão aprovado no teste do Quorr: retrato 0,72, sem nada de carta, personagem inteiro. Saem em 486×675 (WebP), sem cortar o personagem.
- **Área segura:** 15% de cima ficam sob a gota, o ⚡ e o ícone do grupo; 15% de baixo sob a faixa do nome; 5% de cada lado podem ser cortados na mão.
- Os **Comandantes** usam recortes de **corpo inteiro** dessas artes (sem perna ou braço faltando), com a altura aparente da tabela da seção 32.
- Script: `scripts/art/build_clean.py` (cartas) e `scripts/art/build_cutouts.py --limpas` (recortes).
- **Tela inicial em pé (v0.34.1):** o conteúdo fica centralizado na altura da tela, com faixas vazias iguais em cima e embaixo.

## 37. Textos limpos, segurar para ver a descrição e Comandantes inteiros (v0.35.0)
- As descrições das habilidades e feitiços mostram só o nome, o que fazem e o valor de agora ("agora: …"); não há mais notas de versão nem a linha "Por raridade".
- **Na batalha**, tocar/clicar numa carta da mão ou numa unidade só escolhe ou joga. A **descrição** abre ao **segurar** (cerca de 0,45 s) e, no PC, também com o **botão direito**. Arrastar a carta continua invocando.
- O **tutorial** (Batalha 2) tem um passo que pede para segurar a carta do Riku; o texto é "toque e segure" no celular e "clique e segure (ou botão direito)" no PC.
- **Comandantes:** nenhum recorte pode ter parte do corpo, arma ou efeito pela metade (v0.38.0: quem não tem recorte limpo não é Comandante — ver seção 40). Script: `scripts/art/build_cutouts.py` (`--retrato` para o modelo de retrato; tabelas `PORTRAIT` e `FILL`).

## 38. Arena de 10 casas (v0.36.0)
- A arena tem **2 fileiras × 10 colunas** (até a v0.35.0 eram 12). Cada lado invoca nas **3 colunas** da sua ponta (você: 1–3; inimigo: 8–10). O número de colunas é uma constante só (`COLS` em `src/core/battle.ts`).
- A vida e os degraus do inimigo de cada fase foram reequilibrados para a arena nova (tabela `ENEMY_HERO_HP` e `ENEMY_STEPS`).
- Comparação no simulador (Fácil, jogador só com personagens, 60 jogadores; `scripts/balance/arena.ts`, `SIM_SPELLS=0`), com a campanha de antes:

| Casas | Turnos por batalha | Golpes entre personagens por batalha | Dano no Comandante inimigo / no seu | Vitória ao chegar (fases 1–10) |
|---|---|---|---|---|
| 12 | 10,3 | 33,4 | 35,5 / 9,2 | 98 · 99 · 87 · 91 · 69 · 82 · 77 · 67 · 63 · 67% |
| 10 | 9,6 | 32,6 | 36,8 / 7,7 | 89 · 70 · 89 · 89 · 93 · 76 · 84 · 76 · 77 · 82% |
| 7 | 6,2 | 15,1 | 39,2 / 5,2 | 100 · 93 · 99 · 93 · 100 · 97 · 97 · 96 · 95 · 95% |

  Com 10 casas e a campanha reequilibrada: 95 · 97 · 89 · 91 · 83 · 78 · 78 · 67 · 67 · 69%.

## 39. Adversário esperto (v0.37.0)
- O inimigo tem **níveis de IA**: **0 = simples** (regras fixas: invoca as cartas prontas mais caras e reforça as fileiras ameaçadas) e **1 a 3 = esperta**.
- A IA esperta **pensa antes de jogar**: para cada jogada possível (cada carta pronta em cada casa da zona, cada feitiço em cada alvo, ou parar), ela simula a batalha alguns turnos à frente numa cópia (o nível 1 olha só o próprio ataque; os níveis 2 e 3 também a resposta do jogador e o turno seguinte) e escolhe a jogada que deixa a situação melhor. Repete enquanto houver jogada que melhore.
- A **nota** da situação pesa: vida dos dois Comandantes (abaixo de 40% vira **modo perigo**: defender ou fechar a partida), vida, ataque e habilidades das unidades, **unidades-chave** (curandeiros, auras, guardiões, Necropolis), avanço rumo ao Comandante adversário, ameaça das unidades inimigas que se aproximam, efeitos ruins e cartas prontas na mão. Os pesos vêm de um **treino contra ela mesma** (`scripts/balance/train_ai.ts`).
- O tempo de pensar é limitado por **número de simulações** (não pelo relógio) e as simulações não mexem no sorteio da batalha real: a partida continua **determinística** e verificável.
- **Nível por fase (Fácil):** 0, 0, 0, 1, 1, 1, 2, 2, 2, 3. **Normal** soma +1 e **Difícil** +2 (até 3). O **modo Auto do jogador usa sempre a IA simples**.
- Mesmo baralho dos dois lados contra a IA simples: o inimigo vence 55% (nível 0), 60% (1), 90% (2), 93% (3).

## 40. Comandantes sem cortes (v0.38.0)
- **Só vira Comandante adversário quem tem recorte limpo:** corpo, arma e efeito inteiros. As **120 artes** foram triadas uma a uma, lado a lado com o recorte: **79 servem** e **41 não servem** (efeito cortado pela metade, arma sem a lâmina, pedaço do cenário junto, corpo escondido pelo cenário ou figura encostada na borda da arte). A lista com o motivo de cada recusa está em `COMMANDER_REJECTED` (`src/core/commanders.ts`).
- **Saíram:** Nyx (redemoinho cortado), Zarek (buraco negro cortado), Riku, Hana e Ren. O redemoinho desenhado pelo jogo por cima da Nyx também saiu.
- **Comandante de cada fase:** o personagem mais forte do baralho da fase, com recorte limpo, que ainda não foi Comandante antes. Fases 1–9 (Fácil): Daichi, Kuro, Tobi, Aiko, Gorath, Yume, **Mei**, Kenji, **Lyra**; fase 10: o minotauro.
- **Altura aparente** de cada um em relação ao nosso bárbaro (1,0), pelo tamanho real e pela pose (`COMMANDER_LOOK`): gigantes até 1,12 (Gorath), em pé 0,8–1,0, agachados, ajoelhados e sentados 0,55–0,75 (ex.: besouro Grub 0,55, Mei sobre a lótus 0,62). Ninguém é esticado.
- Recortes em WebP com até 560 px de altura (`src/assets/cutouts/`).

## 41. Mapa do mundo: 100 fases (v0.39.0)
- A **Aventura** abre no **mapa do mundo**: as **10 regiões** num caminho pontilhado na horizontal (rola de lado). Cada região mostra o ícone, o nome, as fases vencidas (x/10) e as ⭐ (x/30) na dificuldade escolhida. Tocar numa região liberada abre o **mapa dela**, com as 10 fases no caminho vertical de sempre e o botão **◀ Mundo**.
- **Regiões:** 1 Vale Sereno (as 10 fases de antes) · 2 Costa do Coral Partido · 3 Selva das Mil Raízes · 4 Dunas de Âmbar · 5 Cordilheira Trovejante · 6 Pântano das Velas Mortas · 7 Cidadela das Engrenagens · 8 Ilhas Flutuantes de Éter · 9 Abismo Estelar · 10 Coroa do Dragão Eterno. As fases são numeradas "região-fase" (ex.: 3-7) e por dentro vão de 1 a 100.
- **Liberação:** a região N+1 abre ao vencer a **fase 10 da região N**, separadamente em cada dificuldade. Dentro da região vale a regra de sempre (fase anterior vencida; Normal/Difícil também pedem a mesma fase vencida na dificuldade anterior).
- **Inimigos das regiões 2–10:** 10 personagens diferentes por fase, tirados dos **120 personagens**, com a raça da região em maioria; raridade e degrau sobem de região em região (de Comum++/Incomum na região 2 até Mítico+/++ na 10). Vida do Comandante inimigo de 50 (fase 2-1) a 160 (fase 10-10). **IA:** nível 1 a 3 nas regiões 2–5 (sobe dentro da região) e sempre 3 da região 6 em diante; Normal +1 e Difícil +2 (até 3). Feitiços da IA nas fases 3 e 6 (1) e 9 e 10 (2) de cada região.
- **Comandantes:** cada fase tem um Comandante com recorte limpo (seção 40), que nunca se repete dentro da região; no mundo inteiro aparecem os **79** recortes limpos (alguns voltam numa região mais adiante). A fase 1-10 continua com o minotauro.
- **Objetivos (⭐):** da mesma lista (vida do Comandante, máximo de cartas, sem feitiços / pelo menos 2, abates); o par gira de fase em fase e os números apertam no Normal, no Difícil e a partir da região 6.
- **Recompensas:** o XP dos Orbes de cada fase é o da fase de mesmo número da região 1 × **2 por região**, em Orbes de raridade maior a cada 2 regiões (região 2–3: Incomum/Raro … região 8–10: Lendário/Mítico; Normal e Difícil também sobem). Os itens de ascensão sobem 1 cor a cada 2 regiões (até laranja). Essências, Ouro, XP de perfil e XP por jogar seguem crescendo com o número da fase. **💠 Gemas** na primeira vitória das fases 3, 6 e 9 (1) e 10 (3) de **cada região**, em cada dificuldade.
- **Save:** o progresso de antes (fases 1–10, ⭐, limite do dia) continua igual — é a região 1. Quem já venceu a fase 10 encontra a região 2 liberada.
- **Curva de dificuldade** (simulador de longo prazo `scripts/balance/world.ts`, 32 jogadores no Fácil, com Loja e Banner pelo Ouro): vitória ao chegar, média de cada região: **83 · 77 · 75 · 74 · 69 · 63 · 60 · 58 · 53 · 52%**.
- **Visual da carta (v0.40.0):** a arte aparece limpa, sem aura colorida e sem estrelinhas. Ficam só o reflexo (cartas Raras ou melhores) e a borda na cor da raridade.

## Feitiços colecionáveis (v0.41.0)
- Cada feitiço tem uma **raridade** (`rarity` em `src/core/spells.ts`): Comum (Muralha, Flecha Envenenada, Cura em Massa), Incomum (Veneno Mortal, Chuva de Flechas, Investida de Ki), Raro (Lâmina Giratória, Tremor, Bola de Fogo, Raio Paralisante) e Épico (Golpe nas Sombras, Anjo da Guarda, Chamado da Necropolis).
- O save guarda as **cópias de cada feitiço** (`spells`). Feitiço sem cópia não entra no baralho; o baralho usa até 3 cópias, mas só as que você tem (igual aos personagens).
- **Banner:** a carta sorteada numa raridade sai do grupo "personagens dessa raridade + feitiços dessa raridade" (`cardPoolFor`), com a mesma chance para cada carta do grupo. Não há feitiço Lendário nem Mítico.
- **Fases:** a 1ª vitória das fases **2, 5 e 8 de cada região** (em cada dificuldade) dá 1 carta de feitiço (`spellRewardFor` em `src/core/adventure.ts`). Raridade = Fácil 1 / Normal 2 / Difícil 3, +1 a cada 3 regiões (regiões 4, 7 e 10), até Épico. Os feitiços da raridade se revezam em ordem; nas regiões 1–3 do Fácil cada feitiço Comum sai 3 vezes.
- Feitiço novo entra sozinho no baralho se couber e se já houver no baralho quem o conjure; repetido soma 1 cópia (e entra no baralho se ele já estiver lá e couber).
- **Desmanchar:** cópias de feitiço que sobram (fora do baralho e sem ser a 1ª) viram Orbes como no Desmanchar geral: 25% do XP do Orbe da raridade do feitiço, somado ao XP guardado.
- **Tutorial:** o pacote grátis dá o feitiço **Investida de Ki** com 2 cópias (no baralho). Na Batalha 2, depois das 3 invocações guiadas, o roteiro pede para escolher o feitiço e tocar (celular) ou clicar (PC) no inimigo destacado — uma vez só. Escolha no simulador (`scripts/balance/v41.ts`, 50 jogadores, Fácil com Loja; média da vitória ao chegar nas fases 1–10): Investida 87,8% · Lâmina Giratória 86,4% · Tremor 82,7% · Raio Paralisante 79,8% · Cura em Massa 71,8% · sem feitiço no tutorial 79,5%.
- **Migração:** save de antes da v0.41.0 fica com os feitiços que estavam no baralho, com as cópias que o baralho usava (sem valor = 3). A ADM ganha 9 cópias de cada feitiço.
- **Simulador:** o jogador simulado usa só os feitiços que tem (tutorial, fases 2/5/8 e Banner; até 2 cópias de cada, até 4 cartas de feitiço). `SIM_ALL_SPELLS=1` volta ao jeito antigo; `SIM_TUT_SPELL=<id>` troca o feitiço do tutorial.
- **Curva da região 1** (`scripts/balance/v28.ts`, 100 jogadores): vitória ao chegar 100 · 100 · 98 · 94 · 97 · 88 · 89 · 80 · 74 · 64% (só personagens: 94 · 97 · 88 · 88 · 90 · 82 · 80 · 69 · 70 · 67%; todos os feitiços liberados: 100 · 100 · 100 · 90 · 94 · 89 · 87 · 77 · 78 · 74%).

## Ícone do app (v0.41.0)
- Arte: `scripts/android/icone-fonte.jpg` (dragão dourado em anel com cartas, fundo cósmico). `python3 scripts/android/icons.py` gera `public/icon-192.png` e `icon-512.png` (arte inteira), `icon-maskable-512.png` (anel reduzido para caber no círculo seguro de 60%, com os raios da arte esticados para fora), os ícones do Android (normal, redondo e adaptável: fundo = raios, frente = disco do dragão dentro da zona segura de 66 dp) e as telas de abertura. O ícone da aba do navegador também é o novo.

## Ícones do jogo (v0.42.0)
- Recursos, Orbes, itens, raças, grupos, habilidades, efeitos, regiões, menus e botões usam **ícones desenhados** (src/assets/icons), mostrados como imagem; se faltar um ícone, o jogo mostra o emoji antigo no lugar.
- Cada **carta de feitiço** tem arte própria; o **monte do baralho** na batalha mostra o verso da carta.
- Os ícones não mudam regra nenhuma: são só visuais.

## Ajustes de tela (v0.42.2)
- **Batalha deitada:** a largura da arena desconta a faixa da câmera/entalhe do celular (safe area); as 10 colunas cabem inteiras, centralizadas entre os dois Comandantes.
- **Cartas:** sem o Poder no topo (ver acima). **Detalhe da carta:** espaço entre a carta grande e as etiquetas (raridade, raça, grupo) para o brilho não pegar no texto.
- **Grades (Coleção, baralho, Treinar):** usam miniaturas das artes (`src/assets/chars-sm`, `scripts/art/build_thumbs.py`), carregadas de uma vez, para a lista rolar sem as cartas piscarem pretas.
- **Loja:** o Banner mostra só a imagem, os 2 destaques com o primeiro nome, as chances, a Lendária garantida e os botões (sem título nem textos explicativos).
