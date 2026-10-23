import { buildRoads } from './road.mjs';
const MODES = [['light', 'Light'], ['dark', 'Dark HUD'], ['char', 'Charcoal']];
const LABEL = { todo: 'To do', doing: 'In progress', blocked: 'Blocked', done: 'Done', finish: 'Finish line' };
const AGENT = { claude: 'Claude', chatgpt: 'ChatGPT' };
const THEME_KEY = 'johnson-project-hub-theme', OPEN_KEY = 'johnson-project-hub-road-open';
const app = document.getElementById('app');
const S = { data: null, roads: [], mode: 'dark', open: {}, sel: null, more: false };
const store = (k, v) => { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch {} return null; };
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const first = (s) => { const m = /^.*?[.!?](?=\s|$)/.exec(s || ''); return m ? m[0] : s || ''; };
const hl = (pos, solid) => 'position:absolute;height:0;' + pos + (solid ? 'top:37px;border-top:4px solid var(--mid);' : 'top:38px;border-top:2px dashed var(--mid);opacity:.7;');
const vl = (kind, solid) => 'position:absolute;left:50%;width:0;' + (solid ? 'border-left:4px solid var(--mid);margin-left:-2px;' : 'border-left:2px dashed var(--mid);margin-left:-1px;opacity:.7;') + (kind === 'min' ? 'top:37px;bottom:0;' : kind === 'max' ? 'top:0;height:41px;' : 'top:0;bottom:0;');

function diagram(m, ri) {
  const nRows = m.tracks.length, K = 2 * m.nCols - 1, lines = {};
  const add = (r, k, st) => { (lines[r + ',' + k] ||= []).push(st); };
  m.nodes.forEach((to) => to.deps.forEach((fid) => {
    const from = m.byId.get(fid), solid = from.status === 'done', fc = from.col, fr = from.row, tc = to.col, tr = to.row;
    add(fr, 2 * fc, hl('left:50%;right:0;', solid));
    for (let c = fc + 1; c <= tc - 1; c++) add(fr, 2 * c, hl('left:0;right:0;', solid));
    for (let g = fc; g <= tc - 2; g++) add(fr, 2 * g + 1, hl('left:0;right:0;', solid));
    const G = 2 * (tc - 1) + 1;
    if (fr === tr) add(fr, G, hl('left:0;right:0;', solid));
    else {
      add(fr, G, hl('left:0;right:50%;', solid)); add(tr, G, hl('left:50%;right:0;', solid));
      const lo = Math.min(fr, tr), hi = Math.max(fr, tr);
      for (let r = lo; r <= hi; r++) add(r, G, vl(r === lo ? 'min' : r === hi ? 'max' : 'mid', solid));
    }
    add(tr, 2 * tc, hl('left:0;right:50%;', solid));
  }));
  const at = {}; m.nodes.forEach((x) => { at[x.row + ',' + 2 * x.col] = x; });
  let html = '';
  for (let r = 0; r < nRows; r++) {
    html += '<div class="cell">' + (m.tracks[r] ? '<span class="lane">' + esc(m.tracks[r]) + '</span>' : '') + '</div>';
    for (let k = 0; k < K; k++) {
      const x = at[r + ',' + k];
      html += '<div class="cell">' + (lines[r + ',' + k] || []).map((s) => '<span style="' + s + '"></span>').join('');
      if (x) {
        const sel = S.sel && S.sel.ri === ri && S.sel.id === x.id, next = m.next.includes(x);
        const sub = x.status === 'blocked' ? 'Blocked' : '';
        html += `<button class="stop" data-act="stop" data-ri="${ri}" data-id="${esc(x.id)}" aria-pressed="${!!sel}" aria-label="${esc(x.name + ', ' + LABEL[x.status] + ', on the ' + m.name + ' road')}">`
          + `<span class="tagrow">${next ? '<span class="tag">' + (x.status === 'doing' ? 'HERE' : 'NEXT') + '</span>' : ''}</span>`
          + `<span class="nodewrap"><span class="node ${x.status}${sel ? ' sel' : ''}"></span></span><span class="slabel ${x.status}">${esc(x.name)}</span>${sub ? '<span class="sub">' + sub + '</span>' : ''}</button>`;
      }
      html += '</div>';
    }
  }
  const cols = '76px ' + Array.from({ length: K }, (v, k) => (k % 2 === 0 ? 'minmax(96px,1fr)' : '26px')).join(' ');
  return `<div class="scroll"><div class="grid" style="min-width:${76 + m.nCols * 96 + (m.nCols - 1) * 26}px;grid-template-columns:${cols}">${html}</div></div>`;
}

