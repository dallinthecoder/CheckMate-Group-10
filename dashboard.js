const $=s=>document.querySelector(s),get=k=>chrome.storage.local.get(k),T=t=>t?new Date(t).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit',second:'2-digit'}):'—';
const dec=o=>Object.entries(o||{}).map(([k,v])=>[k.replace(/,/g,'.'),v]).sort((a,b)=>b[1]-a[1]);
const st=r=>r.leave?'Left':Date.now()-r.upd>90000?'Offline':r.host&&r.host!=='meet.google.com'?'Off-site':r.status==='idle'?'Idle':'Active';
const LBL={Active:'Active',Idle:'Idle','Off-site':'Off-site',Offline:'Offline',Left:'Left'};
const col=n=>n>=70?'var(--lime)':n>=40?'var(--amber)':'var(--rose)';
const rank=n=>n>=70?'Highly engaged':n>=40?'Moderately engaged':'Needs more participation';
const tile=(l,v,c)=>`<div class=tile style="--c:${c}"><span>${l}</span><b>${v}</b></div>`;
const av=n=>`<span class=av>${esc(String(n||'?')[0].toUpperCase())}</span>`;
const dot=c=>`<span class=dot style="--d:${c}"></span>`;
const LOGO=`<svg viewBox="0 0 40 40"><defs><linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ecd49a"/><stop offset="1" stop-color="#a8864a"/></linearGradient></defs><rect x=".75" y=".75" width="38.5" height="38.5" rx="10" fill="#101012" stroke="url(#cg)" stroke-width="1.5"/><g fill="url(#cg)"><rect x="18.6" y="6" width="2.8" height="9"/><rect x="15.6" y="9" width="8.8" height="2.8"/><path d="M13 31l1.6-10.5c1.6-2.6 9.2-2.6 10.8 0L27 31z"/><rect x="11" y="31" width="18" height="3.4" rx="1.4"/></g></svg>`;
const hdr=(sub,pill)=>`<header class=top><div class=brand>${LOGO}<div><div class=wm>Check<b>Mate</b></div><small>${sub}</small></div></div>${pill}</header>`;
(async()=>{const {cfg,last}=await get(['cfg','last']),c=cfg||last;
 if(!c)return $('#app').innerHTML='<p class=mu>Open the CheckMate extension popup first.</p>';
 c.role==='teacher'?teacher(c):student(c)})();

function teacher(c){
 const draw=async()=>{
  if(document.querySelector('details[open]'))return;
  let s;try{s=await db('sessions/'+c.code)||{}}catch{return}
  const rows=Object.values(s.students||{}).sort((a,b)=>String(a.name).localeCompare(b.name)),n=rows.length;
  const sum=f=>rows.reduce((t,r)=>t+f(r),0),avg=n?Math.round(sum(score)/n):0;
  $('#app').innerHTML=hdr('Teacher dashboard',`<div style="text-align:right"><span class="pill ${s.active?'live':'ended'}">${s.active?dot('var(--lime)')+'LIVE':'ENDED'}</span><br><small>Updated ${T(Date.now())}</small></div>`)+
  `<section class=codebar><div><small>SESSION CODE · share with students</small><div class=code>${esc(c.code)}</div></div>
   <div><button id=copy>Copy code</button><button id=csv class=primary>Download report (CSV)</button><button id=end class=danger>End session</button></div></section>
  <section class=tiles>${tile('Students',n,'var(--cyan)')}${tile('Active now',rows.filter(r=>st(r)==='Active').length,'var(--lime)')}${tile('Avg engagement',avg+'/100',col(avg))}${tile('Chat messages',sum(r=>r.chat||0),'var(--vio)')}${tile('Reactions + hands',sum(r=>(r.reactions||0)+(r.hands||0)),'var(--pink)')}${tile('Alerts',sum(r=>r.alerts||0),'var(--amber)')}</section>
  <section class=panel><h2>Students</h2>${n?`<div class=scroll><table><tr><th>Student<th>Status<th>Joined<th>Left<th>Time in class<th>Engagement<th>Chats<th>Reactions / hands<th>Presence passed / missed<th>Alerts<th>Websites</tr>`+
  rows.map(r=>{const w=dec(r.sites),sc=score(r),t=(r.active||0)+(r.idle||0);return `<tr><td><div class=who>${av(r.name)}${esc(r.name)}</div><td><span class="b ${st(r)}">${LBL[st(r)]}</span><td>${T(r.join)}<td>${T(r.leave)}<td>${fmt(t)}<br><small>${t?Math.round(r.active/t*100):0}% active</small><td><div class=eng><div class=bar><i style="width:${sc}%;background-color:${col(sc)}"></i></div><b style="color:${col(sc)}">${sc}</b></div><td>${r.chat||0}<br><small>last ${T(r.lastChat)}</small><td>${r.reactions||0} / ${r.hands||0}<td><span style="color:var(--lime)">${r.ok||0}</span> / <span style="color:var(--rose)">${r.miss||0}</span><td>${r.alerts||0}<td><details><summary>${esc(w[0]?w[0][0]:'—')}</summary><div>${w.map(([h,v])=>`${esc(h)} · ${fmt(v)}`).join('<br>')}</div></details>`}).join('')+'</table></div>':'<div class=empty>Waiting for students to join… share the session code above.</div>'}</section>`;
  $('#copy').onclick=e=>{navigator.clipboard.writeText(c.code);e.target.textContent='Copied'};
  $('#end').onclick=async()=>{await db(`sessions/${c.code}/active`,'PUT',false);draw()};
  $('#csv').onclick=()=>{
   const q=v=>`"${String(v??'').replace(/"/g,'""')}"`,h='Name,Join,Leave,Total time,Active,Idle,Engagement,Chat count,Last chat,Reactions,Raised hands,Checks passed,Checks missed,Alerts,Websites';
   const body=rows.map(r=>[r.name,T(r.join),T(r.leave),fmt((r.active||0)+(r.idle||0)),fmt(r.active),fmt(r.idle),score(r),r.chat||0,T(r.lastChat),r.reactions||0,r.hands||0,r.ok||0,r.miss||0,r.alerts||0,dec(r.sites).map(([k,v])=>k+' '+fmt(v)).join('; ')].map(q).join(','));
   const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([[h,...body].join('\n')],{type:'text/csv'}));a.download=`checkmate-${c.code}.csv`;a.click()};
 };
 draw();setInterval(draw,5000);
}

