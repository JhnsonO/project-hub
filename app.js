const app = document.querySelector('#app');
const groupNav = document.querySelector('#group-nav');
const mobileGroupNav = document.querySelector('#mobile-group-nav');
const projectRoot = document.querySelector('#projects');
const countLabel = document.querySelector('#project-count');
const searchInput = document.querySelector('#project-search');
const pickUp = document.querySelector('#pick-up');
const groupNames = ['All projects', 'FFA', 'OEV', 'Personal'];
const statuses = new Set(['done', 'doing', 'blocked', 'todo']);
let projects = [];
let selectedGroup = 'All';
let searchTerm = '';

function validExternalLink(link) {
  if (!link || Object.keys(link).some((key) => !['provider', 'url'].includes(key))) return false;
  const hosts = { Google: 'docs.google.com', GitHub: 'github.com' };
  if (!Object.hasOwn(hosts, link.provider) || typeof link.url !== 'string') return false;
  try {
    const url = new URL(link.url);
    return url.protocol === 'https:' && url.hostname === hosts[link.provider];
  } catch (_) { return false; }
}

function validData(data) {
  if (data.schema_version !== 2 || !Array.isArray(data.projects) || !Array.isArray(data.groups)) return false;
  const ids = new Set();
  return data.projects.every((project) => {
    const allowed = ['id', 'name', 'mono', 'group', 'status', 'summary', 'milestones', 'next_step', 'blocker', 'watch', 'updated', 'workspace', 'roadmap', 'featured'];
    if (Object.keys(project).some((key) => !allowed.includes(key))) return false;
    if (!project.id || !project.name || !project.mono || !groupNames.slice(1).includes(project.group) || ids.has(project.id)) return false;
    if (!project.status || !project.summary || !project.next_step || !Array.isArray(project.milestones) || project.milestones.length < 2) return false;
    if (!project.milestones.every((phase) => phase.name && statuses.has(phase.status))) return false;
    if (!project.updated || !validExternalLink(project.workspace) || (project.roadmap && !validExternalLink(project.roadmap))) return false;
    ids.add(project.id);
    return true;
  });
}

function setTheme(theme) {
  if (!['light', 'dark', 'char'].includes(theme)) theme = 'dark';
  app.dataset.theme = theme;
  document.querySelectorAll('[data-theme-choice]').forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.themeChoice === theme));
  });
  try { localStorage.setItem('johnson-project-hub-theme', theme); } catch (_) { /* This visit still works. */ }
}

function getInitialTheme() {
  try {
    const saved = localStorage.getItem('johnson-project-hub-theme');
    return ['light', 'dark', 'char'].includes(saved) ? saved : 'dark';
  } catch (_) { return 'dark'; }
}

function externalLink(link, text) {
  const anchor = document.createElement('a');
  anchor.href = link.url;
  anchor.target = '_blank';
  anchor.rel = 'noopener noreferrer';
  anchor.className = 'detail-link';
  anchor.textContent = text;
  anchor.setAttribute('aria-label', `${text} (opens in a new tab)`);
  const arrow = document.createElement('span');
  arrow.setAttribute('aria-hidden', 'true');
  arrow.textContent = '↗';
  anchor.append(arrow);
  return anchor;
}

function makePhaseStrip(project) {
  const wrap = document.createElement('div');
  wrap.className = 'phase-strip';
  wrap.setAttribute('aria-label', 'Roadmap phases');
  const phases = document.createElement('div');
  phases.className = 'phase-pips';
  const done = project.milestones.filter((phase) => phase.status === 'done').length;
  const blocked = project.milestones.filter((phase) => phase.status === 'blocked').length;
  project.milestones.forEach((phase) => {
    const item = document.createElement('span');
    item.className = `phase-pip ${phase.status}`;
    item.title = `${phase.name}: ${phase.status}`;
    item.setAttribute('aria-label', `${phase.name}: ${phase.status}`);
    phases.append(item);
  });
  const counter = document.createElement('span');
  counter.className = 'phase-count';
  counter.textContent = `${done}/${project.milestones.length}${blocked ? ` · ${blocked} BLOCKED` : ''}`;
  wrap.append(phases, counter);
  return wrap;
}

