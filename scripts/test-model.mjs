import assert from 'node:assert/strict';
import {readFile,mkdtemp,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {counts,dependencyLayers,todayTasks,timeline} from '../model.mjs';
const tasks=[{id:'web-a',name:'A',status:'done',depends_on:[],start:'2026-10-12',end:'2026-10-20'},{id:'web-b',name:'B',status:'doing',depends_on:['web-a']},{id:'web-c',name:'C',status:'todo',depends_on:['web-b']},{id:'web-d',name:'D',status:'blocked',depends_on:[]}];
assert.equal(counts(tasks).pct,25);
assert.deepEqual(dependencyLayers(tasks).map(layer=>layer.map(t=>t.id)),[['web-a','web-d'],['web-b'],['web-c']]);
assert.throws(()=>dependencyLayers([{id:'a',depends_on:['b']},{id:'b',depends_on:['a']}]),/cycle/);
assert.throws(()=>dependencyLayers([{id:'a',depends_on:['missing']}]),/Unknown/);
assert.deepEqual(todayTasks([{id:'web',tasks}]).map(t=>t.id),['web-d','web-b']);
const tm=timeline(tasks);assert.equal(tm.weeks.length,2);assert.equal(tm.dated.length,1);assert.equal(tm.undated.length,3);
assert.equal(timeline([{id:'a',start:null,end:null}]).weeks.length,0);
const base=JSON.parse(await readFile(new URL('../data/projects.json',import.meta.url),'utf8'));
const dir=await mkdtemp(join(tmpdir(),'hub-validator-'));
const file=join(dir,'fixture.json');
try {
  const run=async record=>{await writeFile(file,JSON.stringify(record));return spawnSync(process.execPath,[new URL('./validate-projects.mjs',import.meta.url).pathname,file],{encoding:'utf8'});};
  base.projects[0].tasks=tasks.map(t=>({owner:null,note:'',last_touched:null,lane:'QA',start:null,end:null,...t}));
  assert.equal((await run(base)).status,0);
  const invalidStatus=structuredClone(base);invalidStatus.projects[0].tasks[0].status='maybe';assert.notEqual((await run(invalidStatus)).status,0);
  const cycle=structuredClone(base);cycle.projects[0].tasks[0].depends_on=['web-c'];assert.match((await run(cycle)).stderr,/cycle/);
  const dangling=structuredClone(base);dangling.projects[0].tasks[0].depends_on=['web-missing'];assert.match((await run(dangling)).stderr,/Unknown dependency/);
  const invalidDate=structuredClone(base);invalidDate.projects[0].tasks[0].start='2026-02-30';assert.match((await run(invalidDate)).stderr,/invalid start/);
} finally {await rm(dir,{recursive:true,force:true});}
console.log('Model and validator regression checks passed.');
