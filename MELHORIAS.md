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
