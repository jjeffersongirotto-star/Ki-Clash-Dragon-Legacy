# Ki-Clash: Dragon Legacy

Jogo de estratégia com cartas e **batalha automática em grade**, com personagens 100% originais inspirados no estilo dos animes. Roda no navegador do PC e do celular.

🎮 **Jogar:** https://jjeffersongirotto-star.github.io/Ki-Clash-Dragon-Legacy/

## Regras e novidades
- 📖 **[REGRAS.md](REGRAS.md)**: todas as regras do jogo (arena, alcance, categorias, cores com "+", evolução, personagens).
- 📝 **[CHANGELOG.md](CHANGELOG.md)**: histórico de atualizações.
- 💡 **[MELHORIAS.md](MELHORIAS.md)**: melhorias planejadas e ideias para o futuro.

Resumo (v0.20.0): baralho de 20 a 40 cartas (1 a 3 cópias de cada carta; o máximo cresce com o nível de perfil) com mão de 6 e compra semi-aleatória; arena 2 × 12 com Comandantes nas pontas e invocação nas 3 primeiras colunas de cada lado; no lugar da energia, cada carta espera **2 × custo − 1** rodadas na mão antes de poder ser invocada; unidades andam e atacam sozinhas, corpo a corpo só na casa da frente e longo alcance até 4 casas (sempre na própria fileira, exceto as habilidades diagonais e laterais); quem derrota um inimigo fica onde está; 13 feitiços que precisam de um conjurador da categoria em campo (a IA inimiga também usa); Aventura em mapa com 3 dificuldades (Fácil, Normal, Difícil) e limite de 5 vitórias/repetições por dia em cada fase; efeitos com duração (veneno, queimadura, atordoado, escudo); cartas por cor/raridade (Comum cinza, Incomum verde, Raro azul, Épico roxo, Lendário laranja, Mítico vermelho), cada cor com um degrau "+", e 6 categorias (🛡️ ➕ ⚔️ 🪄 🏹 💀). Cada personagem tem uma faixa de cores (Comum/Incomum → Épico+, Raro → Lendário+, Épico/Lendário → Mítico+) e o visual (roupa, cenário de fundo próprio e moldura da carta) evolui a cada cor; o "+" dá só um pequeno bônus de status.

## Android (APK)
📱 **Baixar:** página de [Releases](https://github.com/jjeffersongirotto-star/Ki-Clash-Dragon-Legacy/releases/latest) → arquivo `Ki-Clash-<versão>.apk`. No celular, abra o arquivo e permita instalar apps dessa fonte. Uma versão nova instala por cima da antiga e mantém o progresso. Dentro do jogo, o botão redondo **⟳** (canto superior direito da Base) procura atualização e baixa o APK novo.

O app é o mesmo jogo web empacotado com o [Capacitor](https://capacitorjs.com/) (pasta `android/`), em tela cheia. A cada push na `main`, a CI (`.github/workflows/android.yml`) gera o APK e o publica em Releases.

**Assinatura:** a chave do app é **privada** e nunca vai para o repositório. A CI a lê dos segredos do repositório `KICLASH_KEYSTORE_BASE64` (o arquivo da chave em base64) e `KICLASH_KEYSTORE_PASSWORD`; sem eles, o APK sai com a chave de depuração e não é publicado. Guarde uma cópia da chave: sem ela, uma versão nova não instala por cima da antiga.

Para gerar no computador: JDK 21 + Android SDK (`ANDROID_HOME`), as variáveis `KICLASH_KEYSTORE` (caminho da chave) e `KICLASH_KEYSTORE_PASSWORD`, e `npm run android` (o APK sai em `android/app/build/outputs/apk/release/`). Ícones e telas de abertura: `python3 scripts/android/icons.py`.

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
