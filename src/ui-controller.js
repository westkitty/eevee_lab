/* ==========================================================================
   UI CONTROLLER — shared HUD behavior: auto-fade, Escape/back stack, density,
   reduced-motion detection, modal focus containment, and shortcut capture.
   App-specific wiring (which button does what) stays in index.html.
   ========================================================================== */
(function (global) {
  'use strict';

  const FOCUSABLE_SELECTOR = [
    'a[href]', 'area[href]', 'button:not([disabled])',
    'input:not([disabled]):not([type="hidden"])', 'select:not([disabled])',
    'textarea:not([disabled])', '[contenteditable="true"]',
    '[tabindex]:not([tabindex="-1"])'
  ].join(',');

  class ModalFocusManager {
    constructor(root, documentRef) {
      this.root = root || null;
      this.document = documentRef || global.document || null;
      this.active = false;
      this.returnFocus = null;
      this._onKeydown = this._onKeydown.bind(this);
    }

    open(initialFocus, returnFocus) {
      if (!this.root) return false;
      if (!this.active) {
        this.returnFocus = returnFocus || (this.document && this.document.activeElement) || null;
        this.active = true;
        this.root.addEventListener('keydown', this._onKeydown);
      }
      this.focus(initialFocus, true);
      return true;
    }

    focus(selectorOrElement, useFallback) {
      if (!this.root) return false;
      const requested = typeof selectorOrElement === 'string'
        ? this.root.querySelector(selectorOrElement)
        : selectorOrElement;
      const target = this._isAvailable(requested)
        ? requested
        : (useFallback ? this._focusableElements()[0] : null);
      if (!target || typeof target.focus !== 'function') return false;
      target.focus();
      return true;
    }

    close() {
      if (!this.active) return false;
      this.active = false;
      this.root.removeEventListener('keydown', this._onKeydown);
      const previous = this.returnFocus;
      this.returnFocus = null;
      if (previous && previous.isConnected !== false && typeof previous.focus === 'function') previous.focus();
      return true;
    }

    _isAvailable(element) {
      if (!element || element.disabled || element.hidden) return false;
      if (typeof element.getAttribute === 'function' && element.getAttribute('aria-hidden') === 'true') return false;
      if (typeof element.closest === 'function' && element.closest('[hidden], [aria-hidden="true"], [inert], .visually-hidden')) return false;
      if (element.getClientRects && element.getClientRects().length === 0) return false;
      if (global.getComputedStyle) {
        const style = global.getComputedStyle(element);
        if (style && (style.display === 'none' || style.visibility === 'hidden')) return false;
      }
      return typeof element.focus === 'function';
    }

    _focusableElements() {
      if (!this.root || typeof this.root.querySelectorAll !== 'function') return [];
      return Array.from(this.root.querySelectorAll(FOCUSABLE_SELECTOR)).filter(el => this._isAvailable(el));
    }

    _onKeydown(event) {
      if (!this.active || !event || event.key !== 'Tab') return;
      const elements = this._focusableElements();
      if (!elements.length) {
        event.preventDefault();
        return;
      }
      const index = elements.indexOf(this.document && this.document.activeElement);
      const lastIndex = elements.length - 1;
      if (event.shiftKey && index <= 0) {
        event.preventDefault();
        elements[lastIndex].focus();
      } else if (!event.shiftKey && (index < 0 || index === lastIndex)) {
        event.preventDefault();
        elements[0].focus();
      }
    }
  }

  class ShortcutCapture {
    constructor(options) {
      options = options || {};
      this.target = options.target || global;
      this.actions = new Set(options.actions || ['wheel', 'map', 'games']);
      this.getBindings = options.getBindings || (() => ({}));
      this.onBind = options.onBind || function () {};
      this.onStart = options.onStart || function () {};
      this.onCancel = options.onCancel || function () {};
      this.onInvalid = options.onInvalid || function () {};
      this.onConflict = options.onConflict || function () {};
      this.action = null;
      this._handler = null;
    }

    get capturing() { return this.action !== null; }

    begin(action) {
      if (!this.target || !this.actions.has(action) || typeof this.target.addEventListener !== 'function') return false;
      this.cancel();
      this.action = action;
      this._handler = event => this._handleKeydown(event);
      this.target.addEventListener('keydown', this._handler, true);
      this.onStart(action);
      return true;
    }

    cancel() {
      if (this.action === null) return false;
      const action = this.action;
      this._detach();
      this.onCancel(action);
      return true;
    }

    _detach() {
      if (this._handler && this.target && typeof this.target.removeEventListener === 'function') {
        this.target.removeEventListener('keydown', this._handler, true);
      }
      this.action = null;
      this._handler = null;
    }

    _handleKeydown(event) {
      if (!this.action || !event || event.repeat) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      const action = this.action;
      this._detach();

      if (event.key === 'Escape') {
        this.onCancel(action);
        return;
      }
      if (!/^[a-z0-9]$/i.test(event.key || '')) {
        this.onInvalid(action, event.key);
        return;
      }

      const bindings = Object.assign({}, this.getBindings());
      const pressed = event.key.toLowerCase();
      const conflict = Object.keys(bindings).find(key => key !== action && String(bindings[key]).toLowerCase() === pressed);
      if (conflict) {
        this.onConflict(action, conflict, pressed);
        return;
      }
      bindings[action] = pressed;
      this.onBind(bindings, action);
    }
  }

  class UIChrome {
    constructor({ fadeDelay = 3000, save } = {}) {
      this.fadeDelay = fadeDelay;
      this.save = save;
      this._fadeTimer = null;
      this._faded = false;
      this._fadeTargets = [];
      this._escapeStack = [];
      this._suspendFade = false;

      this._mq = global.matchMedia ? global.matchMedia('(prefers-reduced-motion: reduce)') : null;
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
        global.addEventListener(ev, bump, { passive: true }));
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
      global.document.documentElement.dataset.density = level;
      if (this.save) this.save.set('ui.density', level);
    }

    setReducedMotion(v) {
      this.reducedMotion = v;
      global.document.documentElement.dataset.reducedMotion = v ? 'true' : 'false';
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

  UIChrome.ModalFocusManager = ModalFocusManager;
  UIChrome.ShortcutCapture = ShortcutCapture;
  global.UIChrome = UIChrome;
})(window);
