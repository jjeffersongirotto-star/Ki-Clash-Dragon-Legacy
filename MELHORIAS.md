# Melhorias futuras do Ki-Clash: Dragon Legacy

> Só o que **ainda não foi feito**. Quando um item entra no jogo, ele sai daqui e vai para o [CHANGELOG.md](CHANGELOG.md) (e as regras para o [REGRAS.md](REGRAS.md)).
> Novos itens só entram aqui quando o jogador pedir.

## 🕓 Para depois (decidido)
- **Novas fases e novas cartas:** serão criadas no futuro. Os banners (`BANNERS` em `src/core/banner.ts`) já estão prontos para receber cartas novas.
- **Progressão e dificuldades:** o Normal (+1 degrau) e o Difícil (+2 degraus) ficam como estão. Depois que todas as fases existirem, refazer a progressão completa.
- **Arte própria do Comandante de cada fase:** hoje cada fase usa a arte de um personagem do baralho dela (minotauro só na fase 10).
- **Modo online:** a conferência das partidas já existe (`verifyMatch`); faltam o servidor e as contas online.

- **Locais do hub em breve (🔒):** Torre, Invasão de Chefe, Arena, Masmorra em Dupla, Santuário dos 7 Diamantes, Praça de Eventos e Mina de Cristais — hoje só abrem "Em breve".
- **Arte do hub:** Aventura, Coleção & Baralho, Torre e Invasão de Chefe ainda usam a arte do 1º pacote; caminhante, dragão, faíscas de ki e quadros de animação dos prédios ainda não estão no jogo.

## 💡 Ideias anotadas (ainda sem data)
- **Tipo do personagem com função — bônus de equipe:** ter 3 ou mais personagens do mesmo tipo (Humano, Extraterrestre, Monstro, Mago Arcano, Androide, Necromante) no baralho dá um bônus pequeno a eles (ex.: 3 Androides = +5% de vida para os Androides). Hoje o tipo é só visual e filtro da Coleção.
- **Tipo do personagem nos objetivos:** objetivos de estrela ou missões ligados ao tipo (ex.: "vencer com 3 Humanos no baralho").
