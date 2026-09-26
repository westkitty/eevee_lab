/* ============================================================================
   MINI-GAME SUITE — twenty small, replayable games using one accessible shell.
   State is deterministic when given a seed; saves contain scores, never scenes.
   ============================================================================ */
(function (global) {
  'use strict';

  const GAMES = Object.freeze([
    { id: 'current-keeper', title: 'Current Keeper', region: 'Tideglass Grotto', regionId: 'home', kind: 'route', icon: '💧', description: 'Guide the current through four gates.' },
    { id: 'storm-relay', title: 'Storm Relay', region: 'Storm Relay', regionId: 'home', kind: 'circuit', icon: '⚡', description: 'Complete a safe four-node circuit.' },
    { id: 'hearthbeat', title: 'Hearthbeat', region: 'Ember Den', regionId: 'home', kind: 'timing', icon: '🔥', description: 'Tap when the warmth marker enters the hearth.' },
    { id: 'hourglass-forecast', title: 'Hourglass Forecast', region: 'Hourglass Observatory', regionId: 'home', kind: 'forecast', icon: '🔮', description: 'Read the pattern and predict what happens next.' },
    { id: 'moonbeam-garden', title: 'Moonbeam Garden', region: 'Moon Garden', regionId: 'home', kind: 'mirror', icon: '🌙', description: 'Turn the moon mirror toward three flowers.' },
    { id: 'pollinator-path', title: 'Pollinator Path', region: 'Overgrown Glasshouse', regionId: 'home', kind: 'route', icon: '🌱', description: 'Follow the blooming path to the right flower.' },
    { id: 'glacier-curl', title: 'Glacier Curl', region: 'Frost Gallery', regionId: 'home', kind: 'aim', icon: '❄️', description: 'Set your push and slide a crystal into the target.' },
    { id: 'ribbon-unspool', title: 'Ribbon Unspool', region: 'Ribbon Hall', regionId: 'home', kind: 'order', icon: '🎀', description: 'Untangle the ribbon by lifting the loops in order.' },
    { id: 'stone-memory', title: 'Stone Memory', region: 'Conservatory', regionId: 'home', kind: 'sequence', icon: '💎', description: 'Remember and repeat the glowing stone pattern.' },
    { id: 'lighthouse-optics', title: 'Lighthouse Optics', region: 'Tidewild Coast', regionId: 'tidewild', kind: 'mirror', icon: '🔦', description: 'Aim the lens through three mirror angles.' },
    { id: 'tidepool-sort', title: 'Tidepool Sort', region: 'Tidewild Coast', regionId: 'tidewild', kind: 'sort', icon: '🐚', description: 'Sort five beach finds into their tide pools.' },
    { id: 'pilgrim-glyph-wheel', title: 'Pilgrim Glyph Wheel', region: 'Emberpeak Ruins', regionId: 'emberpeak', kind: 'glyph', icon: '🗿', description: 'Turn the stone wheel until the glyphs align.' },
    { id: 'capsule-claw', title: 'Capsule Claw', region: 'Neon Undercity', regionId: 'undercity', kind: 'timing', icon: '🕹️', description: 'Release the arcade claw in the prize window.' },
    { id: 'last-train-dispatch', title: 'Last Train Dispatcher', region: 'Neon Undercity', regionId: 'undercity', kind: 'route', icon: '🚇', description: 'Route four trains to their matching platform.' },
    { id: 'neon-karaoke', title: 'Neon Karaoke', region: 'Neon Undercity', regionId: 'undercity', kind: 'rhythm', icon: '🎤', description: 'Repeat a short, no-microphone rhythm.' },
    { id: 'clocktower-gears', title: 'Clocktower Gear Catch', region: 'Starfall Dreamway', regionId: 'dreamway', kind: 'gears', icon: '⚙️', description: 'Align three gears to catch the falling minutes.' },
    { id: 'unwritten-library', title: 'Unwritten Library', region: 'Starfall Dreamway', regionId: 'dreamway', kind: 'logic', icon: '📚', description: 'Use a clue to return each book to its shelf.' },
    { id: 'seedling-flight', title: 'Seedling Flight', region: 'Starfall Dreamway', regionId: 'dreamway', kind: 'flight', icon: '🌬️', description: 'Steer a seed through five changing gusts.' },
    { id: 'photo-safari', title: 'Photo Safari', region: 'Any habitat', regionId: 'current', kind: 'photo', icon: '📷', description: 'Compose a creature portrait with a strong Moment score.' },
    { id: 'habitat-makeover', title: 'Habitat Makeover', region: 'Any habitat', regionId: 'current', kind: 'design', icon: '🪴', description: 'Match a tiny garden plan with limited tiles.' }
  ]);

  const TOKENS = Object.freeze(['🔵', '🟡', '🟢', '🔴']);
  const ROUTE_CHOICES = Object.freeze(['Left', 'Center', 'Right']);
  const ITEMS = Object.freeze([
    { name: 'Striped shell', bin: 0 }, { name: 'Sea glass', bin: 1 }, { name: 'Round shell', bin: 0 },
    { name: 'Driftwood bead', bin: 2 }, { name: 'Blue pebble', bin: 1 }
  ]);

  function hashSeed(text) {
    let h = 2166136261;
    for (let i = 0; i < String(text).length; i++) {
      h ^= String(text).charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function seededRandom(seed) {
    let state = seed >>> 0 || 1;
    return function () {
      state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
      return state / 4294967296;
    };
  }

  function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }

  class MiniGameSystem {
    constructor(save, options) {
      this.save = save || null;
      this.options = options || {};
      this.run = null;
    }

    list() { return GAMES.slice(); }
    getCups() {
      const labels = { home: 'Conservatory Cup', tidewild: 'Tidewild Cup', emberpeak: 'Emberpeak Cup', undercity: 'Undercity Cup', dreamway: 'Dreamway Cup', current: 'Any-habitat Cup' };
      const groups = [];
      GAMES.forEach(game => {
        let cup = groups.find(item => item.regionId === game.regionId);
        if (!cup) { cup = { regionId: game.regionId, title: labels[game.regionId] || game.region, total: 0, wins: 0, bestPoints: 0 }; groups.push(cup); }
        cup.total++;
        if (this.save) {
          if (this.save.get(`minigames.completed.${game.id}`, false)) cup.wins++;
          cup.bestPoints += Number(this.save.get(`minigames.highScores.${game.id}`, 0)) || 0;
        }
      });
      return groups;
    }
    get running() { return !!(this.run && !this.run.done); }
    get activeId() { return this.run ? this.run.id : null; }

    start(id, seed) {
      const def = GAMES.find(g => g.id === id);
      if (!def) return { ok: false, reason: 'unknown-game' };
      const runSeed = seed == null ? hashSeed(id + ':' + Date.now() + ':' + Math.random()) : hashSeed(id + ':' + seed);
      const random = seededRandom(runSeed);
      const run = {
        id, seed: runSeed, kind: def.kind, done: false, won: false,
        score: 0, lives: 3, step: 0, total: 0, streak: 0,
        elapsed: 0, phase: 0, feedback: 'Ready when you are.',
        angle: 0, power: 50, selections: [],
        random
      };
      this.run = run;
      this._setupRun(run, random);
      if (this.save) {
        const count = Number(this.save.get(`minigames.plays.${id}`, 0)) || 0;
        this.save.set(`minigames.plays.${id}`, Math.min(9999, count + 1));
      }
      return { ok: true, state: this.getState() };
    }

    _setupRun(run, random) {
      switch (run.kind) {
        case 'route':
          run.total = 4;
          run.targets = Array.from({ length: run.total }, () => Math.floor(random() * 3));
          run.cues = run.targets.map((target, i) => {
            const cues = [
              ['A leaf is swept toward the left bank.', 'A bright current runs straight ahead.', 'A bubble curves around the right rock.'],
              ['The live wire points west.', 'The safe node is directly ahead.', 'The storm path bends east.'],
              ['Follow the flower opening on your left.', 'The center bloom is awake.', 'A ribbon marks the right-hand bloom.'],
              ['The local train needs the left platform.', 'The signal is clear for the center platform.', 'The final train is due on the right.']
            ];
            return cues[Math.min(i, cues.length - 1)][target];
          });
          run.options = ROUTE_CHOICES.slice();
          run.feedback = 'Read the cue, then choose a lane.';
          break;
        case 'timing':
          run.total = 3;
          run.targets = Array.from({ length: run.total }, () => 0.38 + random() * 0.24);
          run.feedback = 'The marker is moving. Tap when it reaches the glowing window.';
          break;
        case 'forecast': {
          run.kind = 'forecast';
          const first = Math.floor(random() * 4);
          const pattern = Array.from({ length: 4 }, (_, i) => (first + i) % 4);
          run.pattern = pattern;
          run.total = 1;
          run.options = TOKENS.slice();
          run.correct = pattern[3];
          run.feedback = 'The last two symbols reveal the rhythm. Which symbol comes next?';
          break;
        }
        case 'mirror':
          run.total = 3;
          run.targets = Array.from({ length: run.total }, () => Math.floor(random() * 8) * 45);
          run.target = run.targets[0];
          run.angle = 0;
          run.feedback = 'Rotate the mirror. A wider beam means you are close.';
          break;
        case 'aim':
          run.total = 1;
          run.targetPower = 35 + Math.floor(random() * 31);
          run.power = 50;
          run.feedback = 'Set the push strength, then release the crystal.';
          break;
        case 'sequence':
          run.total = 1;
          run.pattern = Array.from({ length: 5 }, () => Math.floor(random() * 4));
          run.options = TOKENS.slice();
          run.phase = 'study';
          run.feedback = 'Study the pattern, then repeat it.';
          break;
        case 'sort':
          run.total = ITEMS.length;
          run.items = ITEMS.map(x => Object.assign({}, x));
          run.itemIndex = 0;
          run.options = ['Shells', 'Glass & stones', 'Driftwood'];
          run.feedback = 'Choose the tide pool that fits the item.';
          break;
        case 'glyph':
          run.total = 3;
          run.glyphTarget = [Math.floor(random() * 4), Math.floor(random() * 4), Math.floor(random() * 4)];
          run.glyphAngles = [0, 0, 0];
          run.feedback = 'Turn each ring to match the carved clue.';
          break;
        case 'rhythm':
          run.total = 1;
          run.pattern = [0, 2, 1, 2, 0].map((x, i) => (x + Math.floor(random() * 2) + i) % 3);
          run.options = ['🥁', '👏', '🎵'];
          run.phase = 'study';
          run.feedback = 'Listen to the pattern in your head, then tap it back.';
          break;
        case 'gears':
          run.total = 1;
          run.gearTarget = [Math.floor(random() * 4), Math.floor(random() * 4), Math.floor(random() * 4)];
          run.gears = [0, 0, 0];
          run.feedback = 'Turn each cog to line up the three falling minute marks.';
          break;
        case 'logic':
          run.total = 3;
          run.logicRound = 0;
          run.logic = [
            { clue: 'The moonlit book belongs on the shelf with a crescent.', options: ['Sunrise', 'Crescent', 'Raindrop'], answer: 1 },
            { clue: 'The book about gardens is beside the leaf symbol.', options: ['Leaf', 'Comet', 'Shell'], answer: 0 },
            { clue: 'The book that floats belongs under the cloud mark.', options: ['Bell', 'Cloud', 'Flame'], answer: 1 }
          ];
          run.feedback = 'Solve each shelf clue.';
          break;
        case 'flight':
          run.total = 5;
          run.lanes = Array.from({ length: run.total }, () => Math.floor(random() * 3));
          run.options = ['Drift left', 'Hold course', 'Drift right'];
          run.feedback = 'Read the gust and choose a safe lane for the seed.';
          break;
        case 'seek':
          run.total = 1;
          run.seekTarget = Math.floor(random() * 6);
          run.seekOptions = ['🌧️', '🌙', '🍃', '🐚', '✨', '🔔'];
          run.seekPrompt = ['a rain ripple', 'a moon glint', 'a leaf curl', 'a tide shell', 'a falling star', 'a tiny bell'][run.seekTarget];
          run.feedback = `Find ${run.seekPrompt} in the scene.`;
          break;
        case 'photo':
          run.total = 1;
          run.photoPrompt = 'Capture a portrait with a Moment score of 65 or higher. You can adjust the lens and wait for a playful expression.';
          run.photoAttempts = 0;
          run.feedback = 'Take your time framing the creature, then use the habitat camera.';
          break;
        case 'design':
          run.total = 1;
          run.designTarget = [];
          while (run.designTarget.length < 3) {
            const cell = Math.floor(random() * 9);
            if (!run.designTarget.includes(cell)) run.designTarget.push(cell);
          }
          run.design = [];
          run.feedback = 'Choose exactly three garden tiles to match the plan.';
          break;
        case 'order':
          run.total = 4;
          run.order = [0, 1, 2, 3].sort(() => random() - 0.5);
          run.orderLabels = ['loose loop', 'crossed loop', 'outer bow', 'final knot'];
          run.options = [0, 1, 2, 3];
          run.feedback = 'Lift the loops in the order that frees the ribbon.';
          break;
        case 'circuit':
          run.kind = 'route'; run.total = 4;
          run.targets = [0, 1, 2, 0].map((x, i) => (x + Math.floor(random() * 3)) % 3);
          run.cues = run.targets.map((target, i) => `Relay ${i + 1}: connect to the ${['west', 'middle', 'east'][target]} node.`);
          run.options = ['West node', 'Middle node', 'East node'];
          run.feedback = 'Follow the indicated safe node.';
          break;
      }
      if (run.id === 'last-train-dispatch') {
        run.cues = run.targets.map((target, i) => `Train ${i + 1}: switch to platform ${target + 1}.`);
        run.options = ['Platform 1', 'Platform 2', 'Platform 3'];
      } else if (run.id === 'pollinator-path') {
        run.cues = run.targets.map((target, i) => `Bloom ${i + 1}: follow the ${['left', 'center', 'right'][target]} flower scent.`);
        run.options = ['Left flower', 'Center flower', 'Right flower'];
      } else if (run.id === 'storm-relay') {
        run.cues = run.targets.map((target, i) => `Relay ${i + 1}: join the ${['west', 'middle', 'east'][target]} node.`);
        run.options = ['West node', 'Middle node', 'East node'];
      }
    }

    act(action) {
      const r = this.run;
      if (!r || r.done) return this.getState();
      const n = typeof action === 'object' && action !== null ? action.value : action;
      const idx = Number(n);
      switch (r.kind) {
        case 'route':
          this._answer(idx, r.targets[r.step], `Route ${r.step + 1} connected.`, 'That path dead-ends. Try the clue again.');
          break;
        case 'timing': {
          if (n === 'hit') {
            const distance = Math.abs(r.phase - r.targets[r.step]);
            if (distance <= 0.11) {
              r.score += Math.round(100 - distance * 500);
              r.streak++;
              r.feedback = distance <= 0.045 ? 'Bullseye timing!' : 'Right in the warm window!';
              r.step++;
              if (r.step >= r.total) this._finish(true);
            } else {
              r.lives--;
              r.streak = 0;
              r.feedback = 'A little early or late. Wait for the next window.';
              if (r.lives <= 0) this._finish(false);
            }
          }
          break;
        }
        case 'forecast':
          this._answer(idx, r.correct, 'You read the pattern correctly.', 'The pattern shifts. Take another look.');
          break;
        case 'mirror':
          if (n === 'left') r.angle = (r.angle + 315) % 360;
          else if (n === 'right') r.angle = (r.angle + 45) % 360;
          else if (n === 'align') {
            const delta = Math.abs(((r.angle - r.target + 540) % 360) - 180);
            if (delta <= 45) {
              r.score += Math.max(25, 100 - delta);
              r.step++;
              if (r.step >= r.total) this._finish(true);
              else { r.target = r.targets[r.step]; r.angle = 0; r.feedback = 'Beam aligned. A new flower needs light.'; }
            } else { r.lives--; r.feedback = 'The beam misses. Adjust the mirror and try again.'; if (r.lives <= 0) this._finish(false); }
          }
          break;
        case 'aim':
          if (n === 'less') r.power = clamp(r.power - 5, 0, 100);
          else if (n === 'more') r.power = clamp(r.power + 5, 0, 100);
          else if (n === 'throw') {
            const delta = Math.abs(r.power - r.targetPower);
            r.score = Math.max(0, 100 - delta * 3);
            if (delta <= 12) this._finish(true);
            else { r.lives--; r.feedback = 'The crystal slides past the target. Adjust your push and try again.'; if (r.lives <= 0) this._finish(false); }
          }
          break;
        case 'sequence':
        case 'rhythm':
          if (n === 'start') { r.phase = 'input'; r.selections = []; r.feedback = 'Your turn—repeat the pattern.'; break; }
          if (Number.isInteger(idx) && r.phase === 'input') {
            const expected = r.pattern[r.selections.length];
            if (idx === expected) {
              r.selections.push(idx); r.score += 20;
              if (r.selections.length === r.pattern.length) this._finish(true);
              else r.feedback = `Good. ${r.pattern.length - r.selections.length} beats left.`;
            } else {
              r.lives--; r.selections = []; r.feedback = r.lives > 0 ? 'Not quite. The pattern is shown again—try once more.' : 'The pattern faded away.';
              if (r.lives <= 0) this._finish(false);
              else r.phase = 'study';
            }
          }
          break;
        case 'sort': {
          const item = r.items[r.itemIndex];
          if (!item) break;
          const correct = item.bin === idx;
          if (correct) { r.score += 20; r.step++; r.itemIndex++; r.feedback = `${item.name} is sorted correctly.`; }
          else { r.lives--; r.feedback = `${item.name} belongs somewhere else.`; }
          if (r.itemIndex >= r.items.length) this._finish(true);
          else if (r.lives <= 0) this._finish(false);
          break;
        }
        case 'glyph':
          if (typeof n === 'string' && n.startsWith('ring:')) {
            const [, ring, direction] = n.split(':');
            const i = Number(ring);
            if (i >= 0 && i < 3) r.glyphAngles[i] = (r.glyphAngles[i] + (direction === 'right' ? 1 : 3)) % 4;
          } else if (n === 'align') {
            const correct = r.glyphAngles.every((a, i) => a === r.glyphTarget[i]);
            if (correct) this._finish(true);
            else { r.lives--; r.feedback = 'The glyphs do not line up yet.'; if (r.lives <= 0) this._finish(false); }
          }
          break;
        case 'gears':
          if (typeof n === 'string' && n.startsWith('gear:')) {
            const [, gear, direction] = n.split(':');
            const i = Number(gear);
            if (i >= 0 && i < 3) r.gears[i] = (r.gears[i] + (direction === 'right' ? 1 : 3)) % 4;
          } else if (n === 'catch') {
            const matches = r.gears.filter((g, i) => g === r.gearTarget[i]).length;
            r.score += matches * 25;
            if (matches === 3) this._finish(true);
            else { r.lives--; r.feedback = `${matches} gears aligned. Keep adjusting.`; if (r.lives <= 0) this._finish(false); }
          }
          break;
        case 'logic': {
          const q = r.logic[r.logicRound];
          if (idx === q.answer) { r.score += 25; r.logicRound++; r.step++; r.feedback = 'That shelf fits the clue.'; }
          else { r.lives--; r.feedback = 'That shelf contradicts the clue.'; }
          if (r.logicRound >= r.total) this._finish(true);
          else if (r.lives <= 0) this._finish(false);
          break;
        }
        case 'flight':
          this._answer(idx, r.lanes[r.step], 'The seed catches the breeze!', 'A crosswind nudges it off course.');
          break;
        case 'seek':
          this._answer(idx, r.seekTarget, 'Found it! The camera noticed the detail.', 'Not that one. Scan the little vignette again.');
          break;
        case 'design':
          if (n === 'toggle') {
            const cell = Number(action.cell);
            if (r.design.includes(cell)) r.design = r.design.filter(x => x !== cell);
            else if (r.design.length < 3) r.design.push(cell);
          } else if (n === 'submit') {
            const overlap = r.design.filter(x => r.designTarget.includes(x)).length;
            r.score = overlap * 33;
            if (overlap >= 2 && r.design.length === 3) this._finish(true);
            else { r.lives--; r.feedback = 'Two of the three garden tiles match. Try a new arrangement.'; r.design = []; if (r.lives <= 0) this._finish(false); }
          }
          break;
        case 'order': {
          const expected = r.order[r.step];
          if (idx === expected) {
            r.score += 25; r.step++;
            if (r.step >= r.total) this._finish(true);
            else r.feedback = 'Loop freed. Choose the next safest strand.';
          } else { r.lives--; r.feedback = 'That pull tightens a crossing. Try another loop.'; if (r.lives <= 0) this._finish(false); }
          break;
        }
      }
      return this.getState();
    }

    submitPhoto(metadata) {
      const r = this.run;
      if (!r || r.done || r.kind !== 'photo') return { ok: false, state: this.getState() };
      const score = clamp(Math.round(Number(metadata && metadata.score) || 0), 0, 100);
      r.photoAttempts++;
      r.score = Math.max(r.score, score);
      if (score >= 65) {
        r.step = 1;
        r.feedback = `A lovely portrait—${score}/100!`;
        this._finish(true);
        return { ok: true, won: true, score, state: this.getState() };
      }
      r.lives--;
      r.feedback = r.lives > 0
        ? `That moment scored ${score}/100. Try a steadier frame or a more expressive pose.`
        : `Photo Safari finished after ${r.photoAttempts} attempts. You can take another tour any time.`;
      if (r.lives <= 0) this._finish(false);
      return { ok: true, won: false, score, state: this.getState() };
    }

    _answer(answer, expected, successText, failureText) {
      const r = this.run;
      if (answer === expected) {
        r.score += 25; r.step++; r.streak++;
        r.feedback = successText;
        if (r.step >= r.total) this._finish(true);
      } else {
        r.lives--; r.streak = 0; r.feedback = failureText;
        if (r.lives <= 0) this._finish(false);
      }
    }

    update(dt) {
      const r = this.run;
      if (!r || r.done || r.kind !== 'timing') return;
      r.elapsed += Math.max(0, Math.min(Number(dt) || 0, 0.1));
      // A triangular wave makes the timing game deterministic and readable.
      const phase = (r.elapsed * 0.82) % 2;
      r.phase = phase <= 1 ? phase : 2 - phase;
    }

    _finish(won) {
      const r = this.run;
      if (!r || r.done) return;
      r.done = true;
      r.won = !!won;
      if (won && r.score <= 0) r.score = 100;
      r.feedback = won ? 'Lovely work! Your result has been saved.' : 'Nice try. Nothing is lost—play again whenever you like.';
      const result = this._result();
      if (this.save) {
        const key = `minigames.highScores.${r.id}`;
        const previous = Number(this.save.get(key, 0)) || 0;
        if (result.score > previous) this.save.set(key, result.score);
        if (won) {
          const completed = this.save.get('minigames.completed', {});
          completed[r.id] = true;
          this.save.set('minigames.completed', completed);
          const total = Math.min(9999, (Number(this.save.get('minigames.wins', 0)) || 0) + 1);
          this.save.set('minigames.wins', total);
        }
      }
      if (typeof this.options.onComplete === 'function') this.options.onComplete(result);
    }

    _result() {
      const r = this.run;
      if (!r) return null;
      const previous = this.save ? Number(this.save.get(`minigames.highScores.${r.id}`, 0)) || 0 : 0;
      const definition = GAMES.find(g => g.id === r.id) || {};
      return {
        id: r.id, title: definition.title, regionId: definition.regionId || 'current',
        won: r.won, score: r.score, previousBest: previous,
        best: Math.max(previous, r.score), lives: r.lives, seed: r.seed
      };
    }

    getState() {
      const r = this.run;
      if (!r) return null;
      return {
        id: r.id, kind: r.kind, step: r.step, total: r.total,
        score: r.score, lives: r.lives, done: r.done, won: r.won,
        feedback: r.feedback, phase: r.phase, angle: r.angle, target: r.target,
        power: r.power, targetPower: r.targetPower,
        pattern: r.pattern ? r.pattern.slice() : null,
        selections: r.selections.slice(),
        targets: r.targets ? r.targets.slice() : null,
        cues: r.cues ? r.cues.slice() : null,
        options: r.options ? r.options.slice() : null,
        item: r.items && r.items[r.itemIndex] ? Object.assign({}, r.items[r.itemIndex]) : null,
        itemIndex: r.itemIndex,
        gearAngles: r.gears ? r.gears.slice() : null,
        gearTargets: r.gearTarget ? r.gearTarget.slice() : null,
        glyphAngles: r.glyphAngles ? r.glyphAngles.slice() : null,
        glyphTargets: r.glyphTarget ? r.glyphTarget.slice() : null,
        clue: r.logic && r.logic[r.logicRound] ? Object.assign({}, r.logic[r.logicRound]) : null,
        lanes: r.lanes ? r.lanes.slice() : null,
        lane: r.lanes ? r.lanes[r.step] : null,
        seekOptions: r.seekOptions ? r.seekOptions.slice() : null,
        seekPrompt: r.seekPrompt,
        photoPrompt: r.photoPrompt,
        photoAttempts: r.photoAttempts || 0,
        design: r.design ? r.design.slice() : null,
        designTarget: r.designTarget ? r.designTarget.slice() : null,
        orderLabels: r.orderLabels ? r.orderLabels.slice() : null,
        orderStep: r.order ? r.order[r.step] : null,
        result: r.done ? this._result() : null
      };
    }

    stop() { this.run = null; }
  }

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  }

  class MiniGameUI {
    constructor(system, root, options) {
      this.system = system;
      this.root = root;
      this.options = options || {};
      this.onClose = this.options.onClose || function () {};
      this.filter = '';
      this._timing = null;
      this.focusScope = global.UIChrome && global.UIChrome.ModalFocusManager && this.root
        ? new global.UIChrome.ModalFocusManager(this.root)
        : null;
      if (this.root) this.root.addEventListener('click', e => {
        if (e.target === this.root) this.close();
      });
    }

    openCatalog(returnFocus) {
      if (!this.root) return;
      this.system.stop();
      this.root.hidden = false;
      this.root.setAttribute('aria-hidden', 'false');
      this.renderCatalog();
      if (this.focusScope) this.focusScope.open('.mini-card button', returnFocus);
      else {
        const first = this.root.querySelector('.mini-card button');
        if (first) first.focus();
      }
    }

    renderCatalog() {
      const root = this.root;
      if (!root) return;
      const cupMarkup = this.system.getCups().map(cup => `<span class="mini-cup">${esc(cup.title)} · ${cup.wins}/${cup.total} wins · ${cup.bestPoints} pts</span>`).join('');
      root.innerHTML = `
        <section class="feature-panel mini-panel" role="dialog" aria-modal="true" aria-labelledby="mini-title">
          <header class="feature-head"><div><h2 id="mini-title">Habitat Arcade</h2><p>Twenty short games. No lives to lose outside the game.</p></div><button class="feature-close" type="button" aria-label="Close games">×</button></header>
          <div class="mini-tools"><label for="mini-search">Find a game</label><input id="mini-search" type="search" autocomplete="off" placeholder="Search games or regions" value="${esc(this.filter)}"><span class="mini-best">${this.system.save ? Number(this.system.save.get('minigames.wins', 0)) || 0 : 0} wins</span></div>
          <div class="mini-cups" aria-label="Regional cup progress">${cupMarkup}</div>
          <div class="mini-grid" role="list"></div>
        </section>`;
      root.querySelector('.feature-close').onclick = () => this.close();
      const search = root.querySelector('#mini-search');
      search.addEventListener('input', () => { this.filter = search.value; this._populateCatalog(); });
      this._populateCatalog();
      if (this.focusScope && this.focusScope.active) this.focusScope.focus('.mini-card button');
    }

    _populateCatalog() {
      const list = this.root.querySelector('.mini-grid');
      if (!list) return;
      const query = this.filter.trim().toLowerCase();
      const items = GAMES.filter(g => !query || `${g.title} ${g.region} ${g.description}`.toLowerCase().includes(query));
      list.innerHTML = '';
      items.forEach(game => {
        const card = document.createElement('article');
        card.className = 'mini-card'; card.setAttribute('role', 'listitem');
        const best = this.system.save ? Number(this.system.save.get(`minigames.highScores.${game.id}`, 0)) || 0 : 0;
        const complete = this.system.save ? !!this.system.save.get(`minigames.completed.${game.id}`, false) : false;
        card.innerHTML = `<div class="mini-card-icon" aria-hidden="true">${game.icon}</div><div class="mini-card-copy"><h3>${esc(game.title)}</h3><p>${esc(game.description)}</p><small>${esc(game.region)} · Best ${best}${complete ? ' · ✓ Complete' : ''}</small></div><button type="button" aria-label="Play ${esc(game.title)}">Play</button>`;
        card.querySelector('button').onclick = () => this.start(game.id);
        list.appendChild(card);
      });
      if (!items.length) list.innerHTML = '<p class="feature-empty">No games match that search.</p>';
    }

    start(id) {
      const result = this.system.start(id);
      if (!result.ok) return;
      this.renderRun();
      this._focusRunControl();
    }

    renderRun() {
      const state = this.system.getState();
      const game = GAMES.find(g => g.id === state.id);
      if (!this.root || !state || !game) return;
      const progress = state.total ? Math.min(100, Math.round(state.step / state.total * 100)) : 0;
      this.root.innerHTML = `<section class="feature-panel mini-panel" role="dialog" aria-modal="true" aria-labelledby="mini-title">
        <header class="feature-head"><div><h2 id="mini-title">${game.icon} ${esc(game.title)}</h2><p>${esc(game.description)}</p></div><button class="feature-close" type="button" aria-label="Exit game">×</button></header>
        <div class="mini-run-status"><span>${esc(game.region)}</span><span>Score <b>${state.score}</b></span><span>Attempts <b>${state.lives}</b></span></div>
        <div class="mini-progress" role="progressbar" aria-label="Game progress" aria-valuenow="${progress}" aria-valuemin="0" aria-valuemax="100"><span style="width:${progress}%"></span></div>
        <div class="mini-play-area" id="mini-play-area"></div>
        <p class="mini-feedback" aria-live="polite">${esc(state.feedback)}</p>
        ${state.done ? `<div class="mini-result"><strong>${state.won ? 'Nice work!' : 'Good try!'}</strong><span>${state.score} points · best ${state.result ? state.result.best : state.score}</span><button type="button" class="mini-replay">Play again</button><button type="button" class="mini-catalog">Game list</button></div>` : ''}
        </section>`;
      this.root.querySelector('.feature-close').onclick = () => this.close();
      this._renderControls(state, game);
      if (state.done) {
        this.root.querySelector('.mini-replay').onclick = () => this.start(game.id);
        this.root.querySelector('.mini-catalog').onclick = () => this.renderCatalog();
      }
    }

    _focusRunControl() {
      const selectors = ['.mini-controls button', '.mini-replay', '.mini-catalog', '.feature-close'];
      if (!this.focusScope) {
        for (const selector of selectors) {
          const target = this.root && this.root.querySelector(selector);
          if (target && typeof target.focus === 'function') { target.focus(); return; }
        }
        return;
      }
      for (const selector of selectors) if (this.focusScope.focus(selector)) return;
    }

    _button(label, action, extra) {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'mini-action' + (extra ? ' ' + extra : ''); b.textContent = label;
      b.onclick = action; return b;
    }

    _renderControls(s, game) {
      const area = this.root.querySelector('#mini-play-area');
      if (!area) return;
      const controls = document.createElement('div'); controls.className = 'mini-controls';
      const prompt = document.createElement('p'); prompt.className = 'mini-prompt';
      let promptText = game.description;
      if (s.kind === 'route') promptText = s.cues[s.step] || 'The route is clear.';
      else if (s.kind === 'forecast') promptText = 'Pattern: ' + (s.pattern || []).slice(0, 3).map(i => TOKENS[i]).join('  ') + '  ?';
      else if (s.kind === 'sequence' || s.kind === 'rhythm') promptText = s.phase === 'study'
        ? 'Memorize: ' + (s.pattern || []).map(i => s.kind === 'rhythm' ? ['🥁', '👏', '🎵'][i] : TOKENS[i]).join('  ')
        : `Repeat the pattern (${s.selections.length + 1}/${s.pattern.length}).`;
      else if (s.kind === 'timing') promptText = game.id === 'capsule-claw' ? 'Release inside the prize window.' : 'Tap when the moving marker reaches the gold zone.';
      else if (s.kind === 'mirror') promptText = `Mirror angle ${s.angle}° · align the target at ${s.target}°.`;
      else if (s.kind === 'aim') promptText = `Push strength ${s.power}% · target range around ${s.targetPower}%.`;
      else if (s.kind === 'sort') promptText = `Sort: ${s.item ? s.item.name : 'finished'}`;
      else if (s.kind === 'glyph') promptText = `Carving: ${(s.glyphTargets || []).map((n, i) => `Ring ${i + 1} → ${['ᚠ','ᚢ','ᚦ','ᚨ'][n]}`).join(' · ')}. Current: ${(s.glyphAngles || []).map((n, i) => `R${i + 1} ${['ᚠ','ᚢ','ᚦ','ᚨ'][n]}`).join(' · ')}`;
      else if (s.kind === 'gears') promptText = `Minute marks: ${(s.gearTargets || []).map((n, i) => `Cog ${i + 1} → ${['○','◐','●','◑'][n]}`).join(' · ')}. Current: ${(s.gearAngles || []).map((n, i) => `${i + 1}: ${['○','◐','●','◑'][n]}`).join(' · ')}`;
      else if (s.kind === 'logic') promptText = s.clue ? s.clue.clue : 'The shelves are sorted.';
      else if (s.kind === 'flight') promptText = `Gust ${s.step + 1}/5: the wind pushes ${['left','straight','right'][s.lane]}. Choose a lane.`;
      else if (s.kind === 'seek') promptText = `Photo clue: find ${s.seekPrompt}.`;
      else if (s.kind === 'photo') promptText = s.photoPrompt || 'Take a habitat portrait with a strong Moment score.';
      else if (s.kind === 'design') promptText = `Plan (🌱 = planter): ${(s.designTarget || []).length ? Array.from({ length: 9 }, (_, i) => s.designTarget.includes(i) ? '🌱' : '·').join(' ') : 'three planters'}. Tap three tiles, then check.`;
      else if (s.kind === 'order') promptText = `Free the ${s.orderLabels[s.orderStep] || 'last loop'} next.`;
      prompt.textContent = promptText; area.appendChild(prompt);

      if (s.done) return;
      const addChoiceButtons = (options, handler, tokenStyle) => {
        options.forEach((label, i) => controls.appendChild(this._button(label, () => handler(i), tokenStyle ? 'mini-token' : '')));
      };

      switch (s.kind) {
        case 'route':
          addChoiceButtons(s.options || ROUTE_CHOICES, i => this._act(i));
          break;
        case 'forecast':
        case 'logic':
        case 'seek': {
          const opts = s.kind === 'logic' ? (s.clue ? s.clue.options : []) : (s.kind === 'seek' ? s.seekOptions : TOKENS);
          addChoiceButtons(opts, i => this._act(i), s.kind !== 'logic');
          break;
        }
        case 'timing': {
          const meter = document.createElement('div'); meter.className = 'timing-meter';
          meter.innerHTML = '<span class="timing-safe"></span><span class="timing-marker"></span>';
          const safe = meter.querySelector('.timing-safe');
          const target = (s.targets || [0.5])[s.step] || 0.5;
          safe.style.left = `${Math.max(0, (target - 0.11) * 100)}%`;
          safe.style.width = '22%';
          controls.appendChild(meter);
          controls.appendChild(this._button('Tap / release', () => this._act('hit'), 'mini-primary'));
          break;
        }
        case 'mirror':
          controls.appendChild(this._button('↶ Turn left', () => this._act('left')));
          controls.appendChild(this._button('Turn right ↷', () => this._act('right')));
          controls.appendChild(this._button('Align beam', () => this._act('align'), 'mini-primary'));
          break;
        case 'aim':
          controls.appendChild(this._button('− Push', () => this._act('less')));
          controls.appendChild(this._button('+ Push', () => this._act('more')));
          controls.appendChild(this._button('Slide!', () => this._act('throw'), 'mini-primary'));
          break;
        case 'sequence':
        case 'rhythm':
          if (s.phase === 'study') controls.appendChild(this._button('Hide pattern & begin', () => this._act('start'), 'mini-primary'));
          else addChoiceButtons(s.options || TOKENS, i => this._act(i), true);
          break;
        case 'sort':
          addChoiceButtons(s.options || [], i => this._act(i));
          break;
        case 'glyph':
          for (let i = 0; i < 3; i++) {
            const row = document.createElement('div'); row.className = 'mini-gear-row';
            const label = document.createElement('span'); label.textContent = `Ring ${i + 1}`; row.appendChild(label);
            row.appendChild(this._button('↶', () => this._act(`ring:${i}:left`)));
            row.appendChild(this._button('↷', () => this._act(`ring:${i}:right`)));
            controls.appendChild(row);
          }
          controls.appendChild(this._button('Read the glyph', () => this._act('align'), 'mini-primary'));
          break;
        case 'gears':
          for (let i = 0; i < 3; i++) {
            const row = document.createElement('div'); row.className = 'mini-gear-row';
            const label = document.createElement('span'); label.textContent = `Cog ${i + 1}`; row.appendChild(label);
            row.appendChild(this._button('↶', () => this._act(`gear:${i}:left`)));
            row.appendChild(this._button('↷', () => this._act(`gear:${i}:right`)));
            controls.appendChild(row);
          }
          controls.appendChild(this._button('Catch the minutes', () => this._act('catch'), 'mini-primary'));
          break;
        case 'flight':
          addChoiceButtons(s.options || ['Left', 'Center', 'Right'], i => this._act(i));
          break;
        case 'photo':
          controls.appendChild(this._button('Enter Photo Mode', () => {
            if (typeof this.options.onPhotoRequest === 'function') this.options.onPhotoRequest(s);
          }, 'mini-primary'));
          break;
        case 'order':
          addChoiceButtons(s.orderLabels || [], i => this._act(i));
          break;
        case 'design': {
          const grid = document.createElement('div'); grid.className = 'makeover-grid';
          for (let i = 0; i < 9; i++) {
            const cell = this._button(s.design.includes(i) ? '🌱' : '·', () => this._act({ value: 'toggle', cell: i }), s.design.includes(i) ? 'selected' : '');
            cell.setAttribute('aria-pressed', String(s.design.includes(i))); grid.appendChild(cell);
          }
          controls.appendChild(grid);
          controls.appendChild(this._button('Check garden', () => this._act('submit'), 'mini-primary'));
          break;
        }
      }
      area.appendChild(controls);
    }

    _act(action) {
      const controls = this.root ? Array.from(this.root.querySelectorAll('.mini-controls button')) : [];
      const active = this.root && this.root.ownerDocument ? this.root.ownerDocument.activeElement : null;
      const focusIndex = controls.indexOf(active);
      this.system.act(action);
      this.renderRun();
      const nextControls = this.root ? this.root.querySelectorAll('.mini-controls button') : [];
      if (focusIndex >= 0 && nextControls.length) nextControls[Math.min(focusIndex, nextControls.length - 1)].focus();
      else this._focusRunControl();
    }

    update(dt) {
      if (!this.system.running) return;
      this.system.update(dt);
      const state = this.system.getState();
      const marker = this.root && this.root.querySelector('.timing-marker');
      const safe = this.root && this.root.querySelector('.timing-safe');
      if (marker) marker.style.left = `${Math.max(0, Math.min(100, state.phase * 100))}%`;
      if (safe) {
        const target = (state.targets || [0.5])[state.step] || 0.5;
        safe.style.left = `${Math.max(0, Math.min(78, (target - 0.11) * 100))}%`;
      }
    }

    hideForPhoto() {
      if (!this.root) return;
      this.root.hidden = true;
      this.root.setAttribute('aria-hidden', 'true');
    }

    showAfterPhoto() {
      if (!this.root) return;
      this.root.hidden = false;
      this.root.setAttribute('aria-hidden', 'false');
      this.renderRun();
      this._focusRunControl();
    }

    close() {
      if (!this.root || this.root.hidden) return;
      this.root.hidden = true;
      this.root.setAttribute('aria-hidden', 'true');
      this.system.stop();
      if (this.focusScope) this.focusScope.close();
      this.onClose();
    }
  }

  global.MiniGameSuite = { GAMES, MiniGameSystem, MiniGameUI, hashSeed };
})(window);
