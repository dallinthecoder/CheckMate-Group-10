# CheckMate (Chrome/Edge extension, Manifest V3)
## Setup (Google Sheets backend)
1. New Google Sheet > Extensions > Apps Script > paste Code.gs > Save.
2. Deploy > New deployment > Web app > Execute as: Me, Who has access: Anyone > Deploy > authorize > copy the /exec URL.
3. Paste the URL into config.js (CFG.DB).
4. chrome://extensions > Developer mode > Load unpacked > select this folder (reload after editing config.js).
## How to use the extension based on roles:
- Teacher: popup > "I'm a teacher" > Start new session > share the code. Dashboard shows live data + CSV report.
- Student: popup > name + code > Join session > open Meet. Tracking starts when they are in the call and ends on leaving (code is cleared; a summary page opens).
## Notes
- Meet's DOM changes; chat/reaction/hand detection uses click/keyboard listeners and aria-labels (see content.js).
- Anyone with the Web app URL can read/write; keep it private. Works well for classes up to ~40 students.
- Tell students what is tracked (hostnames only, never page content) and get consent.
