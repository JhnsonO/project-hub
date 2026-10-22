export const statuses = ['todo', 'doing', 'blocked', 'done'];
export const labels = {todo:'To do',doing:'In progress',blocked:'Blocked',done:'Done'};
export function counts(tasks) {
  const result = Object.fromEntries(statuses.map(s=>[s,tasks.filter(t=>t.status===s).length]));
  result.total=tasks.length; result.pct=result.total?Math.round(result.done/result.total*100):0;
  return result;
}
export function dependencyLayers(tasks) {
  const byId=new Map(tasks.map(t=>[t.id,t])), cache=new Map(), visiting=new Set();
  function depth(id) {
    if(cache.has(id)) return cache.get(id);
    if(visiting.has(id)) throw new Error('Dependency cycle');
    if(!byId.has(id)) throw new Error('Unknown dependency');
    visiting.add(id);
    const deps=byId.get(id).depends_on||[];
    const n=deps.length?1+Math.max(...deps.map(depth)):0;
    visiting.delete(id); cache.set(id,n); return n;
  }
  tasks.forEach(t=>depth(t.id));
  return tasks.reduce((layers,t)=>{const n=cache.get(t.id); (layers[n]||=[]).push(t);return layers;},[]);
}
export function todayTasks(projects) {
  const all=projects.flatMap(p=>p.tasks.map(t=>({...t,project:p})));
  return all.filter(t=>t.status!=='done' && (t.status!=='todo'||(t.depends_on||[]).every(id=>t.project.tasks.some(d=>d.id===id&&d.status==='done'))))
    .sort((a,b)=>({blocked:0,doing:1,todo:2}[a.status]-{blocked:0,doing:1,todo:2}[b.status])||a.project.id.localeCompare(b.project.id)||a.id.localeCompare(b.id)).slice(0,5);
}
export function timeline(tasks) {
  const dated=[], undated=[];
  const isDate=d=>/^\d{4}-\d{2}-\d{2}$/.test(d||'');
  tasks.forEach(t=>{
    if(isDate(t.start)&&isDate(t.end))dated.push(t);
    else if(t.status==='done'&&isDate(t.completed_on))dated.push({...t,start:t.completed_on,end:t.completed_on,milestone:true});
    else undated.push(t);
  });
  if(!dated.length)return {dated,undated,weeks:[],start:0,end:0};
  const day=86400000; let start=Math.min(...dated.map(t=>Date.parse(t.start)));const dow=new Date(start).getUTCDay();start-=((dow+6)%7)*day;
  let end=Math.max(...dated.map(t=>Date.parse(t.end)))+day; end=start+Math.ceil((end-start)/(7*day))*7*day;
  if ((end-start)/(7*day)>262) throw new Error('Timeline exceeds five years');
  const weeks=[];for(let d=start;d<end;d+=7*day)weeks.push(new Date(d));
  return {dated,undated,weeks,start,end};
}
