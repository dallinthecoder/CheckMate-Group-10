importScripts('config.js');
const MEET='meet.google.com',get=k=>chrome.storage.local.get(k);
// Website time: closes the previous segment each time the focused tab/window changes
async function mark(){
 const {on,trk={},sites={}}=await get(['on','trk','sites']); if(!on)return;
 const now=Date.now(); if(trk.host)sites[trk.host]=(sites[trk.host]||0)+(now-trk.ts)/1000;
 let host='(other app)'; const w=await chrome.windows.getLastFocused().catch(()=>null);
 if(w&&w.focused){const [t]=await chrome.tabs.query({active:true,windowId:w.id}); try{host=new URL(t.url).hostname||host}catch{}}
 const ch=host!==trk.host;
 await chrome.storage.local.set({sites,trk:{host,ts:now,since:ch?now:trk.since,alerted:ch?false:trk.alerted}});
}
async function sync(){
 const {cfg,me,sites={},alerts=0,trk={}}=await get(['cfg','me','sites','alerts','trk']);
 if(!cfg||cfg.role!=='student'||!me)return;
 const s={}; for(const k in sites)s[k.replace(/\./g,',')]=Math.round(sites[k]);
 try{await db(`sessions/${cfg.code}/students/${cfg.sid}`,'PUT',{...me,name:cfg.name,sites:s,alerts,host:trk.host||'',upd:Date.now()})}catch{}
}
async function tick(){
 await mark(); const {on,trk={},alerts=0}=await get(['on','trk','alerts']); if(!on)return;
 if(trk.host!==MEET&&!trk.alerted&&(Date.now()-trk.since)/1000>CFG.OFFSITE_SEC){
  chrome.notifications.create({type:'basic',iconUrl:'icon.png',title:'CheckMate: Check! Come back to class',message:`You have been on ${trk.host} for over ${CFG.OFFSITE_SEC}s. Return to Google Meet.`});
  await chrome.storage.local.set({alerts:alerts+1,trk:{...trk,alerted:true}});
 }
 await sync();
}
chrome.tabs.onActivated.addListener(mark);
chrome.tabs.onUpdated.addListener((i,c)=>{if(c.url)mark()});
chrome.windows.onFocusChanged.addListener(mark);
chrome.alarms.create('t',{periodInMinutes:0.5});
chrome.alarms.onAlarm.addListener(tick);
chrome.runtime.onMessage.addListener(async m=>{
 if(m.type==='joined'){await chrome.storage.local.set({on:true,sites:{},alerts:0,trk:{}});await mark();await sync()}
 if(m.type==='sync'){await tick()}
 if(m.type==='left'){await mark();await sync();const {cfg}=await get('cfg');
  await chrome.storage.local.set({on:false,last:cfg});await chrome.storage.local.remove('cfg'); // code needed again next session
  chrome.tabs.create({url:chrome.runtime.getURL('dashboard.html')})}
});
