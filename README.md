# CheckMate (Chrome/Edge extension, Manifest V3)

## Install (students and teachers)
1. Download the project: on GitHub click **Code > Download ZIP** (or use the zip your teacher shared).
2. Unzip it.
3. Open `chrome://extensions` (Edge: `edge://extensions`) and turn on **Developer mode**.
4. Click **Load unpacked** and select the folder that contains `manifest.json`.
5. Pin CheckMate from the puzzle-piece menu.

## One-time backend setup (teacher/admin only)
Do this once for the whole class, then share the updated folder with everyone.
1. New Google Sheet > Extensions > Apps Script > paste `Code.gs` > Save.
2. Deploy > New deployment > Web app > Execute as: Me, Who has access: Anyone > Deploy > authorize > copy the `/exec` URL.
3. Paste the URL into `config.js` (CFG.DB) and save.
4. Share the folder with students. Everyone uses the same `config.js`.

## How to use
- **Teacher:** popup > "I'm a teacher" > Start new session > share the code. The dashboard shows live data and a CSV report.
- **Student:** popup > name + code > Join session > open Meet. Tracking starts when they are in the call and ends when they leave (the code is cleared and a summary page opens).

## Notes
- Meet's page structure changes; chat, reaction and hand detection uses click/keyboard listeners and aria-labels (see `content.js`).
- Anyone with the Web app URL can read/write, so keep it private. Works well for classes up to about 40 students.
- Tell students what is tracked (hostnames only, never page content) and get their consent.
