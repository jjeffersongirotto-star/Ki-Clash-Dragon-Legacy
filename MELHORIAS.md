# Melhorias futuras do Ki-Clash: Dragon Legacy

> Lista das ideias e pedidos de melhoria, para nada se perder entre as conversas.
> Quando um item for feito, ele sai daqui e vai para o [CHANGELOG.md](CHANGELOG.md) (e as regras para o [REGRAS.md](REGRAS.md)).

## 🔜 Próxima atualização (decidido, falta fazer)

### 1. Aventura: tirar o texto do topo
- Sai o texto acima da lista de fases: "Seu Comandante: Bárbaro Nv.10 · ❤110 · Poder do baralho…" e "Nível de perfil… · Seu baralho (40/40): …".
- Ficam o botão **← Base** e a linha de recursos (✴ 📜 💎 🔮).

### 2. Aventura: botões "Jogar" e "Repetir" nas fases já vencidas
- Em cada fase vencida, **Jogar** fica em cima e **Repetir** embaixo.
- **Jogar:** joga a batalha da fase normalmente.
- **Repetir:** não joga a batalha. Entrega na hora a **recompensa inteira** da fase, como se tivesse vencido de novo.
- **Limite de 5 por dia, POR FASE.** Cada "Repetir" gasta 1, e cada "Jogar" **vencido** gasta 1.
  - A **primeira vitória** de uma fase não gasta.
  - **Perder** não gasta.
  - Quando as 5 acabam, a fase fica **bloqueada (Jogar e Repetir) até o dia seguinte**.
  - As 5 vezes **voltam à meia-noite (horário de Brasília)**.
  - Cada fase mostra quantas vezes ainda restam no dia, por exemplo **"3/5"**.
- **Por quê:** o jogador não fica ganhando recompensas sem fim.
- Hoje repetir uma fase dá metade da recompensa; com esta mudança passa a dar a recompensa inteira.

### 3. Aventura: dificuldades Fácil, Normal e Difícil
- **Onde:** 3 opções no **topo da tela, no centro**: **Fácil · Normal · Difícil**.
- **Como funciona:** a escolhida vale para a lista de fases. Cada dificuldade tem **as mesmas fases**, mas com os personagens inimigos **mais fortes (com mais nível)** e, às vezes, **1 ou 2 cartas diferentes** no baralho inimigo para dificultar.
- **Nesta atualização:** criar só os 3 botões e a lógica (cada fase com uma versão Fácil, Normal e Difícil). O **ajuste da dificuldade** de cada uma fica para depois, quando você pedir.
- **A decidir (perguntar antes de fazer):**
  - Normal e Difícil começam liberadas, ou só depois de vencer a fase no modo anterior?
  - O limite de 5 por dia (item 2) é separado para cada dificuldade?
  - A recompensa muda conforme a dificuldade?

### 4. Aventura: fases num mapa com caminho pontilhado
- As fases deixam de ser uma lista de cartões e viram um **mapa**: cada fase é uma **bolinha**, ligada à seguinte por um **caminho pontilhado**.
- Em cima da bolinha de cada fase aparece o **Comandante**, um pouco acima da bolinha (sem encostar nela), com uma **faixa de luz nos pés** (dourada nas fases vencidas, azul na próxima, apagada nas bloqueadas) e **se movimentando** (respirando) como na batalha.
- A próxima fase fica em **azul** com a etiqueta **PRÓXIMA**; as vencidas ficam **douradas** com ✓ e o contador do dia (ex.: "3/5 hoje").
- Ao tocar numa fase vencida, abre uma janela com as informações e os botões **⚔ Jogar** e **⟲ Repetir** (sem texto explicativo entre parênteses).
- Protótipo (imagem e GIF) enviado na conversa de 26/10/2026, ainda em ajuste.
- Fases e caminhos começam **escuros** e vão **se iluminando** conforme o jogador vence as fases.
- **A decidir (perguntar antes de fazer):**
  - O Comandante em cima de cada bolinha é o **inimigo daquela fase** (cada fase com o seu) ou o **seu Bárbaro**, marcando onde você está?
  - Ao tocar numa bolinha, abre uma janela com as informações da fase e os botões **Jogar / Repetir** (e o contador "3/5")?
  - O caminho sobe na tela (fase 1 embaixo, como nos jogos de mapa) ou desce (fase 1 em cima)?

### 5. Tirar as explicações de dentro dos botões
- Botões ficam só com o nome da ação, sem texto explicativo (em parênteses ou em letra pequena).
- Encontrados no jogo hoje:
  - Base → **🔥 Treinar & Despertar** "Suba nível e evolua de cor" — explicação: **sai**.
  - Base → **⚔ Aventura** "Fase 4: Deserto Rubro" e **🃏 Coleção & Baralho** "11/13 personagens" — informação, não explicação: **a decidir**.
  - Detalhes da carta → aba da cor com **"(atual)"** — **a decidir**.
  - Treinar → **✨ Despertar para … (✴ 120)** — é o custo, não explicação: **a decidir**.
  - Coleção → filtro **🌟 Todos (13)** — é a contagem: **a decidir**.

## 💡 Ideias para o futuro (ainda sem data)

### Energia
- Uma **energia** que limita quantas vezes dá para jogar ou repetir. O jogador vai ter que escolher onde gastar.
- Quando a energia existir, ela pode substituir ou somar com o limite de 5 por fase.

### Equipamentos para ascender personagens, por fase
- **Diminuir os bônus** das recompensas atuais.
- Criar **equipamentos** que servem para **ascender (evoluir) personagens**.
- Cada equipamento cai em **fases diferentes**, então o jogador vai buscar uma **fase específica** para conseguir o que precisa (por isso o "Repetir" dá a recompensa inteira).

## 📋 Pendências técnicas (da análise do jogo)
- Unidade com Reflexo de Magia (Nyx) ainda devolve dano depois de derrotada.
- Feitiços contra inimigos acertam a qualquer distância (decisão de design a confirmar).
- Fases 2 e 3 estão com a dificuldade praticamente igual (89% e 90% de vitória no simulador).
- Servidor para o modo online: a verificação das partidas já existe (`verifyMatch`); falta o servidor, as contas online e conferir os baralhos.
- Organização do código: `battle.ts`, `battleView.ts` e `main.ts` estão grandes; testes separados por versão em vez de por assunto; sem ferramenta de lint.
- Ideias da proposta ainda não adotadas: habilidades em %, "Escudo" como reserva de pontos, bônus de nível, teto da Emboscada e a regra nova da Prole.
- Kenji e Vorax ainda bloqueados ("em breve") e o nível de perfil completo (fase 3 do plano).
