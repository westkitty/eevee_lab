/* ==========================================================================
   UI CONTROLLER — generic chrome behavior shared by the whole HUD: auto-fade,
   a predictable Escape/back stack, density, and reduced-motion detection.
   App-specific wiring (which button does what) stays in index.html.
   ========================================================================== */
(function (global) {
  'use strict';

  class UIChrome {
    constructor({ fadeDelay = 3000, save } = {}) {
      this.fadeDelay = fadeDelay;
      this.save = save;
      this._fadeTimer = null;
      this._faded = false;
      this._fadeTargets = [];
      this._escapeStack = [];
      this._suspendFade = false;

      this._mq = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
      const manualOverride = save ? save.get('ui.reducedMotion', null) : null;
      this.reducedMotion = manualOverride != null ? manualOverride : !!(this._mq && this._mq.matches);

      this._bindActivity();
    }

    registerFadeTargets(elements) {
      this._fadeTargets = elements.filter(Boolean);
    }

    _bindActivity() {
      const bump = () => this.reportActivity();
      ['pointerdown', 'pointermove', 'keydown', 'touchstart', 'wheel'].forEach(ev =>
        window.addEventListener(ev, bump, { passive: true }));
    }

    reportActivity() {
      if (this._faded) this._setFaded(false);
      clearTimeout(this._fadeTimer);
      if (this._suspendFade) return;
      this._fadeTimer = setTimeout(() => this._setFaded(true), this.fadeDelay);
    }

    suspendFade(v) {
      this._suspendFade = v;
      if (v) { clearTimeout(this._fadeTimer); this._setFaded(false); }
      else this.reportActivity();
    }

    _setFaded(v) {
      this._faded = v;
      this._fadeTargets.forEach(el => el.classList.toggle('chrome-faded', v));
    }

    /* Predictable Escape hierarchy: last-pushed closes first (UX-20). */
    pushEscape(closeFn) { this._escapeStack.push(closeFn); }
    removeEscape(closeFn) {
      const i = this._escapeStack.lastIndexOf(closeFn);
      if (i >= 0) this._escapeStack.splice(i, 1);
    }
    handleEscape() {
      if (!this._escapeStack.length) return false;
      const fn = this._escapeStack.pop();
      fn();
      return true;
    }
    clearEscapeStack() { this._escapeStack = []; }

    applyDensity(level) {
      document.documentElement.dataset.density = level;
      if (this.save) this.save.set('ui.density', level);
    }

    setReducedMotion(v) {
      this.reducedMotion = v;
      document.documentElement.dataset.reducedMotion = v ? 'true' : 'false';
      if (this.save) this.save.set('ui.reducedMotion', v);
    }

    hasSeenHint(id) { return this.save ? !!this.save.get(`ui.hintsSeen.${id}`, false) : false; }
    markHintSeen(id) {
      if (!this.save) return;
      const seen = this.save.get('ui.hintsSeen', {});
      seen[id] = true;
      this.save.set('ui.hintsSeen', seen);
    }
  }

  global.UIChrome = UIChrome;
})(window);
