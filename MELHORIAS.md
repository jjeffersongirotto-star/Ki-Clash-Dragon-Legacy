# Melhorias futuras do Ki-Clash: Dragon Legacy

> Lista das ideias e pedidos de melhoria, para nada se perder entre as conversas.
> Quando um item for feito, ele sai daqui e vai para o [CHANGELOG.md](CHANGELOG.md) (e as regras para o [REGRAS.md](REGRAS.md)).

## 🔜 Próxima atualização (decidido, falta fazer)
_Nada pendente. Os itens 1 a 9 entraram na v0.20.0 (ver [CHANGELOG.md](CHANGELOG.md))._

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
- **De onde vêm:** cada fase dá **sempre o mesmo item** (sem sorteio do tipo). Cai **1 item por vitória ou Repetir**, com a **cor sorteada pela dificuldade**:
  - **Fácil:** cinza 70% ou verde 30% · **Normal:** azul 70% ou roxo 30% · **Difícil:** roxo 70% ou laranja 30%.
- **De onde vem o XP (pergunta 16):** de **três fontes juntas**: Orbes (no Treinar), **cópias repetidas** do personagem (com chance de 1,5×, decisões 5 e 38 do plano) e **XP por jogar** (o personagem ganha XP nas batalhas).
- **Orbes 🔮 (pergunta 17):** o Orbe **substitui o 📜 Pergaminho e o 💎 Cristal**. Existe nas **6 raridades** (Comum, Incomum, Raro, Épico, Lendário, Mítico), cada uma com a sua cor, e dá **mais XP quanto mais rara**. Os Pergaminhos e Cristais que o jogador já tem viram Orbes.
- **Junto com isso:** diminuir os bônus das recompensas atuais.
- **A conferir quando for fazer:** isso muda a regra do plano "crescimento de ataque e vida fica como está" (hoje o status também sobe por nível) e as habilidades que melhoram no nível 20/25/30. Os saves antigos precisam de uma conversão (nível atual → barra de XP).

### "Raridade" no lugar de "cor" (pergunta 18)
- Em todo o jogo (telas, REGRAS e textos), quando falar das cartas, usar **raridade** em vez de **cor** (ex.: "evolui de raridade", "raridade atual"). As cores continuam no visual; só o nome muda.

### Combinados de trabalho (26/10/2026)
- Depois que a CI passa, **eu mesmo faço o merge** do PR.
- O plano do Grok (38 decisões e perguntas abertas) vai para o repositório como **`PLANO.md`**, sem nomes de Dragon Ball e sem os caminhos do APK.
- Perguntas: **uma de cada vez**, com as opções **Sim / Não / Outros**.

## 📋 Pendências técnicas (da análise do jogo)
- Unidade com Reflexo de Magia (Nyx) ainda devolve dano depois de derrotada.
- Feitiços contra inimigos acertam a qualquer distância (decisão de design a confirmar).
- Fases 2 e 3 estão com a dificuldade praticamente igual (89% e 90% de vitória no simulador).
- Servidor para o modo online: a verificação das partidas já existe (`verifyMatch`); falta o servidor, as contas online e conferir os baralhos.
- Organização do código: `battle.ts`, `battleView.ts` e `main.ts` estão grandes; testes separados por versão em vez de por assunto; sem ferramenta de lint.
- Ideias da proposta ainda não adotadas: habilidades em %, "Escudo" como reserva de pontos, bônus de nível, teto da Emboscada e a regra nova da Prole.
- Kenji e Vorax ainda bloqueados ("em breve") e o nível de perfil completo (fase 3 do plano).
