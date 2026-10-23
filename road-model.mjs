// Builds a "road to the finish line" per project from data/projects.json.
// Done work collapses into one start node; open tasks become stops. Column = dependency depth, row = track (lane).
export function buildRoad(project) {
  const tasks = project.tasks || [];
  const done = tasks.filter((t) => t.status === 'done');
  const open = tasks.filter((t) => t.status !== 'done');
  const openIds = new Set(open.map((t) => t.id));
  const startId = project.id + '-start', finishId = project.id + '-finish';
  const last = done.map((t) => t.completed_on || t.last_touched || '').sort().pop() || '';
  const start = { id: startId, kind: 'start', name: 'Done so far: ' + done.length, status: 'done', note: done.length + ' tasks finished' + (last ? '; most recent ' + last : '') + '.', deps: [], lane: '' };
  const stops = open.map((t) => ({ ...t, kind: 'stop', deps: [...new Set((t.depends_on || []).map((d) => (openIds.has(d) ? d : startId)))] }));
  stops.forEach((s) => { if (!s.deps.length) s.deps = [startId]; });
  // parked work (lane named Later/Backlog, nothing depends on it) is stacked into one node so the road stays short
  const parked = stops.filter((s) => /later|backlog/i.test(s.lane || '') && s.status === 'todo' && s.deps.length === 1 && s.deps[0] === startId && !stops.some((y) => y.deps.includes(s.id)));
  let group = null;
  if (parked.length >= 2) {
    group = { id: project.id + '-later', kind: 'group', name: 'Later: ' + parked.length, status: 'todo', note: 'Parked for later: ' + parked.length + ' items.', members: parked.map((s) => s.name), deps: [startId], lane: parked[0].lane };
  }
  const flat = group ? stops.filter((s) => !parked.includes(s)) : stops;
  const nodesIn = group ? [...flat, group] : flat;
  const byId = new Map([[startId, start], ...nodesIn.map((s) => [s.id, s])]);
  const memo = new Map();
  const depth = (id) => {
    if (memo.has(id)) return memo.get(id);
    const n = byId.get(id);
    const d = n.deps.length ? 1 + Math.max(...n.deps.map(depth)) : 0;
    memo.set(id, d); return d;
  };
  [start, ...nodesIn].forEach((n) => { n.col = depth(n.id); });
  // Optional work still occupies a grid cell even though it does not gate
  // completion. Keep the finish beyond it when all remaining work is parked.
  const maxc = Math.max(0, ...nodesIn.map((s) => s.col));
  const sinks = [start, ...flat].filter((n) => ![start, ...flat].some((y) => y.deps.includes(n.id))).map((n) => n.id);
  const finish = { id: finishId, kind: 'finish', name: project.name + ' complete', status: 'finish', note: 'The finish line for this road.', deps: sinks, col: maxc + 1, lane: '' };
  const nodes = [start, ...nodesIn, finish];

  // rows: one lane may need several tracks when stops share a column
  const lanes = [...new Set(nodesIn.map((s) => s.lane || 'General'))];
  const tracks = []; // {lane, cells:Set(col)}
  const laneTracks = new Map(lanes.map((l) => [l, []]));
  const place = (n, lane) => {
    const mine = laneTracks.get(lane);
    let t = mine.find((x) => !x.cells.has(n.col) && n.deps.every((d) => { const f = byId.get(d); if (!f || f.row === undefined) return true; for (let c = f.col + 1; c < n.col; c++) if (tracks[f.row].cells.has(c)) return false; return true; }));
    if (!t) { t = { lane, cells: new Set(), label: !mine.length }; mine.push(t); tracks.push(t); }
    t.cells.add(n.col); n.row = tracks.indexOf(t);
  };
  // start and finish sit on track 0 once it exists
  const order = [...nodesIn].sort((a, b) => a.col - b.col || lanes.indexOf(a.lane || 'General') - lanes.indexOf(b.lane || 'General') || a.id.localeCompare(b.id));
  if (!order.length) { tracks.push({ lane: 'Road', cells: new Set(), label: true }); }
  order.forEach((s) => place(s, s.lane || 'General'));
  start.row = 0; tracks[0].cells.add(0);
  finish.row = 0; tracks[0].cells.add(finish.col);
  const counts = (st) => tasks.filter((t) => t.status === st).length;
  const ready = stops.filter((s) => s.status === 'todo' && s.deps.every((d) => byId.get(d).status === 'done'));
  const cur = stops.filter((s) => s.status === 'doing');
  return {
    id: project.id, name: project.name, group: project.group, nodes, byId: new Map(nodes.map((n) => [n.id, n])),
    tracks: tracks.map((t) => (t.label ? t.lane : '')), nCols: maxc + 2,
    total: tasks.length, done: done.length, doing: counts('doing'), blocked: counts('blocked'), toGo: open.length,
    next: cur.length ? cur : ready.slice(0, 1)
  };
}
export const buildRoads = (projects) => projects.map(buildRoad).sort((a, b) => a.toGo - b.toGo || a.name.localeCompare(b.name));

