const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const listeners = new Map();
const window = {
  document: null,
  addEventListener(type, handler) {
    if (!listeners.has(type)) listeners.set(type, []);
    listeners.get(type).push(handler);
  },
  removeEventListener(type, handler) {
    listeners.set(type, (listeners.get(type) || []).filter(item => item !== handler));
  }
};
const document = { activeElement: null };
window.document = document;
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '..', 'src', 'ui-controller.js'), 'utf8'), {
  window, document, clearTimeout, setTimeout, Array, Set, Object, String, Math
});

class Focusable {
  constructor(name, options = {}) {
    this.name = name;
    this.disabled = !!options.disabled;
    this.hidden = !!options.hidden;
    this.isConnected = true;
    this.attrs = options.attrs || {};
  }
  focus() { document.activeElement = this; }
  getAttribute(name) { return this.attrs[name] == null ? null : this.attrs[name]; }
}
class FocusRoot {
  constructor(children) { this.children = children; this.handlers = new Map(); }
  querySelectorAll() { return this.children; }
  querySelector(selector) { return this.children.find(item => selector === `#${item.name}`) || null; }
  addEventListener(type, handler) { this.handlers.set(type, handler); }
  removeEventListener(type, handler) { if (this.handlers.get(type) === handler) this.handlers.delete(type); }
  dispatch(event) { const handler = this.handlers.get('keydown'); if (handler) handler(event); }
}
function keyEvent(key, shiftKey = false, repeat = false) {
  return {
    key, shiftKey, repeat, prevented: false, stopped: false,
    preventDefault() { this.prevented = true; },
    stopImmediatePropagation() { this.stopped = true; }
  };
}

const opener = new Focusable('opener');
const disabled = new Focusable('disabled', { disabled: true });
const hidden = new Focusable('hidden', { hidden: true });
const first = new Focusable('first');
const last = new Focusable('last');
const root = new FocusRoot([disabled, hidden, first, last]);
document.activeElement = opener;
const focus = new window.UIChrome.ModalFocusManager(root, document);
assert(focus.open('#first'));
assert.equal(document.activeElement, first, 'opening focuses the requested control');
assert.equal(focus.focus('#missing'), false, 'an absent requested selector does not steal focus');
assert.equal(document.activeElement, first);
last.focus();
let event = keyEvent('Tab'); root.dispatch(event);
assert(event.prevented && document.activeElement === first, 'Tab wraps from the last control to the first');
first.focus();
event = keyEvent('Tab', true); root.dispatch(event);
assert(event.prevented && document.activeElement === last, 'Shift+Tab wraps from the first control to the last');
opener.focus();
event = keyEvent('Tab'); root.dispatch(event);
assert(event.prevented && document.activeElement === first, 'focus entering from outside is contained');
assert(focus.close());
assert.equal(document.activeElement, opener, 'closing restores the original focus target');
assert.equal(focus.close(), false, 'closing is idempotent');

class EventTarget {
  constructor() { this.handlers = new Map(); }
  addEventListener(type, handler) { this.handlers.set(type, handler); }
  removeEventListener(type, handler) { if (this.handlers.get(type) === handler) this.handlers.delete(type); }
  count(type) { return this.handlers.has(type) ? 1 : 0; }
  dispatch(event) { const handler = this.handlers.get('keydown'); if (handler) handler(event); }
}
const target = new EventTarget();
let bindings = { wheel: 'e', map: 'm', games: 'g' };
const notices = [];
const capture = new window.UIChrome.ShortcutCapture({
  target,
  getBindings: () => bindings,
  onBind: next => { bindings = next; notices.push('bound'); },
  onStart: action => notices.push(`start:${action}`),
  onCancel: action => notices.push(`cancel:${action}`),
  onInvalid: action => notices.push(`invalid:${action}`),
  onConflict: (action, conflict) => notices.push(`conflict:${action}:${conflict}`)
});
assert(capture.begin('wheel'));
assert(capture.begin('map'), 'starting a second capture replaces the first pending listener');
assert.equal(target.count('keydown'), 1, 'only one temporary key handler can exist');
event = keyEvent('x', false, true); target.dispatch(event);
assert(!event.prevented && capture.capturing && target.count('keydown') === 1, 'key repeats do not complete capture');
event = keyEvent('x'); target.dispatch(event);
assert(event.prevented && event.stopped && bindings.map === 'x' && bindings.wheel === 'e');
assert.equal(target.count('keydown'), 0, 'successful capture removes its temporary listener');

capture.begin('games');
target.dispatch(keyEvent('x'));
assert.equal(bindings.games, 'g', 'conflicting shortcuts do not overwrite an existing binding');
assert(notices.includes('conflict:games:map'));

capture.begin('wheel');
target.dispatch(keyEvent('ArrowLeft'));
assert(notices.includes('invalid:wheel'), 'non-letter/number input is rejected');
assert.equal(target.count('keydown'), 0);

capture.begin('wheel');
event = keyEvent('Escape'); target.dispatch(event);
assert(event.prevented && event.stopped && !capture.capturing, 'Escape cancels capture without leaking to gameplay');
capture.begin('map');
assert(capture.cancel());
assert.equal(target.count('keydown'), 0, 'closing settings can cancel and remove the listener');

console.log('modal focus containment and shortcut capture contracts: PASS');
