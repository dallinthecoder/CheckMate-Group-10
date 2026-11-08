const CHAT_TARGET = 5; // keep equal to CFG.CHAT_TARGET in the extension's config.js
const SESS = ['code','active','check_min','created'];
const COLS = ['code','sid','name','joined','left','total_min','active_min','idle_min','engagement','chats','last_chat','reactions','raised_hands','checks_ok','checks_missed','alerts','status','current_site','websites','updated','raw'];

function doGet() { return ContentService.createTextOutput('SIA backend is running ✓'); }

function doPost(e) {
  const lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    const q = JSON.parse(e.postData.contents);
    return ContentService.createTextOutput(JSON.stringify(route(q.p.split('/'), q.m, q.b)))
      .setMimeType(ContentService.MimeType.JSON);
  } finally { lock.releaseLock(); }
}

function tab(name, headers) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let s = ss.getSheetByName(name);
  if (!s) { s = ss.insertSheet(name); s.appendRow(headers); s.setFrozenRows(1); s.getRange('A:C').setNumberFormat('@'); }
  return s;
}
const fmt = ms => ms ? Utilities.formatDate(new Date(ms), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss') : '';
const min = s => Math.round((s || 0) / 6) / 10;
function findRow(sheet, match) {
  const v = sheet.getDataRange().getValues();
  for (let i = 1; i < v.length; i++) if (match(v[i])) return i + 1;
  return 0;
}

function route(a, m, b) {
  const code = a[1], S = tab('Sessions', SESS), T = tab('Students', COLS);
  const sr = findRow(S, r => String(r[0]) === code);
  if (a.length === 2 && m === 'PUT') {            // teacher starts a session
    const row = [code, true, b.checkMin, b.created];
    sr ? S.getRange(sr, 1, 1, 4).setValues([row]) : S.appendRow(row);
    return b;
  }
  if (a.length === 2) {                            // read session + all its students
    if (!sr) return null;
    const v = S.getRange(sr, 1, 1, 4).getValues()[0];
    const out = { active: String(v[1]) === 'true', checkMin: Number(v[2]), students: {} };
    T.getDataRange().getValues().slice(1).forEach(r => {
      if (String(r[0]) === code) out.students[r[1]] = JSON.parse(r[COLS.length - 1]);
    });
    return out;
  }
  if (a[2] === 'active') { if (sr) S.getRange(sr, 2).setValue(b); return b; }  // end session
  if (a[2] === 'students') {                       // student update -> one row per student
    const sid = a[3], r = b;
    const tr = findRow(T, x => String(x[0]) === code && String(x[1]) === sid);
    const tot = (r.active || 0) + (r.idle || 0);
    const sites = Object.entries(r.sites || {}).sort((x, y) => y[1] - x[1])
      .map(([h, s]) => h.replace(/,/g, '.') + ' ' + min(s) + 'm').join('; ');
    const row = [code, sid, r.name, fmt(r.join), fmt(r.leave), min(tot), min(r.active), min(r.idle),
      Math.round(70 * (tot ? r.active / tot : 0) + 30 * Math.min((r.chat || 0) / CHAT_TARGET, 1)),
      r.chat || 0, fmt(r.lastChat), r.reactions || 0, r.hands || 0, r.ok || 0, r.miss || 0, r.alerts || 0,
      r.status || '', r.host || '', sites, fmt(r.upd), JSON.stringify(r)];
    tr ? T.getRange(tr, 1, 1, row.length).setValues([row]) : T.appendRow(row);
    return b;
  }
  return null;
}
