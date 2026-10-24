# Ki-Clash: Dragon Legacy

Jogo de estratégia com cartas e **batalha automática em grade**, com personagens 100% originais inspirados no estilo dos animes. Roda no navegador do PC e do celular.

🎮 **Jogar:** https://jjeffersongirotto-star.github.io/Ki-Clash-Dragon-Legacy/

## Como funciona
- Arena de **2 fileiras × 7 colunas**. Cada herói fica logo depois da última coluna do seu lado.
- A cada turno você ganha energia (3 no início, +1 por turno, máx. 10), compra **exatamente 1 carta** e invoca nas **3 primeiras colunas** do seu lado (a IA usa as 3 do lado dela).
- Cartas não usadas ficam na mão (até 6). Carta usada volta na hora ao fim do baralho e pode ser comprada de novo — o mesmo personagem pode estar em campo mais de uma vez.
- Ao tocar em **LUTAR**, as unidades agem sozinhas: atacam se houver alvo, senão andam 2 casas e tentam atacar.
- **Corpo a corpo:** só a casa logo à frente (alcance 1). **Longo alcance:** até 2 casas à frente; não avança se puder atacar.
- **Herói = unidade numa coluna virtual** logo após a arena, alcançável pelas duas fileiras. Sem unidade inimiga para enfrentar, todos atacam o herói com o próprio alcance: corpo a corpo da última coluna; alcance 2 (Aiko, Nyx, Crias, Lyra, Zarek, Yume) da penúltima.
- **Miras especiais** só enxergam até 2 colunas à frente; **diagonais** só a casa diagonal adjacente.
- Ninguém atravessa inimigos, exceto quem tem Salto.
- Dano físico/mágico com resistências (ex.: resistência física 1 transforma 3 de dano físico em 2).
- **Fúria de batalha:** a partir do turno 8 todas as unidades ganham +1 de ataque a cada 3 turnos (evita empates travados). Limite de 40 turnos.
- Vença zerando a vida do herói inimigo. Raridades: Comum, Incomum, Raro, Épico, Lendário e Mítico. Estrelas de 1★ a 6★.
- Treino: itens de XP enchem a barra; em 100% sobe de nível (cada nível pede mais XP). No nível máximo, desperte (+1★) com Essências.
- Progresso salvo no navegador (localStorage).

## Personagens
| Personagem | Raridade | Estrelas | Habilidade |
|---|---|---|---|
| Riku Vendaval | Comum | 1–4★ | Salto Vendaval: pula por cima de uma unidade (2 casas) |
| Nara Lâmina-Lunar | Incomum | 1–4★ | Corte Diagonal: ataca nas diagonais à frente |
| Toru Sombra-Reversa | Incomum | 1–5★ | Golpe Reverso: ataca nas diagonais para trás |
| Aiko Flecha-Celeste | Raro | 2–5★ | Longo Alcance: até 2 casas à frente |
| Lyra Olho-de-Falcão | Raro | 2–5★ | Tiro Perfurante: ataca o inimigo mais distante da fileira, até 2 casas (mágico) |
| Gorath Muralha-de-Ferro | Raro | 2–5★ | Resistência física 2, Inabalável |
| Yume Caçadora | Épico | 3–5★ | Instinto Predador: ataca o de menos vida até 2 colunas à frente |
| Zarek do Eclipse | Épico | 3–5★ | Emboscada: ataca o mais recuado até 2 colunas à frente |
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
