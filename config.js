// Paste your Apps Script Web app URL (ends with /exec) into DB
var CFG={DB:'https://script.google.com/macros/s/AKfycby9EnN9cPFwPJDSHGyhkhwxZSnYT7e8H2Ip7hzYSJyCj4_xYErzv6cwAzfBDHWHqRZ5/exec',CHECK_MIN:5,RESPOND_SEC:30,OFFSITE_SEC:60,CHAT_TARGET:5};
var db=(p,m='GET',b)=>fetch(CFG.DB,{method:'POST',headers:{'Content-Type':'text/plain'},body:JSON.stringify({p,m,b:b===undefined?null:b})}).then(r=>r.json());
var fmt=s=>{s=Math.round(s||0);const h=s/3600|0,m=s%3600/60|0;return (h?h+'h ':'')+m+'m '+s%60+'s'};
// Engagement = 70% active-time ratio + 30% chat messages (capped at CHAT_TARGET)
var score=r=>{const t=(r.active||0)+(r.idle||0),a=t?r.active/t:0;return Math.round(70*a+30*Math.min((r.chat||0)/CFG.CHAT_TARGET,1))};
var esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
