import './ui/style.css';
import { getChar, PLAYABLE } from './core/characters';
import { STAGES } from './core/campaign';
import { isSpell } from './core/spells';
import { warmLeader, warmPortraits } from './ui/art';
import { installPerfGuards } from './ui/perf';
import { installLandscape } from './ui/orientation';
import { migrateV17 } from './ui/save';
import { app, save } from './app/state';
import { bakeAllGrid } from './app/ui';
import { home } from './app/home';

// garante que o save tem todos os campos e personagens válidos
migrateV17(save);
installPerfGuards(app);
installLandscape();
home();
void bakeAllGrid();
warmLeader();
warmPortraits([
  ...PLAYABLE.map((def) => ({ def, stars: save.cards[def.id]?.stars ?? def.minStars })),
  // miniaturas dos inimigos da Aventura
  ...STAGES.flatMap((st) => st.enemyDeck.filter((c) => !isSpell(c.charId)).map((c) => ({ def: getChar(c.charId), stars: c.stars, layers: ['all' as const] }))).filter((x, i, a) => a.findIndex((y) => y.def.id === x.def.id && y.stars === x.stars) === i),
]);