function panel(m) {
  const x = m.byId.get(S.sel.id); if (!x) return '';
  const needs = x.deps.map((d) => m.byId.get(d)?.name).filter(Boolean), unlocks = m.nodes.filter((y) => y.deps.includes(x.id)).map((y) => y.name);
  const after = (needs.length ? 'Needs: ' + needs.join(', ') : 'Starts the road') + '  //  ' + (unlocks.length ? 'Unlocks: ' + unlocks.join(', ') : 'End of the road');
  let h = `<div class="detail"><div style="display:flex;flex-wrap:wrap;align-items:baseline;gap:4px 14px"><b>${esc(x.name)}</b><span class="meta">${esc(LABEL[x.status] + (x.owner ? ' // ' + AGENT[x.owner] : '') + (x.lane ? ' // ' + x.lane : ''))}</span></div><span>${esc(first(x.note))}</span><span class="meta">${esc(after)}</span>`;
  const more = x.kind === 'stop' && ((x.note || '').length > first(x.note).length || (x.evidence || []).length || x.last_touched);
  if (more) {
    if (!S.more) h += '<button class="link" data-act="more">More</button>';
    else {
      h += '<div class="more">' + ((x.note || '').length > first(x.note).length ? `<span>${esc(x.note)}</span>` : '');
      if (x.evidence?.length) h += '<h4>EVIDENCE (PROTECTED DOCS)</h4><ul>' + x.evidence.map((e) => `<li><a style="color:var(--fg)" href="${esc(e.url)}" rel="noopener noreferrer" target="_blank">${esc(e.label)}</a> <span class="meta">${esc(e.provider)}</span></li>`).join('') + '</ul>';
      if (x.last_touched) h += `<h4>LAST TOUCHED</h4><span class="meta">${esc(x.last_touched)}</span>`;
      h += '<button class="link" data-act="less">Less</button></div>';
    }
  }
  return h + '</div>';
}

