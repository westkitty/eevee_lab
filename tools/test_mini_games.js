const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const saved = {};
const save = {
  get(key, fallback) {
    const value = key.split('.').reduce((cur, part) => cur == null ? undefined : cur[part], saved);
    return value === undefined ? fallback : value;
  },
  set(key, value) {
    const parts = key.split('.'); let cur = saved;
    for (const part of parts.slice(0, -1)) cur = cur[part] = cur[part] || {};
    cur[parts[parts.length - 1]] = value; return value;
  }
};
const window = {};
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '..', 'src', 'mini-games.js'), 'utf8'), { window, Math, Object, Array, Number, String, Set });
const Suite = window.MiniGameSuite;
assert.equal(Suite.GAMES.length, 20, 'exactly twenty minigames are registered');
assert.equal(new Set(Suite.GAMES.map(g => g.id)).size, 20, 'game ids are unique');

function actUntilDone(system, max = 1600) {
  for (let i = 0; i < max && !system.getState().done; i++) {
    const s = system.getState();
    switch (s.kind) {
      case 'route': system.act(s.targets[s.step]); break;
      case 'forecast': system.act(s.pattern[3]); break;
      case 'timing': {
        if (Math.abs(s.phase - s.targets[s.step]) <= 0.095) system.act('hit');
        else system.update(0.02);
        break;
      }
      case 'mirror': {
        const step = s.target / 45;
        const direction = step <= 4 ? 'right' : 'left';
        const turns = step <= 4 ? step : 8 - step;
        const desired = (system.getState().angle / 45) % 8;
        const current = ((Math.round(desired) % 8) + 8) % 8;
        const signed = direction === 'right' ? ((step - current + 8) % 8) : ((current - step + 8) % 8);
        for (let j = 0; j < signed; j++) system.act(direction);
        system.act('align');
        break;
      }
      case 'aim': {
        const delta = Math.round((s.targetPower - s.power) / 5);
        for (let j = 0; j < Math.abs(delta); j++) system.act(delta > 0 ? 'more' : 'less');
        system.act('throw');
        break;
      }
      case 'sequence':
      case 'rhythm':
        if (s.phase === 'study') system.act('start');
        else system.act(s.pattern[s.selections.length]);
        break;
      case 'sort': {
        const bin = /shell/i.test(s.item.name) ? 0 : /glass|pebble/i.test(s.item.name) ? 1 : 2;
        system.act(bin); break;
      }
      case 'glyph':
        for (let i = 0; i < 3; i++) {
          const d = (s.glyphTargets[i] - s.glyphAngles[i] + 4) % 4;
          for (let j = 0; j < d; j++) system.act(`ring:${i}:right`);
        }
        system.act('align'); break;
      case 'gears':
        for (let i = 0; i < 3; i++) {
          const d = (s.gearTargets[i] - s.gearAngles[i] + 4) % 4;
          for (let j = 0; j < d; j++) system.act(`gear:${i}:right`);
        }
        system.act('catch'); break;
      case 'logic': system.act(s.clue.answer); break;
      case 'flight': system.act(s.lane); break;
      case 'seek': {
        const icons = ['a rain ripple','a moon glint','a leaf curl','a tide shell','a falling star','a tiny bell'];
        system.act(icons.indexOf(s.seekPrompt)); break;
      }
      case 'photo': system.submitPhoto({ score: 87, roomId: 'conservatory', form: 'eevee' }); break;
      case 'design':
        s.designTarget.forEach(cell => system.act({ value: 'toggle', cell }));
        system.act('submit'); break;
      case 'order': system.act(s.orderStep); break;
      default: throw new Error(`No solver for ${s.id}/${s.kind}`);
    }
  }
  return system.getState();
}

for (const game of Suite.GAMES) {
  const system = new Suite.MiniGameSystem(save, { onComplete: result => { assert.equal(result.id, game.id); } });
  assert(system.start(game.id, 'contract-seed').ok, `start ${game.id}`);
  const result = actUntilDone(system);
  assert(result.done, `${game.id} should finish from its rule set`);
  assert(result.won, `${game.id} should be solvable`);
  assert(saved.minigames.completed[game.id], `${game.id} win should persist`);
  assert(saved.minigames.highScores[game.id] >= 0, `${game.id} score should persist`);
}
assert.equal(saved.minigames.wins, 20);
const cups = new Suite.MiniGameSystem(save).getCups();
assert.equal(cups.reduce((total, cup) => total + cup.total, 0), 20, 'regional cups should cover every game exactly once');
assert.equal(cups.reduce((total, cup) => total + cup.wins, 0), 20, 'cup win totals should reflect saved completions');
const safari = new Suite.MiniGameSystem(null);
safari.start('photo-safari', 'photo-retry');
assert.equal(safari.submitPhoto({ score: 64 }).state.lives, 2, 'a weak photo should ask for a retry without ending the challenge');
const safariWin = safari.submitPhoto({ score: 65, roomId: 'conservatory' });
assert(safariWin.state.done && safariWin.state.won, 'a good camera capture should finish Photo Safari');
console.log('twenty minigame contracts and Photo Safari capture flow: PASS');
