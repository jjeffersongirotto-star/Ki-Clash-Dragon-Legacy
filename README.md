# Ki-Clash: Dragon Legacy

Jogo de estratégia com cartas e **batalha automática em grade**, com personagens 100% originais inspirados no estilo dos animes. Roda no navegador do PC e do celular.

🎮 **Jogar:** https://jjeffersongirotto-star.github.io/Ki-Clash-Dragon-Legacy/

## Regras e novidades
- 📖 **[REGRAS.md](REGRAS.md)**: todas as regras do jogo (arena, alcance, categorias, estrelas, evolução, personagens).
- 📝 **[CHANGELOG.md](CHANGELOG.md)**: histórico de atualizações.

Resumo: arena 2×7 com heróis nas pontas, invocação nas 3 primeiras colunas, unidades andam e atacam sozinhas, corpo a corpo com alcance 1 e longo alcance com 3 (sempre na própria fileira, exceto as diagonais), passo à frente ao derrotar, cartas coloridas por estrela e 6 categorias (🛡️ ➕ ⚔️ 🪄 🏹 💀). Cada personagem tem uma faixa de estrelas (1–2★ → 4★, 3★ → 5★, 4–5★ → 6★; únicos de 5★ a 6★) e o visual evolui a cada estrela.

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

**Toda PR deve atualizar `REGRAS.md` e `CHANGELOG.md`.** A CI falha se algum dos dois não for alterado.
