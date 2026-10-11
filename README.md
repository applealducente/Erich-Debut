# Erich Enchants — 18th birthday invitation

Static site (HTML, CSS, vanilla JS) deployed on Vercel from `main`.

- `index.html`, `script.js`, `styles.css`: the invitation and RSVP form.
- `dashboard.html`: organizer dashboard (RSVP tracker, seating chart, guest list). Reached with the ✦ button and password.
- `guests.js` and `api/guests.js`: read the guest list from the Google Sheet (first tab, "Guests"). The sheet is the source of truth.
- `data.js`: built-in copy of the 18 Roses, Treasures, Blue Bills, Candles and Cotillion lists. The site reads the sheet's "18's" tab (via `api/roles.js`) and uses it in place of this copy, so edit the sheet, not this file. The built-in copy is the fallback if the tab cannot be read.
- `firebase-config.js`, `firebase-sync.js`: RSVPs are stored in Firebase Realtime Database under `rsvps/<guest-key>`.
- `database.rules.json`: paste into Firebase Console, Realtime Database, Rules, then Publish.
- `assets/hero-portrait.jpg`: phone version of the opening artwork (re-stacked from `hero-reference.png`).

The dashboard's "Sync with Google Sheet" button reloads the guest list and the 18's right away. The invitation page reads both on every load.

To clear a test RSVP, open the dashboard and use Delete, Clear Confirmed, or Clear All.
