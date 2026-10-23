import { buildRoad } from './road-model.mjs?v=2';
const LABEL = { todo: 'To do', doing: 'In progress', blocked: 'Blocked', done: 'Done', finish: 'Finish line' };
const AGENT = { claude: 'Claude', chatgpt: 'ChatGPT' };
const memory = new Map(); // per-project selection survives re-renders of the page
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const first = (s) => { const m = /^.*?[.!?](?=\s|$)/.exec(s || ''); return m ? m[0] : s || ''; };
const hl = (pos, solid) => 'position:absolute;height:0;' + pos + (solid ? 'top:37px;border-top:4px solid var(--mid);' : 'top:38px;border-top:2px dashed var(--mid);opacity:.7;');
const vl = (kind, solid) => 'position:absolute;left:50%;width:0;' + (solid ? 'border-left:4px solid var(--mid);margin-left:-2px;' : 'border-left:2px dashed var(--mid);margin-left:-1px;opacity:.7;') + (kind === 'min' ? 'top:37px;bottom:0;' : kind === 'max' ? 'top:0;height:41px;' : 'top:0;bottom:0;');

function diagram(m, sel) {
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
    html += '<div class="rv-cell">' + (m.tracks[r] ? '<span class="rv-lane">' + esc(m.tracks[r]) + '</span>' : '') + '</div>';
    for (let k = 0; k < K; k++) {
      const x = at[r + ',' + k];
      html += '<div class="rv-cell">' + (lines[r + ',' + k] || []).map((s) => '<span style="' + s + '"></span>').join('');
      if (x) {
        const on = sel.id === x.id, next = m.next.includes(x);
        html += `<button class="rv-stop" data-id="${esc(x.id)}" aria-pressed="${on}" aria-label="${esc(x.name + ', ' + LABEL[x.status])}">`
          + `<span class="rv-tagrow">${next ? '<span class="rv-tag">' + (x.status === 'doing' ? 'HERE' : 'NEXT') + '</span>' : ''}</span>`
          + `<span class="rv-nodewrap"><span class="rv-node ${x.status}${on ? ' sel' : ''}"></span></span><span class="rv-label ${x.status}" title="${esc(x.name)}">${esc(x.name)}</span>${x.status === 'blocked' ? '<span class="rv-sub">Blocked</span>' : ''}</button>`;
      }
      html += '</div>';
    }
  }
  const cols = '76px ' + Array.from({ length: K }, (v, k) => (k % 2 === 0 ? 'minmax(112px,1fr)' : '26px')).join(' ');
  return `<div class="rv-scroll"><div class="rv-grid" style="min-width:${76 + m.nCols * 112 + (m.nCols - 1) * 26}px;grid-template-columns:${cols}">${html}</div></div>`;
}

function panel(m, sel) {
  const x = m.byId.get(sel.id); if (!x) return '';
  const needs = x.deps.map((d) => m.byId.get(d)?.name).filter(Boolean), unlocks = m.nodes.filter((y) => y.deps.includes(x.id)).map((y) => y.name);
  const after = (needs.length > 3 ? 'Needs: ' + needs.length + ' stops' : needs.length ? 'Needs: ' + needs.join(', ') : 'Starts the road') + '  //  ' + (unlocks.length > 3 ? 'Unlocks: ' + unlocks.length + ' stops' : unlocks.length ? 'Unlocks: ' + unlocks.join(', ') : 'End of the road');
  const rest = (x.note || '').length > first(x.note).length;
  let h = `<div class="rv-detail"><div class="rv-title"><b>${esc(x.name)}</b><span class="rv-meta">${esc(LABEL[x.status] + (x.owner ? ' // ' + AGENT[x.owner] : '') + (x.lane ? ' // ' + x.lane : ''))}</span></div><span>${esc(first(x.note))}</span><span class="rv-meta">${esc(after)}</span>`;
  if (x.kind === 'stop' && (rest || (x.evidence || []).length || x.last_touched)) {
    if (!sel.more) h += '<button class="rv-link" data-act="more">More</button>';
    else {
      h += '<div class="rv-more">' + (rest ? `<span>${esc(x.note)}</span>` : '');
      if (x.evidence?.length) h += '<h4>EVIDENCE (PROTECTED DOCS)</h4><ul>' + x.evidence.map((e) => `<li><a href="${esc(e.url)}" rel="noopener noreferrer" target="_blank">${esc(e.label)}</a> <span class="rv-meta">${esc(e.provider)}</span></li>`).join('') + '</ul>';
      if (x.last_touched) h += `<h4>LAST TOUCHED</h4><span class="rv-meta">${esc(x.last_touched)}</span>`;
      h += '<button class="rv-link" data-act="less">Less</button></div>';
    }
  }
  return h + '</div>';
}

export function roadView(project) {
  const m = buildRoad(project), root = document.createElement('div');
  root.className = 'road-view';
  const sel = memory.get(project.id) || { id: null, more: false };
  memory.set(project.id, sel);
  const nx = m.next.length ? m.next[0].name + (m.next.length > 1 ? ` +${m.next.length - 1} in parallel` : '') : 'Finish line';
  const paint = () => {
    const sc = root.querySelector('.rv-scroll')?.scrollLeft || 0;
    root.innerHTML = `<p class="rv-meta">NEXT: ${esc(nx)}${m.blocked ? ` // ${m.blocked} ROADBLOCK${m.blocked > 1 ? 'S' : ''}` : ''} // ${m.toGo} TO GO</p>` + diagram(m, sel) + (sel.id ? panel(m, sel) : '<p class="rv-meta">TAP ANY STOP FOR DETAIL</p>')
      + '<div class="rv-legend">' + [['done', 'Reached'], ['doing', 'You are here'], ['blocked', 'Roadblock'], ['todo', 'Ahead (NEXT = ready to start)'], ['finish', 'Finish line']].map(([c, l]) => `<span><i class="rv-dot ${c}"></i>${l}</span>`).join('') + '</div>';
    const s = root.querySelector('.rv-scroll'); if (s) s.scrollLeft = sc;
  };
  root.addEventListener('click', (e) => {
    const stop = e.target.closest('.rv-stop'), act = e.target.closest('[data-act]');
    if (stop) { sel.id = sel.id === stop.dataset.id ? null : stop.dataset.id; sel.more = false; }
    else if (act) sel.more = act.dataset.act === 'more'; else return;
    paint();
  });
  paint();
  return root;
}