function student(c){
 const draw=async()=>{
  const {me={},sites={},alerts=0}=await get(['me','sites','alerts']),t=(me.active||0)+(me.idle||0),w=dec(sites),sc=score(me),ap=t?Math.round(me.active/t*100):0,mx=w[0]?w[0][1]:1;
  const rem=[];
  if(!me.leave)rem.push('Stay on the Google Meet tab. Visiting other sites counts as idle.');
  rem.push(`A presence check appears every ${CFG.CHECK_MIN} minutes. Click “I’m here” within ${CFG.RESPOND_SEC}s.`);
  if((me.chat||0)<CFG.CHAT_TARGET)rem.push(`Send ${CFG.CHAT_TARGET-(me.chat||0)} more chat message(s) to boost your engagement.`);
  if(alerts)rem.push(`You received ${alerts} off-site alert(s).`);
  if(me.miss)rem.push(`You missed ${me.miss} presence check(s).`);
  $('#app').innerHTML=hdr('Student report',`<span class="pill ${me.leave?'ended':'live'}">${me.leave?'CLASS ENDED':dot('var(--lime)')+'IN CLASS'}</span>`)+
  `<section class=hero><div class=ring style="--p:${sc};--c:${col(sc)}"><b style="color:${col(sc)}">${sc}</b><small>/ 100</small></div>
   <div style="flex:1;min-width:240px"><h2>Hi, ${esc(c.name)}</h2><div class=mu>Session ${esc(c.code)} · ${rank(sc)}</div>
   <div class=split><i style="width:${ap}%;background-color:var(--lime)"></i><i style="width:${100-ap}%;background-color:var(--rose)"></i></div>
   <small>${dot('var(--lime)')}Active ${fmt(me.active)} (${ap}%) &nbsp; ${dot('var(--rose)')}Idle ${fmt(me.idle)}</small></div></section>
  <section class=tiles>${tile('Joined',T(me.join),'var(--cyan)')}${tile('Left',T(me.leave),'var(--vio)')}${tile('Time in class',fmt(t),'var(--cyan)')}${tile('Chat messages',me.chat||0,'var(--pink)')}${tile('Last chat',T(me.lastChat),'var(--pink)')}${tile('Reactions',me.reactions||0,'var(--amber)')}${tile('Raised hand',me.hands||0,'var(--lime)')}${tile('Presence passed / missed',(me.ok||0)+' / '+(me.miss||0),'var(--vio)')}</section>
  <section class=panel><h2>Reminders</h2><ul class=ul>${rem.map(x=>`<li>${esc(x)}`).join('')}</ul></section>
  <section class=panel><h2>Websites visited</h2>${w.length?w.map(([h,v])=>`<div class=site><span>${esc(h)}</span><div class=bar><i style="width:${Math.max(3,v/mx*100)}%;background-color:${h==='meet.google.com'?'var(--cyan)':'var(--vio)'}"></i></div><span class=mu>${fmt(v)}</span></div>`).join(''):'<div class=empty>No data yet.</div>'}</section>`;
 };
 draw();setInterval(draw,5000);
}
