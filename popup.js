const $=s=>document.querySelector(s),msg=t=>$('#msg').textContent=t,L=chrome.storage.local;
const open=()=>chrome.tabs.create({url:chrome.runtime.getURL('dashboard.html')});
$('#role').onchange=()=>{$('#st').hidden=$('#role').value!=='student';$('#te').hidden=!$('#st').hidden};
$('#join').onclick=async()=>{
 const name=$('#name').value.trim(),code=$('#code').value.trim().toUpperCase();
 if(!name||!code)return msg('Enter your name and the code.');
 try{const s=await db('sessions/'+code);if(!s||!s.active)return msg('Invalid or ended code.');
  let {sid}=await L.get('sid');sid=sid||crypto.randomUUID().slice(0,8);
  await L.set({sid,cfg:{role:'student',name,code,sid,checkMin:s.checkMin}});msg('Checked in. Now join the Meet call.');
 }catch{msg('Cannot reach database. Check config.js.')}};
$('#start').onclick=async()=>{
 const code=Math.random().toString(36).slice(2,8).toUpperCase();
 try{await db('sessions/'+code,'PUT',{active:true,created:Date.now(),checkMin:CFG.CHECK_MIN});
  await L.set({cfg:{role:'teacher',code}});msg('Session code: '+code+' (share with students)');open()}
 catch{msg('Cannot reach database. Check config.js.')}};
$('#dash').onclick=open;$('#me').onclick=open;
$('#reset').onclick=async()=>{await L.clear();msg('Reset done.')};
