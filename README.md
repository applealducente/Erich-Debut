# Erich Enchants — 18th birthday invitation

Static site (HTML, CSS, vanilla JS) deployed on Vercel from `main`.

- `index.html`, `script.js`, `styles.css`: the invitation and RSVP form.
- `dashboard.html`: organizer dashboard (RSVP tracker, seating chart, guest list). Reached with the ✦ button and password.
- `guests.js` and `api/guests.js`: read the guest list from the Google Sheet (first tab, "Guests"). The sheet is the source of truth.
- `data.js`: the 18 Roses, Treasures, Blue Bills, Candles and Cotillion lists. Copy them from the sheet's "18's" tab. The same lists are written out by hand in `index.html` (section "HER EIGHTEEN"), so change both.
- `firebase-config.js`, `firebase-sync.js`: RSVPs are stored in Firebase Realtime Database under `rsvps/<guest-key>`.
- `database.rules.json`: paste into Firebase Console, Realtime Database, Rules, then Publish.
- `assets/hero-portrait.jpg`: phone version of the opening artwork (re-stacked from `hero-reference.png`).

To clear a test RSVP, open the dashboard and use Delete, Clear Confirmed, or Clear All.
