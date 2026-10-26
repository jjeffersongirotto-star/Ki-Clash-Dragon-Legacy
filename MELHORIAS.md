# Melhorias futuras do Ki-Clash: Dragon Legacy

> Lista das ideias e pedidos de melhoria, para nada se perder entre as conversas.
> Quando um item for feito, ele sai daqui e vai para o [CHANGELOG.md](CHANGELOG.md) (e as regras para o [REGRAS.md](REGRAS.md)).

## 🔜 Próxima atualização (decidido, falta fazer)
Roteiro aprovado em 26/10/2026 (pergunta 23), uma versão por vez, cada uma com PR e merge:
1. ✅ **v0.21.0:** ⭐ estrelas por fase (3 objetivos) + Repetir só nas fases com 3 ⭐ + "raridade" no lugar de "cor" — feito (perguntas 24–25: estrelas por dificuldade; fases já vencidas começam com 1 ⭐).
2. **v0.22.0:** 🔮 Orbes por raridade (no lugar de 📜 e 💎) + XP por jogar.
3. **v0.23.0:** itens de ascensão + degraus "+"/"++" + carta sem nível numerado (a maior: conversão dos saves e simulação).
4. **v0.24.0:** energia (antes, perguntas sobre como ela funciona).

Antes de cada versão, perguntas só do que faltar decidir, uma por vez.

## ❓ A decidir (perguntas abertas)
- **Ajuste fino das dificuldades:** hoje Normal = +3 níveis e Difícil = +6 níveis nos inimigos, sem cartas trocadas, e a mesma recompensa nas três. Você vai dizer como ajustar (níveis, quais cartas trocar em cada fase, recompensa maior no Normal/Difícil?).
- **Liberação das dificuldades:** hoje o Normal abre ao vencer a fase 10 no Fácil (e o Difícil, a fase 10 no Normal). Manter assim?
- **Limite diário:** hoje é separado por dificuldade (5 no Fácil + 5 no Normal + 5 no Difícil, em cada fase). Manter assim?
- **Comandante em cima de cada fase:** hoje é o inimigo da fase (o minotauro em todas, porque as fases ainda usam a mesma arte). Quando houver Comandantes diferentes por fase, cada fase mostra o seu.
- **Informações dentro dos botões (não são explicações):** "Fase 4: Deserto Rubro" no ⚔ Aventura, "11/13 personagens" no 🃏 Coleção & Baralho, "(atual)" na aba da cor da carta, o custo "(✴ 120)" no ✨ Despertar e a contagem em 🌟 Todos (13). Tirar também?

## 💡 Ideias para o futuro (ainda sem data)

### Energia
- Uma **energia** que limita quantas vezes dá para jogar ou repetir. O jogador vai ter que escolher onde gastar.
- Quando a energia existir, ela pode substituir ou somar com o limite de 5 por fase.

### Itens de ascensão (decidido em 26/10/2026, ainda sem data)
_Respostas às perguntas 3 a 15. Substitui a ideia "Equipamentos para ascender personagens". Não é o equipamento do jogo original (que dava status ao líder; decisão 9 do plano continua valendo)._
- **Nome:** **itens de ascensão**. São de vários tipos: roupas (camisa, calça, gorro…), armas, diamantes e outros.
- **Gerais, não de um personagem só:** os itens são divididos por **grupo/tipo**, e cada personagem pede os **5 itens diferentes** que mais combinam com ele.
- **Cor do item:** cada item tem uma cor, mostrada **só no fundo do ícone**: **cinza, verde, azul, roxo, laranja**. Cada cor serve para subir a carta da sua cor para a seguinte:
  - Comum → Incomum: **cinza** · Incomum → Raro: **verde** · Raro → Épico: **azul** · Épico → Lendário: **roxo** · Lendário → Mítico: **laranja**.
- **Degraus de cada cor:** cor → **"+"** → **"++"** → próxima cor (o "++" é novo).
  - **"+"** pede **3 itens**, **"++"** pede **4 itens** e a **troca de cor** pede os **5 itens**, todos da cor da carta.
  - O Despertar continua gastando **Essências ✴** além dos itens.
- **Sem nível numerado na carta:** em cada degrau existe só uma **barra de XP**. Quando ela enche, a carta pode subir o degrau gastando os itens.
  - A barra de XP **só aparece na tela de Treinar**, para não poluir o visual.
