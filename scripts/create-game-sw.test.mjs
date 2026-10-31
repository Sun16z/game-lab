import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve, join } from 'node:path';
import { execFileSync } from 'node:child_process';
import vm from 'node:vm';

function worker(fetchImpl) {
  const root = mkdtempSync(join(tmpdir(), 'game-sw-'));
  try {
    mkdirSync(join(root, 'dist'));
    writeFileSync(join(root, 'dist/index.html'), '<!doctype html><html><head></head><body>new install</body></html>');
    execFileSync(process.execPath, [resolve('scripts/create-game-sw.mjs'), 'test-game'], { cwd: root });
    const handlers = {}, saved = new Map();
    const scope = 'https://example.test/play/test-game/';
    const cache = { match: async key => saved.get(typeof key === 'string' ? key : key.url)?.clone(), put: async (key, response) => saved.set(key.url, response) };
    const context = { self: { registration: { scope }, location: { origin: 'https://example.test' }, addEventListener: (type, handler) => { handlers[type] = handler; } }, caches: { open: async () => cache }, fetch: fetchImpl, URL, Response };
    vm.runInNewContext(readFileSync(join(root, 'dist/sw.js'), 'utf8'), context);
    return { scope, saved, request: async url => { let result; const pending = []; handlers.fetch({ request: { url, method: 'GET', mode: 'navigate' }, respondWith: promise => { result = promise; }, waitUntil: promise => pending.push(promise) }); const response = await result; await Promise.all(pending); return response; } };
  } finally { rmSync(root, { recursive: true, force: true }); }
}
test('online navigation replaces an older cached document', async () => {
  const w = worker(async () => new Response('new characters'));
  w.saved.set(w.scope, new Response('old game'));
  assert.equal(await (await w.request(w.scope)).text(), 'new characters');
  assert.equal(await w.saved.get(w.scope).clone().text(), 'new characters');
});
test('offline navigation retains a playable document, including query links', async () => {
  const w = worker(async () => { throw new Error('offline'); });
  w.saved.set(w.scope, new Response('offline game'));
  assert.equal(await (await w.request(w.scope + '?lang=en')).text(), 'offline game');
});
test('an online 404 is returned instead of a stale cached success', async () => {
  const w = worker(async () => new Response('missing', { status: 404 }));
  w.saved.set(w.scope, new Response('old game'));
  assert.equal((await w.request(w.scope)).status, 404);
});
