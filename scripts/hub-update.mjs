import { createHash } from 'node:crypto';
import { readFile, writeFile, rename, unlink, mkdtemp, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

// One public projection per update. Source writes happen through the active AI's
// authenticated tools; their verified receipts stay in the private handover.
export const digest = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const fail = message => { throw new Error(message); };
export function prepare(snapshot, journal, update) {
  if (update.version !== 1 || !/^[a-z0-9][a-z0-9-]{7,79}$/.test(update.id || '')) fail('Invalid update ID');
  if (!['chatgpt', 'claude'].includes(update.editor)) fail('Invalid editor');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(update.date || '') || !Number.isFinite(Date.parse(update.date)) || new Date(update.date).toISOString().slice(0,10) !== update.date) fail('Invalid date');
  if (update.public_safe !== true) fail('Review the projection for public safety first');
  if (!Array.isArray(update.sources) || !update.sources.length || update.sources.some(s => !s.record || !s.revision || s.readback_verified !== true)) fail('Verified canonical source receipts are required');
  if (!Array.isArray(update.projects) || !update.projects.length) fail('No project changes');
  const fingerprint = digest(update);
  const old = journal.updates.find(x => x.id === update.id);
  if (old) {
    if (old.fingerprint !== fingerprint) fail('Update ID already used for different content');
    return { snapshot, journal, duplicate: true };
  }
  const next = structuredClone(snapshot), seen = new Set();
  for (const change of update.projects) {
    const p = change.project;
    if (!p?.id || seen.has(p.id)) fail('Missing or duplicate project ID');
    seen.add(p.id);
    const i = next.projects.findIndex(x => x.id === p.id);
    if (i < 0) {
      if (change.expected_hash !== null) fail('New project requires expected_hash null');
      if (next.projects.some(x => x.name.trim().toLowerCase() === p.name?.trim().toLowerCase())) fail('Possible duplicate project name');
      next.projects.push(p);
    } else {
      if (digest(next.projects[i]) !== change.expected_hash) fail('Project changed since read; reconcile latest version');
      const before = next.projects[i];
      for (const task of before.tasks || []) {
        const replacement = p.tasks?.find(t => t.id === task.id);
        if (!replacement) fail('Existing task history must be retained');
        if (task.status === 'done' && replacement.status !== 'done' && !change.reopen_reason?.trim()) fail('Reopening completed work requires a reason');
      }
      next.projects[i] = p;
    }
    if (!next.groups.includes(p.group)) next.groups.push(p.group);
  }
  next.updated = update.date; next.updated_by = update.editor;
  // This public journal intentionally stores hashes and IDs, not source content,
  // private revisions, conversation excerpts or source receipts.
  const entry = { id: update.id, fingerprint, date: update.date, editor: update.editor,
    projects: update.projects.map(x => x.project.id), snapshot_hash: digest(next) };
  return { snapshot: next, journal: { version: 1, updates: [...journal.updates, entry] }, duplicate: false };
}
export function verifyLive(expected, actual, updateId) {
  const a = expected.journal.updates.find(x => x.id === updateId);
  const b = actual.journal.updates.find(x => x.id === updateId);
  if (!a || !b || a.fingerprint !== b.fingerprint) fail('Update receipt is not live');
  // Match the exact prepared snapshot. A later publication requires re-reading
  // and independently reconciling it, rather than silently claiming success.
  if (digest(expected.snapshot) !== digest(actual.snapshot)) fail('Live snapshot differs from the prepared publication');
  return { update: updateId, status: 'live_verified', snapshot_hash: digest(actual.snapshot) };
}
async function main() {
  const [command, arg, root = '.'] = process.argv.slice(2);
  const snapshotPath = join(root,'data/projects.json'), journalPath = join(root,'data/updates.json');
  const snapshot = JSON.parse(await readFile(snapshotPath,'utf8'));
  const journal = JSON.parse(await readFile(journalPath,'utf8'));
  if (command === 'hash') {
    const p = snapshot.projects.find(p => p.id === arg); if (!p) fail('Unknown project');
    console.log(digest(p)); return;
  }
  if (command === 'verify') {
    const base = 'https://jhnsono.github.io/project-hub/';
    const get = async path => {
      const response = await fetch(base+path+'?check='+Date.now(), { cache:'no-store' });
      if (!response.ok) fail('Live read failed: '+response.status);
      return response.json();
    };
    const [liveSnapshot,liveJournal] = await Promise.all([get('data/projects.json'),get('data/updates.json')]);
    console.log(JSON.stringify(verifyLive({snapshot,journal},{snapshot:liveSnapshot,journal:liveJournal},arg))); return;
  }
  if (command !== 'apply' || !arg) fail('Usage: hub-update.mjs hash PROJECT [ROOT] | apply PRIVATE_UPDATE_JSON [ROOT] | verify UPDATE_ID [ROOT]');
  const update = JSON.parse(await readFile(arg,'utf8'));
  const next = prepare(snapshot,journal,update);
  if (next.duplicate) { console.log('Already applied; no changes.'); return; }
  const temp = await mkdtemp(join(tmpdir(),'hub-update-'));
  try {
    const candidate = join(temp,'projects.json');
    await writeFile(candidate,JSON.stringify(next.snapshot,null,2)+'\n');
    const check = spawnSync(process.execPath,[new URL('./validate-projects.mjs',import.meta.url).pathname,candidate],{encoding:'utf8'});
    if (check.status !== 0) fail(check.stderr || 'Snapshot validation failed');
    // Recheck both files immediately before staging to catch concurrent edits.
    if (digest(JSON.parse(await readFile(snapshotPath,'utf8'))) !== digest(snapshot) || digest(JSON.parse(await readFile(journalPath,'utf8'))) !== digest(journal)) fail('Files changed during preparation; retry from latest');
    await writeFile(snapshotPath+'.pending',JSON.stringify(next.snapshot,null,2)+'\n',{flag:'wx'});
    try {
      await writeFile(journalPath+'.pending',JSON.stringify(next.journal,null,2)+'\n',{flag:'wx'});
      await rename(snapshotPath+'.pending',snapshotPath);
      await rename(journalPath+'.pending',journalPath);
    } catch (error) {
      await unlink(snapshotPath+'.pending').catch(()=>{});
      await unlink(journalPath+'.pending').catch(()=>{});
      throw error;
    }
    console.log(JSON.stringify({update:update.id,status:'prepared_pending_publication',snapshot_hash:digest(next.snapshot)}));
  } finally { await rm(temp,{recursive:true,force:true}); }
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main().catch(error=>{console.error(error.message);process.exitCode=1;});
