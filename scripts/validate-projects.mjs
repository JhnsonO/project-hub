import { readFile } from 'node:fs/promises';

const file = new URL('../data/projects.json', import.meta.url);
let source;
try { source = await readFile(file, 'utf8'); }
catch { throw new Error('Could not find data/projects.json'); }
let data;
try { data = JSON.parse(source); }
catch { throw new Error('data/projects.json is not valid JSON'); }

const allowedGroups = new Set(['FFA', 'OEV', 'Personal']);
const allowedStatuses = new Set(['done', 'doing', 'blocked', 'todo']);
const allowedHosts = new Map([['Google', 'docs.google.com'], ['GitHub', 'github.com']]);
const projectKeys = new Set(['id', 'name', 'mono', 'group', 'status', 'summary', 'milestones', 'next_step', 'blocker', 'watch', 'updated', 'workspace', 'roadmap', 'featured']);
const fail = (message) => { console.error(`Project status validation failed: ${message}`); process.exit(1); };

if (data.schema_version !== 2) fail('unsupported schema_version');
if (!/^\d{4}-\d{2}-\d{2}$/.test(data.updated || '')) fail('updated must be an ISO date');
if (!['claude', 'chatgpt'].includes(data.updated_by)) fail('updated_by must identify the editing assistant');
if (!Array.isArray(data.groups) || !Array.isArray(data.projects)) fail('groups and projects must be arrays');
if (new Set(data.groups).size !== data.groups.length) fail('duplicate groups');
if (data.groups.some((group) => !allowedGroups.has(group))) fail('unknown group');
if (data.projects.length === 0) fail('no projects found');

const ids = new Set();
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
  validateLink(project.workspace, `${project.id}.workspace`);
  if (project.roadmap) validateLink(project.roadmap, `${project.id}.roadmap`);
  for (const key of ['blocker', 'watch']) if (project[key] !== undefined && typeof project[key] !== 'string') fail(`${project.id}.${key} must be text`);
}

console.log(`Validated ${data.projects.length} project snapshots across ${data.groups.length} groups.`);
