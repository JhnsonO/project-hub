import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { buildRoads } from '../road-model.mjs';
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
const oev = roads.find((r) => r.id === 'oev');
const grp = oev.nodes.find((n) => n.kind === 'group');
assert.ok(grp && grp.members.length >= 2, 'later backlog should be stacked into one node');
assert.ok(!oev.byId.get('oev-finish').deps.includes(grp.id), 'parked work must not gate the finish');
assert.ok(oev.nodes.filter((n) => n.status === 'blocked').every((n) => n.blocked_reason), 'blocked stops need a reason');
const sample = buildRoads([{ id: 'x', name: 'X', group: 'FFA', tasks: [{ id: 'x-1', name: 'a', status: 'done', depends_on: [] }] }]);
assert.equal(sample[0].toGo, 0);
const parkedOnly = buildRoads([{id:'optional',name:'Optional',group:'Personal',tasks:[
  {id:'optional-a',name:'Later A',status:'todo',lane:'Later / optional',depends_on:[]},
  {id:'optional-b',name:'Later B',status:'todo',lane:'Later / optional',depends_on:[]}
]}])[0];
const parkedCells=parkedOnly.nodes.map(n=>n.row+','+n.col);
assert.equal(new Set(parkedCells).size,parkedCells.length,'optional-only roadmap must not overlap its finish');
assert.ok(!parkedOnly.byId.get('optional-finish').deps.includes('optional-later'),'optional work must not gate completion');
console.log(`Road model OK for ${roads.length} projects.`);

