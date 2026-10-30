/**
 * Como jogar.
 * v0.28.1: separado do main.ts (organização do código, sem mudar o jogo).
 */
import { CATEGORY_INFO, RACE_INFO, STAR_COLORS } from '../core/characters';
import { TIER_NAMES } from '../core/progression';
import { ico } from '../ui/icons';
import { catIcon, goldHTML, essIcon, raceIcon } from '../ui/components';
import { leaveBattleMode } from '../ui/orientation';
import { ENERGY_COST } from '../core/profile';
import { COLS, ROWS } from '../core/battle';
import { app } from './state';
import { topbar, bindNav } from './ui';

// ---------------- AJUDA ----------------
export function help() {
  leaveBattleMode();
  app.innerHTML = `<div class="screen">${topbar('Como jogar')}
  <div class="help">
    <h3>Objetivo</h3><p>A arena tem <b>${ROWS} fileiras × ${COLS} colunas</b>. Cada Comandante fica posicionado nas extremidades da arena. Zere a vida do <b>Comandante inimigo</b> (à direita) antes que ele zere a sua.</p>
    <h3>Raças e Origens Anime</h3><ul>${Object.entries(RACE_INFO).map(([k, r]) => `<li><b>${raceIcon(k)} ${r.label}</b> — ${r.desc}</li>`).join('')}</ul>
    <h3>Seu turno</h3><ol>
      <li>Na batalha, as cartas não gastam energia: cada carta da mão tem uma <b>contagem de rodadas ⏳</b> (o número na gota). Ela começa em <b>2 × custo − 1</b> (3, 5, 7, 9 ou 11), cai 1 no início de cada turno seu e a carta só pode ser invocada quando chega a <b>0</b> — dá para invocar <b>todas</b> as prontas no mesmo turno. A mão inicial começa 2 rodadas adiantada. Depois, você compra <b>as cartas que faltarem para a mão voltar a ter 6</b>.</li>
      <li>Toque numa carta e em qualquer casa brilhante da sua zona (<b>as 3 primeiras colunas do seu lado</b>, 6 casas) para invocá-la como um lutador de corpo inteiro na arena.</li>
      <li>Toque em <b>LUTAR</b> (ou ligue o modo <b>Auto</b>): seus personagens caminham (<b>MOVE</b>), saltam, disparam feixes de Ki ou golpes corpo a corpo (<b>HIT</b>), sofrem dano e vão para a <b>Necropolis</b> quando derrotados.</li></ol>
    <h3>Cartas e baralho</h3><ul>
      <li>Cada carta (personagem ou <b>feitiço ✦</b>) entra no baralho com <b>1 a 3 cópias</b> (botões − / + em Coleção & Baralho). O baralho precisa ter de <b>20</b> até <b>28 + 2 × nível de perfil</b> cartas (30 no nível 1, 40 no nível 6+) e pelo menos 1 personagem.</li>
      <li><b>Feitiços ✦:</b> esperam <b>custo − 1</b> rodadas e precisam de um <b>aliado da categoria em campo</b> (o de maior ataque conjura; a força vem do ataque dele). Toque no feitiço e numa casa <b>roxa</b>. Depois de lançado, volta para o Baralho. Os feitiços são cartas colecionáveis (Comum a Épico): vêm do ${ico('banner', '🎴')} Banner, da 1ª vitória das fases 2, 5 e 8 de cada região e do tutorial; o baralho usa até 3 cópias, só as que você tem.</li>
      <li>A <b>mão tem 6 cartas</b>. Você começa com 6 diferentes e, a cada rodada, <b>compra o que faltar para voltar a 6</b> (jogou 3, compra 3; com a mão cheia, não compra). Cartas não usadas ficam na mão.</li>
      <li>À esquerda da mão fica o <b>Baralho</b> (quantas cartas ainda podem vir); à direita, a <b>Necropolis (Derrotadas)</b>.</li>
      <li>A carta jogada vira unidade em campo. Quando a unidade <b>morre</b>, aquela cópia vai para a <b>Necropolis</b> e só volta com Necromancia (Vorax) ou o feitiço Chamado da Necropolis.</li>
      <li><b>Compra semi-aleatória:</b> depois de comprada, a carta fica <b>bloqueada nas 6 compras seguintes</b>; na <b>7ª, 8ª e 9ª</b> pode vir no sorteio e na <b>10ª vem garantida</b>. Conta a partir da compra, não de quando você joga.</li>
      <li><b>Começo da luta:</b> as 6 cartas da mão inicial voltam ao sorteio já na <b>5ª compra</b> (só restam 4 outras) e ficam garantidas na 8ª.</li>
      <li>Todas as cartas compradas na mesma rodada contam como <b>uma compra só</b>. Se várias cartas ficarem garantidas ao mesmo tempo, saem <b>em fila</b>; uma compra de 3 cartas atende até 3 garantias.</li></ul>
    <h3>Como as unidades agem na Arena</h3><ul>
      <li>Se houver alvo no alcance, atacam. Senão, <b>caminham até 2 casas (MOVE)</b> e tentam atacar.</li>
      <li><b>Só a própria fileira:</b> ninguém ataca a outra fileira, exceto Corte Diagonal (Nara), Golpe Reverso (Toru) e a Explosão de Brasas (Kael). A cura de Mei e o Tambor de Guerra (Tobi) também alcançam vizinhos da outra fileira.</li>
      <li><b>Corpo a corpo:</b> só atinge o inimigo na casa <b>logo à frente</b> (atacar a 2 casas fica para habilidades) com animação de investida e corte de energia (<b>HIT!</b>).</li>
      <li><b>Longo alcance (Magos 🪄, Arqueiros 🏹 e Suportes à distância):</b> atinge o inimigo <b>mais próximo até 4 casas à frente</b> disparando feixes de Ki ou flechas energéticas e não avança se puder atacar.</li>
      <li><b>Passam pelos aliados</b> ao caminhar, mas só param em casa livre (ninguém termina em casa ocupada). <b>Inimigos bloqueiam.</b> O <b>Riku</b> (Salto Vendaval) se move <b>sempre saltando para a 3ª casa</b> (2ª ou 1ª se estiver ocupada), por cima de quem estiver no caminho, e ataca com bônus ao cair.</li>
      <li><b>Ao derrotar um inimigo</b>, a unidade <b>fica onde está</b>.</li>
      <li><b>Ordem de ação:</b> quem tem <b>Vigia 👁</b> age antes; depois quem está mais à frente; na <b>mesma coluna, a fileira de cima age antes</b>. <b>Atordoado 💫</b> perde a ação.</li>
      <li><b>O Comandante inimigo</b> conta como uma unidade parada logo depois da última coluna, alcançável pelas duas fileiras.</li></ul>
    <h3>Fúria de batalha 🔥</h3><p>A partir do <b>turno 8</b>, todas as unidades dos dois lados ganham <b>+1 de ataque a cada 3 turnos</b>, para a luta não travar. Se chegar ao turno 40, vence quem tiver mais vida (em %) no Comandante.</p>
    <h3>Dano e efeitos</h3><p><b>Físico 👊</b> é reduzido pela resistência física; <b>Mágico ✨</b> pela resistência mágica (resistência só vem de habilidades). Ex.: 3 de dano físico contra resistência 1 = 2 de dano.</p>
    <p>Selos no lutador: <b>🧪 veneno</b> (dano por rodada, ignora resistência), <b>🔥 queimadura</b>, <b>💫 atordoado</b>, <b>🛡 escudo</b> (absorve antes da vida), <b>👼 Anjo da Guarda</b>, <b>🥁</b> recebendo o Tambor e <b>🌀</b> drenado pelo Sifão.</p>
    <h3>Raridades das cartas e Despertar</h3><p>${[1, 2, 3, 4, 5, 6].map((n) => `<span class="rar-chip" style="--rc:${STAR_COLORS[n].color}">${TIER_NAMES[n]} (${STAR_COLORS[n].label})</span>`).join(' ')}</p>
    <p>A <b>raridade da carta</b> (mostrada pela cor) é o tier do personagem. A carta <b>não tem nível</b>: cada raridade tem três degraus, <b>base</b>, <b>"+"</b> e <b>"++"</b> (ex.: Raro → <b>Raro+</b> → <b>Raro++</b> → Épico). O degrau aparece na estrela dourada da carta.</p>
    <p>Cada degrau tem uma <b>barra de XP</b> (vista só em <b>Treinar</b>). A barra enche com <b>Orbes 🔮</b> e com o <b>XP por jogar</b>. Com a barra cheia, o <b>Despertar</b> sobe o degrau gastando <b>Essências ${essIcon()}</b> e <b>itens de ascensão 🎒</b> (3 no "+", 4 no "++" e 5 na nova raridade; 1 / 2 / 3 deles da raridade um acima da carta e 2 da raridade dela; cada fase dá 3 itens). Cada degrau dá <b>+17% de ataque e de vida</b>; encher a barra não aumenta os status. <b>Habilidades, roupa, armadura, armas e aura de Ki</b> evoluem quando a <b>raridade muda</b>.</p>
    <h3>Poder ⚡ e Comandante 👑</h3><p>Cada carta tem um <b>Poder</b> que sobe com a raridade e o degrau ("+" e "++"), com um bônus pela habilidade do personagem. O <b>Poder do baralho</b> é a soma dos personagens do baralho (cada um uma vez). Em <b>Coleção & Baralho</b>, quando o Poder do baralho alcança o requisito, toque em <b>Evoluir</b> no painel do Comandante: cada nível dá <b>+10 de vida máxima</b> (20 → 110). O Poder só é conferido na hora de evoluir — trocar cartas depois <b>nunca</b> tira o nível do Comandante. Os Comandantes inimigos também ficam mais resistentes a cada fase.</p>
    <h3>Energia ⚡, nível de perfil 👤 e Ouro de Dragão ${goldHTML()}</h3><ul>
      <li><b>Jogar ou Repetir</b> uma fase gasta energia: <b>Fácil ${ENERGY_COST.facil} · Normal ${ENERGY_COST.normal} · Difícil ${ENERGY_COST.dificil}</b>. Na batalha ela é gasta ao começar (a derrota também gasta). O tutorial é grátis.</li>
      <li>A energia <b>recupera 1 a cada 6 minutos</b> até o máximo do seu nível de perfil (nível 1 = 20 … nível 100 = 300).</li>
      <li>O <b>nível de perfil</b> sobe com XP de perfil: <b>1 por energia gasta</b> e mais um bônus a cada vitória ou Repetir (em dobro na primeira vitória). Ao subir de nível, você <b>ganha a energia máxima do nível novo</b>, que pode passar do máximo. O nível também aumenta o tamanho do baralho.</li>
      <li>Cada vitória ou Repetir dá <b>Ouro de Dragão</b> (mais nas fases altas e nas dificuldades difíceis; em dobro na primeira vitória). Gaste na <b>🏪 Loja</b> em itens de ascensão, Orbes e cartas do <b>${ico('banner', '🎴')} Banner</b> (personagem repetido vira mais 1 cópia: o baralho usa até 3 de cada, e as sobras você desmancha em XP no <b>🎒 Inventário</b>).</li></ul>
    <h3>Categorias (ícone no canto da carta)</h3><ul>${Object.entries(CATEGORY_INFO).map(([k, c]) => `<li><b>${catIcon(k)} ${c.label}</b> — ${c.desc}</li>`).join('')}</ul>
  </div></div>`;
  bindNav();
}
