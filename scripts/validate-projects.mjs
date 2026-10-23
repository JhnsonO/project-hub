import { readFile } from 'node:fs/promises';
import { dependencyLayers } from '../model.mjs';

const file = process.argv[2] || new URL('../data/projects.json', import.meta.url);
let source;
try { source = await readFile(file, 'utf8'); }
catch { throw new Error('Could not find data/projects.json'); }
let data;
try { data = JSON.parse(source); }
catch { throw new Error('data/projects.json is not valid JSON'); }

const allowedGroups = new Set(['FFA', 'OEV', 'Personal']);
const allowedStatuses = new Set(['done', 'doing', 'blocked', 'todo']);
const allowedHosts = new Map([['Google', 'docs.google.com'], ['GitHub', 'github.com']]);
const projectKeys = new Set(['id', 'name', 'mono', 'group', 'status', 'summary', 'milestones', 'next_step', 'blocker', 'watch', 'updated', 'workspace', 'roadmap', 'featured', 'target', 'target_asked_on', 'questions', 'tasks']);
const isIsoDate = (value) => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
const fail = (message) => { console.error(`Project status validation failed: ${message}`); process.exit(1); };

if (data.schema_version !== 2) fail('unsupported schema_version');
if (!isIsoDate(data.updated)) fail('updated must be a real ISO calendar date');
if (!['claude', 'chatgpt'].includes(data.updated_by)) fail('updated_by must identify the editing assistant');
if (!Array.isArray(data.groups) || !Array.isArray(data.projects)) fail('groups and projects must be arrays');
if (new Set(data.groups).size !== data.groups.length) fail('duplicate groups');
if (data.groups.some((group) => !allowedGroups.has(group))) fail('unknown group');
if (data.projects.length === 0) fail('no projects found');

const ids = new Set();
const allTaskIds = new Set();
function validateLink(link, where) {
  if (!link || typeof link.url !== 'string' || !allowedHosts.has(link.provider)) fail(`${where}: invalid link record`);
  if (Object.keys(link).some((key) => !['provider', 'url'].includes(key))) fail(`${where}: unexpected link field`);
  let url;
  try { url = new URL(link.url); } catch { fail(`${where}: invalid URL`); }
  if (url.protocol !== 'https:' || allowedHosts.get(link.provider) !== url.hostname) fail(`${where}: provider and HTTPS host do not match`);
}

