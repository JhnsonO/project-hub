import { readFile } from 'node:fs/promises';
import { digest } from './hub-update.mjs';
const read = path => readFile(new URL(path, import.meta.url),'utf8').then(JSON.parse);
const [snapshot,journal] = await Promise.all([read('../data/projects.json'),read('../data/updates.json')]);
if (journal.version !== 1 || !Array.isArray(journal.updates)) throw new Error('Invalid update journal');
const ids = new Set();
for (const u of journal.updates) {
  if (Object.keys(u).sort().join() !== ['date','editor','fingerprint','id','projects','snapshot_hash'].sort().join()) throw new Error('Unexpected update field');
  if (!/^[a-z0-9][a-z0-9-]{7,79}$/.test(u.id) || ids.has(u.id)) throw new Error('Duplicate/invalid update ID');
  ids.add(u.id);
  if (![u.fingerprint,u.snapshot_hash].every(x=>/^[a-f0-9]{64}$/.test(x))) throw new Error('Invalid hash');
  if (!['claude','chatgpt'].includes(u.editor) || !/^\d{4}-\d{2}-\d{2}$/.test(u.date) || !Number.isFinite(Date.parse(u.date)) || new Date(u.date).toISOString().slice(0,10)!==u.date) throw new Error('Invalid editor/date');
  if (!Array.isArray(u.projects) || !u.projects.length || new Set(u.projects).size!==u.projects.length || u.projects.some(id=>!snapshot.projects.some(p=>p.id===id))) throw new Error('Invalid project IDs');
}
if (journal.updates.length && journal.updates.at(-1).snapshot_hash !== digest(snapshot)) throw new Error('Snapshot changed without a matching update receipt; use hub-update.mjs');
console.log('Update journal matches the snapshot.');
