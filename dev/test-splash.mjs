import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('../assets/splash.js', import.meta.url), 'utf8');

function harness(visibilityState) {
  const listeners = new Map();
  const timers = [];
  const mounted = [];
  let plays = 0;
  const node = () => ({ style: {}, setAttribute() {}, appendChild() {} });
  const document = {
    visibilityState,
    documentElement: { style: {} },
    body: { appendChild(element) { mounted.push(element); } },
    getElementById() { return null; },
    createElement: node,
    addEventListener(name, callback) {
      const bucket = listeners.get(name) ?? new Set();
      bucket.add(callback);
      listeners.set(name, bucket);
    },
    removeEventListener(name, callback) { listeners.get(name)?.delete(callback); }
  };
  const context = {
    document,
    performance: { now: () => 0 },
    setTimeout(callback, delay) { timers.push({ callback, delay }); return timers.length; },
    clearTimeout() {},
    __XTHINGS_LAUNCH_DATA__: { layers: [] },
    lottie: {
      loadAnimation() {
        plays++;
        return { setSpeed(speed) { assert.equal(speed, 1); }, addEventListener() {} };
      }
    }
  };
  vm.createContext(context);
  vm.runInContext(source, context);
  return {
    mounted, timers, context,
    get plays() { return plays; },
    visibility(state) {
      document.visibilityState = state;
      for (const callback of [...(listeners.get('visibilitychange') ?? [])]) callback();
    },
    listeners
  };
}

const hidden = harness('hidden');
assert.equal(hidden.plays, 0, 'hidden Desktop workspace must not consume animation playback');
assert.equal(hidden.mounted.length, 0, 'do not mount an invisible splash');
assert.equal(hidden.timers.length, 0, 'watchdog budget must not expire behind native welcome');
hidden.visibility('hidden');
assert.equal(hidden.plays, 0);
hidden.visibility('visible');
assert.equal(hidden.plays, 1, 'start playback once the workspace is shown');
assert.equal(hidden.mounted.length, 1);
assert.deepEqual(hidden.timers.map(({ delay }) => delay), [8800, 6000], 'budgets start at visibility');
hidden.visibility('hidden');
hidden.visibility('visible');
assert.equal(hidden.plays, 1, 'later visibility changes must not replay startup');
assert.equal(hidden.listeners.get('visibilitychange')?.size, 0, 'remove startup listener');
vm.runInContext(source, hidden.context);
assert.equal(hidden.plays, 1, 'repeated injection stays idempotent');

const visible = harness('visible');
assert.equal(visible.plays, 1, 'normal visible startup remains immediate');
assert.equal(visible.mounted.length, 1);
const unspecified = harness(undefined);
assert.equal(unspecified.plays, 1, 'environments without visibility API keep working');
console.log('splash visibility regression: ALL GREEN');