for (const project of data.projects) {
  if (Object.keys(project).some((key) => !projectKeys.has(key))) fail(`${project.id || 'project'} contains an unexpected field`);
  if (!project.id || !project.name || !project.mono || !allowedGroups.has(project.group) || !project.status || !project.summary || !project.next_step) fail('project is missing a required field');
  if (ids.has(project.id)) fail(`duplicate project id: ${project.id}`);
  ids.add(project.id);
  if (!/^\d{2} [A-Z]{3}$/.test(project.updated || '')) fail(`${project.id}.updated must be DD MON`);
  if (!Array.isArray(project.milestones) || project.milestones.length < 2) fail(`${project.id} needs at least two milestones`);
  if (project.milestones.some((phase) => !phase.name || Object.keys(phase).some((key) => !['name', 'status'].includes(key)) || !allowedStatuses.has(phase.status))) fail(`${project.id} has an invalid milestone`);
  if (project.tasks !== undefined) {
    const taskKeys = new Set(['id','name','status','owner','note','last_touched','lane','start','end','depends_on','completed_on','evidence','date_basis','date_note','blocked_reason']);
    if (!Array.isArray(project.tasks) || !project.tasks.length) fail(`${project.id}: tasks must be a nonempty array`);
    const taskIds = new Set();
    for (const task of project.tasks) {
      if (!task.id || !task.name || !allowedStatuses.has(task.status) || Object.keys(task).some(k=>!taskKeys.has(k))) fail(`${project.id}: invalid task`);
      if (!task.id.startsWith(project.id+'-') || allTaskIds.has(task.id)) fail(`${task.id}: task IDs must be unique and prefixed by project ID`);
      allTaskIds.add(task.id);
      if (taskIds.has(task.id)) fail(`${project.id}: duplicate task id`);
      taskIds.add(task.id);
      if (task.blocked_reason !== undefined && (task.status !== 'blocked' || typeof task.blocked_reason !== 'string' || !task.blocked_reason.trim() || task.blocked_reason.length > 80)) fail(`${task.id}: blocked_reason must be short text on a blocked task`);
      if (task.owner != null && !['claude','chatgpt'].includes(task.owner)) fail(`${task.id}: invalid owner`);
      if (!Array.isArray(task.depends_on) || new Set(task.depends_on).size !== task.depends_on.length) fail(`${task.id}: invalid dependencies`);
      for (const key of ['start','end','last_touched','completed_on']) if (task[key] != null && (!/^\d{4}-\d{2}-\d{2}$/.test(task[key]) || Number.isNaN(Date.parse(task[key])) || new Date(task[key]).toISOString().slice(0,10) !== task[key])) fail(`${task.id}: invalid ${key}`);
      if (task.completed_on && task.status!=='done') fail(`${task.id}: only done items can have a completion date`);
      if (task.evidence !== undefined) {
        if (!Array.isArray(task.evidence) || !task.evidence.length) fail(`${task.id}: invalid evidence`);
        for (const evidence of task.evidence) {
          const {label,...link}=evidence;
          if (typeof label!=='string' || !label) fail(`${task.id}: missing evidence label`);
          validateLink(link,`${task.id}.evidence`);
        }
      }
      if (task.date_basis != null && (!['observed','planned'].includes(task.date_basis) || !task.start || !task.end || typeof task.date_note!=='string' || !task.date_note.trim() || !task.evidence?.length)) fail(`${task.id}: dated activity needs valid basis, note and source evidence`);
      if (Boolean(task.start)!==Boolean(task.end) || (task.start && task.start>task.end)) fail(`${task.id}: invalid date range`);
    }
    const dates=project.tasks.flatMap(t=>[t.start,t.end,t.completed_on]).filter(Boolean).map(Date.parse);
    if(dates.length && Math.max(...dates)-Math.min(...dates)>5*366*86400000) fail(`${project.id}: timeline exceeds five years`);
    try { dependencyLayers(project.tasks); } catch (error) { fail(`${project.id}: ${error.message}`); }
  }
  if (project.questions !== undefined) {
    if (!Array.isArray(project.questions)) fail(`${project.id}.questions must be an array`);
    const qids = new Set();
    for (const q of project.questions) {
      if (!q || typeof q !== 'object' || Object.keys(q).some(k => !['id', 'text', 'asked_on'].includes(k))) fail(`${project.id}.questions entries allow only id, text, asked_on`);
      if (typeof q.id !== 'string' || !q.id || qids.has(q.id)) fail(`${project.id}.questions needs unique ids`);
      qids.add(q.id);
      if (typeof q.text !== 'string' || !q.text.trim() || q.text.length > 80) fail(`${project.id}.questions text must be 1-80 characters`);
      if (!isIsoDate(q.asked_on)) fail(`${project.id}.questions asked_on must be a real ISO calendar date`);
    }
  }
  if (project.target != null && !isIsoDate(project.target)) fail(`${project.id}.target must be a real ISO calendar date`);
  if (project.target_asked_on !== undefined && (!isIsoDate(project.target_asked_on) || project.target != null)) fail(`${project.id}.target_asked_on must be a real date only while target is missing`);
  if (project.tasks?.some(task => task.status !== 'done') && project.target == null && !isIsoDate(project.target_asked_on)) fail(`${project.id}.target_asked_on must record when its missing target was first surfaced`);
  validateLink(project.workspace, `${project.id}.workspace`);
  if (project.roadmap) validateLink(project.roadmap, `${project.id}.roadmap`);
  for (const key of ['blocker', 'watch']) if (project[key] !== undefined && typeof project[key] !== 'string') fail(`${project.id}.${key} must be text`);
}

console.log(`Validated ${data.projects.length} project snapshots across ${data.groups.length} groups.`);
