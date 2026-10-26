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
