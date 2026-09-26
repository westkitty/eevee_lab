'use strict';

const path = require('path');
const { execFileSync } = require('child_process');

function resolvePlaywright() {
  try { return require('playwright'); } catch (_) { /* try the active npm global prefix */ }

  try {
    const globalRoot = execFileSync('npm', ['root', '-g'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    if (globalRoot) return require(path.join(globalRoot, 'playwright'));
  } catch (_) { /* report a concise actionable message below */ }

  throw new Error('Playwright is not installed. Install it locally or globally before running browser tests.');
}

module.exports = { resolvePlaywright };