function render() {
  document.body.dataset.mode = S.mode;
  const rs = S.roads, sum = (k) => rs.reduce((n, m) => n + m[k], 0), anyOpen = rs.some((m) => S.open[m.id]);
  const ahead = sum('toGo') - sum('doing') - sum('blocked');
  let h = `<header><div class="col" style="gap:4px"><span class="kick"><a class="back" href="./">← HUB</a>ROADMAP // ${esc(S.data.updated)}</span><h1>Road to the finish line</h1></div><div class="row">${MODES.map(([k, l]) => `<button class="btn" data-act="mode" data-mode="${k}" aria-pressed="${S.mode === k}">${l}</button>`).join('')}</div></header>`;
  h += `<section class="panel"><div class="hero"><div class="col" style="align-items:flex-end"><span class="big">${sum('toGo')}</span><span class="lbl" style="font-size:12px;letter-spacing:.16em">STOPS TO GO</span></div><div class="counts">${[['done', sum('done'), 'REACHED'], ['doing', sum('doing'), 'IN PROGRESS'], ['blocked', sum('blocked'), 'ROADBLOCKS'], ['todo', ahead, 'AHEAD']].map(([c, n, l]) => `<div class="count"><span class="dot ${c}"></span><div class="col"><span class="mid">${n}</span><span class="lbl">${l}</span></div></div>`).join('')}</div></div></section>`;
  h += `<section class="col" style="gap:18px"><div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px"><span class="sect">// THE ROADS, CLOSEST TO FINISH FIRST</span><button class="btn" data-act="all">${anyOpen ? 'Collapse all' : 'Expand all'}</button></div>`;
  rs.forEach((m, ri) => {
    const open = !!S.open[m.id], w = (c) => (c / m.total * 100) + '%', nx = m.next.length ? m.next[0].name + (m.next.length > 1 ? ` +${m.next.length - 1} in parallel` : '') : 'Finish line';
    h += `<div class="panel road"><button class="head" data-act="road" data-id="${esc(m.id)}" aria-expanded="${open}"><span style="display:flex;flex-wrap:wrap;align-items:baseline;gap:4px 14px"><span class="mono" style="width:14px;color:var(--acc)">${open ? '▾' : '▸'}</span><span class="name">${esc(m.name)}</span><span class="lbl">${esc(m.group.toUpperCase())}</span>${ri === 0 ? '<span class="tag">CLOSEST TO FINISH</span>' : ''}</span>`
      + `<span style="display:flex;flex-wrap:wrap;align-items:center;gap:8px 16px"><span class="bar" aria-hidden="true"><i style="width:${w(m.done)};background:var(--mid)"></i><i style="width:${w(m.doing)};background:var(--acc)"></i><i style="width:${w(m.blocked)};background:repeating-linear-gradient(135deg,var(--mid) 0,var(--mid) 3px,transparent 3px,transparent 6px)"></i></span><span class="meta">${Math.round(m.done / m.total * 100)}% THERE // ${m.toGo} TO GO</span></span>`
      + `<span class="meta" style="flex-basis:100%;padding-left:28px">NEXT: ${esc(nx)}${m.blocked ? ` // ${m.blocked} ROADBLOCK${m.blocked > 1 ? 'S' : ''}` : ''}</span></button>`;
    if (open) { h += diagram(m, ri); if (S.sel && S.sel.ri === ri) h += panel(m); }
    h += '</div>';
  });
  h += `</section><section class="legend">${[['done', 'Reached'], ['doing', 'You are here'], ['blocked', 'Roadblock'], ['todo', 'Ahead (NEXT = ready to start)'], ['finish', 'Finish line']].map(([c, l]) => `<span><span class="dot ${c}"></span>${l}</span>`).join('')}</section><footer>PUBLIC PAGE // BUILT FROM data/projects.json // READ-ONLY // TARGET DATES NOT YET RECORDED</footer>`;
  const y = window.scrollY; app.innerHTML = h; window.scrollTo(0, y);
}

app.addEventListener('click', (e) => {
  const t = e.target.closest('[data-act]'); if (!t) return; const a = t.dataset.act;
  if (a === 'mode') { S.mode = t.dataset.mode; store(THEME_KEY, S.mode); }
  else if (a === 'road') { const id = t.dataset.id; S.open[id] = !S.open[id]; if (!S.open[id] && S.sel && S.roads[S.sel.ri].id === id) S.sel = null; store(OPEN_KEY, JSON.stringify(S.open)); }
  else if (a === 'all') { const any = S.roads.some((m) => S.open[m.id]); S.open = {}; if (!any) S.roads.forEach((m) => { S.open[m.id] = true; }); else S.sel = null; store(OPEN_KEY, JSON.stringify(S.open)); }
  else if (a === 'stop') { const ri = +t.dataset.ri; S.sel = S.sel && S.sel.ri === ri && S.sel.id === t.dataset.id ? null : { ri, id: t.dataset.id }; S.more = false; }
  else if (a === 'more') S.more = true; else if (a === 'less') S.more = false;
  render();
});

const m0 = store(THEME_KEY); if (['light', 'dark', 'char'].includes(m0)) S.mode = m0;
try { S.open = JSON.parse(store(OPEN_KEY) || '{}') || {}; } catch { S.open = {}; }
fetch('./data/projects.json', { cache: 'no-store' }).then((r) => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
  .then((d) => { S.data = d; S.roads = buildRoads(d.projects.filter((p) => p.tasks)); render(); })
  .catch((e) => { app.innerHTML = '<div class="err" role="alert">ROADMAP DATA NOT LOADED // ' + esc(e.message) + '</div>'; });
