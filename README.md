# Ki-Clash: Dragon Legacy

Jogo de estratégia com cartas e **batalha automática em grade**, com personagens 100% originais inspirados no estilo dos animes. Roda no navegador do PC e do celular.

🎮 **Jogar:** https://jjeffersongirotto-star.github.io/Ki-Clash-Dragon-Legacy/

## Como funciona
- Campo de 5 fileiras × 9 colunas. Seu herói fica à esquerda, o inimigo à direita.
- A cada turno você ganha energia (3 no início, +1 por turno, máx. 10) e invoca cartas nas 2 colunas da sua zona.
- Ao tocar em **LUTAR**, as unidades agem sozinhas: atacam se houver alvo no alcance, senão andam 2 casas e tentam atacar.
- Alcance básico 2; longo alcance +2 (e não avança se puder atacar). Ninguém atravessa inimigos, exceto quem tem Salto.
- Dano físico/mágico com resistências (ex.: resistência física 1 transforma 3 de dano físico em 2).
- Vença zerando a vida do herói inimigo.
- Raridades: Comum, Incomum, Raro, Épico, Lendário e Mítico. Estrelas de 1★ a 6★.
- Treino: alimente itens de XP para encher a barra; em 100% sobe de nível (cada nível pede mais XP). No nível máximo, desperte (+1★) com Essências.
- Progresso salvo no navegador (localStorage).

## Personagens
| Personagem | Raridade | Estrelas | Habilidade |
|---|---|---|---|
| Riku Vendaval | Comum | 1–4★ | Salto Vendaval: pula por cima de uma unidade (2 casas) |
| Nara Lâmina-Lunar | Incomum | 1–4★ | Corte Diagonal: ataca nas diagonais à frente |
| Toru Sombra-Reversa | Incomum | 1–5★ | Golpe Reverso: ataca nas diagonais para trás |
| Aiko Flecha-Celeste | Raro | 2–5★ | Longo Alcance (+2) |
| Lyra Olho-de-Falcão | Raro | 2–5★ | Tiro Perfurante: ataca o último inimigo da fileira (mágico) |
| Gorath Muralha-de-Ferro | Raro | 2–5★ | Resistência física 2, Inabalável |
| Yume Caçadora | Épico | 3–5★ | Instinto Predador: ataca o inimigo com menos vida |
| Zarek do Eclipse | Épico | 3–5★ | Emboscada: ataca a retaguarda inimiga |
| Kenji Punho-Espelhado | Lendário | 4–6★ | Contra-golpe em dobro + empurrão contra ataques físicos de frente |
| Nyx-07 | Lendário | 4–5★ | Sifão de Energia: -1 de ataque em todos os inimigos (mágico, longo alcance) |
| Vorax | Mítico | 4–6★ | Prole Sombria: ao derrotar, gera Crias Sombrias que também se multiplicam |

## Desenvolvimento
```bash
npm install
npm run dev     # servidor local
npm test        # testes das regras de combate (vitest)
npm run build   # gera dist/
```

Estrutura:
- `src/core/` — regras puras do jogo (batalha, habilidades, IA, progressão, campanha), sem DOM, prontas para rodar num servidor no futuro modo online.
- `src/ui/` — telas, retratos SVG procedurais, animações e save.
- `tests/` — testes das regras.

Deploy automático no GitHub Pages a cada push na `main` (`.github/workflows/deploy.yml`).
