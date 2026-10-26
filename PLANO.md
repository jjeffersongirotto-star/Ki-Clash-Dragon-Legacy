# Ki-Clash: Dragon Legacy — Plano do projeto

> Plano do projeto (as 38 decisões, o que já foi feito e o que falta), para qualquer pessoa ou assistente continuar sem contexto anterior.
> Escrito em 26/10/2026 a partir da passagem de bastão feita com outro assistente, sobre a `main` na **v0.20.0**. Fontes: REGRAS.md, CHANGELOG.md, MELHORIAS.md, a Página do plano (38 decisões), a Página "Proposta: habilidades protagonistas" e a análise do APK do jogo original *Dragon of Legend-HD*.
> **Decisões novas (26/10/2026 em diante) ficam no [MELHORIAS.md](MELHORIAS.md)** — itens de ascensão, Orbes por raridade, estrelas por fase, "raridade" no lugar de "cor" e a simulação da economia. Quando uma decisão nova muda algo daqui, vale a do MELHORIAS.md.
>
> **Legenda:** ✅ feito · ⬜ falta fazer · ❓ decisão em aberto · ⚠️ incerto / precisa confirmar com o dono.

---

## 0. Sobre a versão

Este documento descreve a `main` na **v0.20.0** (PRs #33 a #39). As versões 0.18.0, 0.19.0 e 0.20.0 adiantaram partes das fases 3 e 4 do plano e trouxeram ideias novas que **divergem** de algumas decisões do plano (ver seção 5.5).

---

## 1. Visão geral do projeto

**Ki-Clash: Dragon Legacy** é um auto-battler de cartas em grade (estilo "card strategy"), inspirado no jogo mobile *Dragon of Legend-HD* (2015, fora do ar). O jogador monta um baralho de personagens e feitiços, invoca unidades numa arena de 2 fileiras × 12 colunas e elas andam e lutam sozinhas até derrubar o **Comandante** inimigo.

| Item | Valor |
|---|---|
| Repositório | https://github.com/jjeffersongirotto-star/Ki-Clash-Dragon-Legacy |
| Jogo no ar (site) | https://jjeffersongirotto-star.github.io/Ki-Clash-Dragon-Legacy/ |
| APK Android | página de Releases do GitHub (`Ki-Clash.apk` / `Ki-Clash-<versão>.apk`) |
| Dono | Jefferson (escreve em **português do Brasil**) |
| Versão atual | **0.20.0** (`package.json`) |

### 1.1 Stack
- **Vite 5 + TypeScript 5**, UI em DOM/SVG/CSS (sem framework).
- `src/core/` = regras puras, **sem DOM** (`battle.ts`, `abilities.ts`, `spells.ts`, `deck.ts`, `deckbuild.ts`, `campaign.ts`, `adventure.ts`, `progression.ts`, `power.ts`, `leaders.ts`, `match.ts`, `ai.ts`, `rng.ts`, `types.ts`, `characters.ts`, `hairAudit.ts`).
- `src/ui/` = telas (`scenes.ts`, `battleView.ts`, `components.ts`, `dialog.ts`, `drag.ts`, `accounts.ts`, `save.ts`, `update.ts`, `orientation.ts`, `perf.ts`, `art.ts`, `gridArt.ts`, `style.css`).
- Testes: **vitest** em `tests/` (`battle`, `cards`, `deck`, `evolution`, `faces`, `hair`, `leader`, `progression`, `rules`).
- Simuladores de equilíbrio: `scripts/balance/*.ts` (`progression.ts`, `move15.ts`, `v18.ts`, `calibrate.ts`, `schedules.ts`, `final.ts`, `sim.ts`). Rodar com `npx vite-node scripts/balance/v18.ts 300`.
- App Android: **Capacitor 8** (`android/`), assinado com chave guardada nos segredos do repositório.
- Save: `localStorage` (contas locais; site e app têm saves separados).

### 1.2 Comandos
```bash
npm ci
npm run dev        # servidor local (Vite)
npm test           # vitest run
npm run build      # tsc --noEmit && vite build
npm run android    # build + cap sync + gradle assembleRelease (precisa Android SDK/Java 21)
npx vite-node scripts/balance/v18.ts 300   # simulação da campanha (300 jogadores)
```

### 1.3 Deploy (CI)
- `.github/workflows/deploy.yml`: em push na `main` → Node 20 → `npm ci` → `npm test` → `npm run build` → GitHub Pages.
- `.github/workflows/android.yml`: em push na `main` → Node 22 + Java 21 → build → `cap sync android` → APK assinado publicado em Releases.

### 1.4 Regras de trabalho (obrigatórias)
- [ ] **Um PR por mudança**, com **CI verde**. **O assistente faz o merge** quando a CI passa (combinado em 26/10/2026) e o dono confere no site no ar.
- [ ] Todo PR atualiza **REGRAS.md**, **CHANGELOG.md** (entrada nova no topo, data/hora de Brasília) e **sobe a versão no `package.json`**. Planejado-mas-não-feito vai para **MELHORIAS.md**.
- [ ] Quando o dono diz **"anote"**, só registre; aplique quando ele disser **"pode fazer"**. Pedidos diretos são feitos na hora.
- [ ] **60 FPS no mínimo em todas as telas** (sem `filter`/blur animado, sem animação contínua desnecessária; cartas de grade são bitmaps congelados).
- [ ] **Só janelas do próprio jogo** (tema escuro/dourado). Nunca `alert`/`confirm` do navegador.
- [ ] **Visual das cartas só muda quando ele pedir.**
- [ ] **Crescimento de ataque e vida fica como está:** `base × (1 + 0,08 × (nível − 1)) × (1 + 0,15 × (cor − 1))`, "+" dá +10% (mín. +1).
- [ ] **Habilidades são as protagonistas:** a melhora de verdade vem das habilidades por **cor**; algumas não escalam quando quebraria o jogo.
- [ ] **Regra do Riku (fixa):** o movimento dele é **sempre um salto** até a **3ª casa**, por cima de quem estiver nas casas 1–2; 3ª ocupada → 2ª; 2ª também → 1ª; tudo ocupado → fica. **Nunca anda depois do salto e nunca passa da 3ª**, em nenhuma cor/nível. Ataca com bônus de investida ao cair se houver alvo.
- [ ] **Mockups nunca são commitados nem publicados.**
- [ ] O jogo original usava **personagens de outra obra, sem licença**: use **só as ideias**, com **nomes e artes próprios** (nada dos nomes, golpes, dragões ou esferas daquela obra).
- [ ] Toda mudança de equilíbrio vem com **simulação** (tabela de "vitória ao chegar" por fase) no REGRAS.md.

---

## 2. Estado atual do jogo (v0.20.0)

### 2.1 Regras de batalha
- **Arena 2 × 12** (v0.16.0). Zona de invocação: colunas 1–3 (jogador) e 10–12 (IA); 6 colunas livres no meio. Comandantes numa coluna virtual depois da última coluna.
- **Sem energia:** cada carta na mão tem **contagem de rodadas** = **2 × custo − 1** (custo 2 → 3 … custo 6 → 11). Cai 1 no início de cada turno seu; só invoca em **0**. Mão inicial começa **2 rodadas adiantada**. Pode invocar todas as prontas no mesmo turno. **Carta pronta não jogada continua pronta.** Orbe ⏳ mostra quantas estão prontas.
- **Mão de 6**, compra até voltar a 6; fila semi-aleatória por carta (bloqueada 6 compras, sorteável na 7ª–9ª, garantida na 10ª; proporcional ao nº de cartas diferentes desde a v0.17.0).
- **Movimento:** anda até 2 casas, para quando um alvo entra no alcance; atravessa aliados (só para em casa livre); inimigos bloqueiam; sem passo da vitória.
- **Corpo a corpo:** só a casa da frente. Atacar a 2 casas é **habilidade**. **Longo alcance 4** (magos, arqueiros, suportes à distância).
- **Ordem:** da mais avançada para a mais recuada; **na mesma coluna, a fileira de cima primeiro**; **Vigia** age antes de todos.
- **Dano:** físico/mágico, reduzido pela resistência **que só existe por habilidade** (v0.17.0); mínimo 1. Ordem: Reflexo → escudo temporário → vida → (Anjo do feitiço, Anjo da Mei, Renascer) → cai.
- **Fúria:** a partir do turno 8, +1 de ataque para todos, +1 a cada 3 turnos. Turno 40: vence quem tiver mais % de vida no Comandante.
- **Comandante:** jogador 20 de vida no nível 1, +10 por nível até 110 (nível 10); sobe de nível quando o Poder do baralho alcança o requisito (480, 510, 560, 610, 660, 760, 840, 930, 980). Inimigo: 12 + 7 × (fase − 1) → 12…75.

### 2.2 O que a Fase 1 entregou (v0.16.0, PR #33)
- ✅ Arena 2 × 12 (casas redimensionadas para deitado/em pé/computador, ~60 FPS).
- ✅ Contagem de rodadas no lugar da energia (**2 × custo − 1**, mão inicial 2 adiantada — escolhido por simulação; "espera = custo" deixava fases 4–6 e 10 com 13–25%).
- ✅ Corpo a corpo só na frente (confirmado e testado).
- ✅ Longo alcance 4.
- ✅ Desempate: fileira de cima primeiro (documentado e testado).
- ✅ Contas locais: botão **👤 Entrar / Criar conta** no canto superior esquerdo da Base; conta de teste **ADM / 12345** com tudo no máximo. ⚠️ Sem servidor: senha da ADM no código, contas só no aparelho.

### 2.3 O que a Fase 2 entregou (v0.17.0 PR #34 e v0.17.1 PR #35)
- ✅ **Efeitos com duração:** 🧪 veneno (ignora resistência), 🔥 queimadura (reduzida pela resistência mágica), 💫 atordoado (perde a ação), 🛡 escudo temporário (absorve antes da vida, soma até 99). Não acumulam (fica o mais forte e a maior duração). Selos parados no lutador.
- ✅ **Ícone de aura** no beneficiado (🥁 Tambor, 🌀 Sifão).
- ✅ **Habilidades novas:** 👁 Vigia (Jin), ♻ Renascer (Zarek, 30/40/50%), 👼 Anjo da Guarda (Mei, 1 vez, vizinho ou ela mesma com 1 de vida), 🪞 Reflexo de Magia (Nyx, 30/40/50%), 💢 Ombrada (Gorath, empurra 1), ⚰️ Necromancia (Vorax, traz a última derrotada para a mão pronta), 🔰 Barreira Arcana (Lyra, mágica 1/2).
- ✅ **Resistência só por habilidade:** Toru (física 1/1/2/3), Gorath (física 2/3 + mágica 1 no Épico), Daichi (física 1), Lyra (mágica 1/2). Teto 3. Kenji e magos perderam a resistência de atributo.
- ✅ **13 feitiços** (2+ por categoria, 5 cruzados), ocupam vagas do baralho, esperam **custo − 1**, precisam de **conjurador** da categoria em campo (força pelo ataque/vida dele), voltam ao Baralho depois de lançados. Tabela completa na seção 16 do REGRAS.md.
- ✅ **Baralho com cópias:** 1 a 3 cópias por carta; de **20** até **min(40, 28 + 2 × nível de perfil)**; pelo menos 1 personagem. **Nível de perfil provisório = 1 + fases vencidas (no Fácil)**, máx. 11.
- ✅ Escudo da Muralha conta turnos do adversário (v0.17.1); texto do Anjo "dura até ser usado".

**Escolhas padrão da v0.17.0 (o plano não definia; ⚠️ confirmáveis):** duração contada em turnos do lado da unidade; DoT no começo do turno, atordoar no fim; Anjo da Mei nas 8 casas vizinhas 1 vez por batalha; Reflexo também contra feitiços (devolve no Comandante de quem lançou); feitiço volta ao Baralho com a fila recomeçando; inimigos com 3 cópias.

### 2.4 Depois da Fase 2 (já na `main`)
- ✅ **v0.18.0 (PR #36):** feitiços da IA na Aventura (fases 3, 5–10); nível das cartas da IA recalibrado (fases 1–10 = 1, 4, 4, 5, 6, 6, 11, 14, 17, 12); **partidas verificáveis** (`verifyMatch` em `src/core/match.ts`, base para um servidor futuro).
- ✅ **v0.19.0 (PR #37):** app Android (Capacitor), APK em Releases, botão **⟳** de atualização na Base.
- ✅ **Doc (PR #38):** criado `MELHORIAS.md`.
- ✅ **v0.20.0 (PR #39):** **Aventura em mapa** (bolinhas num caminho, Comandante inimigo animado em cima), **dificuldades Fácil/Normal/Difícil** (+3/+6 níveis, provisório), **⚔ Jogar / ⟲ Repetir** (Repetir dá a recompensa inteira sem jogar) com **limite de 5 por dia por fase e por dificuldade** (primeira vitória e derrotas não gastam; volta à meia-noite de Brasília), botão **⬇ Baixar** APK, telas responsivas (1,3× e 1,75× em telas grandes).

### 2.5 Últimas simulações ("vitória ao chegar", jogador simulado = IA do Auto)
| Fase | v0.15.4 | v0.16.0 | v0.17.0 (c/ feitiços) | v0.17.1 | **v0.18.0 (atual)** |
|---|---|---|---|---|---|
| 1 | 98% | 92% | 93% | 93% | **93%** |
| 2 | 95% | 98% | 99% | 99% | **89%** |
| 3 | 92% | 76% | 91% | 91% | **90%** |
| 4 | 61% | 76% | 77% | 77% | **81%** |
| 5 | 82% | 80% | 82% | 82% | **79%** |
| 6 | 45% | 47% | 53% | 53% | **76%** |
| 7 | 80% | 81% | 82% | 82% | **70%** |
| 8 | 49% | 86% | 89% | 89% | **68%** |
| 9 | 76% | 87% | 86% | 86% | **65%** |
| 10 | 38% | 66% | 53% | 53% | **62%** |

- v0.16.0–v0.17.0: `scripts/balance/move15.ts`, 300 jogadores. v0.18.0: `scripts/balance/v18.ts`, 300 jogadores; tentativas médias 1,1–1,5 por fase.
- Fases 2 e 3 ficaram praticamente iguais (pendência). A v0.20.0 não refez a simulação (mudou recompensa/limite, não a batalha) — ⚠️ conferir se a recompensa inteira no Repetir acelerou demais a progressão.

---

## 3. O que se sabe do jogo original (análise do APK)

### 3.1 Identificação
| Item | Valor |
|---|---|
| Nome | **Dragon of Legend-HD** |
| Pacote | `com.youtogame.dragonhd` (Google Play: `air.com.youtogame.dragonhd`) |
| Versão | 1.0.20, compilado em jan/2015 |
| Empresas | Youtogame / Nutsplay (ocidente), udhappy (China) |
| Motor | **Adobe AIR 16** (Flash/ActionScript 3 + Starling); tudo em `assets/index.swf` (1.255 scripts recuperados) |
| Licença | Personagens de outra obra **sem licença**. Usar só ideias. |
| Por que saiu do ar | O servidor de configuração `source.summon.nutsplay.com` não existe mais (NXDOMAIN); o site oficial também sumiu e a página da Play retorna 404. A batalha era calculada **no servidor** e os dados das cartas (`dataXML/`) eram **baixados do servidor** — **nada disso está no APK**. Uma cópia jogável offline **não é viável**. |

A análise foi feita fora do repositório; nenhum arquivo do APK original fica aqui. **Arte com direitos de terceiros: só referência, nunca no jogo.**

### 3.2 Batalha (real = está no código ou nas telas; deduzido = marcado)
- **Arena 2 × 12** por padrão; até **4 fileiras** quando há mais jogadores (masmorra em dupla). *Real (`BattleFormation.as`, `BattleModel.as`).*
- Tipos de carta: **Herói, Soldado, Arcano (feitiço)**. *Real (`CardType.as`).*
- Soldado **anda 2** e **ataca a 2 casas**; atirador **+2 de alcance** e **não avança depois de atacar**. *Real (tutorial `course1/2.png`).*
- Ordem: **da frente para trás, de cima para baixo**; quem tem **alerta (Vigia)** age de trás para frente. *Real (dicas de loading).*
- **Contagem de rodadas** na carta (o número do canto). Só arrasta com 0; o servidor baixava a cada rodada. *Real (`BattleCardList.as` 155–162, 365–390).* Exemplos: uma carta roxa espera 6, ataque 2, vida 12; uma carta verde espera 1, ataque 2, vida 4. *Real (tutorial).*
- **Carta pronta e não jogada voltava a esperar metade da sua espera** (arredondado para cima). *Real no cliente (`BattleCardList.as:434`); a regra final era do servidor.* No Ki-Clash hoje a carta **continua pronta** (ver ❓ 7.2).
- **Mão de 6**; contador de cartas restantes; **trocar a mão** no começo (vezes grátis, depois ouro). *Real.*
- Vitória: derrubar o **líder** (ponta direita). Líder tinha **Vida, Crítico do líder, Crítico dos soldados, Bloqueio dos soldados** (vinham do nível e de equipamentos). *Real (`BattleUserData.as`, `BattleHeroInfo.as`).*
- Dano **físico** e **energia**. Ataque/vida fixos por carta; **cartas não têm defesa**.
- Ações que o cliente sabia mostrar: entrar, andar, voar (pular para outra casa), atacar, ser atingido, ataque múltiplo, empurrão, ganhar/perder buff (com contador de rodadas), ganhar/perder aura, mudar vida, curar, renascer, habilidade passiva/ativa, reflexo de feitiço, anjo da guarda, mudar atributo, ir para o cemitério, sair do cemitério, virar esqueleto, virar soldado. *Real (`BattleView.as` ~1040–1150, 1520–1600).* O efeito exato de "anjo da guarda" e "alerta" é *deduzido*.
- Feitiços de classe (tutorial): Assassino com um tiro (6 físico), Médico com lança-chamas (energia + 1/turno por 10 turnos), Ancião com onda sonora (5 de energia, não reduz), Lutador com um raio de energia. *Real.*
- Modo **Auto** e velocidades 2× (nível 30/VIP) e 3× (nível 50/VIP). *Real.*

### 3.3 Baralho e cartas
- Mínimo/máximo de cartas no baralho **por nível do jogador** (tabela no servidor; padrão no código 8/8); aviso de baralho incompleto a partir do nível 5. *Real (`LevelData.as`, `CardSetModel.as`).*
- **Até 3 cartas do mesmo tipo** no baralho (tipo = provavelmente o mesmo personagem — *deduzido*). Feitiços e soldados contam juntos.
- Poder do baralho por qualidade: soldado 50/80/110/150/190/240; feitiço 70/90/110/140/170/210; Elite ×1,3; Herói ×1,8. *Real.*
- 6 qualidades: Normal/Superior/Raro/Épico/Lendário/Mito (tutorial: Poor, Fine, Rare, Super, Legend, God). Cada qualidade é **outra carta** com números próprios.
- Vários baralhos salvos e botão **Auto** de montagem.

### 3.4 Progressão
- **Evolução:** alimentar a carta com cartas de material ou **cartas de XP** (precisam ser da mesma raça); cada qualidade pede `need_exp`; **crítico de XP 1,5× (prata) e 3× (pago)**; cartas raras dão bônus. *Real.*
- **Decompor:** cartas viram XP guardado; modos rápidos (todas brancas/verdes/azuis, guardar 3, etc.). Cartas protegidas não são usadas. *Real.*
- **Enfurecer/Despertar:** usa cartas Herói/Elite/Material; dá para reverter sem reembolso. *Real.*
- **Equipamento (do jogador, não das cartas):** 8 espaços (elmo, armadura, capa, arma, asas, anel, colar, emblema); dava só **Vida e Crítico do líder** e **Crítico e Bloqueio dos soldados**; reforço com 5 pedras e chance de sucesso (podia **falhar**; opção "evita perder nível"); fundir 2–4 iguais; asas com durabilidade e conserto. *Real.* — **No Ki-Clash foi recusado (decisão 9).**
- **Nível do jogador até 45**; libera: masmorra (8), torneio (11), ferreiro (13), evolução/contra-relógio (14), guilda (35). **Stamina:** 2 a cada 30 min, máx. 200. *Real.*
- **Varredura:** repetir fase vencida várias vezes de uma vez. *Real (guia de 2015 + textos).*

### 3.5 Como o original dava cartas (gacha)
- **Pacotes** com preço em prata, ouro ou diamante, cada um com **tempo para o grátis** e um "primeiro pacote" especial; 3 saídas com qualidade definida. *Real (`TearPackageModel.as`).*
- **Pacote de Herói:** 1 ou 10 de uma vez; cada compra garante uma "carta rei". Cada pacote dá 1 ponto, 10 dão 10; **pontos compram cartas escolhidas**. *Real.*
- **Virar cartas** depois da masmorra (grátis por dia + pagas). Roleta diária (5 grátis, até 30). Sorteio especial 1/dia. *Real.*
- **7 objetos colecionáveis** na aventura → desejo: tesouro (100 ouro), dinheiro (100K), poder (1 conjunto roxo), companheiro (pacote roxo). *Real.*
- Lojas de prestígio (torneio), da torre e troca por estrelas do mapa. *Real.*
- Moedas: uma moeda do jogo, duas moedas pagas e diamantes de evento. **Chances e preços: não estão no APK.**

### 3.6 Modos do original
Campanha em mapa com chefes; masmorras (instâncias) solo e **em dupla** (com outro jogador ou seu "espelho"); **Torre/"Inferno"** com andares, tokens e loja; **Invasão de chefe** (o chefe mata no 12º turno, conta o dano, baralho sem feitiços); **Torneio de Artes Marciais / Arena** (PvP contra defesa, prestígio, loja); guilda/legião; chat; VIP; recarga; eventos (cavar diamantes, etc.).

---

## 4. As 38 decisões do plano (+ adendos)

| Nº | Tema | Decisão | Situação |
|---|---|---|---|
| 1 | Custo da carta | Contagem de rodadas no lugar da energia | ✅ v0.16.0 |
| 2 | Arena | 2 × 12 | ✅ v0.16.0 |
| 3 | Corpo a corpo | Só a casa da frente; alcance maior é habilidade | ✅ v0.16.0 |
| 4 | Feitiços | Ocupam vagas do baralho | ✅ v0.17.0 |
| 5 | Cópias | Viram material de evolução | ⬜ fase 3 |
| 6 | Baralho | Até 3 cópias por personagem; limite cresce com o **nível de perfil do jogador** (não do Comandante) | ✅ v0.17.0 (nível de perfil provisório) |
| 7 | Moeda dos pacotes | Só ganha jogando, **sem dinheiro real** | ⬜ fase 3 |
| 8 | O que o pacote dá | Qualquer personagem, inclusive os que o jogador não tem, **menos os presos a objetivo** (vencer fase, nível de perfil) até cumprir | ⬜ fase 3 |
| 9 | Equipamento | **Não terá** (equipamento que dá status ao líder). O Comandante terá habilidades próprias (a definir) | ✅ decidido; os **itens de ascensão** (materiais de evolução) são outra coisa — ver MELHORIAS.md |
| 10 | Por onde começar | Fase 1 | ✅ |
| 11 | Desempate | Mesma coluna: fileira de cima age primeiro | ✅ v0.16.0 |
| 12 | Vigia | Habilidade: age antes dos outros (de trás para frente) | ✅ v0.17.0 |
| 13 | Atiradores | Alcance 4 | ✅ v0.16.0 |
| 14 | Resistência | Não é status de toda carta; é **habilidade** de alguns | ✅ v0.17.0 |
| 15 | Nome do dano | Continua **mágico** (não "energia") | ✅ |
| 16 | Efeitos com duração | Veneno, queimadura, atordoar, escudo temporário | ✅ v0.17.0 |
| 17 | Aura | Ícone em quem recebe | ✅ v0.17.0 |
| 18 | Renascer | Habilidades de renascer e de trazer da Necropolis | ✅ v0.17.0 |
| 19 | Empurrão | Em mais habilidades | ✅ v0.17.0 |
| 20 | Reflexo de magia | Habilidade (depois dos feitiços) | ✅ v0.17.0 |
| 21 | Anjo da Guarda | Salva um aliado da morte uma vez | ✅ v0.17.0 |
| 22 | Feitiços por categoria | 2+ únicos por categoria, alguns usáveis por outras; baralhos ecléticos ou de uma categoria só | ✅ v0.17.0 |
| 23 | Comandante | Só guarda a vida; **não é classe**, não limita feitiços; no futuro, no máximo suporte, provavelmente **único por partida** | ✅ decidido; habilidades ⬜ |
| 24 | Decompor | Cópias viram XP guardado | ⬜ fase 3 |
| 25 | Nível de perfil e login | Libera telas/modos aos poucos; login local no canto superior esquerdo; conta **ADM / 12345** no máximo (aviso: sem servidor, senha visível no código, contas só no aparelho, só para teste) | ✅ login (v0.16.0); ⬜ nível de perfil completo |
| 26 | Varredura | Repetir fase vencida **5 vezes de uma vez** (simulado); jogar normal continua possível | ⚠️ v0.20.0 fez "Repetir" 1 por vez com limite 5/dia; decidido em 26/10 que o Repetir automático fica só para fases com **3 ⭐** (ver MELHORIAS.md) |
| 27 | Campanha | Mapa com capítulos e chefes | ✅ mapa (v0.20.0); ⬜ capítulos e chefes |
| 28 | Torre | Andares e loja própria | ⬜ fase 4 |
| 29 | Invasão de chefe | 12 turnos, máximo de dano, prêmio por faixa — **por enquanto com cadeado "Em breve"** | ⬜ fase 4 |
| 30 | Arena | Contra equipes da IA, ranking e loja — **cadeado "Em breve"** | ⬜ fase 4 |
| 31 | Masmorra em dupla | Aliado da IA — **cadeado "Em breve"** | ⬜ fase 4 |
| 32 | 7 diamantes | Juntar **7 diamantes** na aventura e fazer **1 de 4 desejos**: tesouro, moedas, poder, personagem; tema próprio | ⬜ fase 4 |
| 33 | Guilda, chat, VIP, compras | **Ficam de fora** (sem dinheiro real) | ✅ decidido |
| 34 | Stamina | Criar a mecânica, mas **por enquanto mostra ∞** e não limita | ⬜ fase 3 (ver 5.5) |
| 35 | Pacotes | **1 grátis a cada 8 h**; **item especial** de recrutamento ganho em certas fases, missões, eventos e bônus (é a moeda dos pacotes) | ⬜ fase 3 |
| 36 | Garantias | **Pacote de 10 garante 1 Épico**; **a cada 80 pacotes, 1 Lendário garantido** | ⬜ fase 3 |
| 36a | Adendo | O Lendário dos 80 é sorteado **ao acaso entre TODOS os Lendários, inclusive os bloqueados (Kenji, Vorax…)** — única exceção à regra da decisão 8 | ⬜ fase 3 |
| 37 | Carta após a vitória | Ao vencer, o jogo pega o **baralho do adversário**, sorteia **3 cartas**, mostra, e o jogador **escolhe 1** | ⬜ fase 3 |
| 38 | Bônus de XP | Alimentar com cópias tem **chance de 1,5×** no XP | ⬜ fase 3 |

**Chances por cor no pacote (só proposta, ❓ não decidido):** Comum 60% · Incomum 28% · Raro 10% · Épico 2% · Lendário/Mítico só pela garantia de 80. Acertar por simulação.

---

## 5. O que falta fazer

### 5.1 Fase 3 — Progressão (checklist)
- [ ] **Nível de perfil completo** (decisões 6 e 25): XP de perfil (de onde vem: vitórias, primeiras vitórias, missões — ❓ definir), curva de níveis, tela/indicador do nível. Substituir o provisório "1 + fases vencidas". Manter `max baralho = min(40, 28 + 2 × nível)` ou recalibrar.
- [ ] **Liberação gradual de telas/modos por nível de perfil** (25). ❓ Tabela de níveis (sugestão inspirada no original: masmorras ~8, arena ~11, torre ~13…). Telas bloqueadas com cadeado e o nível exigido.
- [ ] **Stamina com ∞** (34): campo e ícone na Base; nada consome por enquanto. Preparar a lógica (custo por batalha, recarga) desligada.
- [ ] **Item especial de recrutamento** (35): ❓ nome e ícone (tema próprio); fontes: primeira vitória de certas fases, missões, eventos, bônus. Mostrar na barra de recursos.
- [ ] **Tela de Recrutamento / pacotes** (7, 8, 35, 36, 36a):
  - [ ] Pacote grátis a cada **8 h** (❓ acumula? até quantos?).
  - [ ] Abrir 1 ou 10 com o item especial; **10 garante 1 Épico**.
  - [ ] **Contador de garantia de 80** → 1 Lendário sorteado entre **todos** os Lendários (inclusive bloqueados). Ao sair um bloqueado, ele passa a ser obtido (❓ confirmar que "obter pelo pacote" libera o personagem).
  - [ ] Sorteio por cor (❓ chances; proposta 60/28/10/2).
  - [ ] Pool: todos os personagens **exceto os presos a objetivo não cumprido** (fora a exceção do 36a).
  - [ ] Personagem novo entra na coleção; repetido vira **cópia** (material).
  - [ ] Feitiços entram no pacote? ❓ (hoje os 13 estão liberados para todos).
  - [ ] Animação de abertura leve (60 FPS), janela do jogo.
- [ ] **Cópias como material** (5, 38): guardar contagem de cópias por personagem; tela "Alimentar": cópias dão XP ao personagem, com **chance de 1,5×** (❓ qual chance? ❓ quanto XP por cor da cópia?).
- [ ] **Decompor** (24): cópias viram **XP guardado** (reserva usável em qualquer personagem); ❓ taxa de conversão; botões rápidos opcionais.
- [ ] **Carta após a vitória** (37): ao vencer, sortear 3 cartas do baralho do adversário (personagens e/ou feitiços? ❓), mostrar numa janela, jogador escolhe 1 → vira personagem novo ou cópia. Valer também no Repetir? ❓
- [ ] **Varredura** (26): hoje "⟲ Repetir" faz 1 por vez. Decisão original era **5 de uma vez**. ❓ Adicionar "Repetir ×5" usando o limite diário?
- [ ] **Habilidades do Comandante** (9, 23): ❓ definir lista. Ideias do dono: proteção contra dano físico ou mágico; +X de vida máxima para os aliados; −1 de vida em todos os atacantes à distância do adversário. Começo: só vida por nível; depois de alguns níveis: **defesa física 1**. "Provavelmente única por partida".
- [ ] Simulação da campanha com a nova economia (quantos pacotes/cópias por fase) e tabela no REGRAS.md.

### 5.2 Fase 4 — Modos (checklist)
- [ ] **Campanha em capítulos com chefes** (27): o mapa já existe (v0.20.0). Falta: agrupar fases em capítulos, chefe no fim de cada capítulo (Comandante/arte própria, ❓ regras especiais), mais fases além das 10 (❓).
- [ ] **7 diamantes e desejos** (32): diamantes caem em fases/eventos (❓ onde e com que chance); ao juntar 7, escolher 1 de 4 desejos — tesouro (itens de XP/Essências?), moedas, poder (❓ o quê), personagem (❓ qual raridade). Tema próprio (nada da obra original).
- [ ] **Torre** (28): andares crescentes com IA; tentativas por dia (❓); moeda própria da torre e **loja da torre** (❓ itens).
- [ ] **Invasão de chefe** (29): botão com **🔒 Em breve** já agora; regra futura: 12 turnos, conta o dano máximo, prêmio por faixa.
- [ ] **Arena contra IA** (30): **🔒 Em breve**; regra futura: equipes da IA, ranking local, loja de prêmios.
- [ ] **Masmorra em dupla** (31): **🔒 Em breve**; regra futura: aliado controlado pela IA (arena com 3–4 fileiras, como no original).
- [ ] Liberação desses modos pelo nível de perfil (25).

### 5.3 Perguntas em aberto (❓)
**Comandante**
- Quais habilidades, em que níveis, e se é "uma por partida" escolhida antes da batalha.

**Página de habilidades (proposta, ainda não adotada — "Proposta: habilidades protagonistas")**
- Proposta: bônus de habilidade em **% do ataque/vida por cor** (ex.: Riku investida 10/20/35/50%, Aiko 2ª flecha 30/45/60%, Kael 20/30/40/50%, Mei cura 8/12/16% da vida do aliado, Nyx −10/15/20%…). Ver tabela completa na Página.
- "Escudo" como **reserva por rodada** (Toru Épico 15) — ⚠️ a proposta foi escrita **antes** da decisão 14; resistência/escudo agora **só para quem tem a habilidade**, então os valores "base × cor" da proposta precisam ser refeitos.
- **Prole Sombria:** com o Vorax em campo, **toda unidade que morre vira cria** (desejo do dono). Vale para aliados também ou só inimigos? Continua o máximo de 3 crias por lado? A cria cresce com a cor (sugestão 25%/35% do ataque e vida do Vorax)? — hoje o código só cria quando Vorax/Cria mata.
- **Emboscada:** teto de 65% ou 50% do escudo ignorado?
- **Escudo por rodada ou por golpe?** (por golpe, 15 deixaria o Toru quase imune).
- **Tirar os bônus de habilidade por nível** (Nv.20, 25, 30) e deixar a melhora só na troca de cor?

**Equilíbrio**
- Dificuldade da fase 10 (hoje 62%) e fases 2 e 3 quase iguais (89% vs 90%).
- Ajuste fino de Normal/Difícil (hoje +3/+6 níveis, mesma recompensa), liberação das dificuldades e limite diário separado por dificuldade (MELHORIAS.md).
- Feitiços contra inimigos acertam a qualquer distância — manter? (MELHORIAS.md)

**Regras herdadas do original**
- Carta pronta e não jogada: no original voltava a esperar **metade** da espera; no Ki-Clash **continua pronta**. Adotar a regra do original?
- Feitiços inimigos na Aventura: **já implementados** (v0.18.0); ❓ só ajuste de quais feitiços por fase.

**Pacotes**
- Chances por cor (60/28/10/2 é proposta), acúmulo do grátis, feitiços no pool, nome do item especial.

**Kenji e Vorax**
- Continuam "🔒 Em breve" fora do pacote; só podem vir pela garantia de 80 (decisão 36a). ❓ Haverá outro objetivo de liberação?

### 5.4 Pendências técnicas (de MELHORIAS.md)
- [x] Nyx (Reflexo de Magia) devolvia dano depois de derrotada (bug) — corrigido na v0.20.1.
- [ ] `battle.ts`, `battleView.ts` e `main.ts` grandes; testes por versão em vez de por assunto; sem lint.
- [ ] Modo online: `verifyMatch` existe; faltam servidor, contas online e conferência de baralhos.

### 5.5 Divergências a confirmar com o dono (⚠️)
- **Energia (MELHORIAS.md, ideia nova)** vs **decisão 34** (stamina criada mas mostrando ∞): parecem a mesma coisa — confirmar se substitui o limite de 5/dia.
- **"Equipamentos para ascender personagens, por fase" (MELHORIAS.md, ideia nova)** vs **decisão 9** (sem equipamento). São coisas diferentes do equipamento do original (que dava stats ao líder): aqui seriam **materiais de evolução** que caem em fases específicas. Confirmar antes de fazer.
- **Varredura:** decisão 26 = 5 de uma vez; v0.20.0 = Repetir 1 por vez com limite 5/dia e recompensa inteira.

---

## 6. Divisão sugerida em PRs (um por mudança, nesta ordem)

1. ✅ **v0.20.1 — correções:** Reflexo da Nyx depois de derrotada; simulação da economia (ver MELHORIAS.md).
2. **v0.21.0 — Nível de perfil completo:** XP de perfil, curva, indicador; baralho máximo pelo nível novo; migração de saves (nível atual = 1 + fases vencidas).
3. **v0.22.0 — Liberação por nível + Stamina ∞:** cadeados com nível exigido nas telas/modos; stamina exibida como ∞; botões dos modos futuros com **🔒 Em breve** (Invasão, Arena, Masmorra em dupla).
4. **v0.23.0 — Cópias, Alimentar e Decompor:** contagem de cópias, tela de alimentar com chance 1,5×, XP guardado.
5. **v0.24.0 — Item especial e Recrutamento:** moeda, pacote grátis de 8 h, 1/10 com Épico garantido, garantia de 80 com Lendário entre todos (inclusive bloqueados), chances por cor; simulação.
6. **v0.25.0 — Carta após a vitória:** 3 cartas do baralho do adversário, escolher 1.
7. **v0.26.0 — Varredura ×5** (se confirmado).
8. **v0.27.0 — Habilidades do Comandante** (depois de definidas).
9. **v0.28.0 — Revisão das habilidades protagonistas** (depois das respostas da Página de habilidades), com simulação.
10. **v0.29.0 — Campanha em capítulos e chefes.**
11. **v0.30.0 — 7 diamantes e desejos.**
12. **v0.31.0 — Torre e loja da torre.**
13. Depois: Invasão de chefe, Arena contra IA, Masmorra em dupla (tirando os cadeados um por vez).

Cada PR: código + testes (vitest) + simulação quando mexe em equilíbrio + REGRAS.md + CHANGELOG.md + `package.json` + verificação de 60 FPS no celular deitado/em pé.

---

## 7. Links de referência
- Repositório: https://github.com/jjeffersongirotto-star/Ki-Clash-Dragon-Legacy
- Site: https://jjeffersongirotto-star.github.io/Ki-Clash-Dragon-Legacy/
- Regras atuais: [REGRAS.md](REGRAS.md) · Histórico: [CHANGELOG.md](CHANGELOG.md) · Decisões novas e ideias: [MELHORIAS.md](MELHORIAS.md)
- As Páginas do plano e da proposta de habilidades eram privadas; tudo o que importa delas está copiado neste arquivo.
