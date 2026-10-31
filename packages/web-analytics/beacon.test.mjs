import { test } from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { beaconLoader } from './beacon.mjs';
const token = '0123456789abcdef0123456789abcdef';
test('missing token produces no loader and invalid token fails the build', () => {
  assert.equal(beaconLoader(''), ''); assert.throws(() => beaconLoader('invalid'));
});
test('beacon loads once only on the production hostname', () => {
  for (const host of ['games.somewhen.life', 'pr-1.workers.dev', 'localhost', 'games.somewhen.life.example.com']) {
    const nodes = [], document = { createElement: () => ({setAttribute(k,v){this[k]=v}}), body:{appendChild: e=>nodes.push(e)} };
    vm.runInNewContext(beaconLoader(token), { location: {hostname:host}, document, JSON });
    assert.equal(nodes.length, host === 'games.somewhen.life' ? 1 : 0);
    if (nodes.length) { assert.equal(nodes[0].type, 'module'); assert.equal(nodes[0].src, 'https://static.cloudflareinsights.com/beacon.min.js'); assert.deepEqual(JSON.parse(nodes[0]['data-cf-beacon']), {token}); }
  }
});
