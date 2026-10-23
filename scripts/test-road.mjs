import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { buildRoads } from '../road.mjs';
const data = JSON.parse(await readFile(new URL('../data/projects.json', import.meta.url), 'utf8'));
const roads = buildRoads(data.projects.filter((p) => p.tasks));
assert.ok(roads.length >= 1, 'no roads');
for (const r of roads) {
  const cells = new Set();
  const ids = new Set(r.nodes.map((n) => n.id));
  assert.equal(ids.size, r.nodes.length, r.id + ': duplicate node ids');
  for (const n of r.nodes) {
    for (const d of n.deps) assert.ok(ids.has(d), `${n.id}: unknown dep ${d}`);
    const key = n.row + ',' + n.col;
    assert.ok(!cells.has(key), `${r.id}: two nodes share cell ${key}`);
    cells.add(key);
    assert.ok(n.row >= 0 && n.row < r.tracks.length, `${n.id}: bad row`);
  }
  assert.equal(r.done + r.toGo, r.total, r.id + ': counts');
  assert.ok(r.byId.get(r.id + '-finish').deps.length, r.id + ': finish unreachable');
}
const sample = buildRoads([{ id: 'x', name: 'X', group: 'FFA', tasks: [{ id: 'x-1', name: 'a', status: 'done', depends_on: [] }] }]);
assert.equal(sample[0].toGo, 0);
console.log(`Road model OK for ${roads.length} projects.`);
