import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
const source = readFileSync(new URL('./theme.js', import.meta.url), 'utf8');
function setup({ stored = null, dark = false, blocked = false } = {}) {
  const data = new Map(stored ? [['game-lab:theme', stored]] : []);
  const handlers = {}, media = { matches: dark, addEventListener: (_, cb) => { handlers.media = cb; } };
  const window = { matchMedia: () => media, dispatchEvent: () => {}, addEventListener: (name, cb) => { handlers[name] = cb; } };
  const localStorage = { getItem: k => { if (blocked) throw Error('blocked'); return data.get(k) ?? null; }, setItem: (k,v) => { if (blocked) throw Error('blocked'); data.set(k,v); }, removeItem: k => { if (blocked) throw Error('blocked'); data.delete(k); } };
  const document = { documentElement: { dataset: {} } };
  vm.runInNewContext(source, { window, document, localStorage, Event: class {} });
  return { theme: window.gameLabTheme, dataset: document.documentElement.dataset, media, handlers, data };
}
test('system tracks preference and explicit choice persists', () => {
  const s = setup({dark:true}); assert.equal(s.dataset.theme, 'dark');
  s.theme.set('light'); assert.equal(s.dataset.theme, 'light'); assert.equal(s.data.get('game-lab:theme'), 'light');
  s.theme.set('system'); assert.equal(s.dataset.theme, 'dark'); assert.equal(s.data.size, 0);
  s.media.matches = false; s.handlers.media(); assert.equal(s.dataset.theme, 'light');
});
test('blocked storage falls back to system', () => {
  const s = setup({blocked:true, dark:true}); s.theme.set('light');
  assert.equal(s.theme.get(), 'system'); assert.equal(s.dataset.theme, 'dark');
});
test('saved preference applies immediately', () => { const s = setup({stored:'dark'}); assert.equal(s.dataset.theme, 'dark'); });