- **Status:** ataque e vida sobem **só nos degraus e ao ascender**: "+" dá +10%, "++" mais +10% e a nova cor dá o bônus da cor (como hoje). Encher a barra de XP não aumenta status.
- **De onde vêm (atualizado na pergunta 21):** cada fase dá itens de **grupos diferentes** (não só de um grupo ou personagem), para não ficar fácil de evoluir; com a energia, o jogador vai escolher em quais fases jogar para conseguir os itens que precisa. Cai **1 item por vitória ou Repetir**, com a **cor sorteada pela dificuldade**:
  - **Fácil:** cinza 70% ou verde 30% · **Normal:** azul 70% ou roxo 30% · **Difícil:** roxo 70% ou laranja 30%.
- **De onde vem o XP (pergunta 16):** de **três fontes juntas**: Orbes (no Treinar), **cópias repetidas** do personagem (com chance de 1,5×, decisões 5 e 38 do plano) e **XP por jogar** (o personagem ganha XP nas batalhas).
- **Orbes 🔮 (pergunta 17):** o Orbe **substitui o 📜 Pergaminho e o 💎 Cristal**. Existe nas **6 raridades** (Comum, Incomum, Raro, Épico, Lendário, Mítico), cada uma com a sua cor, e dá **mais XP quanto mais rara**. Os Pergaminhos e Cristais que o jogador já tem viram Orbes.
- **Junto com isso:** diminuir os bônus das recompensas atuais.
- **A conferir quando for fazer:** isso muda a regra do plano "crescimento de ataque e vida fica como está" (hoje o status também sobe por nível) e as habilidades que melhoram no nível 20/25/30. Os saves antigos precisam de uma conversão (nível atual → barra de XP).

### Combinados de trabalho (26/10/2026)
- Depois que a CI passa, **eu mesmo faço o merge** do PR.
- O plano do Grok (38 decisões e perguntas abertas) está no repositório como **[PLANO.md](PLANO.md)**, sem os nomes da obra original e sem os caminhos do APK.
- Perguntas: **uma de cada vez**, com as opções **Sim / Não / Outros**.

## 📊 Simulação da economia da v0.20.0 (pergunta 19)
Vitória ao chegar em cada fase (fases 1 a 10), jogador simulado com a IA do Auto (`scripts/balance/v20.ts`, 300 jogadores):
- **Antes** (repetir dava 50%, só depois de perder): 93 · 89 · 90 · 81 · 79 · 76 · 70 · 68 · 65 · 62%.
- **v0.20.0** (5 Repetir de recompensa inteira antes de cada fase nova): 94 · **100** · **100** · **100** · **100** · **100** · **100** · **100** · **100** · **100**%. O jogador fica forte demais e a dificuldade some.
- Outras opções testadas (100 jogadores): 1 Repetir por dia com 100% → 93–99% em todas; 5 Repetir com 20% → 82–95%; 5 Repetir com 10% → 68–93% (parecido com antes).
- **Decisão (pergunta 21):** o Repetir **continua dando tudo**; o equilíbrio vai vir da **energia**, dos **itens espalhados em grupos diferentes** e do **Repetir só em fases com 3 ⭐**. Refazer a simulação quando isso existir.

## 📋 Pendências técnicas (da análise do jogo)
- A ⭐ de "vencer em até 15 turnos" pode ser difícil no começo (no Auto a fase 1 termina perto do turno 25–30). Rever no ajuste fino.
- ✅ ~~Reflexo de Magia (Nyx) devolvia dano depois de derrotada~~ — corrigido na v0.20.1.
- Feitiços contra inimigos acertam a qualquer distância (decisão de design a confirmar).
- Fases 2 e 3 estão com a dificuldade praticamente igual (89% e 90% de vitória no simulador).
- Servidor para o modo online: a verificação das partidas já existe (`verifyMatch`); falta o servidor, as contas online e conferir os baralhos.
- Organização do código: `battle.ts`, `battleView.ts` e `main.ts` estão grandes; testes separados por versão em vez de por assunto; sem ferramenta de lint.
- Ideias da proposta ainda não adotadas: habilidades em %, "Escudo" como reserva de pontos, bônus de nível, teto da Emboscada e a regra nova da Prole.
- Kenji e Vorax ainda bloqueados ("em breve") e o nível de perfil completo (fase 3 do plano).
