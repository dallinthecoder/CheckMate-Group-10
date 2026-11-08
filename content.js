(()=>{
const g=k=>chrome.storage.local.get(k);
const GOLD='#d4b06a',RED='#c8706b',MUTED='#8e8b83';
const box=document.createElement('div');
box.style.cssText='position:fixed;z-index:2147483647;right:20px;top:20px;width:310px;padding:16px 18px;border-radius:14px;font:14px/1.4 system-ui,sans-serif;color:#ece8de;background:linear-gradient(160deg,#1b1b1f,#0b0b0d);border:1px solid #2b2a27;border-left:5px solid '+GOLD+';box-shadow:0 12px 40px #000c;display:none';
document.body.appendChild(box);
const BTN='style="margin-top:12px;padding:9px 18px;border:0;border-radius:9px;cursor:pointer;font-weight:700;background:linear-gradient(180deg,#e3c887,#b8934a);color:#17130a"';
const say=(label,title,sub,c,btn)=>{box.innerHTML=`<div style="font:700 11px Georgia,serif;letter-spacing:2px;color:${c};margin-bottom:8px">${label}</div><div style="font:600 17px Georgia,serif">${title}</div><div style="color:#9c9a92;margin-top:3px">${sub}</div>${btn||''}`;box.style.borderLeftColor=c;box.style.display='block'};
let me=null,status='active',next=0,dl=0,n=0,lt=Date.now(),gapMin=CFG.CHECK_MIN,warned=false;
const gap=()=>gapMin*60000;
const save=()=>{if(me){me.status=status;chrome.storage.local.set({me})}};
const inCall=()=>!!document.querySelector('[aria-label*="Leave call" i]');
const live=()=>me&&!me.leave;
const chat=()=>{if(!live())return;me.chat++;me.lastChat=Date.now();status='active';save()};
const leave=()=>{if(!live())return;me.leave=Date.now();save();box.style.display='none';chrome.runtime.sendMessage({type:'left'})};
addEventListener('beforeunload',leave);
box.onclick=e=>{if(e.target.id!=='sia-ok'||!live())return;if(dl){me.ok++;dl=0;next=Date.now()+gap()}status='active';box.style.display='none';save()};
document.addEventListener('keydown',e=>{const t=e.target;if(e.key==='Enter'&&!e.shiftKey&&t.matches&&t.matches('textarea')&&/message/i.test(t.getAttribute('aria-label')||t.placeholder||'')&&t.value.trim())chat()},true);
document.addEventListener('click',e=>{
 const b=e.target.closest&&e.target.closest('button,[role=button]');if(!b||!live())return;
 const l=(b.getAttribute('aria-label')||'').toLowerCase();
 if(/send (a )?message/.test(l)){if(!b.disabled)chat()}
 else if(/raise hand/.test(l))me.hands++;
 else if(b.dataset.emoji||/\p{Extended_Pictographic}/u.test(l)){me.reactions++}
 else return; save();
},true);
setInterval(async()=>{
 const {cfg}=await g('cfg'),inn=inCall(),now=Date.now(),dt=Math.min((now-lt)/1000,120);lt=now;
 if(!inn)warned=false;
 if(inn&&(!cfg||cfg.role!=='student')){if(!cfg&&!warned){warned=true;say('CHECKMATE','Join again','Enter your session code in the CheckMate extension to be counted present.',MUTED)}return}
 if(inn&&!live()){me={join:now,leave:null,active:0,idle:0,chat:0,lastChat:null,reactions:0,hands:0,ok:0,miss:0};status='active';next=now+gap();dl=0;box.style.display='none';chrome.runtime.sendMessage({type:'joined'});save();return}
 if(!live())return;
 if(!inn){leave();return}
 (status==='active'&&!document.hidden&&document.hasFocus())?me.active+=dt:me.idle+=dt;
 if(!dl&&status==='active'&&now>=next){dl=now+CFG.RESPOND_SEC*1000;say('CHECK','Check! Are you still here?',`Please respond within <b id="sia-c" style="color:#ece8de">${CFG.RESPOND_SEC}</b>s or you will be marked idle.`,GOLD,`<button id="sia-ok" ${BTN}>I'm here</button>`)}
 if(dl){const r=Math.ceil((dl-now)/1000);
  if(r<=0){dl=0;me.miss++;status='idle';next=now+gap();say('CHECKMATE','You were marked idle','You missed the presence check. Join again to be counted active.',RED,`<button id="sia-ok" ${BTN}>Join again</button>`)}
  else{const c=box.querySelector('#sia-c');if(c)c.textContent=r}}
 if(++n%15===0){save();chrome.runtime.sendMessage({type:'sync'})}
},1000);
})();