function makeMilestoneList(project) {
  const board = document.createElement('div');
  board.className = 'milestone-board';
  const labels = { todo: 'Next', doing: 'Active', blocked: 'Blocked', done: 'Done' };
  ['todo', 'doing', 'blocked', 'done'].forEach((status) => {
    const phases = project.milestones.filter((phase) => phase.status === status);
    if (!phases.length) return;
    const lane = document.createElement('section');
    lane.className = `milestone-lane ${status}`;
    const heading = document.createElement('h5');
    heading.textContent = `${labels[status]} · ${phases.length}`;
    const list = document.createElement('ul');
    list.className = 'milestone-list';
    phases.forEach((phase) => {
      const item = document.createElement('li');
      item.className = `milestone ${status}`;
      const mark = document.createElement('span');
      mark.className = 'milestone-mark';
      mark.setAttribute('aria-hidden', 'true');
      const label = document.createElement('span');
      label.textContent = phase.name;
      item.append(mark, label);
      list.append(item);
    });
    lane.append(heading, list);
    board.append(lane);
  });
  return board;
}

function makeProjectCard(project) {
  const card = document.createElement('article');
  card.className = `project-card ${project.featured ? 'is-featured' : ''}`;
  card.dataset.projectId = project.id;

  const header = document.createElement('div');
  header.className = 'card-heading';
  const mono = document.createElement('span');
  mono.className = 'project-mono';
  mono.setAttribute('aria-hidden', 'true');
  mono.textContent = project.mono;
  const identity = document.createElement('div');
  identity.className = 'project-identity';
  const title = document.createElement('h4');
  title.className = 'project-title';
  title.textContent = project.name;
  identity.append(title);
  const badge = document.createElement('span');
  badge.className = 'status-badge';
  badge.textContent = project.status;
  header.append(mono, identity, badge);

  const phaseTitle = makePhaseStrip(project);

  const next = document.createElement('div');
  next.className = 'card-callout next-callout';
  const nextLabel = document.createElement('span');
  nextLabel.className = 'callout-label';
  nextLabel.textContent = 'NEXT';
  const nextText = document.createElement('p');
  nextText.textContent = project.next_step;
  next.append(nextLabel, nextText);

  const details = document.createElement('details');
  details.className = 'milestone-details';
  const summaryButton = document.createElement('summary');
  summaryButton.textContent = 'Details';

  const detailBody = document.createElement('div');
  detailBody.className = 'card-details-body';
  const projectSummary = document.createElement('p');
  projectSummary.className = 'project-summary';
  projectSummary.textContent = project.summary;
  detailBody.append(projectSummary, makeMilestoneList(project));
  if (project.blocker || project.watch) {
    const fullAlert = document.createElement('p');
    fullAlert.className = 'detail-alert';
    fullAlert.textContent = `${project.blocker ? 'Blocked: ' : 'Watch: '}${project.blocker || project.watch}`;
    detailBody.append(fullAlert);
  }

  const footer = document.createElement('div');
  footer.className = 'card-footer';
  footer.append(externalLink(project.workspace, 'Open tracker'));
  if (project.roadmap) footer.append(externalLink(project.roadmap, 'Full roadmap'));
  detailBody.append(footer);
  details.append(summaryButton, detailBody);

  card.append(header, phaseTitle, next);
  card.append(details);
  return card;
}

function makeGroupButton(name) {
  const key = name === 'All projects' ? 'All' : name;
  const count = key === 'All' ? projects.length : projects.filter((project) => project.group === key).length;
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'group-filter';
  button.dataset.group = key;
  button.setAttribute('aria-pressed', String(selectedGroup === key));
  const left = document.createElement('span');
  left.className = 'group-left';
  const square = document.createElement('span');
  square.className = 'group-square';
  square.setAttribute('aria-hidden', 'true');
  const label = document.createElement('span');
  label.textContent = name;
  left.append(square, label);
  const n = document.createElement('span');
  n.className = 'group-count';
  n.textContent = String(count).padStart(2, '0');
  button.append(left, n);
  button.addEventListener('click', () => { selectedGroup = key; renderGroups(); });
  return button;
}

function renderPickUp() {
  const project = projects.find((item) => item.featured) || projects.find((item) => item.milestones.some((phase) => phase.status === 'doing'));
  if (!project) return;
  pickUp.replaceChildren();
  const copy = document.createElement('span');
  copy.className = 'pick-copy';
  const eyebrow = document.createElement('small');
  eyebrow.textContent = `PICK UP HERE · ${project.group}`;
  const title = document.createElement('strong');
  title.textContent = project.name;
  const next = document.createElement('span');
  next.textContent = project.next_step;
  copy.append(eyebrow, title, next);
  const button = externalLink(project.workspace, 'OPEN TRACKER');
  button.className = 'pick-open';
  pickUp.append(copy, button);
  pickUp.hidden = false;
}

function renderGroups() {
  groupNav.replaceChildren(...groupNames.map(makeGroupButton));
  mobileGroupNav.replaceChildren(...groupNames.map(makeGroupButton));
  const needle = searchTerm.trim().toLocaleLowerCase();
  const filtered = projects.filter((project) => {
    const matchesGroup = selectedGroup === 'All' || project.group === selectedGroup;
    const text = `${project.name} ${project.group} ${project.status} ${project.summary} ${project.next_step} ${project.blocker || ''} ${project.watch || ''}`;
    return matchesGroup && (!needle || text.toLocaleLowerCase().includes(needle));
  });
  countLabel.textContent = `${String(filtered.length).padStart(2, '0')} SHOWN`;
  projectRoot.replaceChildren();
  [...new Set(filtered.map((project) => project.group))].forEach((groupName) => {
    const section = document.createElement('section');
    section.className = `project-group group-${groupName.toLowerCase()}`;
    const heading = document.createElement('div');
    heading.className = 'group-heading';
    const title = document.createElement('h3');
    title.textContent = groupName;
    const groupProjects = filtered.filter((project) => project.group === groupName);
    heading.append(title);
    section.append(heading, ...groupProjects.map(makeProjectCard));
    projectRoot.append(section);
  });
  if (!filtered.length) {
    const empty = document.createElement('p');
    empty.className = 'empty-state';
    empty.textContent = 'No projects match.';
    projectRoot.append(empty);
  }
}

function renderOverview(snapshotDate) {
  const active = projects.filter((project) => project.milestones.some((phase) => phase.status === 'doing')).length;
  document.querySelector('#active-count').textContent = String(active).padStart(2, '0');
  const date = new Date(`${snapshotDate}T00:00:00Z`);
  const label = Number.isNaN(date.getTime()) ? snapshotDate : date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' }).toUpperCase();
  document.querySelector('#updated-label').textContent = `UPDATED ${label}`;
  renderPickUp();
}

function showLoadError() {
  projectRoot.replaceChildren();
  const error = document.createElement('div');
  error.className = 'error-state';
  error.textContent = 'Project status could not load. Refresh to retry.';
  projectRoot.append(error);
  countLabel.textContent = 'Unavailable';
}

document.querySelectorAll('[data-theme-choice]').forEach((button) => {
  button.addEventListener('click', () => setTheme(button.dataset.themeChoice));
});
setTheme(getInitialTheme());
searchInput.addEventListener('input', () => { searchTerm = searchInput.value; renderGroups(); });
fetch('./data/projects.json', { cache: 'no-store' })
  .then((response) => { if (!response.ok) throw new Error(`HTTP ${response.status}`); return response.json(); })
  .then((data) => {
    if (!validData(data)) throw new Error('Invalid project status data');
    projects = data.projects;
    renderOverview(data.updated);
    renderGroups();
  })
  .catch(showLoadError);
